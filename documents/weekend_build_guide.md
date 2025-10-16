# Stock Market Tycoon - Weekend Build Guide

**Goal:** Get a working Trader Mode game by end of weekend
**Time:** 16-20 hours over 2 days
**You will:** Copy prompts, run commands, test features
**Claude Code will:** Write all the code

---

## BEFORE YOU START (Friday Night - 1 hour)

### Step 1: Install Software (30 minutes)

**Install Node.js:**
1. Go to: https://nodejs.org/
2. Download LTS version (left button)
3. Run installer, click Next through everything
4. Open Terminal (Mac) or Command Prompt (Windows)
5. Type: `node --version`
6. Should show: v20.x.x or similar

**Install Git:**
1. Go to: https://git-scm.com/downloads
2. Download for your OS
3. Run installer with defaults
4. Type in Terminal: `git --version`
5. Should show: git version 2.x.x

**Install Claude Code:**
1. Go to: https://docs.claude.com/en/docs/claude-code
2. Follow installation for your OS
3. Type in Terminal: `claude --version`
4. Should show Claude Code version

**Install VS Code (optional but helpful):**
1. Go to: https://code.visualstudio.com/
2. Download and install
3. You'll use this to view files

### Step 2: Create Accounts (30 minutes)

**Supabase Account:**
1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up with Google
4. Click "New Project"
5. Name: stock-market-tycoon
6. Database Password: Create strong password (SAVE THIS!)
7. Region: Choose closest to you
8. Click "Create new project"
9. Wait 2-3 minutes for setup
10. Leave tab open

**Google Cloud Account (for OAuth):**
1. Go to: https://console.cloud.google.com
2. Sign in with Google
3. Create new project: "Stock Market Tycoon"
4. Wait for project creation
5. Leave tab open

**Vercel Account (for deployment):**
1. Go to: https://vercel.com
2. Sign up with Google
3. Leave tab open

### Step 3: Setup Project Folder

**On Mac:**
```bash
cd ~
mkdir stock-market-tycoon
cd stock-market-tycoon
mkdir docs
```

**On Windows:**
```cmd
cd C:\
mkdir stock-market-tycoon
cd stock-market-tycoon
mkdir docs
```

**Copy this file (claude.md) into the docs folder**

---

## SATURDAY MORNING (8 AM - 12 PM) - 4 hours

### HOUR 1: Initial Setup (8-9 AM)

#### Step 4: Initialize Git

**You do:**
```bash
cd stock-market-tycoon
git init
git add .
git commit -m "Initial setup"
```

#### Step 5: Start Claude Code

**You do:**
```bash
claude
```

**Give Claude Code this prompt:**
```
I'm building Stock Market Tycoon, a web-based stock market simulation game. 

I have a complete game rules document at docs/claude.md that you should read to understand the game.

First task: Set up a React + TypeScript + Vite project with:
- React 18+
- TypeScript
- Vite as build tool
- Tailwind CSS
- React Router
- Folder structure: src/components, src/pages, src/lib, src/types, src/styles

Create package.json, vite.config.ts, tsconfig.json, tailwind.config.js, and basic project structure.

After creating files, tell me exactly what command to run.
```

**Claude Code will:**
- Create all config files
- Set up project structure
- Tell you what to do next

**You do after:**
1. Wait for Claude Code to finish
2. Run the command it tells you (probably `npm install`)
3. Then run: `npm run dev`
4. Open browser to: http://localhost:5173
5. You should see a React page!

**Time checkpoint: 9:00 AM**

---

### HOUR 2: Supabase Setup (9-10 AM)

#### Step 6: Get Supabase Credentials

**You do:**
1. Go to your Supabase dashboard
2. Click "Settings" (gear icon on left)
3. Click "API"
4. Copy "Project URL" - paste in notepad
5. Copy "anon public" key - paste in notepad
6. Keep this notepad open!

#### Step 7: Configure Supabase

**Give Claude Code this prompt:**
```
Now set up Supabase integration:

1. Install @supabase/supabase-js package
2. Create src/lib/supabase.ts with Supabase client setup
3. Create .env.local file with these variables:
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
4. Add .env.local to .gitignore
5. Create a .env.example file showing the variable names

Don't include actual credentials - I'll add them manually.
```

