# AsterLaunch Solana Program

This directory contains the Rust smart contract (Solana program) for AsterLaunch.

## 🏗️ Architecture

### Program Accounts

1. **PlatformConfig**
   - Stores global platform configuration
   - Contains authority, treasury, and fee settings
   - Tracks platform-wide statistics

2. **TokenState**
   - Metadata for each launched token
   - Tracks graduation status
   - Links to bonding curve account

3. **BondingCurveState**
   - Manages token pricing
   - Tracks SOL and token reserves
   - Calculates market cap

### Key Functions

#### `calculate_buy_price(token_amount)`
Calculates the total SOL cost for buying a specific amount of tokens.

**Formula**:
```rust
// For a linear curve: price(n) = initial_price + n * increment
// Total cost = sum from i to i+amount of price(i)
// This equals: amount * avg_price where avg_price = (first_price + last_price) / 2

first_price = initial_price + tokens_sold * increment
last_price = initial_price + (tokens_sold + amount - 1) * increment
total_cost = amount * (first_price + last_price) / 2
```

#### `calculate_sell_price(token_amount)`
Calculates the SOL received when selling tokens back to the curve.

**Formula**: Similar to buy, but in reverse direction on the curve.

#### `check_graduation()`
Checks if the token has reached the $69K market cap threshold.

**Condition**:
```rust
market_cap_usd >= 69_000_000_000 // $69K with 6 decimals
```

### Fee Structure Implementation

```rust
pub struct FeeStructure {
    total_fee_bps: 100,        // 1% total
    liquidity_fee_bps: 50,     // 0.5% to liquidity
    platform_fee_bps: 50,      // 0.5% to platform
}
```

On every trade:
1. Calculate total fee (1% of trade value)
2. Split: 50% to liquidity pool, 50% to platform treasury
3. Apply to both buys and sells

## 🔧 Building

```bash
# Install Rust and Solana CLI first
cargo build-bpf
```

Output: `target/deploy/asterlaunch_program.so`

## 🧪 Testing

```bash
# Run all tests
cargo test

# Run with detailed output
cargo test -- --nocapture

# Test specific module
cargo test bonding_curve::tests
```

### Example Test Cases

1. **Fee Calculation Test**
   - Input: 1 SOL (1_000_000_000 lamports)
   - Expected: 0.99 SOL net + 0.005 SOL liquidity + 0.005 SOL platform

2. **Market Cap Test**
   - Price: 0.0001 SOL per token
   - Supply: 1 billion tokens
   - SOL Price: $20
   - Expected: $2M market cap

3. **Price Calculation Test**
   - Verifies bonding curve formula
   - Tests overflow protection
   - Validates slippage protection

## 🚀 Deployment

### Devnet

```bash
# Configure Solana CLI
solana config set --url devnet

# Airdrop SOL for deployment
solana airdrop 2

# Deploy
solana program deploy target/deploy/asterlaunch_program.so

# Note the Program ID
```

### Mainnet

```bash
# Switch to mainnet
solana config set --url mainnet-beta

# Deploy (requires SOL for deployment)
solana program deploy target/deploy/asterlaunch_program.so

# ⚠️ IMPORTANT: Audit code before mainnet deployment!
```

## 📝 Program Instructions

### 1. InitializePlatform

Initialize the global platform configuration.

**Accounts**:
- `[signer]` authority
- `[writable]` config_account
- `[]` treasury
- `[]` system_program
- `[]` rent_sysvar

**Data**: None

### 2. CreateToken

Launch a new meme coin with bonding curve.

**Accounts**:
- `[signer]` creator
- `[writable]` platform_config
- `[writable]` token_state
- `[writable]` token_mint
- `[writable]` bonding_curve_state
- `[writable]` bonding_curve_token_account
- `[writable]` bonding_curve_sol_account
- `[writable]` creator_account
- `[writable]` platform_treasury
- Token program
- System program
- Rent sysvar

**Data**:
- `name: String` - Token name
- `ticker: String` - Token symbol (max 5 chars)
- `description: String` - Token description
- `metadata_uri: String` - IPFS/Arweave URI for image
- `total_supply: u64` - Total token supply

### 3. BuyTokens

Purchase tokens from the bonding curve.

