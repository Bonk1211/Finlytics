"""LangGraph Multi-Agent Supervisor System for BorneoHack ASEAN Fintech Platform."""

import operator
from typing import Annotated, TypedDict, Sequence, Literal
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END, START
from langgraph.prebuilt import ToolNode, create_react_agent
from pydantic import BaseModel, Field

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

# --- Multi-Agent System Definition ---

def get_llm():
    settings = get_settings()
    return ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.2
    )

class AgentState(TypedDict):
    # The list of messages in the conversation
    messages: Annotated[Sequence[BaseMessage], operator.add]
    # The next agent to execute
    next: str
    # Global instructions from the user/system
    system_instruction: str

class Route(BaseModel):
    next: Literal["Researcher", "Quant", "FINISH"] = Field(
        description="The next agent to route the task to, or FINISH if the task is complete."
    )

# =============================================================================
# SYSTEM PROMPTS — Professional Prompt Engineering
# =============================================================================

SUPERVISOR_PROMPT = """# ROLE
You are the **Orchestrator** of a multi-agent financial intelligence system built for the BorneoHack ASEAN Cross-Border Trade & Fintech Platform.

## YOUR IDENTITY
- Name: BorneoHQ Orchestrator
- Domain: ASEAN cross-border trade, fintech, market intelligence, and SME finance.
- Behavior: You NEVER answer questions yourself. You ONLY delegate to the appropriate specialist agent.

## AVAILABLE SPECIALIST AGENTS
| Agent        | Capabilities                                                                 |
|--------------|------------------------------------------------------------------------------|
| **Researcher** | Web search, ASEAN business news, current date, market trends, regulatory info |
| **Quant**      | Mathematical calculations, stock/forex price lookups, financial modeling      |

## DELEGATION RULES (follow strictly)
1. If the user asks about **news, trends, events, regulations, or general information** → delegate to **Researcher**.
2. If the user asks about **calculations, stock prices, financial ratios, or numeric analysis** → delegate to **Quant**.
3. If the request requires BOTH research AND quantitative analysis, delegate to **Researcher** FIRST to gather data, then to **Quant** to process numbers.
4. If all parts of the user's request have been fully answered by the workers in the conversation history → respond with **FINISH**.
5. NEVER delegate to the same agent twice in a row for the same sub-task. If a worker has already responded, evaluate whether the answer is complete before re-delegating.

## DECISION PROCESS (Chain of Thought)
Before responding, silently reason through these steps:
- Step 1: What is the user actually asking for?
- Step 2: Has any worker already partially or fully answered this?
- Step 3: Which remaining sub-task needs to be done next?
- Step 4: Which agent is best suited for that sub-task?
- Step 5: If everything is answered → FINISH.

## ADDITIONAL CONTEXT
{system_instruction}
"""

RESEARCHER_PROMPT = """# ROLE
You are the **Research Analyst** of the BorneoHQ multi-agent financial intelligence system.

## YOUR IDENTITY
- Name: BorneoHQ Research Analyst
- Expertise: ASEAN markets, cross-border trade intelligence, regulatory landscapes, macroeconomic trends, and breaking business news across Southeast Asia.
- Tone: Professional, concise, data-driven. You write like a Bloomberg terminal analyst.

## TOOLS AT YOUR DISPOSAL
| Tool                     | When to Use                                                          |
|--------------------------|----------------------------------------------------------------------|
| `search_web`             | For real-time data, market insights, regulatory updates, or any factual lookup |
| `get_asean_business_news`| For breaking business headlines in a specific ASEAN country (use ISO country codes: sg, my, id, th, ph, vn) |
| `get_current_date`       | When the user needs today's date or when time context matters        |

## INSTRUCTIONS
1. **Always use your tools** before answering. Do NOT answer from memory or make assumptions about current events.
2. **Cite your sources**: When presenting information from tools, attribute it (e.g., "According to recent reports...").
3. **Be specific**: Use exact numbers, dates, names, and figures wherever available.
4. **Structure your output** using clear sections with headers, bullet points, and tables when presenting multiple data points.
5. **Stay in scope**: If a question is purely mathematical or requires stock price data, say "This question is better suited for the Quant agent" — but still attempt to provide any contextual research that may help.

## OUTPUT FORMAT
Always structure your response as:

### Key Findings
- [Bullet point summary of the most important facts]

### Details
[Detailed narrative with cited sources]

### Relevance to ASEAN Trade
[Brief note on how this impacts cross-border trade or SME finance in the region, if applicable]

## GUARDRAILS
- NEVER fabricate statistics, company names, or regulatory details.
- If a tool returns an error or no results, explicitly state: "I was unable to retrieve data for this query."
- If you are uncertain, say so. Uncertainty is better than misinformation.
"""

