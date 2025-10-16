# Stock Market Tycoon - Complete Architecture & Setup Guide

## 📋 Overview

This document contains the complete technical architecture, database schema, configuration files, and setup instructions for Stock Market Tycoon.

**Tech Stack:**
- Frontend: React + Vite + Tailwind CSS
- Backend: Vercel Serverless Functions
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth + Google OAuth
- Hosting: Vercel
- Real-time: Supabase Realtime

**Cost Target:** $0-25/month for MVP

---

## 📁 Project Structure

[Full detailed project structure with all folders and files as shown above - truncated for space]

---

## 🗄️ Database Tables

### Core Tables:
1. **users** - User profiles and stats
2. **games** - Game state and metadata
3. **game_players** - Player data per game
4. **transactions** - Transaction history
5. **achievements** - Achievement definitions
6. **user_achievements** - Unlocked achievements
7. **stock_price_history** - Historical prices
8. **leaderboard** - Materialized view

---

## 🔐 Google OAuth Setup

1. **Google Cloud Console:**
   - Create project
   - Enable Google+ API
   - Create OAuth credentials
   - Configure redirect URIs

2. **Supabase:**
   - Enable Google provider
   - Add Client ID/Secret

3. **Environment Variables:**
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_KEY=...
   ```

---

## ⚙️ Key Configuration Files

- `vercel.json` - Vercel deployment config
- `vite.config.js` - Vite bundler config  
- `tailwind.config.js` - Tailwind CSS config
- `package.json` - Dependencies

---

## 🚀 Setup Steps

1. Create project: `npm create vite@latest`
2. Install dependencies: `npm install`
3. Setup Supabase: `npx supabase init`
4. Run migrations: `npx supabase migration up`
5. Configure environment variables
6. Start dev: `npm run dev`
7. Deploy: `vercel --prod`

---

## 💾 Data Storage

**Client-side (No backend cost):**
- AI player logic
- Tutorial definitions
- Game constants
- Card deck data

**Database (Supabase):**
- User profiles
- Game state (active games only)
- Transaction logs
- Achievements
- Leaderboard

**Real-time Sync:**
- Game state updates
- Player actions
- Transaction broadcasts

---

## 🎮 Game Flow

```
User Login (OAuth)
    ↓
Dashboard
    ↓
Create/Join Game
    ↓
Game Lobby (Wait for players)
    ↓
Game Start (10 rounds)
    ↓
Each Round:
  - Deal cards
  - 3 transactions
  - Calculate prices
  - Update state (real-time)
    ↓
Game End
    ↓
Save results & Update stats
```

---

## 📊 Architecture Benefits

✅ **Cost Effective:** $0/month for MVP, scales affordably
✅ **Performant:** CDN + edge functions + indexed queries
✅ **Real-time:** Built-in WebSocket support
✅ **Scalable:** Serverless auto-scales
✅ **Responsive:** Works on mobile, tablet, desktop
✅ **Secure:** Row-level security + OAuth

---

*Complete technical reference for Stock Market Tycoon development*