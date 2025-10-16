# Stock Market Tycoon - Design System & Assets Guide

Complete design system specification with free assets, implementation code, and setup instructions.

---

## Table of Contents
1. [Typography System](#typography-system)
2. [Color Palette](#color-palette)
3. [Spacing & Layout](#spacing--layout)
4. [Free Assets](#free-assets)
5. [Component Library](#component-library)
6. [Animation System](#animation-system)
7. [Implementation Guide](#implementation-guide)
8. [Code Examples](#code-examples)

---

## Typography System

### Font Stack (Recommended)

#### Primary Fonts
```html
<!-- Add to index.html <head> or import in CSS -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
```

**Font Usage:**
- **Space Grotesk** (500, 700) - Headers, company names, section titles
- **Inter** (400, 500, 600, 700) - Body text, UI labels, buttons
- **JetBrains Mono** (500, 700) - Stock prices, money values, round numbers

#### Why This Stack?
✅ Modern and professional  
✅ Excellent screen readability  
✅ JetBrains Mono has tabular figures (all numbers same width)  
✅ All three fonts are free via Google Fonts  
✅ Great multilingual support  

### Typography Scale

```css
/* Font Families */
--font-heading: 'Space Grotesk', sans-serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px - Small labels, card metadata */
--text-sm: 0.875rem;     /* 14px - Secondary info, captions */
--text-base: 1rem;       /* 16px - Body text, default */
--text-lg: 1.125rem;     /* 18px - Emphasized text */
--text-xl: 1.25rem;      /* 20px - Section headers, card titles */
--text-2xl: 1.5rem;      /* 24px - Page headers, important numbers */
--text-3xl: 1.875rem;    /* 30px - Stock prices */
--text-4xl: 2.25rem;     /* 36px - Net worth, portfolio value */
--text-5xl: 3rem;        /* 48px - Hero numbers, game over screen */
--text-6xl: 3.75rem;     /* 60px - Landing page hero */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;

/* Letter Spacing */
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
```

### Typography Application Guide

```css
/* Headers */
h1 { 
  font-family: var(--font-heading); 
  font-size: var(--text-5xl); 
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

h2 { 
  font-family: var(--font-heading); 
  font-size: var(--text-3xl); 
  font-weight: var(--font-bold);
}

h3 { 
  font-family: var(--font-heading); 
  font-size: var(--text-2xl); 
  font-weight: var(--font-semibold);
}

/* Body Text */
body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

/* Money/Numbers */
.price, .money, .stat-number {
  font-family: var(--font-mono);
  font-weight: var(--font-bold);
  font-variant-numeric: tabular-nums; /* Ensures consistent number widths */
}
```

---

## Color Palette

### Company Colors (Based on Stock Personalities)

#### Atlas Bank - Stability & Trust
```css
:root {
  /* Atlas Bank - Navy & Gold */
  --atlas-50: #f0f4ff;
  --atlas-100: #dbeafe;
  --atlas-200: #bfdbfe;
  --atlas-300: #93c5fd;
  --atlas-400: #60a5fa;
  --atlas-500: #3b82f6;
  --atlas-600: #1e3a8a;  /* Primary */
  --atlas-700: #1e40af;
  --atlas-800: #1e3a8a;
  --atlas-900: #0f172a;
  
  --atlas-accent: #fbbf24;  /* Gold accent */
  --atlas-gradient: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}
```

#### Titan Steel - Industrial Strength
```css
:root {
  /* Titan Steel - Gray & Steel Blue */
  --titan-50: #f8fafc;
  --titan-100: #f1f5f9;
  --titan-200: #e2e8f0;
  --titan-300: #cbd5e1;
  --titan-400: #94a3b8;
  --titan-500: #64748b;
  --titan-600: #475569;  /* Primary */
  --titan-700: #334155;
  --titan-800: #1e293b;
  --titan-900: #0f172a;
  
  --titan-accent: #60a5fa;  /* Steel blue accent */
  --titan-gradient: linear-gradient(135deg, #475569 0%, #94a3b8 100%);
}
```

#### Global Industries - Diversified Power
```css
:root {
  /* Global Industries - Business Blue & Green */
  --global-50: #f0f9ff;
  --global-100: #e0f2fe;
  --global-200: #bae6fd;
  --global-300: #7dd3fc;
  --global-400: #38bdf8;
  --global-500: #0ea5e9;
  --global-600: #0369a1;  /* Primary */
  --global-700: #075985;
  --global-800: #0c4a6e;
  --global-900: #134e4a;
  
  --global-accent: #059669;  /* Green accent */
  --global-gradient: linear-gradient(135deg, #0369a1 0%, #059669 100%);
}
```

#### Omega Energy - Power & Heat
```css
:root {
  /* Omega Energy - Orange & Red */
  --omega-50: #fff7ed;
  --omega-100: #ffedd5;
  --omega-200: #fed7aa;
  --omega-300: #fdba74;
  --omega-400: #fb923c;
  --omega-500: #f97316;
  --omega-600: #ea580c;  /* Primary */
  --omega-700: #c2410c;
  --omega-800: #9a3412;
  --omega-900: #7c2d12;
  
  --omega-accent: #dc2626;  /* Red accent */
  --omega-gradient: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
}
```

#### VitalCare Pharma - Health & Innovation
```css
:root {
  /* VitalCare Pharma - Teal & Green */
  --vital-50: #f0fdfa;
  --vital-100: #ccfbf1;
  --vital-200: #99f6e4;
  --vital-300: #5eead4;
  --vital-400: #2dd4bf;
  --vital-500: #14b8a6;
  --vital-600: #0d9488;  /* Primary */
  --vital-700: #0f766e;
  --vital-800: #115e59;
  --vital-900: #065f46;
  
  --vital-accent: #10b981;  /* Green accent */
  --vital-gradient: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
}
```

#### NovaTech - Future & Innovation
```css
:root {
  /* NovaTech - Purple & Electric Blue */
  --nova-50: #faf5ff;
  --nova-100: #f3e8ff;
  --nova-200: #e9d5ff;
  --nova-300: #d8b4fe;
  --nova-400: #c084fc;
  --nova-500: #a855f7;
  --nova-600: #7c3aed;  /* Primary */
  --nova-700: #6d28d9;
  --nova-800: #5b21b6;
  --nova-900: #4c1d95;
  
  --nova-accent: #3b82f6;  /* Electric blue accent */
  --nova-gradient: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
}
```

### UI System Colors

#### Semantic Colors
```css
:root {
  /* Success - Gains, Positive Actions */
  --success-50: #f0fdf4;
  --success-100: #dcfce7;
  --success-500: #22c55e;
  --success-600: #16a34a;
  --success-700: #15803d;
  --success-900: #14532d;
  
  /* Danger - Losses, Negative Actions */
  --danger-50: #fef2f2;
  --danger-100: #fee2e2;
  --danger-500: #ef4444;
  --danger-600: #dc2626;
  --danger-700: #b91c1c;
  --danger-900: #7f1d1d;
  
  /* Warning - Caution, Important Info */
  --warning-50: #fffbeb;
  --warning-100: #fef3c7;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  --warning-700: #b45309;
  --warning-900: #78350f;
  
  /* Info - Neutral Information */
  --info-50: #eff6ff;
  --info-100: #dbeafe;
  --info-500: #3b82f6;
  --info-600: #2563eb;
  --info-700: #1d4ed8;
  --info-900: #1e3a8a;
}
```

#### Neutral Palette (Grays)
```css
:root {
  /* Neutrals for UI backgrounds and text */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --gray-950: #030712;
  
  /* Background Layers */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --bg-elevated: #ffffff;
  
  /* Text Hierarchy */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-disabled: #d1d5db;
  --text-inverse: #ffffff;
  
  /* Borders */
  --border-light: #f3f4f6;
  --border-medium: #e5e7eb;
  --border-strong: #d1d5db;
}
```

### Color Usage Guidelines

```css
/* Stock Price Changes */
.price-increase {
  color: var(--success-600);
  background: var(--success-50);
}

.price-decrease {
  color: var(--danger-600);
  background: var(--danger-50);
}

/* Director Badge */
.director-badge {
  background: var(--warning-100);
  color: var(--warning-700);
  border: 2px solid var(--warning-400);
}

/* Chairman Badge */
.chairman-badge {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #78350f;
  border: 2px solid #f59e0b;
}
```

---

## Spacing & Layout

### Spacing Scale (4px Base Grid)

```css
:root {
  /* Base Spacing Units */
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem;   /* 2px */
  --space-1: 0.25rem;      /* 4px */
  --space-1-5: 0.375rem;   /* 6px */
  --space-2: 0.5rem;       /* 8px */
  --space-2-5: 0.625rem;   /* 10px */
  --space-3: 0.75rem;      /* 12px */
  --space-3-5: 0.875rem;   /* 14px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-7: 1.75rem;      /* 28px */
  --space-8: 2rem;         /* 32px */
  --space-9: 2.25rem;      /* 36px */
  --space-10: 2.5rem;      /* 40px */
  --space-11: 2.75rem;     /* 44px */
  --space-12: 3rem;        /* 48px */
  --space-14: 3.5rem;      /* 56px */
  --space-16: 4rem;        /* 64px */
  --space-20: 5rem;        /* 80px */
  --space-24: 6rem;        /* 96px */
  --space-32: 8rem;        /* 128px */
}
```

### Component-Specific Spacing

```css
:root {
  /* Cards */
  --card-padding: var(--space-6);        /* 24px */
  --card-gap: var(--space-4);            /* 16px */
  --card-radius: 12px;
  
  /* Buttons */
  --button-padding-y: var(--space-3);    /* 12px */
  --button-padding-x: var(--space-6);    /* 24px */
  --button-radius: 8px;
  --button-gap: var(--space-2);          /* 8px */
  
  /* Inputs */
  --input-padding-y: var(--space-3);     /* 12px */
  --input-padding-x: var(--space-4);     /* 16px */
  --input-radius: 8px;
  
  /* Containers */
  --container-padding: var(--space-4);   /* 16px mobile */
  --container-gap: var(--space-6);       /* 24px */
  --section-gap: var(--space-8);         /* 32px */
  
  /* Layout */
  --header-height: 64px;
  --sidebar-width: 280px;
  --game-board-gap: var(--space-6);      /* 24px */
}
```

### Border Radius Scale

```css
:root {
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
}
```

### Shadow System

```css
:root {
  /* Elevation Shadows */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  /* Colored Shadows for Cards */
  --shadow-atlas: 0 10px 25px -5px rgba(30, 58, 138, 0.2);
  --shadow-nova: 0 10px 25px -5px rgba(124, 58, 237, 0.2);
  --shadow-omega: 0 10px 25px -5px rgba(234, 88, 12, 0.2);
  --shadow-vital: 0 10px 25px -5px rgba(13, 148, 136, 0.2);
}
```

---

## Free Assets

### 1. Icon Library: Lucide React

**Install:**
```bash
npm install lucide-react
```

**Website:** https://lucide.dev/

**Key Icons for Stock Market Tycoon:**

```tsx
// Trading Actions
import { 
  TrendingUp,        // Stock rising
  TrendingDown,      // Stock falling
  ArrowUpCircle,     // Positive change
  ArrowDownCircle,   // Negative change
  Equal,             // No change
  DollarSign,        // Money/currency
  Coins,             // Cash holdings
  ShoppingCart,      // Buy action
  HandCoins,         // Sell action
  RefreshCw,         // Refresh/reload
} from 'lucide-react'

// Game Features
import {
  Award,             // Director badge
  Crown,             // Chairman badge
  Star,              // Premium feature
  Lock,              // Locked mode
  Unlock,            // Unlocked mode
  Target,            // Goal/objective
  Zap,               // Quick action
  Shield,            // Protection
} from 'lucide-react'

// Navigation & UI
import {
  LayoutDashboard,   // Dashboard
  Briefcase,         // Portfolio
  BarChart3,         // Analytics
  LineChart,         // Price chart
  PieChart,          // Distribution
  Users,             // Multiplayer
  Settings,          // Settings
  Menu,              // Mobile menu
  X,                 // Close
  ChevronDown,       // Dropdown
  ChevronRight,      // Next
  ChevronLeft,       // Previous
} from 'lucide-react'

// Actions & Feedback
import {
  Plus,              // Add
  Minus,             // Remove
  Check,             // Confirm
  CheckCircle,       // Success
  AlertCircle,       // Warning
  Info,              // Information
  XCircle,           // Error
  HelpCircle,        // Help
  Bell,              // Notifications
} from 'lucide-react'

// Special Cards
import {
  FileText,          // Loan/Debenture
  Gift,              // Rights Issued
  Pause,             // Share Suspended
  TrendingUp,        // Currency +10%
  TrendingDown,      // Currency -10%
} from 'lucide-react'

// Game Modes
import {
  CircleDot,         // Trader mode
  BarChart2,         // Investor mode
  Brain,             // Strategist mode
  Trophy,            // Tycoon mode
  Diamond,           // Mogul mode
} from 'lucide-react'
```

**Usage Example:**
```tsx
import { TrendingUp } from 'lucide-react'

<TrendingUp 
  size={24} 
  color="#16a34a"
  strokeWidth={2}
/>
```

### 2. Illustrations: unDraw

**Website:** https://undraw.co/illustrations

**Relevant Illustrations (Search Terms):**
- `financial data` - Dashboard/analytics
- `stock market` - Landing page hero
- `online transactions` - Trading interface
- `growing` - Success/gains screen
- `progress` - Mode unlocking
- `in sync` - Multiplayer lobby
- `empty` - Empty states
- `winners` - Game over/victory
- `teaching` - Tutorial screens
- `team` - Multiplayer features

**How to Use:**
1. Search for illustration on unDraw
2. Customize primary color to match your brand
3. Download as SVG
4. Place in `src/assets/illustrations/`

**Example Code:**
```tsx
import EmptyPortfolio from '@/assets/illustrations/empty-portfolio.svg'

<img 
  src={EmptyPortfolio} 
  alt="No stocks in portfolio"
  className="w-64 h-64 mx-auto opacity-50"
/>
```

### 3. Animated Illustrations: Storyset

**Website:** https://storyset.com/

**Best Collections:**
- Business illustrations
- Finance illustrations
- Technology illustrations

**Use Cases:**
- Mode unlock celebrations (Lottie animations)
- Tutorial step transitions
- Loading states
- Success animations

**Format:** Download as Lottie JSON or SVG

### 4. Background Patterns

#### SVG Backgrounds
**Website:** https://www.svgbackgrounds.com/

**Recommended Patterns:**
- Grid pattern for game board
- Layered waves for sections
- Geometric shapes for cards

**Implementation:**
```css
.game-board {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
```

#### Hero Patterns
**Website:** https://heropatterns.com/

**Download as CSS** and customize colors

### 5. Gradient Generator

**Website:** https://www.hypercolor.dev/

**Pre-made gradients for copy-paste**

**Stock-Specific Gradients:**
```css
/* NovaTech - Futuristic */
.nova-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Atlas Bank - Trust */
.atlas-gradient {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

/* Omega Energy - Power */
.omega-gradient {
  background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
}

/* Success State */
.success-gradient {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
```

### 6. Chart Library: Recharts

**Install:**
```bash
npm install recharts
```

**Website:** https://recharts.org/

**Use Cases:**
- Stock price history line charts
- Portfolio distribution pie chart
- Round-by-round comparison bar charts
- Net worth over time area charts

**Example:**
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

<LineChart width={600} height={300} data={priceHistory}>
  <XAxis dataKey="round" />
  <YAxis />
  <Tooltip />
  <Line 
    type="monotone" 
    dataKey="price" 
    stroke="#7c3aed" 
    strokeWidth={3}
  />
</LineChart>
```

### 7. Company Logos (DIY)

**Option 1: Use Text + Icon**
```tsx
<div className="flex items-center gap-2">
  <Crown className="text-atlas-600" />
  <span className="font-heading font-bold">Atlas Bank</span>
</div>
```

**Option 2: Logo Maker (Free Tier)**
- Canva (free logo templates)
- Looka (AI-generated, paid but cheap)
- Hatchful by Shopify (free)

**Option 3: Simple SVG Shapes**
```tsx
// Atlas Bank - Shield Shape
<svg viewBox="0 0 24 24" className="w-8 h-8">
  <path 
    d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" 
    fill="var(--atlas-600)"
  />
</svg>
```

---

## Component Library

### shadcn/ui (Highly Recommended)

**Install:**
```bash
npx shadcn-ui@latest init
```

**Components to Add:**
```bash
# Core Components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar

# Forms & Inputs
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add switch

# Overlays
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add popover

# Navigation
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add navigation-menu

# Feedback
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add progress

# Data Display
npx shadcn-ui@latest add table
npx shadcn-ui@latest add separator
```

**Why shadcn/ui?**
✅ Copy-paste components (no package dependency)  
✅ Built on Radix UI (accessibility)  
✅ Fully customizable with Tailwind  
✅ TypeScript support  
✅ Perfect for game UI  

---

## Animation System

### Framer Motion

**Install:**
```bash
npm install framer-motion
```

**Website:** https://www.framer.com/motion/

### Animation Presets

```tsx
// src/design-system/animations.ts

export const animations = {
  // Card Dealing
  cardDeal: {
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    transition: { type: "spring", stiffness: 260, damping: 20 }
  },
  
  // Price Change (Up)
  priceIncrease: {
    initial: { y: 0 },
    animate: { y: [-10, 0] },
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  // Price Change (Down)
  priceDecrease: {
    initial: { y: 0 },
    animate: { y: [10, 0] },
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  // Button Press
  buttonTap: {
    whileTap: { scale: 0.95 }
  },
  
  // Hover Effect
  cardHover: {
    whileHover: { 
      scale: 1.02, 
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" 
    }
  },
  
  // Fade In
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  
  // Slide In From Right
  slideInRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { type: "spring", damping: 25, stiffness: 200 }
  },
  
  // Success Celebration
  celebration: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: [0, 1.2, 1], rotate: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  },
  
  // Stagger Children
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  // Shake (Error)
  shake: {
    animate: { x: [-10, 10, -10, 10, 0] },
    transition: { duration: 0.4 }
  }
}
```

**Usage Example:**
```tsx
import { motion } from 'framer-motion'
import { animations } from '@/design-system/animations'

<motion.div {...animations.cardDeal}>
  <StockCard />
</motion.div>

<motion.button {...animations.buttonTap}>
  Buy Shares
</motion.button>
```

---

## Implementation Guide

### Project Structure

```
src/
├── assets/
│   ├── fonts/                      # Self-hosted fonts (optional)
│   ├── illustrations/              # unDraw SVGs
│   │   ├── onboarding/
│   │   ├── empty-states/
│   │   └── success/
│   ├── icons/                      # Custom SVG icons
│   └── patterns/                   # Background patterns
│
├── design-system/
│   ├── tokens.ts                   # Design tokens (colors, spacing)
│   ├── animations.ts               # Framer Motion presets
│   └── components/                 # Base components
│       ├── Button/
│       ├── Card/
│       ├── Badge/
│       └── StockPrice/
│
├── components/
│   ├── game/                       # Game-specific components
│   │   ├── StockCard.tsx
│   │   ├── Portfolio.tsx
│   │   ├── TransactionPanel.tsx
│   │   └── PriceChart.tsx
│   ├── ui/                         # shadcn/ui components
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── GameBoard.tsx
│
├── styles/
│   ├── globals.css                 # Global styles
│   └── tokens.css                  # CSS custom properties
│
└── lib/
    ├── utils.ts                    # Utility functions
    └── constants.ts                # Game constants
```

### Tailwind Configuration

```javascript
// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme")

module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Company Colors
        atlas: {
          50: '#f0f4ff',
          100: '#dbeafe',
          600: '#1e3a8a',
          900: '#0f172a',
        },
        titan: {
          600: '#475569',
        },
        global: {
          600: '#0369a1',
        },
        omega: {
          600: '#ea580c',
        },
        vital: {
          600: '#0d9488',
        },
        nova: {
          600: '#7c3aed',
        },
        
        // Semantic
        success: {
          50: '#f0fdf4',
          600: '#16a34a',
        },
        danger: {
          50: '#fef2f2',
          600: '#dc2626',
        },
      },
      
      fontFamily: {
        heading: ['Space Grotesk', ...fontFamily.sans],
        body: ['Inter', ...fontFamily.sans],
        mono: ['JetBrains Mono', ...fontFamily.mono],
      },
      
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      boxShadow: {
        'atlas': '0 10px 25px -5px rgba(30, 58, 138, 0.2)',
        'nova': '0 10px 25px -5px rgba(124, 58, 237, 0.2)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Global Styles

```css
/* src/styles/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Import from tokens.css or define here */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }
  
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground font-body;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
  
  /* Tabular numbers for prices */
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

---

## Code Examples

### Stock Card Component

```tsx
// components/game/StockCard.tsx
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Crown, Award } from 'lucide-react'
import { animations } from '@/design-system/animations'

interface StockCardProps {
  company: string
  price: number
  priceChange: number
  owned: number
  isDirector?: boolean
  isChairman?: boolean
  color: string
}

export function StockCard({
  company,
  price,
  priceChange,
  owned,
  isDirector,
  isChairman,
  color
}: StockCardProps) {
  const isPriceUp = priceChange > 0
  const isPriceDown = priceChange < 0
  
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-xl p-6 
        bg-gradient-to-br from-${color}-50 to-white
        border-2 border-${color}-200
        shadow-lg hover:shadow-xl transition-shadow
      `}
      {...animations.cardHover}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-heading font-bold text-xl text-gray-900">
            {company}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {isChairman && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                <Crown size={12} />
                Chairman
              </span>
            )}
            {isDirector && !isChairman && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                <Award size={12} />
                Director
              </span>
            )}
          </div>
        </div>
        
        {/* Price Change Indicator */}
        {priceChange !== 0 && (
          <motion.div
            className={`
              flex items-center gap-1 px-2 py-1 rounded-md
              ${isPriceUp ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}
            `}
            {...(isPriceUp ? animations.priceIncrease : animations.priceDecrease)}
          >
            {isPriceUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-mono font-semibold text-sm">
              {isPriceUp ? '+' : ''}{priceChange}
            </span>
          </motion.div>
        )}
      </div>
      
      {/* Price */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">Current Price</p>
        <p className="font-mono font-bold text-4xl text-gray-900 tabular-nums">
          ${price}
        </p>
      </div>
      
      {/* Holdings */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-1">Your Holdings</p>
        <p className="font-mono font-semibold text-lg text-gray-900">
          {owned.toLocaleString()} shares
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Value: ${(owned * price).toLocaleString()}
        </p>
      </div>
    </motion.div>
  )
}
```

### Button Component with Variants

```tsx
// components/ui/Button.tsx
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900",
        primary: "bg-nova-600 text-white hover:bg-nova-700 focus:ring-nova-600",
        success: "bg-success-600 text-white hover:bg-success-700 focus:ring-success-600",
        danger: "bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-600",
        outline: "border-2 border-gray-300 bg-transparent hover:bg-gray-50",
        ghost: "hover:bg-gray-100",
      },
      size: {
        sm: "text-sm px-3 py-2",
        md: "text-base px-6 py-3",
        lg: "text-lg px-8 py-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ 
  className, 
  variant, 
  size, 
  children,
  ...props 
}: ButtonProps) {
  return (
    <motion.button
      className={buttonVariants({ variant, size, className })}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
```

### Price Chart Component

```tsx
// components/game/PriceChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface PriceChartProps {
  data: Array<{ round: number; price: number }>
  color: string
  companyName: string
}

export function PriceChart({ data, color, companyName }: PriceChartProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="font-heading font-bold text-lg mb-4">
        {companyName} Price History
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis 
            dataKey="round" 
            label={{ value: 'Round', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

## Quick Start Checklist

### Day 1: Foundation
- [ ] Install Tailwind CSS
- [ ] Add Google Fonts to index.html
- [ ] Install Lucide Icons
- [ ] Create design-system/tokens.ts
- [ ] Set up globals.css with base styles

### Day 2: Component Library
- [ ] Install shadcn/ui
- [ ] Add core components (Button, Card, Badge)
- [ ] Create StockCard component
- [ ] Set up color variants for each company

### Day 3: Assets & Animations
- [ ] Install Framer Motion
- [ ] Download 5-10 unDraw illustrations
- [ ] Create animations.ts with presets
- [ ] Add background patterns

### Day 4: Layout
- [ ] Build Header component
- [ ] Create GameBoard layout
- [ ] Implement responsive grid
- [ ] Test on mobile

### Day 5: Polish
- [ ] Add hover states to all interactive elements
- [ ] Implement micro-animations
- [ ] Test color contrast (accessibility)
- [ ] Optimize for performance

---

## Package.json Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.292.0",
    "recharts": "^2.10.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.2.2",
    "tailwindcss": "^3.3.5",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

---

## Resources Summary

| Resource | URL | Use Case |
|----------|-----|----------|
| Google Fonts | https://fonts.google.com/ | Typography |
| Lucide Icons | https://lucide.dev/ | Icons |
| unDraw | https://undraw.co/ | Illustrations |
| Storyset | https://storyset.com/ | Animated illustrations |
| SVG Backgrounds | https://svgbackgrounds.com/ | Patterns |
| Hero Patterns | https://heropatterns.com/ | Subtle backgrounds |
| Hypercolor | https://hypercolor.dev/ | Gradients |
| shadcn/ui | https://ui.shadcn.com/ | Component library |
| Recharts | https://recharts.org/ | Charts |
| Framer Motion | https://framer.com/motion/ | Animations |
| Tailwind CSS | https://tailwindcss.com/ | Utility CSS |

---

## Next Steps

1. **Save this document** to your project as `design-system.md`
2. **Install core dependencies** (Tailwind, shadcn/ui, Lucide, Framer Motion)
3. **Set up design tokens** in your codebase
4. **Create one complete screen** as a proof of concept (main game board)
5. **Get feedback** and iterate

---

*Last Updated: [Current Date]*  
*Design System Version: 1.0*  
*Project: Stock Market Tycoon*