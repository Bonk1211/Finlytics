# BorneoHack Judge Summary

## What this product is
BorneoHack is an AI platform for ASEAN MSMEs (small businesses) to solve 4 big problems:
1. Hard to get loans due to weak formal credit history.
2. Confusing cross-border trade regulations.
3. Poor demand planning and supplier selection.
4. Slow decisions because market and business data are fragmented.

## Pages and what each one does

1. **Dashboard Overview** (`/`)
- Shows business health in one view (revenue, expenses, cash flow, process widgets).
- Value: gives owners a fast snapshot for daily decision-making.

2. **Alternative Credit Scoring** (`/credit-scoring`)
- User enters business metrics (revenue, payment behavior, digital transactions, supplier reliability, etc.).
- AI returns credit score, risk level, loan recommendation, and key factors.
- Value: helps MSMEs become loan-ready using alternative data, not only bank history.

3. **Automated Supply Chain** (`/supply-chain`)
- User enters product, quantity, target region, and lead-time needs.
- AI recommends suppliers and compares lead time, cost, and suitability.
- Value: reduces stockout risk and improves procurement quality.

4. **Predictive Market Analytics** (`/worldmonitor`)
- Displays live world/risk monitoring dashboard with map layers and alerts.
- Value: helps businesses anticipate disruptions that affect demand, shipping, or supply.

5. **Cross-Border Trade Navigator** (`/trade-navigator`)
- Chat assistant for import/export rules, tariffs, and compliance guidance.
- Value: reduces trade mistakes and speeds up export/import planning.

6. **Business Visibility Engine** (`/visibility-engine`)
- Guided onboarding for offline businesses to create a digital profile.
- Value: improves discoverability and trust for financing/supply-chain participation.

7. **Security** (`/security`)
- Currently listed in sidebar but page not implemented yet.

8. **Account Settings** (`/account`)
- Currently listed in sidebar but page not implemented yet.

## How AI calculates and helps

## A. Credit Scoring AI
Input signals:
- Monthly revenue
- Years in business
- Transaction count
- Digital transaction ratio
- Mobile payment volume
- Inventory turnover
- Supplier count + reliability score
- Customer rating
- Payment history score

AI output:
- `credit_score` (300 to 850)
- `risk_probability` (0 to 1)
- `risk_category` (low/medium/high)
- loan recommendation
- suggested max loan amount
- suggested interest range
- explainable positive/negative factors

Why it matters:
- Converts real operating behavior into lender-friendly risk assessment.

## B. Supply Chain AI
Input signals:
- Product needed, quantity, target region, lead-time constraints, existing suppliers.

AI output:
- Ranked supplier recommendations.
- Trade-off analysis (cost, reliability, lead time).

Why it matters:
- Helps MSMEs source better and avoid delays.

## C. Trade AI (Regulation + HS + Tariff)
How it works:
- Uses regulation knowledge + semantic search + Gemini reasoning.
- Suggests HS codes, tariff expectations, and required documents.

Why it matters:
- Reduces compliance risk and customs delays.

## D. Market AI
How it works:
- Generates demand/competition/growth insights and pricing recommendations.

Why it matters:
- Helps businesses choose better markets and smarter prices.

## E. Chat AI Assistant
How it works:
- Multi-agent system routes tasks to:
- Research tools (news/web/tariff context).
- Quant tools (math, currency conversion, loan calculations).

Why it matters:
- One assistant can answer both strategic and numeric business questions quickly.

## Judge takeaway
This is not just a chatbot. It is a practical MSME operating system where each page maps to a real business decision:
- get financed,
- trade correctly,
- buy smarter,
- price better,
- and respond faster to market change.

