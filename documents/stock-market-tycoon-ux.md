# Stock Market Tycoon - Complete User Journey & Visualization Guide

**Version:** 1.0  
**Last Updated:** October 16, 2025  
**Purpose:** Detailed user experience flow for webapp development

---

## Table of Contents

1. [Landing & Authentication](#landing--authentication)
2. [First-Time User Onboarding](#first-time-user-onboarding)
3. [Main Dashboard](#main-dashboard)
4. [Game Lobby System](#game-lobby-system)
5. [Game Screen - Core Layout](#game-screen---core-layout)
6. [Trader Mode Tutorial](#trader-mode-tutorial)
7. [Investor Mode Tutorial](#investor-mode-tutorial)
8. [Strategist Mode Tutorial](#strategist-mode-tutorial)
9. [Main Gameplay Flow](#main-gameplay-flow)
10. [End of Round Sequence](#end-of-round-sequence)
11. [End of Game Experience](#end-of-game-experience)
12. [Profile & Settings](#profile--settings)
13. [Mobile Experience](#mobile-experience)
14. [Error States & Edge Cases](#error-states--edge-cases)
15. [Visual Design System](#visual-design-system)

---

## Landing & Authentication

### Landing Page - First Impression

**URL:** `https://stockmarkettycoon.com/`

#### Hero Section
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    [Animated Background]                        │
│              Stock tickers scrolling across screen              │
│           Company logos floating with price changes             │
│                                                                 │
│               📈 STOCK MARKET TYCOON 📊                         │
│                                                                 │
│           Build Your Fortune in the Stock Market                │
│               No Real Money. Real Strategy.                     │
│                                                                 │
│           ┌────────────────────────────────────┐               │
│           │  🔐 Sign In with Google            │               │
│           └────────────────────────────────────┘               │
│                                                                 │
│                    [Scroll for more ↓]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Visual Elements:**
- **Background Animation:**
  - Subtle dark gradient (navy to dark purple)
  - Animated stock tickers scrolling horizontally
  - 6 company logos floating gently
  - Price numbers changing (+/- animations)
  - Particles/dots connecting logos (network effect)

- **Typography:**
  - Title: Large, bold, modern sans-serif
  - Subtitle: Clean, readable, slightly smaller
  - Call-to-action button: High contrast, rounded corners

- **Button State:**
  - Default: Solid color with Google "G" logo
  - Hover: Slight lift effect (shadow increases)
  - Loading: Spinner replaces text
  - Error: Shake animation + error message below

#### Features Section (Below Hero)

**Scroll down to reveal:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHY PLAY STOCK MARKET TYCOON?                │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   🎯 Learn   │  │  👥 Compete  │  │  🏆 Master   │         │
│  │              │  │              │  │              │         │
│  │   Real stock │  │  Play with   │  │  3 difficulty│         │
│  │   market     │  │  friends or  │  │  levels from │         │
│  │   concepts   │  │  worldwide   │  │  beginner to │         │
│  │              │  │              │  │  expert      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  ⚡ Fast     │  │  📱 Play     │  │  🎓 Tutorial │         │
│  │              │  │              │  │              │         │
│  │   Games in   │  │  On any      │  │  Learn as    │         │
│  │   15-20      │  │  device -    │  │  you play    │         │
│  │   minutes    │  │  responsive  │  │  with guides │         │
│  │              │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Animation:** Each feature card fades in as user scrolls

#### How It Works Section

```
┌─────────────────────────────────────────────────────────────────┐
│                        HOW IT WORKS                             │
│                                                                 │
│  1️⃣  Sign in with Google                                        │
│      ↓                                                          │
│  2️⃣  Complete interactive tutorial                              │
│      ↓                                                          │
│  3️⃣  Play Trader Mode to learn basics                           │
│      ↓                                                          │
│  4️⃣  Unlock Investor & Strategist modes                         │
│      ↓                                                          │
│  5️⃣  Compete on global leaderboards                             │
│                                                                 │
│                  [Sign In to Get Started]                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Footer
```
┌─────────────────────────────────────────────────────────────────┐
│  About | Rules | Privacy Policy | Terms of Service | Contact    │
│                                                                 │
│  © 2025 Stock Market Tycoon. Not affiliated with real markets. │
└─────────────────────────────────────────────────────────────────┘
```

---

### Google Sign-In Flow

#### Step 1: Click "Sign In with Google"

**Loading State:**
```
┌────────────────────────────────┐
│  🔐 Connecting to Google...    │
│  [Spinner animation]           │
└────────────────────────────────┘
```

#### Step 2: Google OAuth Popup

- Standard Google account selection screen
- Permission request: "Stock Market Tycoon wants to:"
  - View your email address
  - View your basic profile info
  - **Note:** We only need email + name for account creation

#### Step 3A: New User - Account Creation

If email not in database:

```
┌─────────────────────────────────────────────────────────────────┐
│                    WELCOME TO STOCK MARKET TYCOON!              │
│                                                                 │
│  We need a few details to set up your account:                  │
│                                                                 │
│  Email: john.doe@gmail.com (from Google)                        │
│                                                                 │
│  Username:                                                      │
│  [_____________________]                                        │
│  • 3-20 characters                                              │
│  • Letters, numbers, underscores only                           │
│  • Will be visible to other players                             │
│                                                                 │
│  Choose Avatar:                                                 │
│  [👨] [👩] [🧑] [👴] [👵] [🎭] [🤖] [🐻] [🦁] [🦊]              │
│                                                                 │
│  I agree to the [Terms of Service] and [Privacy Policy]         │
│  [✓]                                                            │
│                                                                 │
│  [Create Account & Continue]                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Validation:**
- Username uniqueness checked in real-time
- Green checkmark if available
- Red X if taken with suggestion: "JohnDoe_42 is available"

**Database Entry Created:**
```sql
INSERT INTO users (
  user_id, 
  email, 
  username, 
  avatar_url,
  created_at,
  games_played_trader,
  investor_unlocked,
  strategist_unlocked
) VALUES (
  gen_random_uuid(),
  'john.doe@gmail.com',
  'JohnDoe_42',
  'avatar_1.png',
  NOW(),
  0,
  FALSE,
  FALSE
);
```

#### Step 3B: Returning User - Direct Login

If email found in database:

```
┌─────────────────────────────────────────────────────────────────┐
│                    WELCOME BACK, JOHNDOE_42!                    │
│                                                                 │
│  [Loading your stats...]                                        │
│  [Spinner animation]                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Transitions to:** Main Dashboard (in 1-2 seconds)

---

### Error States - Authentication

#### Google Sign-In Failed
```
┌────────────────────────────────────┐
│  ⚠️ Authentication Failed          │
│                                    │
│  Unable to connect with Google.    │
│  Please try again.                 │
│                                    │
│  [Try Again]  [Need Help?]         │
└────────────────────────────────────┘
```

#### Username Taken
```
Username: [JohnDoe________]  ❌
"JohnDoe" is already taken
Try: JohnDoe_42, JohnDoe2025, John_Doe
```

#### Network Error
```
┌────────────────────────────────────┐
│  ⚠️ Connection Error               │
│                                    │
│  Check your internet connection    │
│  and try again.                    │
│                                    │
│  [Retry]                           │
└────────────────────────────────────┘
```

---

## First-Time User Onboarding

### Welcome Screen (New Users Only)

**Shown immediately after account creation**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🎉 ACCOUNT CREATED! 🎉                       │
│                                                                 │
│              Welcome to Stock Market Tycoon, JohnDoe_42!        │
│                                                                 │
│  You're about to learn how to play the stock market without     │
│  risking real money. Before you jump in, let's learn the basics.│
│                                                                 │
│                                                                 │
│  What you'll learn in the next 5 minutes:                       │
│                                                                 │
│  ✓ How to read stock prices                                    │
│  ✓ How to buy and sell shares                                  │
│  ✓ Understanding your cards                                     │
│  ✓ Special cards and powers                                     │
│  ✓ How to win the game                                          │
│                                                                 │
│                                                                 │
│           [Start Interactive Tutorial] [Skip to Game]           │
│                                                                 │
│           (You can revisit the tutorial anytime)                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**User Choices:**
1. **Start Interactive Tutorial** → Goes to Onboarding Tutorial
2. **Skip to Game** → Goes directly to Main Dashboard
   - Shows tooltip: "Access tutorial anytime from Settings"

---

### Onboarding Tutorial (First-Time Users)

**Purpose:** Teach core concepts before first game  
**Duration:** 3-5 minutes  
**Style:** Interactive, step-by-step with animations

#### Tutorial Step 1: Understanding the Game

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●○○○○ Step 1 of 5]                                 │
│                                                                 │
│                    📚 UNDERSTANDING THE GAME                    │
│                                                                 │
│  Stock Market Tycoon is a game about buying and selling shares  │
│  in 6 different companies. Your goal is simple:                 │
│                                                                 │
│           💰 END WITH THE MOST MONEY 💰                         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Each game has:                                           │ │
│  │  • 10 rounds (called "market years")                      │ │
│  │  • Up to 3 transactions per round                         │ │
│  │  • 2-6 players competing                                  │ │
│  │                                                           │ │
│  │  You start with: $600,000                                 │ │
│  │  Winner: Highest net worth after 10 rounds               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│                          [Next →]                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Animation:** Money counter rolling up to $600,000

#### Tutorial Step 2: The Six Companies

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●●○○○ Step 2 of 5]                                 │
│                                                                 │
│                    🏢 THE SIX COMPANIES                         │
│                                                                 │
│  You can invest in 6 fictional companies. Each has different    │
│  starting prices and volatility (how much prices can change).   │
│                                                                 │
│  ┌─────────────┬─────────┬──────────────┐                      │
│  │ Company     │ Price   │ Volatility   │                      │
│  ├─────────────┼─────────┼──────────────┤                      │
│  │ 🏦 Atlas Bank   │ $20   │ ██ Low       │ ← Stable, safe   │
│  │ 🏭 Titan Steel  │ $25   │ ████ Med-Low │                   │
│  │ 🌍 Global Ind   │ $45   │ ████ Medium  │                   │
│  │ ⚡ Omega Energy │ $55   │ ██████ Med-Hi│                   │
│  │ 💊 VitalCare    │ $75   │ ████████ High│                   │
│  │ 💻 NovaTech     │ $80   │ ██████████ VH│ ← Risky, rewards │
│  └─────────────┴─────────┴──────────────┘                      │
│                                                                 │
│  💡 Tip: Cheap stocks = easier to buy lots of shares            │
│         Volatile stocks = bigger price swings (risk & reward)   │
│                                                                 │
│                   [← Back]    [Next →]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Animation:** Each company logo highlights as cursor hovers

#### Tutorial Step 3: Your Cards

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●●●○○ Step 3 of 5]                                 │
│                                                                 │
│                    🃏 UNDERSTANDING YOUR CARDS                  │
│                                                                 │
│  Each round, you get cards that show how stock prices will      │
│  change. Here's an example:                                     │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ 💻      │  │ 💻      │  │ 🏦      │  │ 💊      │          │
│  │NovaTech │  │NovaTech │  │  Atlas  │  │VitalCare│          │
│  │         │  │         │  │  Bank   │  │         │          │
│  │  +20    │  │  -30    │  │   +5    │  │  +15    │          │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
│                                                                 │
│  This means:                                                    │
│  • You have 2 NovaTech cards: +20 and -30                      │
│  • Combined: +20 + (-30) = -10                                 │
│  • You have 1 Atlas Bank card: +5                              │
│  • You have 1 VitalCare card: +15                              │
│                                                                 │
│  💡 Important Rule: You can only BUY a stock if your cards for  │
│     that stock add up to ZERO or POSITIVE.                      │
│                                                                 │
│  ✅ Can buy: Atlas Bank (+5) and VitalCare (+15)               │
│  ❌ Cannot buy: NovaTech (-10)                                  │
│                                                                 │
│                   [← Back]    [Next →]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Interaction:** Cards flip when tapped to show front/back

#### Tutorial Step 4: Buying & Selling

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●●●●○ Step 4 of 5]                                 │
│                                                                 │
│                    💰 BUYING & SELLING SHARES                   │
│                                                                 │
│  Let's practice! You have $600,000 cash.                        │
│  Atlas Bank is $20 per share.                                   │
│  Your cards show +5 for Atlas Bank. ✓ You can buy!             │
│                                                                 │
│  [Interactive Demo]                                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Buy Atlas Bank Shares                                    │ │
│  │                                                           │ │
│  │  Current Price: $20/share                                │ │
│  │                                                           │ │
│  │  How many shares? [Slider: 0 ═══●═══ 30,000]            │ │
│  │                    Selected: 15,000 shares               │ │
│  │                                                           │ │
│  │  Total Cost: $300,000                                    │ │
│  │  Remaining Cash: $300,000                                │ │
│  │                                                           │ │
│  │  [BUY NOW]                                               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Try buying 15,000 shares using the slider above!               │
│                                                                 │
│  💡 Minimum purchase: 1,000 shares ($5,000 minimum)            │
│                                                                 │
│                   [← Back]    [Complete Purchase →]             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Interaction:** 
- User must interact with slider
- "Complete Purchase" only enabled after moving slider
- Animates cash decreasing and shares appearing in portfolio

#### Tutorial Step 5: Winning Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●●●●● Step 5 of 5]                                 │
│                                                                 │
│                    🏆 HOW TO WIN                                │
│                                                                 │
│  Your NET WORTH = Cash + Total Stock Value                      │
│                                                                 │
│  After 10 rounds, the player with the highest net worth wins!   │
│                                                                 │
│  Example:                                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Cash in hand:        $300,000                            │ │
│  │  Atlas Bank:          15,000 shares @ $25 = $375,000     │ │
│  │  NovaTech:            5,000 shares @ $100 = $500,000     │ │
│  │  ─────────────────────────────────────────────────        │ │
│  │  NET WORTH:           $1,175,000                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  💡 Key Strategies:                                             │
│  • Buy low, sell high (obviously!)                              │
│  • Watch your cards - they predict price changes                │
│  • Own 25% of a company = become Director (special power)       │
│  • Own 50% of a company = become Chairman (stronger power)      │
│  • Don't keep too much cash - invest to grow wealth!            │
│                                                                 │
│             ✨ YOU'RE READY TO PLAY! ✨                          │
│                                                                 │
│                   [← Back]    [Start Playing →]                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Celebration Animation:** Confetti falls when clicking "Start Playing"

---

### Post-Tutorial Transition

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ✓ TUTORIAL COMPLETE!                         │
│                                                                 │
│  You've learned the basics of Stock Market Tycoon!              │
│  Time to play your first game in Trader Mode.                   │
│                                                                 │
│  Remember:                                                      │
│  • Start with Trader Mode (basics)                              │
│  • Complete 3 games to unlock Investor Mode                     │
│  • Win 2 Investor games to unlock Strategist Mode               │
│                                                                 │
│             [Go to Dashboard & Create First Game]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Auto-redirects in 3 seconds** (or when button clicked) → Main Dashboard

---

## Main Dashboard

### Layout Overview

**URL:** `https://stockmarkettycoon.com/dashboard`

The main dashboard is your home base. Three-panel layout:

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  Stock Market Tycoon      [Search] [🔔] [Profile ▼]    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────────────────┬────────────────────────┐
│              │                          │                        │
│  LEFT PANEL  │   CENTER PANEL           │   RIGHT PANEL          │
│  Profile &   │   Game Actions           │   Social &             │
│  Progress    │                          │   Leaderboards         │
│              │                          │                        │
│              │                          │                        │
│              │                          │                        │
│              │                          │                        │
│              │                          │                        │
│              │                          │                        │
└──────────────┴──────────────────────────┴────────────────────────┘
```

---

### Left Panel - Profile & Progress

```
┌─────────────────────────────────────┐
│  [Avatar]                           │
│  JohnDoe_42                         │
│  Member since: Oct 2025             │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                     │
│  📊 CURRENT MODE                    │
│  🎯 Trader Mode                     │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                     │
│  📈 QUICK STATS                     │
│  Games Played: 0                    │
│  Win Rate: --                       │
│  Highest Net Worth: $0              │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                     │
│  🔓 MODE UNLOCKS                    │
│                                     │
│  ✅ Trader Mode                     │
│  └─ Unlocked                        │
│                                     │
│  🔒 Investor Mode                   │
│  └─ Complete 3 Trader games         │
│     Progress: 0/3                   │
│                                     │
│  🔒 Strategist Mode                 │
│  └─ Unlock Investor first           │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                     │
│  🏆 RECENT ACHIEVEMENTS              │
│  [Empty - play to earn!]            │
│                                     │
│  [View All Achievements →]          │
│                                     │
└─────────────────────────────────────┘
```

**Interactive Elements:**
- **Avatar:** Click to change
- **Mode badge:** Click to see details about each mode
- **Progress bars:** Animated fill as you complete games
- **Achievements:** Hover to see details, click to view collection

---

### Center Panel - Game Actions

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│           🎮 PLAY STOCK MARKET TYCOON 🎮                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │              [Large Button]                             │ │
│  │         ➕ CREATE NEW GAME                              │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                               │
│  📋 AVAILABLE GAMES                                           │
│                                                               │
│  Filters: [All Modes ▼] [Player Count: Any ▼] [🔄 Refresh]  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🎯 Trader Mode                                          │ │
│  │ Players: 3/6  •  Round: Waiting to start                │ │
│  │ Host: Sarah_Trades  •  Created: 2 mins ago              │ │
│  │                                          [JOIN GAME →]  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🎯 Trader Mode                                          │ │
│  │ Players: 2/4  •  Round: Waiting to start                │ │
│  │ Host: Mike_Investor  •  Created: 5 mins ago             │ │
│  │                                          [JOIN GAME →]  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 📊 Investor Mode                             🔒          │ │
│  │ Unlock by completing 3 Trader games                     │ │
│  │                               [View Requirements →]     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  [Load More Games...]                                         │
│                                                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                               │
│  🔁 YOUR ACTIVE GAMES                                         │
│                                                               │
│  [No active games]                                            │
│                                                               │
│  (Games you're currently playing will appear here)            │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Real-time Updates:**
- Available games list refreshes every 10 seconds
- New games appear with slide-in animation
- "Players joined" updates live
- If a game fills up, it disappears from list

---

### Right Panel - Social & Leaderboards

```
┌────────────────────────────────────┐
│  👥 FRIENDS                        │
│                                    │
│  🟢 Alice_Trader     [Invite]      │
│     In game (Investor Mode)        │
│                                    │
│  ⚫ Bob_Stocks        [Invite]     │
│     Offline - Last seen 2h ago     │
│                                    │
│  [+ Add Friends]                   │
│                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                    │
│  🏆 GLOBAL LEADERBOARD             │
│                                    │
│  [This Week ▼]                     │
│                                    │
│  1. 🥇 ProTrader99   $3.2M  15W    │
│  2. 🥈 StockQueen    $2.9M  12W    │
│  3. 🥉 MarketKing    $2.7M  11W    │
│  4.    InvestorPro   $2.5M  10W    │
│  5.    WealthBuilder $2.4M   9W    │
│  ...                               │
│  247.  YOU          $0       0W    │
│                                    │
│  [View Full Leaderboard →]         │
│                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                    │
│  📊 COMMUNITY STATS                │
│                                    │
│  • 1,247 games played today        │
│  • 423 players online now          │
│  • Most popular: Trader Mode       │
│                                    │
└────────────────────────────────────┘
```

**Interactive Elements:**
- **Friends list:** Click to view profile, send invite
- **Online indicator:** Green (online), Yellow (away), Gray (offline)
- **Leaderboard tabs:** This Week, All Time, Friends Only
- **Your rank:** Highlighted when visible

---

### Top Navigation Bar

```
┌─────────────────────────────────────────────────────────────────┐
│ [📈 Logo]  Stock Market Tycoon                                  │
│                                                                 │
│  [🔍 Search players...]  [🔔 3]  [⚙️]  [👤 Profile ▼]          │
└─────────────────────────────────────────────────────────────────┘
```

**Notification Bell (🔔) Dropdown:**
```
┌─────────────────────────────────┐
│  NOTIFICATIONS (3)              │
│                                 │
│  • Sarah_Trades invited you     │
│    to a Trader game             │
│    [Accept] [Decline]           │
│                                 │
│  • New achievement unlocked!    │
│    "First Steps"                │
│    [View]                       │
│                                 │
│  • Your game is ready to start  │
│    [Join Now]                   │
│                                 │
│  [Mark all as read]             │
└─────────────────────────────────┘
```

**Profile Dropdown:**
```
┌─────────────────────────────────┐
│  JohnDoe_42                     │
│  john.doe@gmail.com             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│  📊 View Profile                │
│  ⚙️  Settings                   │
│  🎓 Replay Tutorial             │
│  📚 Game Rules                  │
│  📧 Invite Friends              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│  🚪 Sign Out                    │
└─────────────────────────────────┘
```

---

## Game Lobby System

### Creating a New Game

#### Step 1: Click "Create New Game"

Modal appears:

```
┌─────────────────────────────────────────────────────────────────┐
│  CREATE NEW GAME                                      [✕ Close] │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  GAME MODE                                                      │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  🎯 Trader     │  │  📊 Investor   │  │  🎓 Strategist │   │
│  │                │  │       🔒       │  │       🔒       │   │
│  │  Unlocked      │  │  Complete 3    │  │  Win 2         │   │
│  │  [●] SELECT    │  │  Trader games  │  │  Investor games│   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  GAME SETTINGS                                                  │
│                                                                 │
│  Number of Players: [2-6]                                       │
│  ●──────●────────● 2    3    4    5    6                       │
│  Selected: 4 players                                            │
│                                                                 │
│  Number of Rounds: [5-15]                                       │
│  ●──────────●──── 5    10   15                                 │
│  Selected: 10 rounds (recommended)                              │
│                                                                 │
│  Privacy:                                                       │
│  [●] Public - Anyone can join                                   │
│  [ ] Private - Invite only (share code)                         │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│                 [Cancel]        [Create Game]                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Validation:**
- Locked modes show tooltip: "Complete 3 Trader games to unlock"
- Cannot create game in locked mode

#### Step 2: Game Created - Lobby Screen

**URL:** `https://stockmarkettycoon.com/game/[game-id]/lobby`

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 TRADER MODE GAME LOBBY                       [Leave Game]  │
│                                                                 │
│  Game Code: WXYZ-5678        [📋 Copy Link to Share]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┬──────────────────────────┐
│                                      │                          │
│  PLAYERS (1/4)                       │  GAME SETTINGS           │
│                                      │                          │
│  ┌────────────────────────────────┐ │  Mode: 🎯 Trader         │
│  │  [👤 Avatar]                   │ │  Rounds: 10              │
│  │  JohnDoe_42 (You)              │ │  Privacy: Public         │
│  │  Host • Ready ✓                │ │                          │
│  │                                │ │  ━━━━━━━━━━━━━━━━━━━━  │
│  │  [Not Ready]  [Ready ✓]        │ │                          │
│  └────────────────────────────────┘ │  CHAT                    │
│                                      │                          │
│  ┌────────────────────────────────┐ │  ┌────────────────────┐ │
│  │  [Empty Slot]                  │ │  │ JohnDoe_42:        │ │
│  │  Waiting for player...         │ │  │ Let's play!        │ │
│  │                                │ │  │                    │ │
│  │  [Invite Friends]              │ │  │ [Type message...] │ │
│  └────────────────────────────────┘ │  └────────────────────┘ │
│                                      │                          │
│  ┌────────────────────────────────┐ │  ━━━━━━━━━━━━━━━━━━━━  │
│  │  [Empty Slot]                  │ │                          │
│  │  Waiting for player...         │ │  HOST CONTROLS           │
│  │                                │ │                          │
│  │  [Invite Friends]              │ │  [Kick Player]           │
│  └────────────────────────────────┘ │  [Change Settings]       │
│                                      │                          │
│  ┌────────────────────────────────┐ │  ━━━━━━━━━━━━━━━━━━━━  │
│  │  [Empty Slot]                  │ │                          │
│  │  Waiting for player...         │ │  Minimum 2 players       │
│  │                                │ │  to start                │
│  │  [Invite Friends]              │ │                          │
│  └────────────────────────────────┘ │  [START GAME]            │
│                                      │  (disabled - need 2+)    │
└──────────────────────────────────────┴──────────────────────────┘
```

**Real-time Updates:**
- When player joins, slot fills instantly
- Ready status updates live
- Chat messages appear immediately
- Player count updates in real-time

---

## Game Screen - Core Layout

### Full Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER BAR                                                     │
│  Round: 1/10 | Transaction: 1/3 | Turn: Sarah_Trades | ⏱️ 0:45 │
└─────────────────────────────────────────────────────────────────┘

┌────────────┬─────────────────────────────────┬─────────────────┐
│            │                                 │                 │
│   LEFT     │         CENTER PANEL            │   RIGHT PANEL   │
│   PANEL    │         GAME BOARD              │                 │
│            │                                 │                 │
│ Portfolio  │      📊 Stock Prices            │  🃏 Your Cards  │
│            │                                 │                 │
│ 💰 Cash    │  ┌─────────────────────────┐   │  ┌───┐ ┌───┐   │
│ $600,000   │  │ 🏦 Atlas Bank      $20  │   │  │+5 │ │-10│   │
│            │  │ ▬▬▬▬ 40%                │   │  └───┘ └───┘   │
│ 📊 Stocks  │  │ Director: (none)        │   │                 │
│ (empty)    │  │ Chairman: (none)        │   │  Card Summary  │
│            │  └─────────────────────────┘   │  Atlas: -5 ❌   │
│ 🏆 Worth   │                                 │  Nova: +20 ✓   │
│ $600,000   │  [Other 5 stock cards...]       │                 │
│            │                                 │  Transaction   │
│ Powers     │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  Log           │
│ (none)     │                                 │                 │
│            │  OTHER PLAYERS                  │  Recent:       │
│            │                                 │  • Round start │
│            │  ┌──────┐ ┌──────┐ ┌──────┐   │                 │
│            │  │Sarah │ │ Mike │ │Alice │   │  [View full]   │
│            │  │$600K │ │$600K │ │$600K │   │                 │
│            │  │ 1st  │ │ 1st  │ │ 1st  │   │                 │
│            │  └──────┘ └──────┘ └──────┘   │                 │
│            │                                 │                 │
└────────────┴─────────────────────────────────┴─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ACTION BAR                                                     │
│  [BUY] [SELL] [SPECIAL CARD ▼] [PASS] [END TURN]              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Trader Mode Tutorial

**Trigger:** First time playing Trader Mode

### Tutorial Complete Message

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🎉 TUTORIAL COMPLETE! 🎉                     │
│                                                                 │
│  You've learned the basics of Trader Mode!                      │
│                                                                 │
│  ✓ Understanding stock prices                                   │
│  ✓ Reading your cards                                           │
│  ✓ Buying and selling shares                                    │
│  ✓ Using special cards                                          │
│  ✓ End of round process                                         │
│  ✓ Director/Chairman powers                                     │
│                                                                 │
│  You're ready to play for real!                                 │
│                                                                 │
│  This tutorial game doesn't count toward your stats.            │
│  Start a real game to begin your journey!                       │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  Remember:                                                      │
│  • Complete 3 Trader games to unlock Investor Mode              │
│  • Win 2 Investor games to unlock Strategist Mode               │
│                                                                 │
│     [Replay Tutorial]    [Go to Dashboard & Play For Real]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Investor Mode Tutorial

**Trigger:** First time accessing Investor Mode

### Unlock Message

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                  🎉 INVESTOR MODE UNLOCKED! 🎉                  │
│                                                                 │
│  Congratulations! You've completed 3 Trader games.              │
│                                                                 │
│  You've unlocked: 📊 INVESTOR MODE                              │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  NEW FEATURE: 📉 SHORT SELLING                                  │
│                                                                 │
│  In Investor Mode, you can SHORT stocks - betting that their    │
│  price will FALL. If you're right, you profit. If wrong, you    │
│  lose money (and can even go bankrupt!).                        │
│                                                                 │
│  This adds a whole new dimension to strategy!                   │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  Ready to learn?                                                │
│                                                                 │
│     [Skip Tutorial]    [Start Investor Mode Tutorial]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Strategist Mode Tutorial

**Trigger:** First time accessing Strategist Mode

### Unlock Message

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                🎉 STRATEGIST MODE UNLOCKED! 🎉                  │
│                                                                 │
│  CONGRATULATIONS! You've won 2 Investor games!                  │
│                                                                 │
│  You've unlocked: 🎓 STRATEGIST MODE                            │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  This is the ULTIMATE level of Stock Market Tycoon!             │
│                                                                 │
│  NEW FEATURES:                                                  │
│  📊 Options Trading (Calls & Puts)                             │
│  💵 Dividends (Extract value as Director/Chairman)              │
│  🔄 Stock Buybacks (Consolidate power as Chairman)              │
│                                                                 │
│  These advanced mechanics create incredible strategic depth.    │
│  Master them to dominate the market!                            │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  This tutorial will cover all three features.                   │
│  Take your time - Strategist Mode is complex!                   │
│                                                                 │
│     [Skip Tutorial]    [Start Strategist Mode Tutorial]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## End of Round Sequence

### Step 1: Card Reveal

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🃏 REVEALING CARDS 🃏                        │
│                        ROUND 3 OF 10                            │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  SARAH_TRADES reveals:                                          │
│                                                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │
│  │ 🏭  │ │ 🏭  │ │ 💻  │ │ 💻  │ │ 🏦  │ │ ⚡  │            │
│  │ +15 │ │ +10 │ │ +30 │ │ -20 │ │ +10 │ │ -15 │            │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘            │
│                                                                 │
│  [Cards flip in with animation]                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: Price Changes

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    💹 NEW STOCK PRICES                          │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  🏦 ATLAS BANK                                                  │
│  $30  ➜  $35                                                    │
│  +$5 (+17%) ▲                                                   │
│                                                                 │
│  🏭 TITAN STEEL                                                 │
│  $35  ➜  $95                                                    │
│  +$60 (+171%) ▲▲▲ [MASSIVE GAIN!]                              │
│                                                                 │
│  💻 NOVATECH                                                    │
│  $105  ➜  $95                                                   │
│  -$10 (-10%) ▼                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Updated Rankings

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🏆 END OF ROUND 3 RANKINGS                   │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  🥇 1ST - SARAH_TRADES                                          │
│  Net Worth: $2,450,000                                          │
│  Round change: +$320,000 (+15%) ▲                              │
│  Previous rank: 2nd ↑                                           │
│                                                                 │
│  🥈 2ND - YOU                                                   │
│  Net Worth: $2,180,000                                          │
│  Round change: +$415,000 (+23%) ▲▲                             │
│  Previous rank: 3rd ↑                                           │
│                                                                 │
│  🥉 3RD - MIKE_INVEST                                           │
│  Net Worth: $1,920,000                                          │
│  Round change: +$150,000 (+8%) ▲                               │
│  Previous rank: 1st ↓                                           │
│                                                                 │
│  4️⃣  4TH - ALICE_TRADER                                          │
│  Net Worth: $1,450,000                                          │
│  Round change: +$30,000 (+2%)                                   │
│  Previous rank: 4th ━                                           │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  💡 Big movers this round:                                      │
│  • Titan Steel +$60!                                            │
│  • Your short on Omega Energy: +$140K profit!                   │
│  • Mike fell from 1st to 3rd!                                   │
│                                                                 │
│  7 rounds remaining!                                            │
│                                                                 │
│                    [Continue to Round 4 ➜]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## End of Game Experience

### Final Standings

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🏆 FINAL GAME RESULTS 🏆                     │
│              TRADER MODE - 4 PLAYERS - 10 ROUNDS                │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  🥇 1ST PLACE - SARAH_TRADES                                    │
│  Final Net Worth: $4,250,000                                    │
│  Total Gain: $3,650,000 (+608%)                                 │
│  Best Stock: Titan Steel (+$1,200,000)                          │
│  Achievement: 👑 Kingmaker (Chairman 7 rounds)                 │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  🥈 2ND PLACE - YOU                                             │
│  Final Net Worth: $3,980,000                                    │
│  Total Gain: $3,380,000 (+563%)                                 │
│  Best Stock: NovaTech (+$920,000)                               │
│  Best Trade: Short on Omega R3 (+$140,000)                      │
│                                                                 │
│  YOUR PERFORMANCE:                                              │
│  • Rounds as Director: 6                                        │
│  • Rounds as Chairman: 2                                        │
│  • Successful trades: 18/22 (82%)                               │
│  • Special cards used: 4                                        │
│  • Highest net worth: Round 9 ($4,100,000)                      │
│  • Biggest single gain: Round 7 (+$650,000)                     │
│  • Biggest single loss: Round 8 (-$280,000)                     │
│                                                                 │
│  NEW ACHIEVEMENTS UNLOCKED! 🎉                                  │
│  ✓ "Silver Medal" - Finish 2nd place                            │
│  ✓ "Director's Chair" - Director 5+ times                       │
│  ✓ "Short Seller" - Profitable short position                   │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  PROGRESS:                                                      │
│  Trader Mode games completed: 4/3 ✓                             │
│  🎉 INVESTOR MODE UNLOCKED!                                     │
│                                                                 │
│  [View Detailed Stats] [Save Replay] [Play Again] [Dashboard]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Profile & Settings

### User Profile Page

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back to Dashboard]                                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────────────┐
│                      │                                          │
│  [🎭 Avatar]         │  JOHNDOE_42                              │
│  [Change Avatar]     │  Member since: October 16, 2025          │
│                      │  Last played: 2 hours ago                │
│  Bio:                │                                          │
│  "Love playing       │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Strategist mode!"   │                                          │
│  [Edit]              │  📊 OVERALL STATS                        │
│                      │                                          │
│  Badges:             │  Games Played: 47                        │
│  🏆 🎯 📊 🎓        │  Games Won: 16 (34%)                     │
│                      │  Total Earnings: $45,230,000             │
│                      │  Highest Net Worth: $6,450,000           │
│                      │  Bankruptcies: 2                         │
│                      │                                          │
│                      │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                      │                                          │
│                      │  📈 BY GAME MODE                         │
│                      │                                          │
│                      │  🎯 Trader Mode:                         │
│                      │  • 25 games (12 wins, 48% win rate)      │
│                      │                                          │
│                      │  📊 Investor Mode:                       │
│                      │  • 18 games (3 wins, 17% win rate)       │
│                      │                                          │
│                      │  🎓 Strategist Mode:                     │
│                      │  • 4 games (1 win, 25% win rate)         │
│                      │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

---

## Mobile Experience

### Portrait Mode Layout

```
┌─────────────────────┐
│ 📈 Stock Market     │
│ Round: 3/10 | T: 2  │
│ Turn: Sarah         │
└─────────────────────┘

[Swipe up: Your Portfolio]
┌─────────────────────┐
│ 💰 $435,000         │
│ 🏆 $1,765,000       │
│ Rank: 2nd/4         │
└─────────────────────┘

[Main view: Stock Prices]
┌─────────────────────┐
│ 🏦 Atlas Bank  $30  │
│ ━━━━━ 50%           │
│ [Details ▼]         │
├─────────────────────┤
│ 🏭 Titan Steel $35  │
│ ━━━ 40%             │
│ [Details ▼]         │
├─────────────────────┤
│ [Scroll for more▼]  │
└─────────────────────┘

[Bottom: Action Bar]
┌─────────────────────┐
│ [BUY] [SELL] [MORE▼]│
│ [    END TURN    ]  │
└─────────────────────┘
```

---

## Error States & Edge Cases

### Connection Lost

```
┌─────────────────────────────────────┐
│  ⚠️ CONNECTION LOST                 │
│                                     │
│  Reconnecting...                    │
│  [●●●○○○]                           │
│                                     │
│  Your game is saved.                │
│  You won't lose progress.           │
│                                     │
│  [Retry Now] [Cancel Game]          │
└─────────────────────────────────────┘
```

### Player Disconnected

```
┌─────────────────────────────────────┐
│  ⏸️ GAME PAUSED                     │
│                                     │
│  Sarah_Trades disconnected.         │
│                                     │
│  Waiting for reconnection...        │
│  Time remaining: 2:45               │
│                                     │
│  If they don't return, they'll be   │
│  replaced by AI.                    │
│                                     │
│  [Continue with AI] [Wait]          │
└─────────────────────────────────────┘
```

---

## Visual Design System

### Color Palette

**Primary Colors:**
- Navy Blue: `#1E3A5F` (Trust, stability)
- Gold: `#FFD700` (Success, wealth)
- Green: `#10B981` (Profit, growth)
- Red: `#EF4444` (Loss, warning)

**Company Colors:**
- 🏦 Atlas Bank: Navy + Gold
- 🏭 Titan Steel: Gray + Silver
- 🌍 Global Industries: Blue + Green
- ⚡ Omega Energy: Orange + Red
- 💊 VitalCare Pharma: Teal + Green
- 💻 NovaTech: Purple + Blue

**UI Colors:**
- Background: `#0F172A` (Dark mode)
- Cards: `#1E293B`
- Text: `#F1F5F9`
- Borders: `#334155`
- Hover: `#475569`

### Typography

**Headings:**
- Font: Inter Bold
- Sizes: 32px (H1), 24px (H2), 18px (H3)

**Body:**
- Font: Inter Regular
- Size: 16px
- Line height: 1.5

**Numbers (Cash, Prices):**
- Font: JetBrains Mono (monospace)
- Size: 18-24px (prominent)
- Bold for emphasis

### Animation Timing

**Fast (100-200ms):**
- Hover effects
- Button clicks

**Medium (300-500ms):**
- Modal open/close
- Card flips

**Slow (1000ms+):**
- Money counters
- End-of-round reveals
- Victory celebrations

---

## Implementation Notes

### Key Technologies
- **Frontend:** React + TypeScript
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Real-time:** Socket.io
- **Authentication:** Google OAuth

### Critical Features
1. Google Sign-In only (no guest play)
2. Progressive mode unlocking system
3. Interactive tutorials for each mode
4. Real-time multiplayer with WebSocket
5. Mobile-responsive design

### Development Priorities
1. Landing page + authentication
2. Dashboard + lobby system
3. Trader Mode game + tutorial
4. Investor Mode + tutorial
5. Strategist Mode + tutorial
6. Mobile optimization
7. Analytics & leaderboards

---

**Ready for Development!** 🚀

This comprehensive guide provides everything needed to build Stock Market Tycoon with a polished, professional user experience.