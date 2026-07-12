Project Context
A mobile app for Filipino farmers (like Aling Rosa) to manage crop listings, view price forecasts, and decide when to sell their harvest. Target users need high readability (sunlight-friendly), simple interactions, and trust-building data.

1. HOME / PRICE FORECAST SCREEN ("Should you sell now?")
Improvements Needed:

Add Confidence Indicator: Below the "+15%" forecast text, add a small tag with:

Text: "High Confidence" with a green badge/background, OR "Medium Confidence" with yellow badge.

Placement: Right next to or directly under the "+15%" percentage.

Interactive Graph Enhancement:

The text "Tap a point to see the predicted price" must be visually supported.

Add a subtle glowing dot or pulsing animation on the predicted line at the current date point to invite tapping.

When tapped, show a tooltip popup with exact date and price (e.g., "Jul 18 · ₱42/kg").

Add Seasonal/Context Alert: Below the graph, add a small one-line alert box (neutral/blue background):

Example text: "ℹ️ Typhoon season approaching – consider storage costs"

UI Polish on Graph:

Increase font size of ₱40 /kg and Jul 18 by +2pt.

Make the predicted line bold and use the primary brand green/teal color.

Make the actual line thinner and use a muted grey or dotted style.

2. "YOUR LISTINGS" SCREEN (List View)
Improvements Needed:

Replace Text Tags with Icons + Colors:

Change Steady → Icon: ↕️ + Color: Yellow/Grey

Change Hold → Icon: ⬆️ + Color: Green

Add a new status Sell Now → Icon: ⬇️ + Color: Red/Orange

Place these to the right of the price, aligned horizontally.

Add "Days to Harvest" Chip:

Next to the harvest date (e.g., Jul 13), add a small pill-shaped chip:

Example: "🌾 Harvest in 2 days" or "🌾 Harvested 1 day ago"

Use a neutral/light background to distinguish it from the date.

Add "Quick Action" Button on Each Card:

On the bottom-right corner of each listing card, add a small outline button:

Text: "Sell" or "Update Price"

This should navigate directly to a sell/update flow, skipping the detail page.

Increase Card Padding:

Add +8px vertical padding between the crop name and the location/price rows.

Ensure the crop name is bold and 2pt larger than the details text.

Add "New" Badge for Recent Listings: If a listing was created in the last 24 hours, show a small red NEW badge on the top-right corner of the card.

3. "NEW LISTING" SCREEN (Form)
Improvements Needed:

Replace Dropdown with Visual Crop Chips:

Remove the dropdown for Crop selection.

Replace with horizontal scrollable chips featuring:

Emoji/icon + crop name (e.g., 🍅 Tomato, 🍌 Saba Banana)

Selected state: filled brand color; Unselected state: outlined grey.

Ensure at least 5 crops are visible without scrolling.

Add "Suggested Price" Feature:

Right next to the Price / kg (₱) label, add a small clickable text link in brand color:

Text: "✨ Suggest based on forecast"

When tapped, it auto-fills the price field with a value derived from the forecast data for that crop.

Make "Post Listing" a Fixed Full-Width Button:

Convert the checkbox-style [ ] Post listing to a large, solid brand-color button.

Button should be sticky/fixed at the bottom of the screen so it's always visible.

Text: "📤 Post Listing Now"

Add a subtle shadow to separate it from the form content.

Add GPS Location Auto-Detect:

Next to the Barangay field, add a small GPS/location icon.

When tapped, it should attempt to auto-detect and fill the user's current barangay.

Quantity/Price Input Improvements:

Change the 0 placeholder to a more descriptive text: "Enter amount".

Add + and - buttons next to the quantity input for quick adjustments (especially helpful for users with larger fingers).

4. GLOBAL NAVIGATION & SYSTEM FEATURES
Improvements Needed:

Add Dashboard Summary Badge on Home:

At the very top of the Home screen, right under "Magandang araw, Aling Rosa 🍀🍀", add a small summary row:

Design: two small chips/cards side-by-side

Left: 📦 2 active listings

Right: 📋 3 pending orders

Add In-App Chat / Contact Feature:

On any listing detail or order screen, add a "💬 Contact Buyer" or "Chat" button.

This should open a simple messaging interface (even if just a placeholder for now).

High Contrast / Sunlight Readability Audit:

Ensure all text meets WCAG AA contrast ratio (minimum 4.5:1 for normal text).

Particularly check: Steady, Hold, and any grey labels on the cards.

Consider adding a dark mode toggle in the profile settings for outdoor use.

5. ADDITIONAL POLISH (NICE-TO-HAVE)
Empty State Illustration: If a farmer has no listings, show a friendly illustration + text: "No listings yet. Tap + to start selling!"

Loading Skeleton: Add shimmer loading placeholders for the forecast graph and listings while data loads.

Haptic Feedback: On Android/iOS, add a subtle vibration when a user taps a forecast point or posts a listing (confirmation feedback).

Design Tokens to Use
Element	Value
Primary Brand Color	#2A9D8F (Teal/Green)
Secondary/Action Color	#E9C46A (Warm Yellow for highlights)
Danger/Sell Now	#E76F51 (Warm Red-Orange)
Success/Hold	#2A9D8F (Green)
Neutral/Steady	#8D99AE (Grey)
Font Scale	Headings: 18pt; Body: 14pt; Labels: 12pt
Card Border Radius	12px
Button Height	48px minimum
End of Prompt.