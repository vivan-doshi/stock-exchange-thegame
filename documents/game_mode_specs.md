# Stock Market Tycoon - Game Mode Specifications

Detailed breakdown of all five game modes with unlock conditions, new features, and design philosophy. All modes support both Standard (2-6 players) and Extended (7-12 players) variants.

---

## Overview

Stock Market Tycoon uses a **progressive difficulty system** where each mode builds on the previous one. Players must demonstrate mastery before unlocking advanced mechanics.

### Design Philosophy
1. **Learn by doing** - Each mode teaches one major concept
2. **Meaningful progression** - Each unlock feels significant
3. **Optional complexity** - Players can stay at comfortable level
4. **Replayability** - Each mode offers different strategic depth
5. **Scalable** - Works for both 2-6 and 7-12 player variants

---

## Game Variants Overview

Before diving into modes, understand the two player count variants:

### Standard Variant (2-6 Players)
- Original balanced experience
- $600,000 starting capital
- 200,000 shares per stock
- Director: 50,000 shares (25%)
- Chairman: 100,000 shares (50%)

### Extended Variant (7-12 Players)
- Large group gameplay
- $450,000 starting capital
- 300,000 shares per stock
- Director: 60,000 shares (20%)
- Chairman: 120,000 shares (40%)
- Double deck (2x all cards)

**Note:** All game modes work with both variants. The variant affects player count and scaling, while the mode affects available mechanics.

---

## 🎯 Level 1: Trader Mode

### Status
**Available:** Unlocked by default for all players

### Target Audience
- First-time players
- Players learning stock market concepts
- Casual gamers
- Ages 8+

### Core Mechanics

#### Included Features
✅ **Basic Trading**
- Buy shares (minimum 1,000 shares / $5,000)
- Sell shares at market price
- Buy condition: Cards must sum to ≥ 0 (or be first buyer)

✅ **Special Cards (All 6 Types)**
- Loan Stocks Matured ($100,000)
- Debenture (face value if stock hits $0)
- Rights Issued (1:2 ratio at $10/share)
- Share Suspended (reset to last year)
- Currency +10% (add to cash)
- Currency -10% (subtract from cash)

✅ **Ownership Powers**
- Director: Remove 1 own card
- Chairman: Remove 1 any card
- *Thresholds vary by variant*

✅ **Turn Structure**
- 10 rounds (market years)
- 3 transactions per round
- Rotating dealer

#### Tutorial Elements
- **Round 1-2:** Guided tutorial explaining:
  - How to read cards
  - Buy condition rules
  - Turn structure
  - Special card basics
  - Variant-specific thresholds
- **Round 3:** First opportunity for Director status
- **Round 5:** Mid-game check-in with tips
- **Round 10:** End-game scoring explanation

### Variant-Specific Considerations

**Standard Variant (2-6 Players):**
- Director achievable by Round 2-3
- Chairman achievable by Round 4-5
- More predictable with fewer players
- Focus on 1-2 stocks for control

**Extended Variant (7-12 Players):**
- Director achievable by Round 3-5
- Chairman achievable by Round 6-8
- More chaotic with many players
- Harder to achieve control
- More special cards appear

### Learning Objectives
By completing Trader Mode, players should understand:
1. How stock prices change based on cards
2. The importance of Director/Chairman status
3. When to buy vs. sell
4. How special cards affect gameplay
5. Basic risk management
6. How player count affects competition

### Win Condition
Highest net worth (cash + stock value) after 10 rounds

### Estimated Playtime
- **Standard Variant:** 15-20 minutes (tutorial: 20-25 minutes)
- **Extended Variant:** 25-35 minutes (tutorial: 30-40 minutes)

### Unlock Condition
**None** - Available immediately

---

## 📊 Level 2: Investor Mode

### Status
**Locked until:** Complete 3 games in Trader Mode (wins not required, any variant)

### Unlock Philosophy
We require **3 completions** (not wins) because:
- Ensures players understand fundamentals
- Doesn't frustrate new players with difficulty barriers
- 3 games = exposure to different market conditions
- Allows learning from losses
- Works across both variants

### Target Audience
- Players who completed 3+ Trader games
- Intermediate strategy gamers
- Players comfortable with calculated risks
- Ages 10+

