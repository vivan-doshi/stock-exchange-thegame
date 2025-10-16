# Stock Market Tycoon - Project Setup Guide

Step-by-step instructions for setting up your Claude Project with all necessary files and context.

---

## Step 1: Create the Project

1. **Open Claude** in your browser
2. **Click "Projects"** in the left sidebar
3. **Click "Create Project"**
4. **Name it:** `Stock Market Tycoon`

---

## Step 2: Add Project Description

Copy and paste this into the Project Description field:

```
Stock Market Tycoon - A progressive stock market simulation game for webapp.

GAME OVERVIEW:
• 2-6 players compete over 10 rounds buying/selling shares in 6 fictional companies
• Starting capital: $600,000
• Winner: Highest net worth (cash + stock value)

COMPANIES:
• Atlas Bank (Banking) - $20 - Low volatility
• Titan Steel (Manufacturing) - $25 - Medium-low volatility  
• Global Industries (Conglomerate) - $45 - Medium volatility
• Omega Energy (Energy) - $55 - Medium-high volatility
• VitalCare Pharma (Healthcare) - $75 - High volatility
• NovaTech (Technology) - $80 - Very high volatility

GAME MODES (5 Levels):
🎯 Trader Mode (L1) - Basic buying/selling, special cards, Director/Chairman powers
📊 Investor Mode (L2) - Adds shorting (unlock: 3 Trader games)
👔 Strategist Mode (L3) - Adds options/dividends/buybacks (unlock: 2 Investor wins)
🏆 Tycoon Mode (L4) - Coming soon
💎 Mogul Mode (L5) - Coming soon

KEY MECHANICS:
• Director (25% ownership): Remove 1 own card from tally
• Chairman (50% ownership): Remove any player's card from tally
• Special cards: Loan, Debenture, Rights Issued, Share Suspended, Currency ±10%
• Advanced: Shorting, Options (calls/puts), Dividends, Buybacks

PROJECT STATUS: Rules finalized, ready for webapp development planning
```

---

## Step 3: Add Custom Instructions

In the Project Settings, add these Custom Instructions:

```
You are helping develop Stock Market Tycoon, a stock market simulation webapp game. The complete rules are documented in the project files.

CONTEXT:
- Game inspired by physical board game but fully redesigned for global digital market
- Uses fictional companies to avoid licensing issues
- 5-level progressive difficulty system
- All mechanics finalized and balanced through extensive playtesting
- Currently in pre-development phase

YOUR ROLE:
- Help with webapp development planning
- Assist with UI/UX design decisions
- Advise on technical implementation
- Suggest game balance adjustments when needed
- Maintain consistency with established rules

IMPORTANT PRINCIPLES:
- Keep mechanics simple and clear
- Progressive complexity (Trader → Investor → Strategist)
- All numbers stay as whole numbers (no decimals)
- Maintain the $600,000 / 200,000 shares scale
- Each mode must feel meaningfully different

When discussing features, always consider:
1. Which game mode does this apply to?
2. Does it maintain game balance?
3. Is it intuitive for new players?
4. Can it be clearly explained?
5. Does it fit the webapp format?
```

---

## Step 4: Download and Upload Files

### Files to Add to Your Project

I've created 5 documents for you in artifacts. Here's how to save and upload each one:

#### **File 1: Complete Rules** ✅
- **Artifact name:** "Stock Market Tycoon - Complete Rules Guide"
- **Save as:** `complete-rules.md`
- **Purpose:** Full rulebook with all 3 modes

#### **File 2: Quick Reference** ✅
- **Artifact name:** "Stock Market Tycoon - Quick Reference Guide"
- **Save as:** `quick-reference.md`
- **Purpose:** One-page cheat sheet for gameplay

#### **File 3: Company Profiles** ✅
- **Artifact name:** "Stock Market Tycoon - Company Profiles"
- **Save as:** `company-profiles.md`
- **Purpose:** Detailed company descriptions with design notes

#### **File 4: Game Mode Specs** ✅
- **Artifact name:** "Stock Market Tycoon - Game Mode Specifications"
- **Save as:** `game-mode-specs.md`
- **Purpose:** Detailed breakdown of all 5 levels

