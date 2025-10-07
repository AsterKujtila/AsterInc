use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum AsterLaunchInstruction {
    /// Initialize the platform
    /// 
    /// Accounts expected:
    /// 0. `[signer]` Platform authority
    /// 1. `[writable]` Platform config account
    /// 2. `[]` Treasury account
    /// 3. `[]` System program
    /// 4. `[]` Rent sysvar
    InitializePlatform,

    /// Create a new token with bonding curve
    /// 
    /// Accounts expected:
    /// 0. `[signer]` Token creator
    /// 1. `[writable]` Platform config account
    /// 2. `[writable]` Token state account
    /// 3. `[writable]` Token mint
    /// 4. `[writable]` Bonding curve state account
    /// 5. `[writable]` Bonding curve token account
    /// 6. `[writable]` Bonding curve SOL account
    /// 7. `[writable]` Creator's account (pays creation fee)
    /// 8. `[writable]` Platform treasury
    /// 9. `[]` Token program
    /// 10. `[]` System program
    /// 11. `[]` Rent sysvar
    CreateToken {
        name: String,
        ticker: String,
        description: String,
        metadata_uri: String,
        total_supply: u64,
    },

    /// Buy tokens from bonding curve
    /// 
    /// Accounts expected:
    /// 0. `[signer]` Buyer
    /// 1. `[writable]` Token state account
    /// 2. `[writable]` Bonding curve state account
    /// 3. `[writable]` Bonding curve token account
    /// 4. `[writable]` Bonding curve SOL account
    /// 5. `[writable]` Buyer's token account
    /// 6. `[writable]` Buyer's SOL account
    /// 7. `[writable]` Platform treasury (receives fees)
    /// 8. `[writable]` Platform config
    /// 9. `[]` Token mint
    /// 10. `[]` Token program
    /// 11. `[]` System program
    BuyTokens {
        /// Amount of tokens to buy
        token_amount: u64,
        /// Maximum SOL willing to pay (slippage protection)
        max_sol_amount: u64,
    },

    /// Sell tokens back to bonding curve
    /// 
    /// Accounts expected:
    /// 0. `[signer]` Seller
    /// 1. `[writable]` Token state account
    /// 2. `[writable]` Bonding curve state account
    /// 3. `[writable]` Bonding curve token account
    /// 4. `[writable]` Bonding curve SOL account
    /// 5. `[writable]` Seller's token account
    /// 6. `[writable]` Seller's SOL account
    /// 7. `[writable]` Platform treasury (receives fees)
    /// 8. `[writable]` Platform config
    /// 9. `[]` Token mint
    /// 10. `[]` Token program
    /// 11. `[]` System program
    SellTokens {
        /// Amount of tokens to sell
        token_amount: u64,
        /// Minimum SOL expected to receive (slippage protection)
        min_sol_amount: u64,
    },

    /// Graduate token to DEX (Raydium)
    /// Called automatically when market cap reaches $69K
    /// 
    /// Accounts expected:
    /// 0. `[signer]` Any user (permissionless)
    /// 1. `[writable]` Token state account
    /// 2. `[writable]` Bonding curve state account
    /// 3. `[writable]` Bonding curve token account
    /// 4. `[writable]` Bonding curve SOL account
    /// 5. `[]` Platform config
    /// 6. `[]` Token mint
    /// 7. `[writable]` Raydium pool account (to be created)
    /// 8. `[writable]` LP token mint
    /// 9. `[]` Raydium program
    /// 10. `[]` Token program
    /// 11. `[]` System program
    GraduateToDEX,
}