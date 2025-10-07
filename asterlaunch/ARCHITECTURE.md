# 🏗️ AsterLaunch Architecture

Comprehensive architectural overview of the AsterLaunch meme coin launchpad.

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────────┐ │
│  │Dashboard │  │   Create  │  │  Trading │  │  Portfolio │ │
│  │  Page    │  │Token Page │  │   Page   │  │    Page    │ │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └──────┬─────┘ │
│       │              │              │                │       │
│       └──────────────┴──────────────┴────────────────┘       │
│                              │                               │
│                    ┌─────────▼──────────┐                    │
│                    │  Wallet Adapter     │                    │
│                    │  (Phantom/Solflare) │                    │
│                    └─────────┬──────────┘                    │
└──────────────────────────────┼───────────────────────────────┘
                               │
                ┌──────────────▼──────────────┐
                │   Solana RPC Endpoint       │
                └──────────────┬──────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                    Solana Blockchain                          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         AsterLaunch Program (Smart Contract)           │  │
│  │                                                         │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  Platform   │  │ Token State  │  │Bonding Curve │  │  │
│  │  │   Config    │  │   Accounts   │  │   Accounts   │  │  │
│  │  └─────────────┘  └──────────────┘  └──────────────┘  │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │            Instruction Processor                 │  │  │
│  │  │  • InitializePlatform                           │  │  │
│  │  │  • CreateToken                                  │  │  │
│  │  │  • BuyTokens                                    │  │  │
│  │  │  • SellTokens                                   │  │  │
│  │  │  • GraduateToDEX                                │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              External Programs                          │  │
│  │  • SPL Token Program                                   │  │
│  │  • System Program                                      │  │
│  │  • Raydium Program (for DEX graduation)                │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## 🎯 Component Architecture

### Frontend Layer

#### 1. **Page Components** (`/app`)

```typescript
├── page.tsx (Dashboard)
│   ├── TokenCard components
│   ├── Real-time price updates (5s interval)
│   └── Sorting & filtering logic
│
├── create/page.tsx (Token Creation)
│   ├── Form validation
│   ├── Image upload handler
│   └── Transaction builder
│
├── coin/[ticker]/page.tsx (Trading View)
│   ├── Bonding curve chart (Recharts)
│   ├── Buy/Sell form
│   ├── Trade history
│   └── Graduation progress
│
└── portfolio/page.tsx (User Portfolio)
    ├── Wallet connection check
    ├── Holdings display
    └── Performance metrics
```

#### 2. **Shared Components** (`/components`)

```typescript
├── Sidebar.tsx
│   ├── Navigation links
│   ├── Wallet connection button
│   └── Platform statistics
│
├── TokenCard.tsx
│   ├── Token metadata display
│   ├── Market cap & price
│   └── Graduation progress bar
│
└── WalletProvider.tsx
    ├── Solana wallet adapter setup
    ├── Network configuration
    └── Wallet state management
```

#### 3. **Data Layer** (`/lib`)

```typescript
├── mockData.ts
│   ├── Sample token data
│   ├── Price history generator
│   └── Trade simulation
│
└── solana.ts (future)
    ├── Program interaction
    ├── Transaction builders
    └── Account fetching
```

### Smart Contract Layer

#### 1. **State Management** (`state.rs`)

```rust
┌─────────────────────────────────────────────────────────────┐
│                    PlatformConfig                            │
│  • authority: Pubkey                                        │
│  • treasury: Pubkey                                         │
│  • trading_fee_bps: 100 (1%)                                │
│  • creation_fee: 0.02 SOL                                   │
│  • graduation_threshold: $69,000                            │
│  • Statistics (total tokens, volume)                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      TokenState                              │
│  • mint: Pubkey (SPL Token Mint)                            │
│  • creator: Pubkey                                          │
│  • bonding_curve: Pubkey                                    │
│  • Metadata (name, ticker, description, URI)                │
│  • Supply information                                       │
│  • Graduation status                                        │
│  • Timestamps (created_at, graduated_at)                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   BondingCurveState                          │
│  • token_mint: Pubkey                                       │
│  • token_reserve: Pubkey (holds unsold tokens)              │
│  • sol_reserve: Pubkey (holds collected SOL)                │
│  • Curve parameters (initial_price, increment)              │
│  • Supply tracking (total, sold)                            │
│  • Liquidity tracking (sol_collected, liquidity_sol)        │
│  • Market cap (in USD with 6 decimals)                      │
│  • Status flags (is_active, has_graduated)                  │
└─────────────────────────────────────────────────────────────┘
```