### New Mechanics Added

#### ⭐ Shorting
**What it is:** Betting that a stock price will decrease

**Rules:**
- Use 1 transaction to initiate short
- Short 1,000 - 12,000 shares per stock
- Max 12,000 shares shorted per stock (all players combined)
- **CANNOT** short stocks you currently own
- Settle at end of market year (after Currency cards)

**Payoff:**
- Stock decreased: Bank pays you the difference
- Stock increased: You pay bank the difference

**Risk:**
- Unlimited loss potential
- Can go bankrupt if unable to pay

**Strategic Impact:**
- Adds risk management dimension
- Creates counter-plays against opponents
- Rewards reading market conditions
- Introduces concept of betting against stocks

### Variant-Specific Considerations

**Standard Variant (2-6 Players):**
- Shorting is powerful but risky
- Fewer players = easier to predict movements
- 12,000 share limit is significant (6% of supply)

**Extended Variant (7-12 Players):**
- Shorting becomes MORE valuable
- More players = more unpredictable movements
- 12,000 share limit less significant (4% of supply)
- More competition for short positions
- Higher chaos = better opportunities for shorts

### Tutorial Addition
- **First Investor game:** Pop-up explaining shorting when first available
- **Example scenarios:** Show profitable and losing short positions
- **Warning system:** Alert players to potential bankruptcy
- **Variant-specific tips:** Adjusted for player count

### Learning Objectives
By mastering Investor Mode, players should understand:
1. How to profit from declining stocks
2. Risk vs. reward calculations
3. When to short vs. when to buy
4. Bankruptcy risk management
5. Counter-strategies against opponents
6. How player count affects shorting viability

### Strategic Depth Increase
- **Trader Mode:** 1-dimensional (buy low, sell high)
- **Investor Mode:** 2-dimensional (long AND short strategies)

### Estimated Playtime
- **Standard Variant:** 15-20 minutes
- **Extended Variant:** 25-35 minutes

### Unlock Condition
**Win 2 games in Investor Mode** (any variant) to unlock Strategist Mode

---

## 💼 Level 3: Strategist Mode

### Status
**Locked until:** Win 2 games in Investor Mode (any variant)

### Unlock Philosophy
We require **2 wins** (not just completions) because:
- Strategist Mode is complex - need demonstrated skill
- Winning shows understanding of Investor concepts
- Higher bar reflects significant complexity increase
- Creates sense of achievement

### Target Audience
- Advanced players who won 2+ Investor games
- Strategy game enthusiasts
- Players who enjoy financial complexity
- Ages 12+

### New Mechanics Added

#### ⭐ Options Trading

**What it is:** Rights to buy/sell stocks at predetermined prices

**Types:**
1. **Call Option** - Right to BUY at strike price
2. **Put Option** - Right to SELL at strike price

**Rules:**
- Premium: 10% of strike value (Chairman adjusts ±5%)
- **Standard Variant:** Max 40,000 shares under options per stock (20%)
- **Extended Variant:** Max 60,000 shares under options per stock (20%)
- Exercise at year-end only (after Currency cards)
- Max loss = premium paid

**Key Limitation:**
- Options DO NOT count for Director/Chairman status
- Options DO NOT receive dividends
- Options DO NOT qualify for Rights Issued

**Strategic Impact:**
- Leverage with limited downside
- Speculation without full capital commitment
- Chairman premium control adds corporate strategy
- Risk management through defined loss

#### ⭐ Dividends

**What it is:** Cash payments to shareholders

**Who Can Issue:**
- **Director:** Up to $10/share (thresholds vary by variant)
- **Chairman:** Up to $20/share (thresholds vary by variant)

**Rules:**
- Uses 1 transaction to declare
- All shareholders paid immediately
- Stock price DROPS by dividend amount
- Both Director and Chairman can issue in same round (cumulative)

**Strategic Impact:**
- Extract value from expensive stocks
- Generate cash for other investments
- Reward loyal shareholders
- Price manipulation tool
- Counter-strategy against put options

#### ⭐ Buybacks

**What it is:** Company repurchases shares from market

**Who Can Issue:**
- **Chairman only**