**You do after:**
1. Stop the dev server (Ctrl+C)
2. Open `.env.local` file in VS Code
3. Paste your credentials:
```
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```
4. Save file
5. Run: `npm run dev` again

**Time checkpoint: 10:00 AM**

---

### HOUR 3: Database Setup (10-11 AM)

#### Step 8: Create Database Tables

**Give Claude Code this prompt:**
```
Create SQL migration files for the database schema.

Based on the technical requirements in docs/claude.md, create numbered SQL files for:

1. 001_users_table.sql - users table with stats and unlock flags
2. 002_games_table.sql - games table with mode and status
3. 003_game_players_table.sql - player data per game
4. 004_player_holdings_table.sql - stock holdings
5. 005_transactions_table.sql - transaction history
6. 006_stock_prices_table.sql - price tracking
7. 007_achievements_tables.sql - achievements and user_achievements

Save them in a folder called supabase/migrations/

Include proper foreign keys, indexes, and constraints.
```

**You do after:**
1. Go to Supabase dashboard
2. Click "SQL Editor" on left
3. Click "New query"
4. Open `supabase/migrations/001_users_table.sql`
5. Copy entire contents
6. Paste into SQL Editor
7. Click "Run"
8. Repeat for files 002, 003, 004, 005, 006, 007
9. Click "Table Editor" to verify tables exist

**Time checkpoint: 11:00 AM**

---

### HOUR 4: Google OAuth Setup (11 AM - 12 PM)

#### Step 9: Configure Google OAuth

**You do:**
1. Go to: https://console.cloud.google.com
2. Select your "Stock Market Tycoon" project
3. Click "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Application type: "Web application"
6. Name: "Stock Market Tycoon Web"
7. Authorized JavaScript origins:
   - http://localhost:5173
   - Your Supabase URL (from notepad)
8. Authorized redirect URIs:
   - http://localhost:5173/auth/callback
   - YOUR_SUPABASE_URL/auth/v1/callback
9. Click "Create"
10. Copy Client ID and Client Secret

**Configure in Supabase:**
1. Go to Supabase dashboard
2. Click "Authentication" on left
3. Click "Providers"
4. Find "Google" and toggle it ON
5. Paste Client ID
6. Paste Client Secret
7. Click "Save"

**Time checkpoint: 12:00 PM - LUNCH BREAK**

---

## SATURDAY AFTERNOON (1 PM - 6 PM) - 5 hours

### HOUR 5: Authentication (1-2 PM)

#### Step 10: Build Login System

**Give Claude Code this prompt:**
```
Create Google OAuth authentication:

1. Create src/contexts/AuthContext.tsx:
   - Use Supabase Auth
   - Handle Google sign-in
   - Track user session
   - Provide auth state to app

2. Create src/pages/Login.tsx:
   - Clean landing page
   - "Sign in with Google" button
   - Brief game description

3. Create src/components/ProtectedRoute.tsx:
   - Redirect to login if not authenticated
   - Show loading state while checking auth

4. Update App.tsx to use AuthContext and routing

Use Supabase's signInWithOAuth method for Google login.
```

**You do after:**
1. Refresh browser (should redirect to login)
2. Click "Sign in with Google"
3. Choose your Google account
4. Should redirect back to app
5. Check browser console for any errors

**Time checkpoint: 2:00 PM**

---

### HOUR 6: Landing Page (2-3 PM)

#### Step 11: Build Landing Page

**Give Claude Code this prompt:**
```
Create an attractive landing page for authenticated users.

The landing page should show:

1. Welcome message with user's name
2. Game logo/title at top
3. Brief "What is Stock Market Tycoon" section
4. Three mode cards (Trader/Investor/Strategist) with:
   - Mode name and icon
   - Short description
   - "Play Now" button (only Trader unlocked for now)
   - Lock icon for locked modes
5. "How to Play" button linking to tutorial
6. User menu in top-right (username, sign out)

Use Tailwind CSS with a stock market theme:
- Dark background
- Gold/green/red accents
- Professional look

Make it responsive for mobile.
```

