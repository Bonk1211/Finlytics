Here is a detailed UI/UX design style guide based on the "Neutrade" dashboard provided in the image. This documentation is structured to help your design team replicate and expand upon this specific aesthetic.

Neutrade UI Kit: Design System Documentation
1. Design Philosophy
The UI follows a modern, clean, and data-forward design philosophy. It utilizes a "bento box" or modular card layout to organize complex financial and crypto data into digestible, distinct sections. The interface feels trustworthy and analytical, yet approachable due to the ample whitespace and soft, rounded geometry.

2. Color Palette
The color system relies on a high-contrast, strictly controlled palette to draw attention to actionable data and status indicators.

Backgrounds:

App Background: Light Gray/Off-White (approx. #F4F5F7). Provides a soft contrast against the pure white data cards.

Card Background: Pure White (#FFFFFF).

Primary Brand:

Vibrant Blue: Used for primary call-to-action buttons (e.g., "Buy & Sell"), active states, chart data lines, and primary icons.

Text & Typography:

Primary Text: Near Black/Dark Gray for headings, main figures, and high-emphasis data.

Secondary Text: Medium Gray for labels, timestamps, table headers, and inactive states.

Semantic & Status Colors:

Positive/Success: Vibrant Green (used for percentage increases, "Completed" statuses, and positive sparklines).

Negative/Warning: Red/Orange (used for percentage decreases, "Pending" statuses, and negative sparklines).

AI/Premium Accents (NeuraNet AI):

Pastel Accents: Soft mint green and light lavender/purple are used as background fills for AI feature cards to differentiate them from standard financial data.

Vibrant Purple: Used for the premium/AI promotional banner in the sidebar.

3. Typography
The interface uses a clean, modern geometric sans-serif typeface (similar to Inter, SF Pro, or Roboto).

Hierarchy:

Hero Metrics: Exceptionally large and bold (e.g., the Main Balance $3,200). Decimal points are visually de-emphasized by using a lighter font weight and smaller size (.80).

Section Titles: Semi-bold, medium size (e.g., "Top tokens", "Recent activities").

Body/Labels: Regular weight, small to medium size, often in secondary gray text.

Styling: Minimal letter spacing, strict left-alignment for readability in tables and lists, and strong contrast in font weights to establish hierarchy without relying solely on color.

4. Layout, Spacing & Geometry
Grid System: A modular "bento box" layout. The main dashboard is divided into discrete, independent widget cards.

Border Radius: * Cards & Widgets: Soft, large rounded corners (approx. 16px - 24px).

Buttons: Fully rounded or "pill" shaped for primary actions. Small UI elements (like status badges or input fields) use tighter, proportionate rounding (8px - 12px).

Shadows & Depth: * Cards sit on the canvas with very subtle, soft, and diffuse drop shadows to create a slight elevation without looking heavy.

Zero borders on the cards; depth is achieved purely through shadow and background contrast.

Padding: Generous internal padding within cards (typically 20px - 24px) allows the data to breathe.

5. Component Guidelines
A. Navigation (Sidebar)
Active State: Indicated by a soft gray background pill, a bolded icon, and a directional arrow on the right.

Inactive State: Clean, borderless icons with medium gray text.

Utility: Features a prominent promotional card ("Upgrade to Pro") with a custom illustration/gradient background, and a segmented control at the bottom for Light/Dark mode toggling.

B. Charts & Data Visualization
Line Charts: Smooth, continuous spline curves. No harsh angles. The area under the curve is transparent or very faintly tinted. Gridlines are almost invisible, focusing solely on the trend line. Include interactive points with tooltips on hover.

Sparklines: Simplified, label-free miniature line charts used in the "Top tokens" list. Color-coded (Green for up, Red/Orange for down).

Gauge Charts: Used for the "Greed index". Segmented into distinct color blocks (Red, Orange, Yellow, Green, Purple) with a prominent central number.

C. Lists & Tables ("Recent Activities")
Borderless tables.

Rows are separated by ample whitespace rather than visible divider lines.

Icons are placed within soft, color-tinted circular or rounded-square backgrounds to denote transaction types (e.g., incoming vs. outgoing arrows).

D. AI Interface Module ("Neura AI")
Features a natural language input field ("Ask AI anything") with a circular send button.

Pre-defined AI action cards use soft pastel backgrounds with specific, color-matched iconography to feel distinct from the raw financial data.