#### 2. **Instruction Processing** (`processor.rs`)

```rust
┌─────────────────────────────────────────────────────────────┐
│                  process_instruction()                       │
└───────────┬─────────────────────────────────────────────────┘
            │
            ├─► InitializePlatform
            │   └─► Creates PlatformConfig account
            │
            ├─► CreateToken
            │   ├─► Validates metadata
            │   ├─► Creates TokenState account
            │   ├─► Creates BondingCurveState
            │   ├─► Initializes token mint
            │   └─► Charges creation fee
            │
            ├─► BuyTokens
            │   ├─► Validates trade amount
            │   ├─► Calculates price from curve
            │   ├─► Checks slippage protection
            │   ├─► Transfers SOL from buyer
            │   ├─► Mints tokens to buyer
            │   ├─► Splits fees (liquidity + platform)
            │   └─► Updates curve state
            │
            ├─► SellTokens
            │   ├─► Validates trade amount
            │   ├─► Calculates sell price
            │   ├─► Checks slippage protection
            │   ├─► Burns tokens from seller
            │   ├─► Transfers SOL to seller
            │   ├─► Deducts fees
            │   └─► Updates curve state
            │
            └─► GraduateToDEX
                ├─► Checks graduation threshold ($69K)
                ├─► Calculates liquidity amounts
                ├─► Creates Raydium pool
                ├─► Adds liquidity (tokens + SOL)
                ├─► Burns LP tokens (permanent lock)
                └─► Marks as graduated
```

#### 3. **Bonding Curve Logic** (`bonding_curve.rs`)

```rust
┌─────────────────────────────────────────────────────────────┐
│                Linear Bonding Curve                          │
│                                                              │
│  Formula: P(n) = P₀ + n·Δp                                  │
│                                                              │
│  where:                                                      │
│    P(n) = price at n tokens sold                            │
│    P₀   = initial price (e.g., 0.0001 SOL)                 │
│    Δp   = price increment (e.g., 0.00000001 SOL)           │
│    n    = number of tokens sold                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Price                                                   │ │
│  │   │                                                  ╱  │ │
│  │   │                                              ╱      │ │
│  │   │                                          ╱          │ │
│  │   │                                      ╱              │ │
│  │   │                                  ╱                  │ │
│  │   │                              ╱                      │ │
│  │   │                          ╱                          │ │
│  │   │                      ╱                              │ │
│  │   │                  ╱                                  │ │
│  │   │              ╱                                      │ │
│  │   │          ╱                                          │ │
│  │   │      ╱                                              │ │
│  │   │  ╱                                                  │ │
│  │   └──────────────────────────────────────────────────► │ │
│  │                    Tokens Sold                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Total Cost = ∫[0 to n] P(x) dx                             │
│             = n · (P(0) + P(n)) / 2                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. Token Creation Flow

```
User Action (Frontend)
    │
    ├─► Fill form (name, ticker, description, image)
    │
    ├─► Upload image to IPFS/Arweave
    │
    ├─► Build CreateToken instruction
    │       ├─► Accounts: creator, platform_config, token_state,
    │       │             token_mint, bonding_curve_state, etc.
    │       └─► Data: name, ticker, description, metadata_uri, supply
    │
    ├─► Sign transaction with wallet
    │
    └─► Send to Solana RPC
            │
            ▼
    Program Execution (Smart Contract)
            │
            ├─► Validate signer
            ├─► Check creation fee payment
            ├─► Validate metadata (length, chars)
            ├─► Create token mint
            ├─► Initialize TokenState account
            ├─► Initialize BondingCurveState account
            ├─► Mint initial supply to curve
            ├─► Transfer fee to treasury
            └─► Emit creation event
                    │
                    ▼
    Transaction Confirmed
            │
            └─► Frontend updates UI
                └─► New token appears in list
