# ASU Expense Tracker

A production-grade, single-page expense tracking web app built for Arizona State University students and staff. Built with **React 18**, **Vite**, and **D3.js** — no backend, no database, everything lives in your browser.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
  - [Expense Management](#expense-management)
  - [Multi-User Authentication](#multi-user-authentication)
  - [Dashboard & Stats](#dashboard--stats)
  - [Filtering & Search](#filtering--search)
  - [Monthly Budget](#monthly-budget)
  - [D3.js Analytics](#d3js-analytics)
  - [UX & Design](#ux--design)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Data Storage](#data-storage)
- [Design Principles](#design-principles)
- [Author](#author)

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 (hooks, Context API, `useReducer`) |
| Build Tool | Vite 5 |
| Charts | D3.js v7 |
| Routing | None — single-page app |
| Persistence | `localStorage` (per-user, no backend) |
| Styling | Vanilla CSS (CSS custom properties, ASU brand tokens) |
| IDs | `uuid` v9 |

---

## Features

### Expense Management

- **Add expenses** via an inline slide-down form — no modal overlay, no page navigation
- **Edit any expense** in place; the same form re-opens pre-populated with existing values
- **Delete expenses** with a single click directly from the expense card
- **11 categories**: Food & Dining, Transport, Education, Entertainment, Health & Fitness, Shopping, Housing & Rent, Utilities, Travel, Subscriptions, Other
- Each expense captures: title, amount (USD), date, category, and an optional description
- Real-time **field validation** with inline error messages and live character counters
- Keyboard accessible — press `Escape` to dismiss the form at any time

### Multi-User Authentication

- **Simulated sign-in** using only `localStorage` — no server, no OAuth tokens required
- **Multi-step sign-in flow**: email lookup → returning users enter their password; new users fill in name, password (min 6 chars), and choose an avatar colour
- **Password verification**: passwords are salted with the user's email and hashed (`md5(password + ':asu:' + email)`) before storage; wrong passwords are rejected with an inline error banner
- **Show/hide toggle** on every password field for usability
- The same email always resolves to the same account — revisit the app anytime and your data is restored
- **FIFO 200-user cap**: when a 201st user registers, the oldest account is evicted automatically (`src/utils/userStorage.js`)
- **Guest → account import**: if you add expenses as a guest and then sign in, all your unsaved expenses are automatically merged into your new account
- **Unsaved data banner**: a sticky bottom banner warns guests that their data will be lost on page refresh; a `window.beforeunload` hook triggers the browser's native "Leave site?" dialog on accidental navigation
- **Inline sign-in panel**: clicking the Sign In button drops a compact corner panel — no full-screen overlay, no page change
- **Dynamic header title**: shows *"Expense Tracker"* for guests and *"[First Name]'s Expense Tracker"* once signed in
- **Gmail Gravatar**: if a signed-in user's email ends in `@gmail.com`, the app attempts to load their [Gravatar](https://gravatar.com) photo; falls back gracefully to the coloured-initial avatar if no Gravatar exists

### Dashboard & Stats

Four summary cards are always visible at the top of the page:

| Card | Shows |
|---|---|
| Total Spent | Cumulative sum of all recorded expenses |
| This Month | Running total for the current calendar month |
| Avg. per Expense | Mean transaction amount across all time |
| Highest Expense | Single largest item with its title |

### Filtering & Search

- **Category filter** — view any of the 11 categories or all at once
- **Full-text search** — searches title and description fields in real time
- **Sort order** — Newest / Oldest / Highest amount / Lowest amount / A–Z / Z–A
- All filters are combined client-side with `useMemo` for instant, zero-latency results

### Monthly Budget

- Set a monthly spending budget via the **Budget** button in the header
- A thin **progress bar** fixed directly below the header fills as spending increases:
  - Gold (< 70%) → Amber (70–89%) → Red with pulse animation (≥ 90%)
- The "This Month" stat chip mirrors the same colour-coded states
- Budget is stored per user and persists across sessions

### D3.js Analytics

The analytics panel is **always visible** — even before you've added a single expense. On first load it displays an animated **sample data preview** so you can explore all three charts and understand what your own data will look like. A pulsing banner reads *"Add your first expense to see your actual analytics"* and the charts animate in with staggered, engaging transitions. Once real expenses exist the demo data is replaced by your actual spending automatically.

All charts animate on load and update with smooth transitions when filters change.

**Summary stat row** (always visible above the charts):

| Stat | Description |
|---|---|
| Total Spent | Sum for the selected filter period |
| Avg / Month | Average monthly spend in the period |
| Top Category | The highest-spend category by name |
| Transactions | Count of matching expenses |

**Three interactive charts:**

1. **Monthly Spending Bar Chart**
   - Animated maroon bars grow up from the baseline on load
   - Individual bars turn gold on hover
   - Tooltip reveals: month label, exact dollar total, transaction count

2. **Category Donut Chart**
   - One arc per active category, coloured by the category's brand colour
   - Hovered arcs expand outward (detail-on-demand)
   - The centre of the donut shows the total for the period
   - A scrollable legend lists every category with its percentage share

3. **Spending Trend Line Chart**
   - CatmullRom smooth curve with an animated stroke-dashoffset draw effect
   - An area fill beneath the line adds visual weight
   - Interactive dots on each data point enlarge on hover with exact values

**Filters** (applied simultaneously to all three charts):

| Filter | Options |
|---|---|
| Category | All Categories · Food · Transport · Education · Entertainment · Health · Shopping · Housing · Utilities · Travel · Subscriptions · Other |
| Time range | Last 3 Months · Last 6 Months · This Year · All Time |

### UX & Design

- **ASU brand colours** — maroon (`#8C1D40`) and gold (`#FFC627`) as primary encoding colours throughout the UI
- **Animated palm tree background** — SVG illustration that adds personality without distracting from the data
- **Sticky navigation** — the header bar and budget progress line are pinned to the top of the viewport (`position: sticky`), always accessible while scrolling through long expense lists
- **Per-month pagination** — each month group in the expense list shows the top 5 entries by default; a gold pill button (`▼ +N more`) expands to a scrollable container for the rest; collapse with `▲ Show less`
- Smooth CSS animations on form open/close, modals, chart entries, and hover states
- Fully responsive — usable from 320 px (mobile) through wide desktop layouts

---

## Project Structure

```
src/
├── components/
│   ├── Analytics/          # D3.js charts — bar, donut, trend line
│   ├── AuthModal/          # Inline sign-in / account-creation panel
│   ├── BudgetModal/        # Monthly budget input dialog
│   ├── Dashboard/          # Summary stat cards
│   ├── ExpenseForm/        # Add / edit inline card form
│   ├── ExpenseItem/        # Single expense row with edit & delete
│   ├── ExpenseList/        # Month-grouped list with 5-entry pagination
│   ├── FilterBar/          # Category filter + search + sort controls
│   ├── Header/             # Sticky nav bar, quick-stat chips, action buttons
│   ├── PalmBackground/     # Animated SVG palm-tree background layer
│   ├── UnsavedBanner/      # Sticky guest-data-loss warning banner
│   └── UserMenu/           # Avatar button + dropdown / Sign In panel
├── context/
│   ├── AuthContext.jsx     # Auth state, signIn, signOut, session restore on refresh
│   └── ExpenseContext.jsx  # Expense CRUD, filter state, budget, localStorage sync
└── utils/
    ├── constants.js        # ASU brand colours, category definitions, sort options
    ├── formatters.js       # Currency, date, and month-year string helpers
    ├── md5.js              # Compact RFC-1321 MD5 (Gravatar URL hashing + password hashing)
    ├── storage.js          # Generic localStorage read / write helpers
    ├── userStorage.js      # FIFO 200-user multi-account localStorage engine
    └── validation.js       # Expense form field validation rules
```

---

## Getting Started

**Prerequisites:** Node.js 18 or later.

```bash
# Install dependencies
npm install

# Start the development server (hot-reload)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

No environment variables, no API keys, no accounts needed. Open [http://localhost:5173](http://localhost:5173) and start tracking.

---

## Data Storage

All data is stored in the browser's `localStorage`. Nothing ever leaves the device.

| Key | Contents |
|---|---|
| `prem_asu_expenses` | Guest (unauthenticated) expense array |
| `prem_asu_budget` | Guest monthly budget value |
| `asu_users` | Registered user index — FIFO ring, max 200 entries |
| `asu_user_{email_hash}` | Per-user expense array + budget |
| `asu_current_user` | Active session (name, email, avatar colour) |

Clearing browser storage or using a private/incognito window resets all data.

---

## Design Principles

The analytics visualisations are built on established information-visualisation research:

**Munzner's Laws**
Appropriate visual channels are matched to data types: length encodes quantitative amounts (bar height), colour hue encodes categorical identity (category colour), and position encodes time (x-axis). Chart junk — decorative elements that carry no data — is minimised throughout.

**Shneiderman's Mantra**
*Overview first, zoom and filter, then details on demand.* The summary stats row and chart overviews are always visible; exact values surface only in tooltips on hover interaction.

**Pre-attentive Attributes**
ASU maroon and gold guide the viewer's eye before conscious reading begins. Hover states flip to the complementary colour to signal interactivity without requiring instructional text.

**Animated Transitions**
When filters change, chart elements transition smoothly so viewers track what changed rather than re-reading from scratch — reducing cognitive load on data updates.

---

## Author

**Prem Pagare** — Arizona State University

> Sun Devils 🔱 · Built for learning, designed for daily use
