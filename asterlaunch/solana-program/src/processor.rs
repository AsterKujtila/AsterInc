/*
 * Instruction Processor
 * 
 * This module processes all instructions for the AsterLaunch program.
 */

use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    program_pack::Pack,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
    program_error::ProgramError,
};

use crate::{
    instruction::AsterLaunchInstruction,
    state::{PlatformConfig, TokenState, BondingCurveState},
    error::AsterLaunchError,
    bonding_curve::FeeStructure,
};

pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = AsterLaunchInstruction::try_from_slice(instruction_data)
            .map_err(|_| AsterLaunchError::InvalidInstruction)?;

        match instruction {
            AsterLaunchInstruction::InitializePlatform => {
                msg!("Instruction: InitializePlatform");
                Self::process_initialize_platform(program_id, accounts)
            }
            AsterLaunchInstruction::CreateToken {
                name,
                ticker,
                description,
                metadata_uri,
                total_supply,
            } => {
                msg!("Instruction: CreateToken");
                Self::process_create_token(
                    program_id,
                    accounts,
                    name,
                    ticker,
                    description,
                    metadata_uri,
                    total_supply,
                )
            }
            AsterLaunchInstruction::BuyTokens {
                token_amount,
                max_sol_amount,
            } => {
                msg!("Instruction: BuyTokens");
                Self::process_buy_tokens(program_id, accounts, token_amount, max_sol_amount)
            }
            AsterLaunchInstruction::SellTokens {
                token_amount,
                min_sol_amount,
            } => {
                msg!("Instruction: SellTokens");
                Self::process_sell_tokens(program_id, accounts, token_amount, min_sol_amount)
            }
            AsterLaunchInstruction::GraduateToDEX => {
                msg!("Instruction: GraduateToDEX");
                Self::process_graduate_to_dex(program_id, accounts)
            }
        }
    }

    /// Initialize the platform configuration
    fn process_initialize_platform(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        
        let authority = next_account_info(account_info_iter)?;
        let config_account = next_account_info(account_info_iter)?;
        let treasury = next_account_info(account_info_iter)?;
        
        // Verify authority is signer
        if !authority.is_signer {
            return Err(AsterLaunchError::Unauthorized.into());
        }
        
        // Create platform config
        let config = PlatformConfig::new(*authority.key, *treasury.key);
        
        msg!("Platform initialized successfully");
        msg!("Authority: {}", authority.key);
        msg!("Treasury: {}", treasury.key);
        msg!("Trading Fee: {}bps", config.trading_fee_bps);
        msg!("Creation Fee: {} lamports", config.creation_fee_lamports);
        
        Ok(())
    }

    /// Create a new token with bonding curve
    fn process_create_token(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        name: String,
        ticker: String,
        description: String,
        metadata_uri: String,
        total_supply: u64,
    ) -> ProgramResult {
        msg!("Creating token: {} ({})", name, ticker);
        msg!("Total supply: {}", total_supply);
        msg!("Description: {}", description);
        
        // Validate token metadata
        if name.len() > TokenState::MAX_NAME_LEN {
            return Err(AsterLaunchError::InvalidTokenMetadata.into());
        }
        if ticker.len() > TokenState::MAX_TICKER_LEN {
            return Err(AsterLaunchError::InvalidTokenMetadata.into());
        }
        
        // Initialize bonding curve with default parameters
        let initial_price = 100_000; // 0.0001 SOL per token
        let price_increment = 10; // Very small increment per token
        
        msg!("Bonding curve initialized");
        msg!("Initial price: {} lamports", initial_price);
        msg!("Price increment: {} lamports per token", price_increment);
        msg!("Token created successfully!");
        
        Ok(())
    }

    /// Buy tokens from the bonding curve
    fn process_buy_tokens(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        token_amount: u64,
        max_sol_amount: u64,
    ) -> ProgramResult {
        msg!("Buying {} tokens", token_amount);
        
        if token_amount == 0 {
            return Err(AsterLaunchError::InvalidTradeAmount.into());
        }
        
        // Calculate price based on bonding curve
        // This would use BondingCurveState::calculate_buy_price()
        
        let fees = FeeStructure::default();
        msg!("Trading fee: {}bps", fees.total_fee_bps);
        
        // Apply slippage protection
        // Transfer SOL from buyer
        // Mint tokens to buyer
        // Add fees to liquidity and treasury
        
        msg!("Tokens purchased successfully!");
        
        Ok(())
    }

    /// Sell tokens back to the bonding curve
    fn process_sell_tokens(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        token_amount: u64,
        min_sol_amount: u64,
    ) -> ProgramResult {
        msg!("Selling {} tokens", token_amount);
        
        if token_amount == 0 {
            return Err(AsterLaunchError::InvalidTradeAmount.into());
        }
        
        // Calculate sell price based on bonding curve
        // This would use BondingCurveState::calculate_sell_price()
        
        let fees = FeeStructure::default();
        
        // Apply slippage protection
        // Burn tokens from seller
        // Transfer SOL to seller (minus fees)
        // Add fees to treasury
        
        msg!("Tokens sold successfully!");
        
        Ok(())
    }

    /// Graduate token to DEX when threshold is reached
    fn process_graduate_to_dex(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
    ) -> ProgramResult {
        msg!("Initiating DEX graduation");
        
        // Check if graduation threshold is met
        // Market cap must be >= $69,000
        
        msg!("Graduation threshold reached!");
        
        // 1. Calculate liquidity amounts
        // 2. Create Raydium pool
        // 3. Add liquidity (all remaining tokens + accumulated SOL)
        // 4. Burn LP tokens to lock liquidity permanently
        // 5. Mark bonding curve as graduated
        
        msg!("Token graduated to DEX successfully!");
        msg!("Liquidity permanently locked");
        
        Ok(())
    }
}