# Stock Market Tycoon

A multiplayer online board game where players compete to build wealth by trading stocks in fictional companies. Born from a beloved family board game, this digital reimagining adds strategic depth through progressive game modes, special mechanics, and real-time multiplayer gameplay.

## Overview

Stock Market Tycoon is a competitive strategy game for 2-12 players spanning 10 market rounds. Players buy and sell shares in six fictional companies with varying volatility levels, leveraging special cards and leadership positions to manipulate market prices. Victory goes to the player with the highest net worth at game end.

### Key Features

- **Progressive Skill System**: 5-level game mode progression from Trader to Mogul
- **Flexible Player Count**: Support for 2-12 players with Standard and Extended variants
- **Rich Game Mechanics**:
  - Special market cards (Loans, Debentures, Rights Issued, Share Suspension, Currency fluctuations)
  - Director and Chairman leadership powers
  - Short selling (Investor Mode+)
  - Options trading and dividends (Strategist Mode+)
- **Real-Time Multiplayer**: Live gameplay with WebSocket-powered synchronization
- **Six Diverse Companies**: From stable banking to volatile tech stocks
- **Achievement System**: Track progress and unlock new capabilities

## Game Modes

### Current Implementation Status

**Active Modes:**

1. **Trader Mode (L1)** - Core buy/sell mechanics with special cards and leadership powers
2. **Investor Mode (L2)** - Adds short selling (unlocked after 3 Trader games)
3. **Strategist Mode (L3)** - Adds options trading, dividends, and buybacks (unlocked after 2 Investor wins)

**Coming Soon:**

- Tycoon Mode (L4)
- Mogul Mode (L5)

## The Companies

| Company | Industry | Volatility | Starting Price |
|---------|----------|------------|----------------|
| Atlas Bank | Banking | Low | $50 |
| Titan Steel | Manufacturing | Medium-Low | $40 |
| Global Industries | Conglomerate | Medium | $35 |
| Omega Energy | Energy | Medium-High | $30 |
| VitalCare Pharma | Healthcare | High | $25 |
| NovaTech | Technology | Very High | $20 |

## Technology Stack

### Frontend

- **React** with **Vite** - Fast, modern development experience
- **TypeScript** - Type safety for financial calculations
- **Tailwind CSS** - Responsive, mobile-first UI

### Backend

- **Vercel Serverless Functions** - Scalable API endpoints
- **Supabase (PostgreSQL)** - Production database with real-time capabilities
- **Supabase Auth** - Google OAuth 2.0 integration
- **Row-Level Security** - Data protection and authorization

### Real-Time

- **Supabase Realtime** - WebSocket-based live game state synchronization

### Deployment

- **Vercel** - Frontend hosting and serverless backend
- Estimated cost: $0-25/month for MVP

## Project Structure

```text
stock-exchange-thegame/
├── documents/              # Comprehensive game documentation
│   ├── stock_market_tycoon_rules.md
│   ├── technical_specs.md
│   ├── architecture_guide.md
│   ├── game_mode_specs.md
│   ├── company_profiles.md
│   └── ...
├── src/                   # Source code (to be implemented)
├── public/                # Static assets
└── README.md
```

## Documentation

Detailed documentation is available in the [/documents](documents/) directory:

- **[Game Rules](documents/stock_market_tycoon_rules.md)** - Complete rules for all game modes
- **[Technical Specifications](documents/technical_specs.md)** - Database schemas, API endpoints, algorithms
- **[Architecture Guide](documents/architecture_guide.md)** - Tech stack and infrastructure details
- **[Game Mode Specifications](documents/game_mode_specs.md)** - Progressive mode system details
- **[Company Profiles](documents/company_profiles.md)** - Fictional company backgrounds
- **[Quick Reference Guide](documents/quick_reference_guide.md)** - One-page player cheat sheet
- **[Project Setup Guide](documents/project_setup_guide.md)** - Development environment setup

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Vercel account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/stock-exchange-thegame.git
cd stock-exchange-thegame

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Run development server
npm run dev
```

### Database Setup

```bash
# Run Supabase migrations
npm run migrate

# Seed initial data
npm run seed
```

## Development Roadmap

### Phase 1: Core Implementation (Current)

- [ ] Database schema implementation
- [ ] User authentication system
- [ ] Basic game lobby
- [ ] Trader Mode (L1) gameplay
- [ ] Real-time game state synchronization

### Phase 2: Enhanced Features

- [ ] Investor Mode (L2) with short selling
- [ ] Strategist Mode (L3) with options trading
- [ ] Achievement system
- [ ] Player statistics dashboard

### Phase 3: Advanced Features

- [ ] Tycoon Mode (L4)
- [ ] Mogul Mode (L5)
- [ ] Spectator mode
- [ ] Game replay system
- [ ] Mobile app

## Game Variants

### Standard Variant (2-6 players)

- Starting capital: $600,000
- Shares per stock: 200,000
- Director threshold: 50,000 shares (25%)
- Chairman threshold: 100,000 shares (50%)

### Extended Variant (7-12 players)

- Starting capital: $450,000
- Shares per stock: 300,000
- Director threshold: 60,000 shares (20%)
- Chairman threshold: 120,000 shares (40%)
- Uses double card deck

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original board game concept from family game nights
- Inspired by classic stock market board games with modern strategic enhancements
- Built with modern web technologies for accessible online play

## Contact

For questions, suggestions, or feedback, please open an issue on GitHub.

---

**Current Status**: Documentation and planning phase complete. Implementation in progress.
