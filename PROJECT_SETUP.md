# Stock Market Tycoon - Project Setup Complete

## Project Structure

```
stock-exchange-thegame/
├── index.html                 # Main HTML entry point
├── package.json              # Project dependencies
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # TypeScript config for Node files
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── .eslintrc.cjs           # ESLint configuration
├── .gitignore              # Git ignore rules
├── src/
│   ├── main.tsx            # Application entry point
│   ├── App.tsx             # Main App component with routing
│   ├── components/         # Reusable React components
│   │   └── README.md       # Component organization guide
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx    # Landing/home page
│   │   └── GamePage.tsx    # Main game page
│   ├── lib/                # Utility functions and game logic
│   │   └── constants.ts    # Game constants and company data
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Core game types
│   └── styles/             # CSS styles
│       └── index.css       # Global styles with Tailwind
└── documents/              # Game documentation
```

## Technology Stack

- **React 18+** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

## Installation & Running

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## What's Included

### Pages
- **HomePage** - Game introduction with Standard/Extended mode selection
- **GamePage** - Main game interface (placeholder ready for implementation)

### Types
Complete TypeScript definitions for:
- Game variants (Standard/Extended)
- Game modes (Trader/Investor/Strategist)
- Companies and stocks
- Players and portfolios
- Cards and transactions
- Game state

### Constants
Game configuration including:
- 6 company profiles (Atlas Bank, Titan Steel, Global Industries, Omega Energy, VitalCare Pharma, NovaTech)
- Standard variant settings (2-6 players, $600k starting capital)
- Extended variant settings (7-12 players, $450k starting capital)
- Director/Chairman thresholds
- Game rules constants

## Next Steps

1. Implement game state management (Context API or Zustand)
2. Build card system and deck management
3. Create transaction handling logic
4. Develop stock price calculation engine
5. Build player management system
6. Design and implement UI components
7. Add game board visualization
8. Implement special cards and powers
9. Add game mode progression system
10. Create save/load game functionality

## Development Notes

- Path alias `@/` is configured to point to `src/` directory
- All components should be placed in appropriate subdirectories
- Follow the type definitions in `src/types/index.ts`
- Use constants from `src/lib/constants.ts` for game rules
- Keep game logic separate from UI components

## Game Rules Reference

Complete game rules are available in:
- `documents/stock_market_tycoon_rules.md` - Complete rules guide
- `documents/company_profiles.md` - Company details
- `documents/technical_specs.md` - Technical specifications

Good luck building Stock Market Tycoon!
