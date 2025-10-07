/*
 * Bonding Curve Implementation
 * 
 * This module implements the core bonding curve mechanics for AsterLaunch.
 * 
 * BONDING CURVE FORMULA:
 * =====================
 * We use a linear bonding curve where the price increases linearly with supply.
 * 
 * price(n) = initial_price + (n * price_increment)
 * 
 * Where:
 * - n = number of tokens sold
 * - initial_price = starting price per token
 * - price_increment = how much price increases per token sold
 * 
 * EXAMPLE:
 * --------
 * If initial_price = 0.0001 SOL and price_increment = 0.00000001 SOL:
 * - 1st token costs: 0.0001 SOL
 * - 100th token costs: 0.0001 + (100 * 0.00000001) = 0.0001001 SOL
 * - 1,000,000th token costs: 0.0001 + (1,000,000 * 0.00000001) = 0.0101 SOL
 * 
 * LIQUIDITY MECHANICS:
 * ====================
 * - 50% of all SOL paid goes to liquidity pool
 * - 49% returns to sellers on sells
 * - 1% platform fee (0.5% to liquidity, 0.5% to treasury)
 * 
 * GRADUATION TO DEX:
 * ==================
 * When market cap reaches $69,000:
 * 1. All remaining tokens are paired with liquidity SOL
 * 2. Liquidity is deposited to Raydium
 * 3. LP tokens are burned (permanent lock)
 * 4. Bonding curve is disabled
 */

use crate::error::AsterLaunchError;

/// Fee structure for trades
pub struct FeeStructure {
    /// Total fee in basis points (100 = 1%)
    pub total_fee_bps: u16,
    
    /// Portion of fee that goes to liquidity (basis points)
    pub liquidity_fee_bps: u16,
    
    /// Portion of fee that goes to platform treasury (basis points)
    pub platform_fee_bps: u16,
}

impl FeeStructure {
    /// Default fee structure: 1% total (0.5% liquidity, 0.5% platform)
    pub fn default() -> Self {
        Self {
            total_fee_bps: 100,      // 1%
            liquidity_fee_bps: 50,   // 0.5%
            platform_fee_bps: 50,    // 0.5%
        }
    }
    
    /// Calculate fee amounts from a SOL amount
    pub fn calculate_fees(&self, sol_amount: u64) -> Result<(u64, u64, u64), AsterLaunchError> {
        let total_fee = sol_amount
            .checked_mul(self.total_fee_bps as u64)
            .ok_or(AsterLaunchError::MathOverflow)?
            .checked_div(10000)
            .ok_or(AsterLaunchError::MathOverflow)?;
        
        let liquidity_fee = total_fee
            .checked_mul(self.liquidity_fee_bps as u64)
            .ok_or(AsterLaunchError::MathOverflow)?
            .checked_div(self.total_fee_bps as u64)
            .ok_or(AsterLaunchError::MathOverflow)?;
        
        let platform_fee = total_fee
            .checked_sub(liquidity_fee)
            .ok_or(AsterLaunchError::MathOverflow)?;
        
        let net_amount = sol_amount
            .checked_sub(total_fee)
            .ok_or(AsterLaunchError::MathOverflow)?;
        
        Ok((net_amount, liquidity_fee, platform_fee))
    }
}

/// Calculate the market cap based on current price and total supply
/// 
/// market_cap = current_price * circulating_supply
pub fn calculate_market_cap(
    current_price_lamports: u64,
    circulating_supply: u64,
    sol_price_usd: u64, // SOL price in USD with 6 decimals (e.g., 20_000_000 = $20)
) -> Result<u64, AsterLaunchError> {
    // Price of all tokens in lamports
    let total_value_lamports = current_price_lamports
        .checked_mul(circulating_supply)
        .ok_or(AsterLaunchError::MathOverflow)?;
    
    // Convert lamports to SOL (1 SOL = 1e9 lamports)
    let total_value_sol = total_value_lamports
        .checked_div(1_000_000_000)
        .ok_or(AsterLaunchError::MathOverflow)?;
    
    // Convert SOL value to USD (with 6 decimals precision)
    let market_cap_usd = total_value_sol
        .checked_mul(sol_price_usd)
        .ok_or(AsterLaunchError::MathOverflow)?;
    
    Ok(market_cap_usd)
}

/// Calculate liquidity pool parameters for DEX graduation
/// 
/// Returns: (token_amount, sol_amount)
pub fn calculate_graduation_liquidity(
    tokens_remaining: u64,
    liquidity_sol: u64,
) -> Result<(u64, u64), AsterLaunchError> {
    // All remaining tokens go to liquidity
    let token_liquidity = tokens_remaining;
    
    // All accumulated liquidity SOL goes to the pool
    let sol_liquidity = liquidity_sol;
    
    Ok((token_liquidity, sol_liquidity))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fee_calculation() {
        let fees = FeeStructure::default();
        let (net, liq_fee, plat_fee) = fees.calculate_fees(1_000_000_000).unwrap(); // 1 SOL
        
        assert_eq!(net, 990_000_000); // 0.99 SOL after 1% fee
        assert_eq!(liq_fee, 5_000_000); // 0.005 SOL
        assert_eq!(plat_fee, 5_000_000); // 0.005 SOL
    }

    #[test]
    fn test_market_cap_calculation() {
        let price_per_token = 100_000; // 0.0001 SOL in lamports
        let supply = 1_000_000_000; // 1 billion tokens
        let sol_price = 20_000_000; // $20 per SOL
        
        let market_cap = calculate_market_cap(price_per_token, supply, sol_price).unwrap();
        
        // 1B tokens * 0.0001 SOL = 100,000 SOL
        // 100,000 SOL * $20 = $2,000,000
        assert_eq!(market_cap, 2_000_000_000_000); // $2M with 6 decimals
    }
}