**Rules:**
- Uses 1 transaction to announce
- Declare # shares and price
- Players sell in turn order (first-come, first-served)
- Shares permanently retired
- Stock price rises $5 per 10,000 shares bought back

**Strategic Impact:**
- Consolidate control (ownership % increases)
- Boost stock price
- Remove shares from competitors
- Deploy excess cash
- Timing matters (turn order advantage)

### Variant-Specific Considerations

**Standard Variant (2-6 Players):**
- Options limit: 40,000 shares per stock
- Control easier to achieve = dividends more accessible
- Buybacks effective for consolidation
- Fewer players = more predictable outcomes
- Chairman premium manipulation more impactful

**Extended Variant (7-12 Players):**
- Options limit: 60,000 shares per stock
- Options become MORE attractive than ownership
- Control MUCH harder = dividends rare but powerful
- Buybacks critical for maintaining control
- More players = higher options activity
- Chairman premium affects more players
- More competition = more strategic depth

### Tutorial Addition
- **First Strategist game:** Multi-step tutorial:
  1. Options explained with examples
  2. Dividends walkthrough
  3. Buyback demonstration
  4. Variant-specific tips
- **Tooltips:** Available throughout for complex actions
- **Calculator:** Built-in profit/loss calculator for options

### Learning Objectives
By mastering Strategist Mode, players should understand:
1. Options leverage and risk profiles
2. Corporate actions (dividends, buybacks)
3. Chairman premium manipulation
4. Complex multi-layered strategies
5. Portfolio theory basics
6. How player count affects advanced strategies

### Strategic Depth Increase
- **Investor Mode:** 2-dimensional (long + short)
- **Strategist Mode:** 5-dimensional (long + short + calls + puts + corporate actions)

### Estimated Playtime
- **Standard Variant:** 20-25 minutes (longer due to complexity)
- **Extended Variant:** 30-40 minutes (more players + complexity)

### Unlock Condition
**Complete achievements in Strategist Mode** to unlock Tycoon Mode (when released)

---

## 🏆 Level 4: Tycoon Mode (Coming Soon)

### Status
**In Development** - Target Release: TBD

### Planned Features (Subject to Change)

#### Potential Mechanics
1. **Futures Contracts**
   - Lock in prices for future transactions
   - Tradeable contracts between players
   - Forward-looking strategy

2. **Stock Splits**
   - Chairman power: Split stocks 2-for-1
   - Changes volatility profile
   - Affects share counts

3. **Bonds / Fixed Income**
   - Alternative low-risk investment
   - Guaranteed returns
   - Portfolio diversification

4. **Market Maker Role**
   - One player per round becomes market maker
   - Facilitates player-to-player trades
   - Earns commissions

5. **Limit Orders**
   - Set automatic buy/sell triggers
   - "If stock hits $X, auto-sell"
   - Strategic automation

#### Design Goals
- Add inter-player trading
- Introduce forward-looking mechanics
- Create more player interaction
- Maintain game balance
- **Works with both variants**

### Unlock Condition
TBD - Likely requires Strategist Mode achievements

---

## 💎 Level 5: Mogul Mode (Coming Soon)

### Status
**Concept Phase** - Target Release: TBD

### Planned Features (Highly Tentative)

#### Potential Mechanics
1. **Mergers & Acquisitions**
   - Combine two companies
   - Hostile takeovers
   - Shareholder votes

2. **IPOs**
   - New companies enter market mid-game
   - Early investment opportunities
   - Risk of startup failure

3. **Regulatory Events**
   - Random market events
   - Sector-wide impacts
   - Crisis management

4. **Leverage / Margin**
   - Borrow money to invest more
   - Interest payments
   - Margin calls

5. **Global Markets**
   - Currency exchange rates
   - International stocks
   - Geopolitical events

#### Design Goals
- Ultimate complexity
- Multi-layered strategy
- High replayability
- For expert players only
- **Scalable to both variants**

### Unlock Condition
TBD - Likely requires Tycoon Mode mastery

---

## Mode Comparison Matrix

