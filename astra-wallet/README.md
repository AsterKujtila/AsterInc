# AsterLaunch - Meme Coin Launchpad

A comprehensive, no-code meme coin launchpad built with React, TypeScript, and Solana smart contracts. Inspired by Pump.fun's user experience with a sleek dark-mode aesthetic and real-time data display.

## 🚀 Features

### Frontend (React/TypeScript)
- **Dark Mode UI**: Professional crypto trading terminal aesthetic
- **Three-Column Layout**: Navigation, Main Feed, and Interaction Panel
- **Real-Time Updates**: Live token data refreshing every 3-5 seconds
- **Wallet Integration**: Support for Phantom and Solflare wallets
- **Token Creation**: Ultra-minimalist one-screen token launch
- **Trading Interface**: Buy/sell with "Pump it!" and "Dump it!" buttons
- **Live Charts**: Real-time price charts using Recharts
- **Responsive Design**: Mobile-first approach with desktop optimization

### Smart Contracts (Rust/Solana)
- **Bonding Curve Logic**: 100% liquidity guaranteed with constant product formula
- **Graduation Mechanism**: Automatic transfer to external DEX at $69K market cap
- **Trading Fees**: 1% total (0.5% liquidity + 0.5% platform)
- **Security**: Comprehensive input validation and error handling
- **Gas Optimization**: Efficient storage and computation

## 🎨 Design System

### Color Palette
- **Primary Background**: `#121212` (Deep black)
- **Surface**: `#1E1E1E` (Dark gray)
- **Accent/Brand**: `#6E56F8` (Electric blue)
- **Success**: `#00D4AA` (Vibrant green)
- **Danger**: `#FF3B30` (Solid red)
- **Borders**: `#333333` (Dark borders)

### Typography
- **Font Family**: JetBrains Mono (monospace for crypto data)
- **Weight**: 400-700 (Regular to Bold)

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/
│   ├── Layout.tsx              # Main three-column layout
│   ├── CreateTokenForm.tsx     # Token creation interface
│   ├── TokenList.tsx          # Real-time token table
│   └── TradingView.tsx        # Trading interface with charts
├── contexts/
│   └── WalletContext.tsx      # Solana wallet integration
├── types/
│   └── index.ts               # TypeScript type definitions
├── utils/
│   └── cn.ts                  # Tailwind CSS utility functions
└── App.tsx                    # Main application component
```

### Smart Contract Structure
```
contracts/
├── Cargo.toml                 # Rust dependencies
└── src/
    └── lib.rs                 # Main smart contract logic
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Rust 1.70+
- Solana CLI 1.18+

### Installation

1. **Install Dependencies**
   ```bash
   cd astra-wallet
   npm install
   ```

2. **Install Rust Dependencies**
   ```bash
   cd contracts
   cargo build
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
# Frontend
npm run build

# Smart Contracts
cd contracts
cargo build-bpf
```

## 🔧 Smart Contract Details

### Bonding Curve Formula
The bonding curve uses a constant product formula: `x * y = k`

- **x**: SOL reserve
- **y**: Token reserve  
- **k**: Constant (invariant)

### Key Functions

#### `initialize_bonding_curve`
Creates a new token with bonding curve mechanics:
- Mints total supply to bonding curve
- Sets up reserves (0 SOL, 100% tokens)
- Initializes with 0.1 SOL launch fee

#### `buy_tokens`
Executes token purchase:
- Calculates tokens using bonding curve formula
- Applies 1% trading fee (0.5% liquidity + 0.5% platform)
- Updates reserves and checks graduation

#### `sell_tokens`
Executes token sale:
- Calculates SOL using bonding curve formula
- Applies 1% trading fee
- Burns tokens and updates reserves

#### `graduate_token`
Transfers liquidity to external DEX:
- Triggers at $69K market cap
- Transfers all SOL and tokens to liquidity pool
- Permanently locks liquidity

### Security Features
- Input validation on all parameters
- Slippage protection through constant product formula
- Reentrancy protection
- Proper access controls
- Comprehensive error handling

## 📊 Real-Time Data

The application simulates real-time updates with:
- Price fluctuations (±1% random changes)
- Graduation progress updates
- Holder count growth
- Volume tracking
- Live chart updates

## 🎯 User Experience

### Token Creation Flow
1. User clicks "Create Coin"
2. Fills minimal form (name, ticker, description, image)
3. Pays 0.1 SOL launch fee
4. Token appears in live feed immediately

### Trading Flow
1. User selects token from list
2. Chooses buy/sell with "Pump it!" or "Dump it!" buttons
3. Enters amount
4. Confirms trade with fee preview
5. Transaction executes with real-time updates

### Graduation Flow
1. Token reaches $69K market cap
2. Automatic graduation to external DEX
3. Liquidity permanently locked
4. Token marked as "Graduated" in UI

## 🔐 Security Considerations

### Smart Contract Security
- All arithmetic operations use checked math
- Input validation prevents invalid states
- Access controls ensure only authorized operations
- Graduation mechanism prevents manipulation

### Frontend Security
- Wallet connection validation
- Input sanitization
- Error boundary implementation
- Secure state management

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Smart Contracts (Solana Mainnet)
```bash
cd contracts
cargo build-bpf
solana program deploy target/deploy/aster_launch.so
```

## 📈 Performance Optimizations

### Frontend
- React.memo for component optimization
- useCallback for event handlers
- Lazy loading for charts
- Efficient state updates

### Smart Contracts
- Minimal storage usage
- Efficient calculations
- Batch operations where possible
- Gas-optimized instruction sets

## 🧪 Testing

### Frontend Testing
```bash
npm run test
```

### Smart Contract Testing
```bash
cd contracts
cargo test
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Follow us on Twitter

---

**AsterLaunch** - Launch your meme coin to the moon! 🚀🌙