**You do after:**
1. Refresh page
2. Check landing page looks good
3. Test on mobile view (browser dev tools, responsive mode)
4. Click sign out
5. Sign back in

**Time checkpoint: 3:00 PM**

---

### HOUR 7: Game Lobby (3-4 PM)

#### Step 12: Create Game Lobby

**Give Claude Code this prompt:**
```
Create the game lobby system:

1. Create src/pages/GameLobby.tsx:
   - "Create Game" button
   - "Join Game" button
   - List of active lobbies

2. Create modal for creating game:
   - Game mode selector (Trader/Investor/Strategist)
   - Number of players (2-6)
   - Add AI players toggle
   - Public/Private toggle
   - "Create" button

3. Create game waiting room:
   - Game code display
   - Player list with avatars
   - "Ready" checkbox for each player
   - "Start Game" button (host only, when 2+ ready)
   - "Leave Game" button

4. Store games in Supabase 'games' and 'game_players' tables
5. Use Supabase Realtime to update player list

Just create the UI and basic database operations. We'll add game logic next.
```

**You do after:**
1. Navigate to lobby
2. Click "Create Game"
3. Select Trader Mode
4. Create game
5. Open incognito browser window
6. Sign in as different user
7. Join the game
8. Test ready status
9. Test start button (don't click yet)

**Time checkpoint: 4:00 PM**

---

### HOUR 8: Game Board UI (4-5 PM)

#### Step 13: Build Game Board

**Give Claude Code this prompt:**
```
Create the main game board UI for Trader Mode.

Layout:

TOP BAR:
- Round indicator: "Round X of 10"
- Transaction indicator: "Transaction X of 3"
- Current player indicator: "Player Name's Turn"

MAIN AREA (3 columns):

LEFT COLUMN (25%):
- Your Portfolio panel:
  - Cash: $XXX,XXX (large, green)
  - Stock Value: $XXX,XXX
  - Net Worth: $XXX,XXX (largest, bold)
  - Holdings list:
    - Each stock owned
    - Shares owned
    - Current value

CENTER COLUMN (50%):
- 6 Stock Cards in 2x3 grid:
  Each card shows:
  - Company name
  - Sector
  - Current price (very large)
  - Price change from start (color coded)
  - Available shares in market
  - Your shares owned
  - Badge if you're Director/Chairman

RIGHT COLUMN (25%):
- Transaction Panel:
  - Buy button
  - Sell button
  - Pass button
  - If Director/Chairman: Power buttons

BOTTOM:
- Card reveal area (shows 3 cards when drawn)
- Transaction log (last 5 actions)

Use company colors from claude.md.
Make it responsive - stack vertically on mobile.

For now, just create the UI with placeholder data. We'll connect game logic next.
```

**You do after:**
1. Start a game from lobby
2. Should see game board
3. Check all elements are visible
4. Test responsive design (resize browser)
5. Test on mobile view

**Time checkpoint: 5:00 PM - SHORT BREAK**

---

### HOUR 9: Core Game Logic (5-6 PM)

#### Step 14: Implement Game Logic Part 1

**Give Claude Code this prompt:**
```
Create the core game logic modules in src/lib/game/:

1. src/lib/game/deck.ts:
   - generateDeck(): Create 108-card deck based on claude.md distribution
   - shuffleDeck(): Shuffle the deck
   - drawCards(count): Draw N cards from deck

2. src/lib/game/validator.ts:
   - canBuyStock(cards, isFirstBuyer): Check buy condition (sum >= 0 or first buyer)
   - validatePurchase(player, stock, quantity, price): Check if player can afford and shares available
   - validateSale(player, stock, quantity): Check if player owns enough shares

3. src/lib/game/calculator.ts:
   - calculateNewPrice(currentPrice, cards): Calculate new price from card sum
   - calculateOwnership(playerShares, totalShares): Calculate ownership percentage
   - getOwnershipStatus(percentage): Return 'none'/'director'/'chairman'
   - calculateNetWorth(cash, holdings, prices): Calculate total net worth

Use TypeScript with proper types.
Export all functions.
Add comments explaining each function.
```

**Time checkpoint: 6:00 PM - DINNER BREAK**

---

## SATURDAY EVENING (7 PM - 10 PM) - 3 hours

### HOUR 10: Connect Game Logic (7-8 PM)

#### Step 15: Implement Game Logic Part 2

**Give Claude Code this prompt:**
```
Create the game state manager in src/lib/game/gameState.ts:

This should handle:

1. initializeGame(gameId, players, mode):
   - Set starting prices for all stocks
   - Give each player $600,000
   - Create initial deck
   - Set round 1, transaction 1
   - Save to database

2. executeTransaction(gameId, playerId, action):
   - action can be: buy, sell, or pass
   - For buy:
     - Draw 3 cards
     - Validate buy condition
     - Deduct money
     - Add shares to player
     - Calculate new price
     - Save transaction
   - For sell:
     - Remove shares from player
     - Add money
     - Save transaction
   - For pass:
     - Just move to next player
   - Update game state in database
   - Broadcast to all players via Supabase Realtime

3. advanceToNextPlayer():
   - Move to next player in turn order
   - If all players done, advance transaction
   - If 3 transactions done, advance round
   - If 10 rounds done, end game

4. endRound():
   - Process special cards
   - Deal new cards for next round
   - Update database

5. endGame():
   - Calculate final net worth for all players
   - Determine winner
   - Update player statistics
   - Mark game as completed

Use Supabase for database operations.
Use Supabase Realtime to broadcast state changes.
```

**You do after:**
- This is complex, so just let it generate
- We'll test in next step

**Time checkpoint: 8:00 PM**

---

### HOUR 11: Connect UI to Logic (8-9 PM)

#### Step 16: Wire Everything Together

**Give Claude Code this prompt:**
```
Connect the game board UI to the game logic:

1. Update src/pages/GameBoard.tsx:
   - Subscribe to game state updates via Supabase Realtime
   - Display current game state (round, transaction, prices, holdings)
   - Update in real-time when state changes

2. Wire up buttons:
   - Buy button: Show modal to select stock and quantity
   - Sell button: Show modal to select stock and quantity
   - Pass button: Call executeTransaction with 'pass'

3. Create transaction modals:
   - Buy modal:
     - Stock selector
     - Quantity input (increments of 1000)
     - Show total cost
     - Validate: enough cash, shares available
     - "Confirm" button
   - Sell modal:
     - Stock selector (only stocks you own)
     - Quantity input (max = your shares)
     - Show proceeds
     - "Confirm" button

4. After each transaction:
   - Show card reveal animation
   - Update prices with animation
   - Update holdings
   - Move to next player
   - If round ends, show summary

Make sure all players see updates in real-time.
```

**You do after:**
1. Open 2 browser windows (1 normal, 1 incognito)
2. Start a game with both
3. Try buying a stock in window 1
4. Check if window 2 updates automatically
5. Try selling in window 2
6. Check if window 1 updates
7. Test passing

**Time checkpoint: 9:00 PM**

---

### HOUR 12: Testing Session (9-10 PM)

#### Step 17: Play Test First Complete Game

**You do:**
1. Get a friend OR use AI players
2. Create a fresh game
3. Play through ALL 10 rounds
4. Test every feature:
   - Buying stocks
   - Selling stocks
   - Passing
   - Price changes
   - Round transitions
   - Game ending

5. Keep notes of any bugs:
   - Does game crash?
   - Prices wrong?
   - Holdings not updating?
   - Game won't end?
   - Any errors in console?

6. For each bug, tell Claude Code:
```
Bug found: [describe what happened]
Expected: [what should happen]
Actual: [what actually happened]
Console errors: [paste any errors]

Please fix this bug.
```

7. Test fix
8. Repeat until game works smoothly

**Time checkpoint: 10:00 PM - END DAY 1**

**Save progress:**
```bash
git add .
git commit -m "Day 1 complete - Basic Trader Mode working"
```

---

## SUNDAY MORNING (9 AM - 1 PM) - 4 hours

### HOUR 13: Special Cards (9-10 AM)

#### Step 18: Implement Special Cards

**Give Claude Code this prompt:**
```
Implement all 6 special card types from claude.md:

Create src/lib/game/specialCards.ts with handlers for:

1. LOAN STOCKS MATURED:
   - Add $100,000 to player cash immediately
   - Show notification

2. DEBENTURE:
   - Store for player
   - If stock hits $0, pay face value ($25k/$50k/$100k)
   - Show when activated

3. RIGHTS ISSUED:
   - Calculate 1:2 ratio (own 10k = can buy 5k)
   - Offer to buy at $10/share
   - Show modal with offer
   - Execute if accepted

4. SHARE SUSPENDED:
   - Reset price to previous round's price
   - Show alert to all players

5. CURRENCY +10%:
   - At end of round, add 10% to cash
   - Show notification

6. CURRENCY -10%:
   - At end of round, subtract 10% from cash
   - Show notification

Update the card deck to include correct number of each special card.
Process special cards at appropriate times.
```

**You do after:**
1. Start new game
2. Play until you draw a special card
3. Test each special card effect
4. Verify they work correctly

**Time checkpoint: 10:00 AM**

---

### HOUR 14: Director/Chairman Powers (10-11 AM)

#### Step 19: Implement Ownership Powers

**Give Claude Code this prompt:**
```
Implement Director and Chairman powers:

1. Track ownership in real-time:
   - After each transaction, recalculate all players' ownership %
   - Update Director status (25%+ = Director)
   - Update Chairman status (50%+ = Chairman)
   - Show badges on stock cards

2. Director power (remove 1 own card):
   - Show "Remove Card" button if player is Director
   - Let them select 1 of their own cards
   - Remove from price calculation
   - Once per transaction

3. Chairman power (remove any card):
   - Show "Remove Card" button if player is Chairman
   - Let them select ANY card (any player's)
   - Remove from price calculation
   - Once per transaction

4. Visual indicators:
   - Director badge: Bronze/orange color
   - Chairman badge: Gold color
   - Show on stock card and in player list

Update game flow to check for powers after each buy/sell.
```

**You do after:**
1. Start game
2. Buy 50,000+ shares of one stock
3. Verify Director badge appears
4. Test removing your own card
5. Buy 100,000+ shares
6. Verify Chairman badge appears
7. Test removing any player's card

**Time checkpoint: 11:00 AM**

---

### HOUR 15: Polish & Animations (11 AM - 12 PM)

#### Step 20: Add Visual Polish

**Give Claude Code this prompt:**
```
Add animations and visual polish:

1. Install framer-motion: npm install framer-motion

2. Add animations for:
   - Stock price changes:
     - Number counter animation
     - Green flash for increase
     - Red flash for decrease
   - Card reveals:
     - Flip animation
     - Stagger effect (cards appear one by one)
   - Money transactions:
     - Counter animation for cash changes
     - Brief highlight when updated
   - Round transitions:
     - Fade out old round
     - Fade in new round
     - Show "Round X" overlay briefly

3. Add loading states:
   - Loading spinner while joining game
   - Skeleton screens while loading game board
   - "Waiting for player..." during their turn

4. Add notifications:
   - Toast messages for actions
   - "Player X bought Y shares"
   - "Price changed by Z"
   - Special card activations

5. Add confirmation dialogs:
   - "Are you sure?" for large purchases
   - "Confirm sale" for selling

Use Tailwind for styling. Keep it smooth (60fps).
```

**You do after:**
1. Play through a game
2. Enjoy the animations!
3. Check that nothing is laggy
4. Verify all notifications work

**Time checkpoint: 12:00 PM - LUNCH BREAK**

---

## SUNDAY AFTERNOON (1 PM - 5 PM) - 4 hours

### HOUR 16: Tutorial System (1-2 PM)

#### Step 21: Create Tutorial

**Give Claude Code this prompt:**
```
Create an interactive tutorial for Trader Mode:

1. Create src/components/Tutorial.tsx:
   - Overlay that dims background
   - Highlights specific elements
   - Shows tooltips with explanations
   - "Next" and "Skip Tutorial" buttons
   - Progress indicator (step X of Y)

2. Tutorial steps:
   - Step 1: "Welcome to Stock Market Tycoon!"
   - Step 2: "This is your portfolio" (highlight left panel)
   - Step 3: "These are the 6 companies" (highlight stock cards)
   - Step 4: "Your goal is highest net worth"
   - Step 5: "Let's make your first purchase" (highlight buy button)
   - Step 6: "You must meet the buy condition" (explain card rule)
   - Step 7: "Selling is simpler" (highlight sell button)
   - Step 8: "You can pass your turn"
   - Step 9: "Special cards add excitement"
   - Step 10: "Own 25% to become Director"
   - Step 11: "Own 50% to become Chairman"
   - Step 12: "Game ends after 10 rounds"
   - Step 13: "Good luck!"

3. Store tutorial completion in user profile
4. Auto-show on first game
5. Add "Replay Tutorial" option in menu

Use react-joyride or build custom with Framer Motion.
```

**You do after:**
1. Create new account (or clear tutorial flag in database)
2. Start game
3. Go through entire tutorial
4. Test skip option
5. Test replay tutorial

**Time checkpoint: 2:00 PM**

---

### HOUR 17: Mode Unlocking (2-3 PM)

#### Step 22: Implement Progression System

**Give Claude Code this prompt:**
```
Implement the mode unlocking system:

1. Update game end logic:
   - When game completes, update player stats
   - Increment games_played_trader (or investor/strategist)
   - If player won, increment games_won_trader
   - Check unlock conditions:
     - Investor: 3+ Trader games played
     - Strategist: 2+ Investor games won
   - If condition met, set unlock flag
   - Show "Mode Unlocked!" celebration modal

2. Update landing page:
   - Trader Mode: Always unlocked, green checkmark
   - Investor Mode: 
     - If locked: Show lock icon, "Complete 3 Trader games"
     - If unlocked: Show checkmark, allow play
   - Strategist Mode:
     - If locked: Show lock icon, "Win 2 Investor games"
     - If unlocked: Show checkmark, allow play

3. Update game creation:
   - Don't allow creating locked modes
   - Show error message if user tries

4. Add progress display:
   - "Trader games: 2/3"
   - "Investor wins: 1/2"
   - Progress bars

Update users table with stats after each game.
```

**You do after:**
1. Play 3 complete Trader games (or manually update database)
2. Check if Investor unlocks
3. Try creating Investor game
4. Verify it works

**Time checkpoint: 3:00 PM**

---

### HOUR 18: Game History (3-4 PM)

#### Step 23: Add History Page

**Give Claude Code this prompt:**
```
Create a game history page:

1. Create src/pages/GameHistory.tsx:
   - List all completed games
   - Show for each game:
     - Date played
     - Mode
     - Players involved
     - Your final net worth
     - Your rank (1st/2nd/3rd...)
     - Winner name
     - "View Details" button

2. Create game details modal:
   - Round-by-round prices
   - Your holdings over time
   - Transaction history
   - Final standings

3. Add filters:
   - Filter by mode (All/Trader/Investor/Strategist)
   - Filter by result (All/Won/Lost)
   - Sort by date (newest/oldest)

4. Add statistics summary:
   - Total games played
   - Total games won
   - Win rate
   - Highest net worth ever
   - Average finish position

Query from games and game_players tables.
Only show user's games.
```

**You do after:**
1. Play a few games
2. Navigate to history page
3. Check games appear
4. View game details
5. Test filters

**Time checkpoint: 4:00 PM**

---

### HOUR 19: Mobile Optimization (4-5 PM)

#### Step 24: Mobile Responsive

**Give Claude Code this prompt:**
```
Optimize Stock Market Tycoon for mobile devices:

1. Update game board for mobile:
   - Stack vertically instead of 3 columns
   - Portfolio collapses into bottom sheet (swipe up)
   - Stock cards: 2 columns instead of 3
   - Transaction buttons: Bottom fixed bar
   - Cards reveal: Horizontal scroll
   - Make all text readable on small screens
   - Increase button sizes (min 44px)

2. Update landing page for mobile:
   - Stack mode cards vertically
   - Larger touch targets
   - Simplified navigation

3. Update lobby for mobile:
   - Responsive player list
   - Larger buttons

4. Add mobile-specific features:
   - Swipe gestures
   - Pull to refresh
   - Touch-friendly modals

5. Test breakpoints:
   - 320px (small phone)
   - 375px (iPhone)
   - 768px (tablet)
   - 1024px (desktop)

Use Tailwind responsive classes (sm:, md:, lg:, xl:).
Test in Chrome DevTools mobile view.
```

**You do after:**
1. Open Chrome DevTools (F12)
2. Click device toggle (phone icon)
3. Test on iPhone size
4. Test on iPad size
5. Test all features work on mobile
6. Test on your actual phone if possible

**Time checkpoint: 5:00 PM - DINNER BREAK**

---

## SUNDAY EVENING (6 PM - 9 PM) - 3 hours

### HOUR 20: Final Testing (6-7 PM)

#### Step 25: Comprehensive Testing

**You do:**
Create a testing checklist and test everything:

**Authentication:**
- [ ] Can sign in with Google
- [ ] Can sign out
- [ ] Redirects to login when not authenticated
- [ ] Stays logged in after refresh

**Game Creation:**
- [ ] Can create Trader game
- [ ] Can't create locked modes
- [ ] Can add AI players
- [ ] Can make private/public

**Game Lobby:**
- [ ] Players can join
- [ ] Ready status works
- [ ] Start button works (host only)
- [ ] Leave game works

**Game Board:**
- [ ] All stocks displayed correctly
- [ ] Portfolio shows correct values
- [ ] Buying works
- [ ] Selling works
- [ ] Passing works
- [ ] Prices update correctly
- [ ] Holdings update correctly
- [ ] Round advances correctly
- [ ] Game ends after 10 rounds

**Special Features:**
- [ ] Special cards work
- [ ] Director badge appears at 25%
- [ ] Chairman badge appears at 50%
- [ ] Powers work correctly
- [ ] Tutorial works
- [ ] History saves games

**Multiplayer:**
- [ ] Real-time sync works
- [ ] Both players see updates
- [ ] Disconnection handled

**Mobile:**
- [ ] Layout works on phone
- [ ] All buttons tappable
- [ ] Text readable

**For each bug:**
```
Tell Claude Code: "Bug: [describe bug] - Please fix"
```

**Time checkpoint: 7:00 PM**

---

### HOUR 21: Deployment Prep (7-8 PM)

#### Step 26: Prepare for Deployment

**You do:**

1. **Update Google OAuth:**
   - Go to Google Cloud Console
   - Click your OAuth credentials
   - Add production URL (you'll get this after deploying)
   - Save

2. **Install Vercel CLI:**
```bash
npm install -g vercel
```

3. **Tell Claude Code:**
```
Prepare the project for production deployment to Vercel:

1. Create vercel.json with optimal settings
2. Create production build script in package.json
3. Add error tracking (set up Sentry or similar)
4. Add environment variable checks
5. Create production-ready .env.example
6. Add build optimization
7. Create deployment checklist

Ensure all environment variables use VITE_ prefix.
```

**Time checkpoint: 8:00 PM**

---

### HOUR 22: Deploy! (8-9 PM)

#### Step 27: Deploy to Vercel

**You do:**

1. **Commit everything:**
```bash
git add .
git commit -m "Ready for deployment"
```

2. **Deploy:**
```bash
vercel
```

3. **Follow prompts:**
   - Link to existing project? N (first time)
   - What's your project name? stock-market-tycoon
   - Which directory? ./ (current)
   - Want to override settings? N

4. **Add environment variables:**
   - Vercel will give you a dashboard URL
   - Go to dashboard
   - Click Settings > Environment Variables
   - Add:
     - VITE_SUPABASE_URL
     - VITE_SUPABASE_ANON_KEY
   - Save

5. **Deploy to production:**
```bash
vercel --prod
```

6. **Update OAuth:**
   - Copy your production URL (something.vercel.app)
   - Go to Google Cloud Console
   - Add production URL to authorized origins
   - Add production URL/auth/callback to redirect URIs
   - Save

7. **Update Supabase:**
   - Go to Supabase dashboard
   - Authentication > URL Configuration
   - Add production URL to allowed URLs
   - Save

8. **Test production:**
   - Visit your production URL
   - Test sign in
   - Create a game
   - Play through
   - Test on phone

**Time checkpoint: 9:00 PM**

---

## COMPLETION CHECKLIST

**You're done when:**
- [ ] Can sign in with Google (production)
- [ ] Can create and join games
- [ ] Can play complete Trader Mode game
- [ ] Real-time multiplayer works
- [ ] Mobile responsive
- [ ] No critical bugs
- [ ] Deployed to Vercel
- [ ] Accessible from anywhere

---

## POST-WEEKEND IMPROVEMENTS

**Next steps after weekend:**

1. **Week 1: Investor Mode**
   - Implement shorting
   - Add bankruptcy mechanics
   - Create tutorial

2. **Week 2: Strategist Mode**
   - Implement options
   - Add dividends
   - Add buybacks
   - Create tutorial

3. **Week 3: AI Players**
   - Easy/Medium/Hard AI
   - Testing and balance

4. **Week 4: Polish**
   - Achievements system
   - Leaderboard
   - More animations
   - Performance optimization

---

## TROUBLESHOOTING

**"npm install fails":**
- Delete node_modules folder
- Delete package-lock.json
- Run `npm install` again

**"Can't connect to Supabase":**
- Check .env.local has correct credentials
- Restart dev server (Ctrl+C, then npm run dev)
- Check Supabase project is running

**"Game won't start":**
- Check browser console for errors
- Check Supabase logs
- Tell Claude Code the error

**"Players not syncing":**
- Check Supabase Realtime is enabled
- Check database policies allow reads
- Test with two different browsers

**"Deploy fails":**
- Run `npm run build` locally first
- Fix any TypeScript errors
- Check all imports are correct
- Try again

**"Can't sign in (production)":**
- Verify Google OAuth URLs are correct
- Check Supabase auth settings
- Clear browser cache

---

## TIME TRACKER

**Saturday:**
- Morning: 4 hours (Setup, Database, OAuth)
- Afternoon: 5 hours (Auth, Lobby, Board, Logic)
- Evening: 3 hours (Connect, Test)
- Total: 12 hours

**Sunday:**
- Morning: 4 hours (Special cards, Powers, Polish)
- Afternoon: 4 hours (Tutorial, History, Mobile)
- Evening: 3 hours (Testing, Deploy)
- Total: 11 hours

**Grand Total: ~23 hours** (with breaks)

---

## TIPS FOR SUCCESS

1. **Follow in order** - Don't skip steps
2. **Test frequently** - After each hour
3. **Take breaks** - You'll code better
4. **Save often** - Commit to git regularly
5. **Ask Claude Code** - If stuck, just ask
6. **Stay focused** - One task at a time
7. **Have fun!** - You're building a game!

---

## WHAT TO DO IF BEHIND SCHEDULE

**If Saturday goes long:**
- Skip polish/animations (Hour 15)
- Do that on Sunday

**If Sunday goes long:**
- Skip game history (Hour 18)
- Skip tutorial (Hour 16)
- Focus on core gameplay + deployment

**Minimum viable weekend:**
- Get authentication working
- Get basic game playable
- Get it deployed
- Add features next week

---

## CELEBRATION CHECKLIST

**When done, you will have:**
- [ ] A live web app
- [ ] Google authentication
- [ ] Real-time multiplayer game
- [ ] Complete Trader Mode
- [ ] Mobile responsive design
- [ ] Deployed and accessible
- [ ] Friends can play with you!

**Share your success:**
- Tweet about it
- Share with friends
- Get feedback
- Start planning next features

---

## NEXT WEEKEND GOALS

**Weekend 2:**
- Investor Mode
- Basic AI players
- Achievements
- Polish

**Weekend 3:**
- Strategist Mode
- Advanced AI
- Leaderboard
- Analytics

**Weekend 4:**
- Bug fixes
- Performance
- Marketing
- Launch!

---

**YOU'VE GOT THIS! LET'S BUILD A GAME!**

Start Friday night with setup, wake up Saturday ready to code, and by Sunday evening you'll have a working multiplayer stock market game deployed to the internet. 

Remember: Claude Code does the coding, you do the testing and decision-making. Perfect partnership!

Good luck! 🚀