#### **File 5: Technical Specs** ✅
- **Artifact name:** "Stock Market Tycoon - Technical Specifications"
- **Save as:** `technical-specs.md`
- **Purpose:** Database schemas, API endpoints, algorithms

---

## Step 5: How to Save Artifacts

For each artifact:

1. **Click the artifact** to expand it
2. **Click the download icon** (or copy the content)
3. **Save as .md file** with the name listed above
4. **Upload to your Project** using the "Add content" button
5. **Repeat for all 5 files**

---

## Step 6: Organize Your Project

### Recommended Folder Structure (in your Project knowledge):

```
📁 Stock Market Tycoon Project/
├── 📄 complete-rules.md
├── 📄 quick-reference.md
├── 📄 company-profiles.md
├── 📄 game-mode-specs.md
├── 📄 technical-specs.md
├── 📁 design/ (create later for assets)
│   ├── mockups/
│   ├── logos/
│   └── color-schemes/
└── 📁 development/ (create later for code snippets)
    ├── database-scripts/
    ├── api-examples/
    └── frontend-components/
```

---

## Step 7: First Conversation Starter

Once your project is set up, start your first conversation with:

```
I'm ready to continue developing Stock Market Tycoon! 
I've set up the project with all the documentation. 
What should we tackle first?
```

Possible next topics:
- UI/UX design and wireframes
- Database implementation details
- User flow diagrams
- Feature prioritization
- MVP scope definition
- Testing strategy
- Monetization planning

---

## Quick File Reference

### When to Reference Each File:

**📄 complete-rules.md**
- Any gameplay questions
- Clarifying game mechanics
- Understanding mode differences

**📄 quick-reference.md**
- Quick lookups during design
- Creating tutorials
- Building in-game help

**📄 company-profiles.md**
- UI design (colors, themes)
- Writing company descriptions
- Creating stock cards/assets

**📄 game-mode-specs.md**
- Planning unlock systems
- Designing progression
- Balancing difficulty

**📄 technical-specs.md**
- Building database
- Creating APIs
- Implementing algorithms

---

## Verification Checklist

Before starting development conversations, verify:

- [ ] Project created with correct name
- [ ] Project description added
- [ ] Custom instructions added
- [ ] All 5 .md files uploaded
- [ ] Files are accessible in the project
- [ ] You can see the content when you open them

---

## Tips for Working in the Project

### Best Practices

1. **Always reference the mode** when asking questions
   - "In Trader Mode, how does..."
   - "For Strategist Mode, should we..."

2. **Upload design assets** as you create them
   - Wireframes
   - Mockups
   - Color palettes
   - Logo concepts

3. **Track decisions** in the project chat
   - Important architectural choices
   - Design rationale
   - Feature priorities

4. **Use artifacts** for code/specs
   - Database schemas
   - API endpoints
   - React components

5. **Update docs** as things evolve
   - If rules change, update complete-rules.md
   - Add new technical decisions to technical-specs.md

---

## Common First Questions to Ask

Once set up, great starting questions:

### Design Phase
- "Let's design the main game board UI. What should we prioritize?"
- "Help me create wireframes for the stock price display"
- "What color scheme works best for each company?"

### Development Phase  
- "Let's implement the buy condition validator algorithm"
- "Help me design the database schema for game state"
- "What's the best way to handle real-time multiplayer?"

### Planning Phase
- "What features should be in the MVP?"
- "How should we prioritize the roadmap?"
- "What's the critical path to launch?"

---

## Project Maintenance

### Keep Updated
- Add new design files as you create them
- Document technical decisions
- Track feature changes
- Update specs when rules evolve

### Regular Reviews
- Monthly: Review and update specs
- After testing: Document findings
- After launches: Add post-mortem notes

---

## Need Help?

### If Something's Unclear
Just ask in the project: "Can you explain [topic] from [file]?"

### If Files Are Missing
Re-upload from the artifacts in this conversation

### If You Want to Change Something
"I want to modify [rule/feature]. What are the implications?"

---

## You're All Set! 🚀

Your Stock Market Tycoon project is now fully documented and ready for development. All the game rules, company profiles, technical specifications, and planning documents are in place.

**Next step:** Create the project, upload the files, and start your first conversation!

---

*Project Setup Guide for Stock Market Tycoon. Follow these steps to get your Claude Project ready for development.*