# 🚀 AsterLaunch - Meme Coin Launchpad

AsterLaunch is a comprehensive, no-code meme coin launchpad for Solana, inspired by the user experience and aesthetics of Pump.fun. Launch tokens in seconds with automatic bonding curves, guaranteed liquidity, and seamless DEX graduation.

![AsterLaunch Banner](https://via.placeholder.com/1200x300/6E56F8/FFFFFF?text=AsterLaunch+-+Launch+Your+Meme+Coin)

## ✨ Features

### 🎨 Frontend Features
- **Dark Mode Design**: Sleek, modern UI optimized for crypto traders
- **Three-Column Dashboard**: Efficient layout with navigation, token feed, and interaction panel
- **Real-Time Updates**: Token prices and stats update every 3-5 seconds
- **Wallet Integration**: Support for Phantom and Solflare wallets
- **Interactive Trading**: Simple buy/sell interface with slippage protection
- **Bonding Curve Visualization**: Real-time price charts showing token performance
- **Portfolio Tracking**: View your holdings and performance

### ⚙️ Smart Contract Features
- **Bonding Curve Mechanics**: Linear bonding curve with guaranteed 100% liquidity
- **1% Trading Fee**: Split between liquidity pool (0.5%) and platform treasury (0.5%)
- **Automatic DEX Graduation**: At $69K market cap, liquidity automatically transfers to Raydium
- **Permanent Liquidity Lock**: LP tokens are burned after graduation
- **Fair Launch**: No pre-mines, everyone buys from the same curve
- **Slippage Protection**: Built-in protection against frontrunning

## 🏗️ Project Structure

```
asterlaunch/
├── src/                          # Next.js Frontend
│   ├── app/                      # App Router pages
│   │   ├── page.tsx             # Home/Dashboard (Token List)
│   │   ├── create/              # Token Creation Page
│   │   ├── coin/[ticker]/       # Individual Token Trading Page
│   │   └── portfolio/           # User Portfolio Page
│   ├── components/              # React Components
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── TokenCard.tsx        # Token display card
│   │   └── WalletProvider.tsx   # Solana wallet integration
│   ├── types/                   # TypeScript type definitions
│   └── lib/                     # Utility functions and mock data
│
└── solana-program/              # Rust Smart Contract
    └── src/
        ├── lib.rs               # Program entry point
        ├── instruction.rs       # Instruction definitions
        ├── processor.rs         # Instruction handlers
        ├── state.rs             # Account state structures
        ├── error.rs             # Custom error types
        └── bonding_curve.rs     # Bonding curve logic
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** 1.70+ (for smart contract development)
- **Solana CLI** 1.18+ (for deployment)
- **Anchor Framework** 0.29+ (optional, for enhanced development)

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd asterlaunch
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Smart Contract Setup

1. **Navigate to program directory**:
   ```bash
   cd solana-program
   ```

2. **Build the program**:
   ```bash
   cargo build-bpf
   ```

3. **Run tests**:
   ```bash
   cargo test
   ```

4. **Deploy to devnet**:
   ```bash
   solana program deploy target/deploy/asterlaunch_program.so
   ```

## 🎯 How It Works

### Token Creation Flow

1. **User Connects Wallet**: Connect Phantom or Solflare wallet
2. **Fill Token Details**: Name, ticker (max 5 chars), description, and image
3. **Pay Creation Fee**: 0.02 SOL to launch the token
4. **Instant Launch**: Token is immediately tradable on the bonding curve

### Bonding Curve Mechanics

AsterLaunch uses a **linear bonding curve** with the following formula:

```
price(n) = initial_price + (n × price_increment)
```

**Example**:
- Initial price: 0.0001 SOL per token
- Price increment: 0.00000001 SOL per token
- 1st token costs: 0.0001 SOL
- 1,000,000th token costs: 0.0101 SOL

### Fee Structure

| Fee Type | Amount | Allocation |
|----------|--------|------------|
| Creation Fee | 0.02 SOL | Platform treasury |
| Trading Fee | 1.0% | 0.5% → Liquidity Pool<br>0.5% → Platform |

### DEX Graduation

When a token reaches **$69,000 market cap**:

1. ✅ All remaining tokens are paired with accumulated liquidity SOL
2. ✅ Liquidity is deposited into a Raydium pool
3. ✅ LP tokens are permanently burned (liquidity locked forever)
4. ✅ Token becomes fully tradable on Raydium DEX

## 🎨 Design System

### Color Palette

```css
Primary Background: #121212 (Deep black)
Secondary Background: #1a1a1a (Dark gray)
Tertiary Background: #252525 (Light gray)

Aster Primary: #6E56F8 (Electric purple-blue)
Aster Secondary: #8b75ff (Light purple)

Pump Green: #00ff88 (For price increases)
Dump Red: #ff4444 (For price decreases)

Text Primary: #ffffff (White)
Text Secondary: #a0a0a0 (Gray)
```

### Typography

- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold, 700-800 weight
- **Body**: Regular, 400 weight
- **Small Text**: 300 weight

## 📱 Pages Overview

### 1. Dashboard (`/`)
- Real-time token list with market data
- Sort by market cap, 24h change, or creation date
- Click any token to view trading page

### 2. Create Token (`/create`)
- Minimal 4-field form
- Image upload with preview
- Displays creation fee
- One-click launch

### 3. Trading Page (`/coin/[ticker]`)
- Live bonding curve chart
- Key metrics dashboard
- Buy/Sell trading panel
- Recent trades feed
- Graduation progress bar

### 4. Portfolio (`/portfolio`)
- Your token holdings
- Total portfolio value
- Individual token performance
- Wallet connection required

## 🔐 Smart Contract Architecture

### Core Modules

#### 1. **Platform Config** (`state.rs`)
Stores global platform settings:
- Authority & treasury addresses
- Fee structure (1% trading, 0.02 SOL creation)
- Graduation threshold ($69,000)
- Platform statistics

#### 2. **Token State** (`state.rs`)
Manages individual token data:
- Metadata (name, ticker, description)
- Supply information
- Graduation status
- Creation timestamp

#### 3. **Bonding Curve State** (`state.rs`)
Handles bonding curve mechanics:
- Price calculation functions
- SOL and token reserves
- Liquidity tracking
- Market cap calculations

#### 4. **Instructions** (`instruction.rs`)
Five core instructions:
- `InitializePlatform`: Setup platform config
- `CreateToken`: Launch new meme coin
- `BuyTokens`: Purchase from bonding curve
- `SellTokens`: Sell back to bonding curve
- `GraduateToDEX`: Transfer liquidity to Raydium

#### 5. **Bonding Curve Logic** (`bonding_curve.rs`)
Mathematical functions:
- Buy/sell price calculations
- Fee distribution
- Market cap computation
- Liquidity management

## 🧪 Testing

### Frontend Testing
```bash
# Run development server
npm run dev

# Build production version
npm run build

# Start production server
npm start
```

### Smart Contract Testing
```bash
# Run all tests
cargo test

# Run with output
cargo test -- --nocapture

# Test specific module
cargo test bonding_curve
```

## 🚢 Deployment

### Frontend Deployment (Vercel)

1. **Connect your repository** to Vercel
2. **Configure environment variables**:
   - `NEXT_PUBLIC_SOLANA_RPC_URL`: Your Solana RPC endpoint
   - `NEXT_PUBLIC_PROGRAM_ID`: Deployed program ID
3. **Deploy**: Automatic deployment on push to main

### Smart Contract Deployment

1. **Set Solana cluster**:
   ```bash
   solana config set --url devnet  # or mainnet-beta
   ```

2. **Airdrop SOL** (devnet only):
   ```bash
   solana airdrop 2
   ```

3. **Deploy program**:
   ```bash
   solana program deploy target/deploy/asterlaunch_program.so
   ```

4. **Note the Program ID** and update frontend configuration

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Wallet**: @solana/wallet-adapter-react
- **State**: Zustand (optional)

### Smart Contract
- **Language**: Rust
- **Framework**: Solana Program Library (SPL)
- **Token Standard**: SPL Token
- **Build**: Cargo + Solana CLI

## 🔒 Security Features

- ✅ **Slippage Protection**: Max/min amounts on trades
- ✅ **Overflow Protection**: Safe math operations
- ✅ **Access Control**: Authority-based permissions
- ✅ **Rent Exemption**: All accounts are rent-exempt
- ✅ **Input Validation**: Comprehensive checks on all inputs
- ✅ **Permanent Liquidity**: LP tokens burned at graduation

## 📊 Market Cap Calculation

Market cap is calculated as:

```rust
market_cap_usd = (current_price × circulating_supply) × sol_price_usd
```

With 6 decimal precision for USD values.

**Graduation occurs at**: `market_cap_usd >= 69_000_000_000` (representing $69,000)

## 🤝 Contributing

This is a blueprint/template project. Feel free to:
- Fork and modify for your own launchpad
- Add new features (e.g., token burning, staking)
- Improve the UI/UX
- Enhance smart contract security

## 📄 License

MIT License - feel free to use this as a starting point for your own projects.

## ⚠️ Disclaimer

This is a blueprint/educational project. Before deploying to mainnet:
- ✅ Conduct thorough security audits
- ✅ Test extensively on devnet
- ✅ Add comprehensive error handling
- ✅ Implement proper key management
- ✅ Consider regulatory compliance
- ✅ Add rate limiting and anti-spam measures

## 🎓 Learning Resources

- [Solana Developer Docs](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

## 🌟 Features Roadmap

Future enhancements to consider:
- [ ] Token commenting system
- [ ] Advanced charts (candlestick, volume)
- [ ] Leaderboard for top traders
- [ ] Token metadata editing
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Telegram/Discord bot integration
- [ ] Advanced analytics dashboard

---

**Built with 💜 by the Solana community**

For questions or support, please open an issue on GitHub.