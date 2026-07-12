ORDERS SCREEN ("Incoming orders")
Current Issues:
Order status steps are confusing (multiple statuses shown as buttons)

"Confirmed" appears twice in the flow

Currency symbol mismatch (₹ instead of ₱)

No visual hierarchy for urgent vs. completed orders

Improvements Needed:
1. Simplify Order Status Flow

Replace the multiple status buttons with a single, clear status badge at the top of each order card:

🟡 Pending (Yellow)

🟢 Confirmed (Green)

🔵 Completed (Blue)

🔴 Cancelled (Red)

Remove the redundant status buttons below the date.

2. Add a Progress Timeline (Optional but Helpful)

Below the status badge, add a horizontal step indicator showing the journey:

Placed → Confirmed → Packed → Shipped → Completed

Highlight the current step with the brand color.

This replaces the confusing button row.

3. Improve Order Card Layout

text
┌─────────────────────────────────┐
│ 🍆 Eggplant            🟡 Pending │
│ 20 kg · Buyer order              │
│ Placed Jul 8, 2026               │
│                                  │
│ 💰 ₱1,160                        │
│                                  │
│ [💬 Chat]  [✅ Mark completed]   │
└─────────────────────────────────┘
4. Action Buttons Should Be Context-Aware

If status is Pending → Show: [💬 Chat] and [Confirm order]

If status is Confirmed → Show: [💬 Chat] and [Mark completed]

If status is Completed → Show: [💬 Chat] only (grayed out)

If status is Cancelled → Show: no actions, just a ⛔ Cancelled badge

5. Add Sorting/Filters

At the top of the orders list, add a segmented control or filter tabs:

All | Pending | Confirmed | Completed

This helps farmers quickly see what needs their attention.

6. Add "Days Since Order"

Next to the date, add a small chip: 📆 4 days ago or 📆 Today

Helps farmers prioritize older orders.

7. Fix Currency Symbol

Change all ₹ to ₱ (Philippine Peso).

PROFILE SCREEN
Current Issues:
"awdawd" appears to be a placeholder name (not user-friendly)

"Your crops" section is empty but takes up space

Stats (Listings, Sales, Rating) feel disconnected

No quick access to edit profile

No way to add crops directly from profile

Improvements Needed:
1. Redesign Profile Header

Add a profile photo placeholder (circular avatar with camera icon to upload)

Display full name prominently (e.g., Aling Rosa M. Santos)

Show role and location: 👨‍🌾 Farmer · Silang, Cavite

Keep the verified badge (great trust signal!)

2. Make Stats Interactive

The three stats (Listings, Sales, Rating) should be tappable cards:

Tap 12 Listings → Navigates to "My Listings" screen

Tap 38 Sales → Navigates to "Sales History" screen

Tap 4.8★ Rating → Navigates to "Reviews" screen

Add a subtle hover/press effect to indicate they're clickable.

3. Fix "Your Crops" Section

Instead of "None added yet", show a helpful empty state:

Illustration + text: "You haven't added any crops yet. Start by creating your first listing!"

Add a + Add Crop button that navigates to the "New Listing" screen.

Once crops are added, show them as small chips with emojis: 🍅 Tomato 🍌 Saba Banana 🌾 Palay

4. Group Menu Items Logically
Current menu is flat. Group them:

text
📋 Account Settings
   └── Edit profile
   └── Change password
   └── Manage payment methods

🔔 Notifications
   └── Order updates
   └── Price alerts
   └── Promotions

❓ Help & Support
   └── FAQ
   └── Contact us
   └── Report an issue

🚪 Log out
5. Add a "Share Profile" Button

At the top right of the profile header, add a 📤 Share icon.

Allows farmers to share their seller profile link with buyers via Messenger, SMS, etc.

6. Add "Earnings Summary" (if applicable)

Below the stats, add a small card:

💰 Total Earnings: ₱12,340

📅 This month: ₱4,200

This motivates farmers and gives a quick financial overview.

7. Improve Footer

"Sagana · AgriConnect · v1.0" looks like a footer. Move it to the very bottom with smaller, muted text.

Make the Log out button red or clearly distinct from other menu items.

8. Add a "Dark Mode" Toggle

Add a simple toggle switch in the Account Settings or at the bottom of the menu.

Useful for farmers working outdoors in bright sunlight.

ORDERS + PROFILE – ADDITIONAL SYSTEM FEATURES
1. Push Notification Suggestions

Add a section in settings for notification preferences:

🔔 New order placed

🔔 Order confirmed by buyer

🔔 Price drop/rise alerts for your crops

2. Order History Archive

Add a 📦 View all orders link at the bottom of the Orders screen.

Navigates to a full history with date filters (Last 7 days, This month, This year).

3. Offline Mode Indicator

Since farmers may have spotty internet, add a small indicator:

📶 Online (green) or 📶 Offline (grey) at the top bar.

When offline, cache the last viewed orders and listings.

SUMMARY OF QUICK WINS (DO THESE FIRST)
Screen	Priority Fix
Orders	Replace status buttons with a single status badge + progress timeline
Orders	Fix currency from ₹ to ₱
Orders	Add filter tabs (All, Pending, Confirmed, Completed)
Profile	Add profile photo and display proper name
Profile	Make stats interactive (tap to navigate)
Profile	Replace empty "Your crops" with + Add Crop CTA
Profile	Group menu items with headers or sections
Both	Ensure high contrast for outdoor readability