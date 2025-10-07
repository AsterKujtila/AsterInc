# 🚀 AsterLaunch - Solana Meme Coin Launchpad

AsterLaunch is a comprehensive, high-performance meme coin launchpad built on Solana, inspired by Pump.fun's user experience with a sleek dark-mode aesthetic and real-time trading capabilities.

## ✨ Features

### 🎨 **Modern Dark UI**
- **Electric Blue Accent** (#6E56F8) - Professional crypto trading terminal aesthetic
- **Three-Column Layout** - Optimized for efficiency and speed
- **Real-time Updates** - Live price feeds and market data every 3-5 seconds
- **Responsive Design** - Works seamlessly on desktop and mobile

### 🪙 **Token Creation**
- **Ultra-Minimal Form** - Only 4 fields required: Name, Ticker, Description, Image
- **Fixed Launch Fee** - 0.02 SOL to create any token
- **Instant Deployment** - Tokens go live immediately on bonding curve
- **1B Token Supply** - Standard supply with 6 decimal places

### 📈 **Bonding Curve Trading**
- **100% Liquidity Guaranteed** - Mathematical curve ensures no rug pulls
- **Real-time Price Discovery** - Prices adjust automatically based on supply/demand
- **1% Trading Fee** - 0.5% to liquidity pool, 0.5% to platform treasury
- **Slippage Protection** - Built-in slippage tolerance controls

### 🎓 **Automatic Graduation**
- **$69K Market Cap Target** - Automatic graduation threshold
- **Raydium Integration** - Liquidity automatically migrates to Raydium DEX
- **LP Token Burning** - Liquidity permanently locked via LP token burn
- **Seamless Transition** - No manual intervention required

### 💼 **Portfolio Management**
- **Real-time Portfolio Tracking** - Live P&L calculations
- **Transaction History** - Complete trading activity log
- **Multi-token Support** - Track all your meme coin positions
- **SOL Balance Integration** - Native Solana wallet integration

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Three-column layout with navigation
├── contexts/           # React context providers
│   ├── WalletContext.tsx   # Solana wallet integration
│   └── DataContext.tsx     # Real-time data management
├── pages/              # Main application pages
│   ├── Dashboard.tsx   # Token list and platform stats
│   ├── CreateCoin.tsx  # Token creation form
│   ├── TradingView.tsx # Individual token trading
│   └── Portfolio.tsx   # User portfolio and history
├── App.tsx            # Main application component
├── index.css          # Dark mode styling system
└── main.tsx           # Application entry point
```

### Smart Contracts (Rust + Anchor)
```
contracts/
└── programs/asterlaunch/src/
    └── lib.rs          # Main program with bonding curve logic
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Rust and Cargo (for smart contracts)
- Solana CLI tools
- Anchor Framework

### Frontend Setup
```bash
cd astra-wallet
npm install
npm run dev
```

### Smart Contract Setup
```bash
cd contracts
anchor build
anchor deploy --provider.cluster devnet
```

## 🎯 Core Functionality

### 1. Token Creation Flow
```typescript
// User fills minimal form
const tokenData = {
  name: "DogeCoin 2.0",
  ticker: "DOGE2", 
  description: "The next evolution of meme coins",
  image: File // Optional image upload
}

// Smart contract creates token with bonding curve
await program.methods.createToken(
  tokenData.name,
  tokenData.ticker,
  tokenData.uri,
  virtualSolReserves,
  virtualTokenReserves
).rpc()
```

### 2. Bonding Curve Trading
```rust
// Constant product formula: k = virtual_sol * virtual_token
let k = current_sol_reserves * current_token_reserves;
let new_sol_reserves = current_sol_reserves + sol_amount;
let new_token_reserves = k / new_sol_reserves;
let tokens_out = current_token_reserves - new_token_reserves;
```

### 3. Automatic Graduation
```rust
// Check if graduation threshold reached
let market_cap = calculate_market_cap(bonding_curve)?;
if market_cap >= GRADUATION_THRESHOLD {
    bonding_curve.graduated = true;
    // Trigger liquidity migration to Raydium
    migrate_to_raydium(bonding_curve)?;
}
```

## 🎨 Design System

### Color Palette
```css
--bg-primary: #121212     /* Deep black background */
--bg-secondary: #1a1a1a   /* Card backgrounds */
--accent-primary: #6E56F8 /* Electric blue accent */
--text-primary: #ffffff   /* Primary text */
--green: #00ff88         /* Price increases */
--red: #ff4757           /* Price decreases */
```

### Component Library
- **Buttons** - Primary, secondary, success, danger variants
- **Cards** - Consistent spacing and border radius
- **Tables** - Real-time data display with hover effects
- **Forms** - Dark-themed inputs with validation
- **Progress Bars** - Graduation progress visualization

## 📊 Real-time Features

### Live Data Updates
- **Token Prices** - Updated every 5 seconds via WebSocket simulation
- **Market Caps** - Real-time calculation based on bonding curve
- **Portfolio Values** - Live P&L tracking
- **Trading Volume** - 24-hour rolling volume statistics

### Performance Optimizations
- **Efficient Re-renders** - React context optimization
- **Lazy Loading** - Components loaded on demand
- **Memoization** - Expensive calculations cached
- **Virtual Scrolling** - Large token lists handled efficiently

## 🔒 Security Features

### Smart Contract Security
- **Anchor Framework** - Built-in security best practices
- **Overflow Protection** - Safe math operations
- **Access Controls** - Proper authorization checks
- **Slippage Protection** - MEV and sandwich attack prevention

### Frontend Security
- **Input Validation** - All user inputs sanitized
- **XSS Prevention** - Proper content escaping
- **Wallet Integration** - Secure connection handling
- **Error Boundaries** - Graceful error handling

## 🧪 Testing

### Frontend Tests
```bash
npm run test
```

### Smart Contract Tests
```bash
anchor test
```

## 📈 Platform Statistics

### Key Metrics Tracked
- **Total Tokens Created** - Platform adoption metric
- **Total Trading Volume** - Economic activity indicator  
- **Graduation Rate** - Success rate of tokens reaching DEX
- **Average Hold Time** - User engagement metric
- **Fee Revenue** - Platform sustainability metric

### Performance Targets
- **Sub-second Response** - All UI interactions under 1s
- **99.9% Uptime** - High availability target
- **Real-time Updates** - Data freshness under 5s
- **Mobile Responsive** - Full functionality on all devices

## 🛠️ Technology Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Recharts** - Beautiful trading charts
- **Lucide React** - Consistent icon system

### Backend/Blockchain
- **Solana** - High-performance blockchain
- **Anchor** - Solana development framework
- **Rust** - Systems programming language
- **SPL Token** - Solana token standard

### Development Tools
- **ESLint** - Code quality enforcement
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality gates
- **GitHub Actions** - CI/CD pipeline

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy to Vercel, Netlify, or any static host
```

### Smart Contract Deployment
```bash
# Deploy to Devnet
anchor deploy --provider.cluster devnet

# Deploy to Mainnet
anchor deploy --provider.cluster mainnet
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🆘 Support

- **Documentation** - Comprehensive guides in `/docs`
- **Discord** - Community support and discussions
- **GitHub Issues** - Bug reports and feature requests
- **Email** - Direct support for critical issues

---

**Built with ⚡ by the AsterLaunch Team**

*Making meme coin creation accessible, secure, and profitable for everyone on Solana.*