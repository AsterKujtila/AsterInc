use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

/// Global platform configuration
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct PlatformConfig {
    /// Platform authority (admin)
    pub authority: Pubkey,
    
    /// Platform treasury for collecting fees
    pub treasury: Pubkey,
    
    /// Trading fee in basis points (100 = 1%)
    pub trading_fee_bps: u16,
    
    /// Creation fee in lamports
    pub creation_fee_lamports: u64,
    
    /// Graduation threshold in USD (multiplied by 1e6 for precision)
    pub graduation_threshold_usd: u64,
    
    /// Total tokens created on platform
    pub total_tokens_created: u64,
    
    /// Total volume traded (in lamports)
    pub total_volume: u64,
    
    /// Is initialized
    pub is_initialized: bool,
}

impl PlatformConfig {
    pub const LEN: usize = 32 + 32 + 2 + 8 + 8 + 8 + 8 + 1;
    
    /// Default platform configuration
    pub fn new(authority: Pubkey, treasury: Pubkey) -> Self {
        Self {
            authority,
            treasury,
            trading_fee_bps: 100, // 1% total fee
            creation_fee_lamports: 20_000_000, // 0.02 SOL
            graduation_threshold_usd: 69_000_000_000, // $69,000 (with 6 decimals)
            total_tokens_created: 0,
            total_volume: 0,
            is_initialized: true,
        }
    }
}

/// Token metadata and state
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct TokenState {
    /// Token mint address
    pub mint: Pubkey,
    
    /// Token creator
    pub creator: Pubkey,
    
    /// Bonding curve account
    pub bonding_curve: Pubkey,
    
    /// Token name
    pub name: String,
    
    /// Token ticker/symbol
    pub ticker: String,
    
    /// Token description
    pub description: String,
    
    /// Token metadata URI (image, etc.)
    pub metadata_uri: String,
    
    /// Total supply (usually 1 billion)
    pub total_supply: u64,
    
    /// Current circulating supply
    pub circulating_supply: u64,
    
    /// Has graduated to DEX
    pub is_graduated: bool,
    
    /// Creation timestamp
    pub created_at: i64,
    
    /// Graduation timestamp (0 if not graduated)
    pub graduated_at: i64,
}

impl TokenState {
    pub const MAX_NAME_LEN: usize = 32;
    pub const MAX_TICKER_LEN: usize = 10;
    pub const MAX_DESCRIPTION_LEN: usize = 200;
    pub const MAX_URI_LEN: usize = 200;
    
    pub const LEN: usize = 32 + 32 + 32 + 
        (4 + Self::MAX_NAME_LEN) + 
        (4 + Self::MAX_TICKER_LEN) + 
        (4 + Self::MAX_DESCRIPTION_LEN) + 
        (4 + Self::MAX_URI_LEN) + 
        8 + 8 + 1 + 8 + 8;
}

/// Bonding curve state
/// Implements a linear bonding curve with the formula:
/// price = initial_price + (tokens_sold * price_increment)
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct BondingCurveState {
    /// Associated token mint
    pub token_mint: Pubkey,
    
    /// Curve's token account (holds unsold tokens)
    pub token_reserve: Pubkey,
    
    /// Curve's SOL reserve account
    pub sol_reserve: Pubkey,
    
    /// Initial price per token (in lamports)
    pub initial_price: u64,
    
    /// Price increment per token sold (in lamports)
    pub price_increment: u64,
    
    /// Total tokens available for sale
    pub total_supply: u64,
    
    /// Tokens sold so far
    pub tokens_sold: u64,
    
    /// Total SOL collected
    pub sol_collected: u64,
    
    /// Total SOL for liquidity (50% of collected)
    pub liquidity_sol: u64,
    
    /// Current market cap in USD (with 6 decimals)
    pub market_cap_usd: u64,
    
    /// Is curve active
    pub is_active: bool,
    
    /// Has graduated
    pub has_graduated: bool,
}

impl BondingCurveState {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 1 + 1;
    
    /// Calculate buy price for a given amount of tokens
    /// Uses the integral of the linear bonding curve
    pub fn calculate_buy_price(&self, token_amount: u64) -> Result<u64, crate::error::AsterLaunchError> {
        // Price = sum from i=tokens_sold to tokens_sold+token_amount of (initial_price + i * price_increment)
        // This is: token_amount * initial_price + price_increment * (sum of i from tokens_sold to tokens_sold+token_amount)
        // Sum of arithmetic sequence: n * (first + last) / 2
        
        let tokens_sold = self.tokens_sold;
        let first_price = self.initial_price
            .checked_add(tokens_sold.checked_mul(self.price_increment)
                .ok_or(crate::error::AsterLaunchError::MathOverflow)?)
            .ok_or(crate::error::AsterLaunchError::MathOverflow)?;
        
        let last_price = self.initial_price
            .checked_add((tokens_sold + token_amount - 1).checked_mul(self.price_increment)
                .ok_or(crate::error::AsterLaunchError::MathOverflow)?)
            .ok_or(crate::error::AsterLaunchError::MathOverflow)?;
        
        let avg_price = (first_price.checked_add(last_price)
            .ok_or(crate::error::AsterLaunchError::MathOverflow)?)
            .checked_div(2)
            .ok_or(crate::error::AsterLaunchError::MathOverflow)?;
        
        let total_cost = avg_price.checked_mul(token_amount)
            .ok_or(crate::error::AsterLaunchError::MathOverflow)?;
        
        Ok(total_cost)
    }
    
    /// Calculate sell price for a given amount of tokens
    /// Slightly lower than buy price due to fees
    pub fn calculate_sell_price(&self, token_amount: u64) -> Result<u64, crate::error::AsterLaunchError> {
        if token_amount > self.tokens_sold {
            return Err(crate::error::AsterLaunchError::InvalidTradeAmount);
        }
        
        let new_tokens_sold = self.tokens_sold.checked_sub(token_amount)
            .ok_or(crate::error::AsterLaunchError::MathOverflow)?;
        
        let first_price = self.initial_price
            .checked_add(new_tokens_sold.checked_mul(self.price_increment)
                .ok_or(crate::error::AsterLaunchError::MathOverflow)?)
            .ok_or(crate::error::AsterLaunchError::MathOverflow)?;
        
        let last_price = self.initial_price
            .checked_add((self.tokens_sold - 1).checked_mul(self.price_increment)
                .ok_or(crate::error::AsterLaunchError::MathOverflow)?)
            .ok_or(crate::error::AsterLaunchError::MathOverflow)?;
        
        let avg_price = (first_price.checked_add(last_price)
            .ok_or(crate::error::AsterLaunchError::MathOverflow)?)
            .checked_div(2)
            .ok_or(crate::error::AsterLaunchError::MathOverflow)?;
        
        let total_return = avg_price.checked_mul(token_amount)
            .ok_or(crate::error::AsterLaunchError::MathOverflow)?;
        
        Ok(total_return)
    }
    
    /// Check if token has reached graduation threshold
    pub fn check_graduation(&self, graduation_threshold: u64) -> bool {
        self.market_cap_usd >= graduation_threshold && !self.has_graduated
    }
}