```

### 2. Buy/Sell Flow

```
Buy Request (Frontend)
    │
    ├─► User inputs token amount
    │
    ├─► Calculate estimated cost
    │       └─► call calculate_buy_price()
    │
    ├─► Set max slippage (default 1%)
    │
    ├─► Build BuyTokens instruction
    │
    └─► Sign & send
            │
            ▼
    Program Execution
            │
            ├─► Fetch BondingCurveState
            ├─► Calculate exact price
            │       price = calculate_buy_price(amount)
            ├─► Check slippage
            │       if price > max_sol_amount: FAIL
            ├─► Calculate fees
            │       total_fee = price * 1%
            │       liquidity_fee = total_fee * 50%
            │       platform_fee = total_fee * 50%
            ├─► Transfer SOL from buyer
            │       ├─► net_amount → bonding curve
            │       ├─► liquidity_fee → liquidity pool
            │       └─► platform_fee → treasury
            ├─► Transfer tokens to buyer
            ├─► Update curve state
            │       ├─► tokens_sold += amount
            │       ├─► sol_collected += net_amount
            │       └─► liquidity_sol += liquidity_fee
            ├─► Check graduation threshold
            │       if market_cap >= $69K:
            │           trigger GraduateToDEX
            └─► Emit trade event
                    │
                    ▼
    Transaction Confirmed
            │
            └─► Frontend updates
                ├─► Update price
                ├─► Update user balance
                └─► Update graduation progress
```

### 3. Graduation Flow

```
Graduation Trigger
    │
    ├─► Market cap reaches $69,000
    │
    ├─► Any user can call GraduateToDEX (permissionless)
    │
    └─► Program checks threshold
            │
            ▼
    Graduation Process
            │
            ├─► Verify market cap >= $69,000
            ├─► Calculate liquidity amounts
            │       token_liquidity = remaining_tokens
            │       sol_liquidity = liquidity_sol
            ├─► Create Raydium pool
            │       ├─► Initialize pool account
            │       └─► Set pool parameters
            ├─► Add liquidity
            │       ├─► Transfer tokens to pool
            │       └─► Transfer SOL to pool
            ├─► Receive LP tokens
            ├─► Burn LP tokens (permanent lock)
            │       └─► Transfer to 0x000...000
            ├─► Update states
            │       ├─► bonding_curve.has_graduated = true
            │       ├─► bonding_curve.is_active = false
            │       └─► token_state.is_graduated = true
            └─► Emit graduation event
                    │
                    ▼
    Graduation Complete
            │
            └─► Token now tradable on Raydium
                └─► Liquidity permanently locked
```

## 🔐 Security Architecture

### 1. Access Control

```rust
┌─────────────────────────────────────────────────────────┐
│                   Permission Levels                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Platform Authority (Admin)                             │
│    ├─► Can initialize platform                          │
│    ├─► Can update fee structure                         │
│    └─► Can update treasury address                      │
│                                                          │
│  Token Creator                                          │
│    ├─► Can create tokens                                │
│    └─► Pays creation fee                                │
│                                                          │
│  Any User (Permissionless)                              │
│    ├─► Can buy tokens                                   │
│    ├─► Can sell tokens                                  │
│    └─► Can trigger graduation (if threshold met)        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2. Validation Layers