| Feature | Trader | Investor | Strategist | Tycoon | Mogul |
|---------|--------|----------|------------|--------|-------|
| **Buy/Sell** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Special Cards** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Director/Chairman** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Both Variants** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Shorting** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Options** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Dividends** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Buybacks** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Futures** | ❌ | ❌ | ❌ | 🔄 | ✅ |
| **Stock Splits** | ❌ | ❌ | ❌ | 🔄 | ✅ |
| **Bonds** | ❌ | ❌ | ❌ | 🔄 | ✅ |
| **M&A** | ❌ | ❌ | ❌ | ❌ | 🔄 |
| **IPOs** | ❌ | ❌ | ❌ | ❌ | 🔄 |

**Legend:** ✅ Included | ❌ Not included | 🔄 Planned

---

## Variant Impact on Modes

### Trader Mode
- **Standard:** Learn fundamentals, achievable control
- **Extended:** Learn fundamentals, competitive control

### Investor Mode
- **Standard:** Strategic shorting, moderate competition
- **Extended:** Chaotic shorting, high competition

### Strategist Mode
- **Standard:** Corporate control focus, dividends common
- **Extended:** Options focus, control rare but powerful

---

## Achievement System Ideas

### Trader Mode Achievements (Both Variants)
- **First Blood:** Complete first game
- **Trader Pro:** Win 3 games
- **Director's Chair:** Become Director
- **Power Player:** Become Chairman
- **Perfect Storm:** Win with all positive cards one round
- **Extended Warrior:** Win with 10+ players (Extended only)

### Investor Mode Achievements (Both Variants)
- **Short Seller:** Profit from first short
- **Bear Market:** Profit $100k+ from shorting in one game
- **Risk Taker:** Short while owning other stocks worth $500k+
- **Narrow Escape:** Avoid bankruptcy by less than $50k
- **Chaos Master:** Win with 10+ players (Extended only)

### Strategist Mode Achievements (Both Variants)
- **Options Master:** Exercise 10 profitable options
- **Dividend King:** Issue $500k+ dividends in one game
- **Corporate Raider:** Use buyback to steal Chairmanship
- **Market Manipulator:** Adjust option premiums 5+ times
- **Triple Threat:** Use options, dividends, AND buybacks in one game
- **Extended Mogul:** Win Strategist with 10+ players (Extended only)

---

## Balancing Considerations

### Mode Balance Goals
1. Each mode should feel **meaningfully different**
2. Advanced modes should NOT obsolete basic strategies
3. Complexity should add **depth**, not just **complication**
4. New players in Trader should have fun
5. Experts in Mogul should still find challenge
6. **Both variants should be balanced**

### Tested Balance Points
- **Shorting:** 12,000 share cap prevents game-breaking positions
- **Options (Standard):** 40,000 share (20%) cap ensures stocks remain primary
- **Options (Extended):** 60,000 share (20%) cap maintains same proportion
- **Dividends:** Director/Chairman split prevents one power from dominating
- **Buybacks:** $5 price increase per 10k prevents inflation

### Extended Variant Balance
- Lower starting capital ($450k) creates more scarcity
- Lower thresholds (20%/40%) keep control achievable
- More shares (300k) prevent market exhaustion
- Double deck prevents card counting

---

## Progression Tracking

### Suggested Metrics to Track
- Games played per mode (by variant)
- Games won per mode (by variant)
- Favorite company to invest in
- Highest net worth achieved (by variant)
- Biggest single-round gain/loss
- Times achieved Director/Chairman (by variant)
- Bankruptcy count (Investor+)
- Options exercised profitably (Strategist+)
- Largest game (player count)

### Unlock Progress Display
```
🎯 Trader Mode: ✅ UNLOCKED
   ├── Games completed (Standard): 5/3 ✅
   └── Games completed (Extended): 2/3 (In Progress)
   
📊 Investor Mode: ✅ UNLOCKED  
   ├── Games won (Standard): 3/2 ✅
   └── Games won (Extended): 1/2 (In Progress)
   
💼 Strategist Mode: ✅ UNLOCKED
   ├── Ready for Tycoon!
   └── Extended games won: 1
   
🏆 Tycoon Mode: 🔒 Coming Soon
   
💎 Mogul Mode: 🔒 Coming Soon
```

---

*Game Mode Specifications for Stock Market Tycoon. This document defines the progression system and planned features for all five difficulty levels, supporting both Standard (2-6) and Extended (7-12) player variants.*