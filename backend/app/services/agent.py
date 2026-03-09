"""LangGraph-based Agent with Tools and Self-Reflection."""

import operator
from typing import Annotated, TypedDict, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from app.config import get_settings

# --- Tools definition ---
from langchain_core.tools import tool

@tool
def calculator(expression: str) -> str:
    """Evaluate a mathematical expression. Use this for all math operations."""
    try:
        # Simplistic and safe-ish eval for demo purposes
        allowed_names = {"__builtins__": None}
        result = eval(expression, allowed_names, {})
        return str(result)
    except Exception as e:
        return f"Error evaluating expression: {e}"

@tool
def get_current_date() -> str:
    """Get the current date."""
    from datetime import date
    return date.today().isoformat()

@tool
def get_stock_price(ticker: str) -> str:
    """Get the current stock or forex price for a given ticker symbol (e.g. MSFT, AAPL) using Alpha Vantage."""
    settings = get_settings()
    if not settings.alphavantage_api_key:
        return "Alpha Vantage API key is not configured."
    
    try:
        import requests
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={settings.alphavantage_api_key}"
        response = requests.get(url)
        data = response.json()
        quote = data.get("Global Quote")
        if not quote:
            return f"Error: Could not find data for ticker {ticker}. Note: Free Alpha Vantage limits apply."
            
        current_price = quote.get("05. price")
        return f"The current price of {ticker} is {current_price} USD."
    except Exception as e:
        return f"Error fetching stock data from Alpha Vantage: {e}"

@tool
def search_web(query: str) -> str:
    """Search the web for real-time news, market insights, and general inquiries using Tavily API."""
    settings = get_settings()
    if not settings.tavily_api_key:
        return "Tavily API key is not configured."
        
    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=settings.tavily_api_key)
        response = client.search(query=query, search_depth="advanced", max_results=3)
        
        results = response.get("results", [])
        if not results:
            return "No web results found."
        
        parsed_results = []
        for r in results:
            parsed_results.append(f"Title: {r.get('title')}\nSnippet: {r.get('content')}")
            
        return "\n\n".join(parsed_results)
    except Exception as e:
        return f"Error searching the web with Tavily: {e}"

@tool
def get_asean_business_news(country_code: str = "sg") -> str:
    """Fetch top breaking business news headlines for a specific ASEAN country (e.g., 'sg' for Singapore, 'id' for Indonesia, 'my' for Malaysia)."""
    settings = get_settings()
    if not settings.news_api_key:
        return "News API key is not configured."
        
    try:
        import requests
        url = f"https://newsapi.org/v2/top-headlines?country={country_code}&category=business&apiKey={settings.news_api_key}"
        response = requests.get(url).json()
        
        if response.get("status") != "ok":
            return f"Failed to fetch news: {response.get('message', 'Unknown error')}"
            
        headlines = [article['title'] for article in response.get('articles', [])[:5]]
        if not headlines:
            return f"No recent business headlines found for country code {country_code}."
            
        return f"Top Breaking Business Headlines for {country_code.upper()}:\n" + "\n".join(f"- {h}" for h in headlines)
    except Exception as e:
        return f"Error fetching breaking news: {e}"

tools = [calculator, get_current_date, get_stock_price, search_web, get_asean_business_news]
tool_node = ToolNode(tools)

# --- Define State ---
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    system_instruction: str
    hallucination_detected: bool

# --- Nodes ---
def generate_draft(state: AgentState):
    """Generate the initial response using tools if needed."""
    settings = get_settings()
    llm = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.2
    ).bind_tools(tools)
    
    messages = state["messages"]
    if state["system_instruction"] and not any(isinstance(m, SystemMessage) for m in messages):
        messages = [SystemMessage(content=state["system_instruction"])] + list(messages)
    
    response = llm.invoke(messages)
    return {"messages": [response]}


def reflect(state: AgentState):
    """Reflect on the generated draft to detect hallucinations."""
    settings = get_settings()
    llm = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.0
    )
    last_message = state["messages"][-1]
    
    # If the last message was a tool call, we don't reflect yet, we just continue drafting
    if last_message.tool_calls:
        return {"hallucination_detected": False}

    reflection_prompt = f"""Review the following response for accuracy, helpfulness, and hallucinations.
Draft Response: {last_message.content}

If the draft contains ANY hallucinations or fabricated information not supported by the input, reply strictly with "YES". Otherwise reply "NO".
"""
    response = llm.invoke(reflection_prompt)
    has_hallucination = "YES" in response.content.upper()
    return {"hallucination_detected": has_hallucination}


def revise(state: AgentState):
    """Revise the draft to remove hallucinations."""
    settings = get_settings()
    llm = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.1
    )
    
    draft = state["messages"][-1].content
    revision_prompt = f"""Revise this response to remove any hallucinations and make it strictly factual based only on provided context.
Draft: {draft}

Return ONLY the finalized revised response content. Do not add conversational filler.
"""
    response = llm.invoke(revision_prompt)
    return {"messages": [response], "hallucination_detected": False}


def should_continue(state: AgentState) -> str:
    last_message = state["messages"][-1]
    # If there is a tool call, route to tools
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    # Otherwise go to reflection
    return "reflect"

def should_revise(state: AgentState) -> str:
    if state["hallucination_detected"]:
        return "revise"
    return END

# --- Build Graph ---
builder = StateGraph(AgentState)
builder.add_node("draft", generate_draft)
builder.add_node("tools", tool_node)
builder.add_node("reflect", reflect)
builder.add_node("revise", revise)

builder.set_entry_point("draft")
builder.add_conditional_edges("draft", should_continue, {"tools": "tools", "reflect": "reflect"})
builder.add_edge("tools", "draft")
builder.add_conditional_edges("reflect", should_revise, {"revise": "revise", END: END})
builder.add_edge("revise", END)

graph = builder.compile()

async def run_langgraph_agent(prompt: str, system_instruction: str = "") -> str:
    """Run the LangGraph LangChain agentic workflow."""
    inputs = {
        "messages": [HumanMessage(content=prompt)],
        "system_instruction": system_instruction,
        "hallucination_detected": False
    }
    
    final_state = await graph.ainvoke(inputs)
    final_message = final_state["messages"][-1]
    return final_message.content
