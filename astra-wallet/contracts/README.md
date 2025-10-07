# AsterLaunch Smart Contracts

This directory contains the Rust smart contracts for the AsterLaunch meme coin launchpad on Solana.

## Architecture Overview

The AsterLaunch platform consists of three main smart contracts:

1. **Token Factory** (`token_factory.rs`) - Creates new SPL tokens with bonding curve mechanics
2. **Bonding Curve** (`bonding_curve.rs`) - Handles token trading with automated market making
3. **Graduation Manager** (`graduation.rs`) - Manages liquidity migration to external DEX

## Key Features

- **Bonding Curve Trading**: Tokens trade on a mathematical curve ensuring 100% liquidity
- **Automatic Graduation**: When market cap reaches $69K, liquidity migrates to Raydium
- **Fee Structure**: 1% trading fee (0.5% to liquidity, 0.5% to platform treasury)
- **Security**: Built with Anchor framework for enhanced security and developer experience

## Contract Addresses (Devnet)

- Token Factory: `TBD`
- Bonding Curve: `TBD`
- Graduation Manager: `TBD`

## Build Instructions

```bash
# Install Anchor CLI
npm install -g @coral-xyz/anchor-cli

# Build contracts
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## Testing

```bash
# Run tests
anchor test
```