```rust
┌─────────────────────────────────────────────────────────┐
│              Input Validation Pipeline                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Signer Verification                                 │
│     └─► Ensure transaction is signed by required account│
│                                                          │
│  2. Account Ownership                                   │
│     └─► Verify accounts are owned by correct programs   │
│                                                          │
│  3. Data Validation                                     │
│     ├─► Check string lengths                            │
│     ├─► Validate numeric ranges                         │
│     └─► Ensure non-zero values where required           │
│                                                          │
│  4. State Validation                                    │
│     ├─► Check initialization flags                      │
│     ├─► Verify graduation status                        │
│     └─► Confirm active/inactive states                  │
│                                                          │
│  5. Math Safety                                         │
│     ├─► Use checked_* operations                        │
│     ├─► Prevent overflow/underflow                      │
│     └─► Handle division by zero                         │
│                                                          │
│  6. Economic Validation                                 │
│     ├─► Verify sufficient balances                      │
│     ├─► Check slippage limits                           │
│     └─► Validate fee calculations                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 3. Fund Safety

```
┌─────────────────────────────────────────────────────────┐
│                  Fund Flow Security                      │
└─────────────────────────────────────────────────────────┘

Platform Treasury
    │
    ├─► Receives creation fees (0.02 SOL per token)
    ├─► Receives 0.5% of all trading volume
    └─► Controlled by platform authority multisig

Bonding Curve Reserve (SOL)
    │
    ├─► Holds trading liquidity
    ├─► 50% of buy amounts
    ├─► Pays out on sells
    └─► PDA owned by program (no one can withdraw)

Bonding Curve Reserve (Tokens)
    │
    ├─► Holds unsold tokens
    ├─► Transfers to buyers
    ├─► Receives from sellers (burn)
    └─► PDA owned by program

Liquidity Pool (Post-Graduation)
    │
    ├─► All remaining tokens
    ├─► Accumulated liquidity SOL
    ├─► LP tokens burned = permanent lock
    └─► Only accessible via Raydium trades
```

## 📈 Scalability Considerations

### 1. Frontend Caching Strategy

```typescript
┌─────────────────────────────────────────────────────────┐
│                   Caching Layers                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Browser Cache (60s)                                    │
│    └─► Token metadata (name, ticker, image)             │
│                                                          │
│  SWR Cache (5s refresh)                                 │
│    ├─► Token prices                                     │
│    ├─► Market caps                                      │
│    └─► Trading volumes                                  │
│                                                          │
│  CDN Cache (5min)                                       │
│    ├─► Token images                                     │
│    ├─► Static assets                                    │
│    └─► Chart data                                       │
│                                                          │
│  Redis Cache (server-side, 30s)                         │
│    ├─► Aggregated statistics                            │
│    ├─► Leaderboards                                     │
│    └─► Token listings                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2. RPC Optimization

```typescript
// Batch requests to reduce RPC calls
const connection = new Connection(rpcUrl, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
});

// Use multiple endpoints with fallback
const endpoints = [
  primaryRPC,
  secondaryRPC,
  tertiaryRPC,
];

// Implement exponential backoff on failures
async function fetchWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

### 3. Program Optimization

```rust
// Use compact data structures
#[derive(BorshSerialize, BorshDeserialize)]
#[repr(packed)]
pub struct CompactTokenState {
    // Use smallest possible types
    pub is_graduated: bool,  // 1 byte instead of enum
    pub tokens_sold: u64,    // 8 bytes
    // Avoid large strings, use fixed arrays
}

// Minimize compute units
// - Reduce account iterations
// - Use efficient algorithms
// - Minimize CPI calls
```

---

## 🎓 Design Patterns Used

1. **Program Derived Addresses (PDAs)**: For deterministic account addresses
2. **Rent Exemption**: All accounts are rent-exempt for permanence
3. **Checked Math**: Prevent overflow/underflow vulnerabilities
4. **State Machine**: Clear state transitions (active → graduated)
5. **Fee-on-Transfer**: Automatic fee collection on trades
6. **Permanent Locks**: LP token burning for trust

---

This architecture ensures **security**, **scalability**, and **user experience** for a production-ready meme coin launchpad on Solana.