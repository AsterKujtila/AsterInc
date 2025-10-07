# 🎯 Getting Started with AsterLaunch

**Welcome to AsterLaunch!** This guide will get you up and running in 5 minutes.

## 🚦 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd /workspace/asterlaunch
npm install
```

This will install:
- Next.js 14
- React 18
- Tailwind CSS
- Solana wallet adapters
- Recharts (for bonding curve visualization)
- TypeScript

### Step 2: Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your settings (optional for local dev)
# The defaults will work for local development
```

### Step 3: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**That's it! 🎉** You should now see the AsterLaunch dashboard.

## 🎨 What You'll See

### Dashboard (Home Page)
- **Token List**: Sample meme coins with real-time price updates
- **Sidebar**: Navigation and wallet connection
- **Sorting**: Filter tokens by market cap, 24h change, or creation date

### Try These Features:

1. **Browse Tokens**
   - Click on any token card to view trading page
   - Watch prices update in real-time (every 5 seconds)

2. **Create a Token** (Mock)
   - Click "Create Coin" in sidebar
   - Fill out the 4-field form
   - Upload an image
   - Click "Launch Coin"
   - *Note: This is frontend-only for now (mock data)*

3. **View Trading Page**
   - Click any token from the dashboard
   - See the bonding curve chart
   - Try the buy/sell interface
   - View recent trades
   - Check graduation progress

4. **Connect Wallet** (Optional)
   - Click "Select Wallet" button
   - Choose Phantom or Solflare
   - Visit the Portfolio page to see holdings

## 📁 Project Structure

```
asterlaunch/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── page.tsx           # Dashboard (/)
│   │   ├── create/            # Token creation (/create)
│   │   ├── coin/[ticker]/     # Trading view (/coin/PEPA)
│   │   └── portfolio/         # Portfolio (/portfolio)
│   │
│   ├── components/            # React components
│   │   ├── Sidebar.tsx       # Navigation
│   │   ├── TokenCard.tsx     # Token display
│   │   └── WalletProvider.tsx # Wallet integration
│   │
│   ├── types/                 # TypeScript types
│   │   └── index.ts          # Token, Trade, etc.
│   │
│   └── lib/                   # Utilities
│       └── mockData.ts       # Sample tokens
│
├── solana-program/            # Rust smart contract
│   └── src/
│       ├── lib.rs            # Program entry
│       ├── instruction.rs    # Instructions
│       ├── processor.rs      # Handlers
│       ├── state.rs          # Account states
│       ├── error.rs          # Errors
│       └── bonding_curve.rs  # Curve logic
│
└── Documentation/             # Guides
    ├── README.md             # Main docs
    ├── ARCHITECTURE.md       # System design
    ├── DEPLOYMENT.md         # Deploy guide
    └── PROJECT_SUMMARY.md    # Overview
```

## 🔧 Smart Contract (Optional)

If you want to test the Solana smart contract:

### Prerequisites
```bash
# Install Rust (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI (if not installed)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Verify installation
solana --version
rustc --version
```

### Build the Program
```bash
cd solana-program
cargo build-bpf
```

### Run Tests
```bash
cargo test
```

### Deploy to Devnet (Optional)
```bash
# Configure for devnet
solana config set --url devnet

# Airdrop SOL
solana airdrop 2

# Deploy
solana program deploy target/deploy/asterlaunch_program.so
```

## 🎨 Customization

### Change Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  background: "#121212",        // Change main background
  "aster-primary": "#6E56F8",  // Change accent color
  "pump-green": "#00ff88",     // Change buy color
  "dump-red": "#ff4444",       // Change sell color
}
```

### Modify Bonding Curve Parameters

Edit `solana-program/src/state.rs`:

```rust
let initial_price = 100_000;    // 0.0001 SOL
let price_increment = 10;        // Price increase per token
```

### Update Platform Fees

Edit `solana-program/src/state.rs`:

```rust
trading_fee_bps: 100,           // 100 = 1%
creation_fee_lamports: 20_000_000,  // 0.02 SOL
graduation_threshold_usd: 69_000_000_000, // $69,000
```

## 📚 Learn More

### Frontend Development
- **Next.js**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Solana Wallet Adapter**: [https://github.com/solana-labs/wallet-adapter](https://github.com/solana-labs/wallet-adapter)

### Solana Development
- **Solana Docs**: [https://docs.solana.com/](https://docs.solana.com/)
- **Solana Cookbook**: [https://solanacookbook.com/](https://solanacookbook.com/)
- **Anchor Framework**: [https://www.anchor-lang.com/](https://www.anchor-lang.com/)

### Project Documentation
- **README.md** - Complete feature documentation
- **ARCHITECTURE.md** - System architecture deep-dive
- **DEPLOYMENT.md** - Production deployment guide
- **PROJECT_SUMMARY.md** - Project overview

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use a different port
npm run dev -- -p 3001
```

### Wallet Not Connecting
1. Install Phantom or Solflare browser extension
2. Create/import a wallet
3. Switch to Devnet in wallet settings
4. Try connecting again

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Rust Build Fails
```bash
# Update Rust
rustup update

# Install BPF tools
solana install
```

## 🎯 Next Steps

### For Frontend Developers
1. ✅ Run the dev server
2. ✅ Explore the UI components
3. ✅ Modify colors and styling
4. ✅ Add new features (search, filters, etc.)
5. ✅ Connect to real Solana program

### For Smart Contract Developers
1. ✅ Review `solana-program/src/` files
2. ✅ Understand bonding curve logic
3. ✅ Run tests (`cargo test`)
4. ✅ Deploy to devnet
5. ✅ Integrate with frontend

### For Full-Stack Developers
1. ✅ Set up both frontend and smart contract
2. ✅ Deploy program to devnet
3. ✅ Connect frontend to deployed program
4. ✅ Test end-to-end flow
5. ✅ Prepare for mainnet

## 💡 Pro Tips

1. **Real-Time Updates**: Data refreshes every 5 seconds automatically
2. **Mock Data**: Current version uses mock data - perfect for UI development
3. **Responsive Design**: Works on desktop, tablet, and mobile
4. **Dark Mode**: Optimized for low-light environments
5. **Type Safety**: Full TypeScript coverage prevents bugs

## 🚀 Production Deployment

When you're ready to deploy:

1. **Frontend**: Deploy to Vercel (recommended)
   ```bash
   vercel --prod
   ```

2. **Smart Contract**: Deploy to Solana mainnet
   ```bash
   solana config set --url mainnet-beta
   solana program deploy target/deploy/asterlaunch_program.so
   ```

3. **Connect**: Update `.env` with production program ID

See `DEPLOYMENT.md` for complete production deployment guide.

## 📞 Need Help?

- **Documentation**: Check `README.md` and `ARCHITECTURE.md`
- **Code Comments**: All files are extensively documented
- **Solana Community**: [Discord](https://discord.gg/solana)
- **Next.js Community**: [Discord](https://discord.gg/nextjs)

## ✨ Features Checklist

- ✅ Token creation interface
- ✅ Real-time trading dashboard
- ✅ Bonding curve visualization
- ✅ Wallet integration (Phantom, Solflare)
- ✅ Portfolio tracking
- ✅ Graduation progress tracking
- ✅ Buy/Sell trading interface
- ✅ Recent trades feed
- ✅ Mobile responsive design
- ✅ Dark mode theme

## 🎉 You're All Set!

You now have a fully functional meme coin launchpad running locally.

**Start exploring and happy coding! 🚀**

---

*Built with 💜 on Solana*