**Accounts**:
- `[signer]` buyer
- `[writable]` token_state
- `[writable]` bonding_curve_state
- `[writable]` bonding_curve_token_account
- `[writable]` bonding_curve_sol_account
- `[writable]` buyer_token_account
- `[writable]` buyer_sol_account
- `[writable]` platform_treasury
- `[writable]` platform_config
- Token mint
- Token program
- System program

**Data**:
- `token_amount: u64` - Amount of tokens to buy
- `max_sol_amount: u64` - Maximum SOL willing to pay (slippage protection)

### 4. SellTokens

Sell tokens back to the bonding curve.

**Accounts**: Similar to BuyTokens

**Data**:
- `token_amount: u64` - Amount of tokens to sell
- `min_sol_amount: u64` - Minimum SOL expected (slippage protection)

### 5. GraduateToDEX

Transfer liquidity to Raydium when market cap reaches $69K.

**Accounts**:
- `[signer]` any_user (permissionless)
- `[writable]` token_state
- `[writable]` bonding_curve_state
- `[writable]` bonding_curve_token_account
- `[writable]` bonding_curve_sol_account
- Platform config
- Token mint
- `[writable]` raydium_pool_account
- `[writable]` lp_token_mint
- Raydium program
- Token program
- System program

**Data**: None

## 🔒 Security Considerations

### Implemented Protections

1. **Overflow Protection**: All math operations use `checked_*` functions
2. **Slippage Protection**: Max/min amounts on all trades
3. **Authorization**: Authority checks on admin functions
4. **Rent Exemption**: All accounts must be rent-exempt
5. **Input Validation**: Comprehensive validation on all inputs

### Recommended Audits

Before mainnet deployment:
- [ ] Third-party security audit
- [ ] Fuzzing tests
- [ ] Formal verification (optional)
- [ ] Bug bounty program

### Known Limitations

1. **Oracle Dependency**: SOL price must be provided (consider Pyth Network)
2. **MEV Risk**: Front-running possible on trades (consider using Jito)
3. **Raydium Integration**: Requires Raydium program update for new pools

## 📊 State Diagrams

### Token Lifecycle

```
[Created] --> [Active Trading] --> [Graduation Threshold] --> [Graduated to DEX]
                    ^                                               |
                    |_______________ (One-way) _____________________|
```

### Bonding Curve State

```
Initial State:
- tokens_sold = 0
- sol_collected = 0
- is_active = true

After Trades:
- tokens_sold increases (buys) or decreases (sells)
- sol_collected accumulates
- liquidity_sol grows with each trade

Graduation:
- is_active = false
- has_graduated = true
- All liquidity → Raydium
```

## 🧮 Mathematical Models

### Linear Bonding Curve

**Price Function**:
```
P(n) = P₀ + n·Δp

where:
P₀ = initial price (e.g., 0.0001 SOL)
Δp = price increment (e.g., 0.00000001 SOL)
n = number of tokens sold
```

**Integral (Total Cost)**:
```
Cost(n₁, n₂) = ∫[n₁ to n₂] P(n) dn
             = (n₂ - n₁) · [P(n₁) + P(n₂)] / 2
```

### Market Cap Calculation

```
Market Cap (USD) = Price per Token (SOL) × Circulating Supply × SOL Price (USD)
```

With precision handling:
- All USD values use 6 decimals
- SOL amounts in lamports (9 decimals)
- Token amounts in base units

## 🔗 Integration Guide

### Frontend Integration

```typescript
import { Connection, PublicKey } from '@solana/web3.js';

// Connect to program
const programId = new PublicKey('YOUR_PROGRAM_ID');
const connection = new Connection('https://api.devnet.solana.com');

// Create instruction
const instruction = createBuyTokensInstruction(
  programId,
  accounts,
  tokenAmount,
  maxSolAmount
);

// Send transaction
const signature = await wallet.sendTransaction(transaction, connection);
```

### Example Accounts Derivation

```typescript
// Derive PDA for bonding curve
const [bondingCurvePDA] = await PublicKey.findProgramAddress(
  [Buffer.from('bonding_curve'), tokenMint.toBuffer()],
  programId
);
```

## 📚 Additional Resources

- [Solana Program Library](https://spl.solana.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Raydium SDK](https://github.com/raydium-io/raydium-sdk)

---

**Note**: This is a blueprint program. Thoroughly test and audit before production use.