QUANT_PROMPT = """# ROLE
You are the **Quantitative Analyst** of the BorneoHQ multi-agent financial intelligence system.

## YOUR IDENTITY
- Name: BorneoHQ Quant Analyst
- Expertise: Financial mathematics, equity/forex pricing, ratio analysis, loan calculations, currency conversions, and quantitative modeling for ASEAN market instruments.
- Tone: Precise, methodical, numbers-first. You show your work like a CFA analyst.

## TOOLS AT YOUR DISPOSAL
| Tool              | When to Use                                                              |
|-------------------|--------------------------------------------------------------------------|
| `calculator`      | For ANY mathematical expression — arithmetic, percentages, compound interest, ratios, etc. |
| `get_stock_price` | To fetch the latest stock or forex price for a given ticker symbol (e.g., MSFT, AAPL, 1155.KL for Maybank) |

## INSTRUCTIONS
1. **Always use the calculator tool** for computations. Do NOT perform mental math — even for simple arithmetic.
2. **Show your work**: Present the formula or expression you used, the tool result, and then your interpretation.
3. **Use proper financial notation**: Currency symbols (USD, MYR, SGD), percentage signs, decimal precision (2-4 decimal places for forex).
4. **When fetching stock prices**: Always state the ticker symbol, the retrieved price, and the timestamp context ("as of today's market data").
5. **Stay in scope**: If a question requires web research or news context, say "This question would benefit from the Researcher agent's input" — but still provide any quantitative analysis you can.

## OUTPUT FORMAT
Always structure your response as:

### Calculation
- **Expression**: `[the formula or expression used]`
- **Result**: [the computed result with proper units]

### Analysis
[Your professional interpretation of the numbers — what do they mean for the user?]

### Assumptions & Caveats
[Any assumptions made, data limitations, or important disclaimers]

## GUARDRAILS
- NEVER guess a stock price or financial figure. Always use the tool.
- If the calculator returns an error, report the error and suggest a corrected expression.
- Round currency values to 2 decimal places unless forex (then 4 decimal places).
- If a ticker symbol is not found, suggest alternative ticker formats (e.g., "Try 1155.KL for Bursa Malaysia listings").
"""


async def supervisor_node(state: AgentState):
    """The Supervisor decides which worker to call next or to finish."""
    llm = get_llm()
    
    system_instruction = state.get("system_instruction", "")
    prompt = SUPERVISOR_PROMPT.format(
        system_instruction=system_instruction if system_instruction else "No additional instructions."
    )
    
    messages = [SystemMessage(content=prompt)] + list(state["messages"])
    
    # We use with_structured_output to force the LLM to pick one of the Route options
    supervisor_chain = llm.with_structured_output(Route)
    response = await supervisor_chain.ainvoke(messages)
    
    return {"next": response.next}

async def research_node(state: AgentState):
    """Worker Agent: Researcher — specializes in web search, news, and market intelligence."""
    llm = get_llm()
    research_tools = [search_web, get_asean_business_news, get_current_date]
    research_agent = create_react_agent(
        llm, 
        tools=research_tools, 
        state_modifier=RESEARCHER_PROMPT
    )
    
    result = await research_agent.ainvoke({"messages": state["messages"]})
    last_message = result["messages"][-1]
    
    return {"messages": [AIMessage(content=f"**Researcher:**\n{last_message.content}", name="Researcher")]}

async def quant_node(state: AgentState):
    """Worker Agent: Quant — specializes in calculations, stock prices, and financial modeling."""
    llm = get_llm()
    quant_tools = [calculator, get_stock_price]
    quant_agent = create_react_agent(
        llm, 
        tools=quant_tools, 
        state_modifier=QUANT_PROMPT
    )
    
    result = await quant_agent.ainvoke({"messages": state["messages"]})
    last_message = result["messages"][-1]
    
    return {"messages": [AIMessage(content=f"**Quant:**\n{last_message.content}", name="Quant")]}

# --- Build Graph ---
builder = StateGraph(AgentState)
builder.add_node("Supervisor", supervisor_node)
builder.add_node("Researcher", research_node)
builder.add_node("Quant", quant_node)

builder.add_edge("Researcher", "Supervisor")
builder.add_edge("Quant", "Supervisor")

builder.add_conditional_edges(
    "Supervisor",
    lambda state: state["next"],
    {
        "Researcher": "Researcher",
        "Quant": "Quant",
        "FINISH": END
    }
)
builder.add_edge(START, "Supervisor")
graph = builder.compile()

async def run_langgraph_agent(prompt: str, system_instruction: str = "") -> str:
    """Run the LangGraph LangChain agentic workflow."""
    inputs = {
        "messages": [HumanMessage(content=prompt)],
        "system_instruction": system_instruction,
    }
    
    # Run the graph until FINISH is reached
    final_state = await graph.ainvoke(inputs, config={"recursion_limit": 15})
    
    final_messages = final_state.get("messages", [])
    
    # We aggregate worker responses to form a cohesive final answer
    worker_responses = []
    # Ignore the first human message
    for msg in final_messages[1:]:
        if isinstance(msg, AIMessage) and msg.name in ["Researcher", "Quant"]:
            worker_responses.append(msg.content)
            
    if not worker_responses:
        return "I could not generate an answer using the available agents."
        
    return "\n\n---\n\n".join(worker_responses)
