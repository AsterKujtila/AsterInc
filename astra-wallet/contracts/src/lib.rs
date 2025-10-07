use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};
use spl_token::{
    instruction::{initialize_mint, mint_to, transfer},
    state::{Account, Mint},
};
use borsh::{BorshDeserialize, BorshSerialize};
use std::mem;

// Program entrypoint
entrypoint!(process_instruction);

/// Program ID for the AsterLaunch program
pub const PROGRAM_ID: &str = "AsterLaunch1111111111111111111111111111111111";

/// Constants
pub const GRADUATION_MARKET_CAP: u64 = 69_000_000_000; // $69,000 in micro-SOL (6 decimals)
pub const TRADING_FEE_BPS: u16 = 100; // 1% (100 basis points)
pub const LIQUIDITY_FEE_BPS: u16 = 50; // 0.5% to liquidity
pub const PLATFORM_FEE_BPS: u16 = 50; // 0.5% to platform
pub const LAUNCH_FEE_SOL: u64 = 100_000_000; // 0.1 SOL in lamports

/// Bonding curve state
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct BondingCurve {
    /// Token mint address
    pub token_mint: Pubkey,
    /// SOL reserve
    pub sol_reserve: u64,
    /// Token reserve
    pub token_reserve: u64,
    /// Total supply
    pub total_supply: u64,
    /// Graduation status
    pub is_graduated: bool,
    /// Creator address
    pub creator: Pubkey,
    /// Platform treasury
    pub platform_treasury: Pubkey,
}

impl BondingCurve {
    /// Calculate the current price based on the bonding curve formula
    /// Price = SOL_reserve / Token_reserve
    pub fn get_current_price(&self) -> u64 {
        if self.token_reserve == 0 {
            return 0;
        }
        self.sol_reserve * 1_000_000 / self.token_reserve // 6 decimal precision
    }

    /// Calculate market cap
    pub fn get_market_cap(&self) -> u64 {
        self.get_current_price() * self.total_supply / 1_000_000
    }

    /// Calculate graduation progress (0-100)
    pub fn get_graduation_progress(&self) -> u8 {
        let market_cap = self.get_market_cap();
        if market_cap >= GRADUATION_MARKET_CAP {
            return 100;
        }
        ((market_cap * 100) / GRADUATION_MARKET_CAP) as u8
    }

    /// Calculate tokens to receive for given SOL amount
    pub fn calculate_tokens_out(&self, sol_in: u64) -> u64 {
        if self.token_reserve == 0 || self.sol_reserve == 0 {
            return 0;
        }
        
        // Apply trading fee
        let sol_after_fee = sol_in * (10000 - TRADING_FEE_BPS) / 10000;
        
        // Constant product formula: x * y = k
        // New token reserve = (sol_reserve * token_reserve) / (sol_reserve + sol_after_fee)
        let new_sol_reserve = self.sol_reserve + sol_after_fee;
        let new_token_reserve = (self.sol_reserve * self.token_reserve) / new_sol_reserve;
        
        self.token_reserve - new_token_reserve
    }

    /// Calculate SOL to receive for given token amount
    pub fn calculate_sol_out(&self, tokens_in: u64) -> u64 {
        if self.token_reserve == 0 || self.sol_reserve == 0 {
            return 0;
        }
        
        // Constant product formula: x * y = k
        // New SOL reserve = (sol_reserve * token_reserve) / (token_reserve + tokens_in)
        let new_token_reserve = self.token_reserve + tokens_in;
        let new_sol_reserve = (self.sol_reserve * self.token_reserve) / new_token_reserve;
        
        let sol_out = self.sol_reserve - new_sol_reserve;
        
        // Apply trading fee
        sol_out * (10000 - TRADING_FEE_BPS) / 10000
    }

    /// Update reserves after a trade
    pub fn update_reserves(&mut self, sol_delta: i64, token_delta: i64) {
        if sol_delta > 0 {
            self.sol_reserve += sol_delta as u64;
        } else {
            self.sol_reserve -= (-sol_delta) as u64;
        }
        
        if token_delta > 0 {
            self.token_reserve += token_delta as u64;
        } else {
            self.token_reserve -= (-token_delta) as u64;
        }
    }
}

/// Instruction data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum AsterLaunchInstruction {
    /// Initialize a new bonding curve
    /// Accounts:
    /// 0. [signer] Creator
    /// 1. [writable] Bonding curve account
    /// 2. [writable] Token mint
    /// 3. [writable] Creator token account
    /// 4. [] System program
    /// 5. [] Token program
    /// 6. [] Rent sysvar
    InitializeBondingCurve {
        token_name: String,
        token_symbol: String,
        token_uri: String,
        total_supply: u64,
    },
    
    /// Buy tokens with SOL
    /// Accounts:
    /// 0. [signer] Buyer
    /// 1. [writable] Bonding curve account
    /// 2. [writable] Buyer token account
    /// 3. [writable] Platform treasury
    /// 4. [] System program
    /// 5. [] Token program
    BuyTokens {
        sol_amount: u64,
    },
    
    /// Sell tokens for SOL
    /// Accounts:
    /// 0. [signer] Seller
    /// 1. [writable] Bonding curve account
    /// 2. [writable] Seller token account
    /// 3. [writable] Platform treasury
    /// 4. [] System program
    /// 5. [] Token program
    SellTokens {
        token_amount: u64,
    },
    
    /// Graduate token to external DEX
    /// Accounts:
    /// 0. [signer] Creator
    /// 1. [writable] Bonding curve account
    /// 2. [writable] Token mint
    /// 3. [writable] Liquidity pool
    /// 4. [] System program
    /// 5. [] Token program
    GraduateToken,
}

/// Process instruction
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = AsterLaunchInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        AsterLaunchInstruction::InitializeBondingCurve {
            token_name,
            token_symbol,
            token_uri,
            total_supply,
        } => {
            msg!("Initializing bonding curve for token: {}", token_symbol);
            initialize_bonding_curve(accounts, token_name, token_symbol, token_uri, total_supply)
        }
        
        AsterLaunchInstruction::BuyTokens { sol_amount } => {
            msg!("Buying tokens with {} lamports", sol_amount);
            buy_tokens(accounts, sol_amount)
        }
        
        AsterLaunchInstruction::SellTokens { token_amount } => {
            msg!("Selling {} tokens", token_amount);
            sell_tokens(accounts, token_amount)
        }
        
        AsterLaunchInstruction::GraduateToken => {
            msg!("Graduating token to external DEX");
            graduate_token(accounts)
        }
    }
}

/// Initialize a new bonding curve
fn initialize_bonding_curve(
    accounts: &[AccountInfo],
    token_name: String,
    token_symbol: String,
    token_uri: String,
    total_supply: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    let creator = next_account_info(account_info_iter)?;
    let bonding_curve_account = next_account_info(account_info_iter)?;
    let token_mint = next_account_info(account_info_iter)?;
    let creator_token_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let rent_sysvar = next_account_info(account_info_iter)?;

    // Verify creator is signer
    if !creator.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Calculate rent for bonding curve account
    let rent = Rent::get()?;
    let bonding_curve_size = mem::size_of::<BondingCurve>();
    let rent_lamports = rent.minimum_balance(bonding_curve_size);

    // Create bonding curve account
    solana_program::program::invoke(
        &system_instruction::create_account(
            creator.key,
            bonding_curve_account.key,
            rent_lamports,
            bonding_curve_size as u64,
            &PROGRAM_ID.parse::<Pubkey>().unwrap(),
        ),
        &[
            creator.clone(),
            bonding_curve_account.clone(),
            system_program.clone(),
        ],
    )?;

    // Initialize token mint
    let mint_authority = bonding_curve_account.key;
    let freeze_authority = bonding_curve_account.key;
    
    solana_program::program::invoke(
        &initialize_mint(
            token_program.key,
            token_mint.key,
            &mint_authority,
            Some(&freeze_authority),
            6, // decimals
        )?,
        &[
            token_mint.clone(),
            token_program.clone(),
            rent_sysvar.clone(),
        ],
    )?;

    // Create bonding curve state
    let bonding_curve = BondingCurve {
        token_mint: *token_mint.key,
        sol_reserve: 0,
        token_reserve: total_supply,
        total_supply,
        is_graduated: false,
        creator: *creator.key,
        platform_treasury: *creator.key, // In production, use actual platform treasury
    };

    // Serialize and store bonding curve
    bonding_curve.serialize(&mut &mut bonding_curve_account.data.borrow_mut()[..])?;

    msg!("Bonding curve initialized successfully");
    msg!("Token: {} ({})", token_name, token_symbol);
    msg!("Total supply: {}", total_supply);
    
    Ok(())
}

/// Buy tokens with SOL
fn buy_tokens(accounts: &[AccountInfo], sol_amount: u64) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    let buyer = next_account_info(account_info_iter)?;
    let bonding_curve_account = next_account_info(account_info_iter)?;
    let buyer_token_account = next_account_info(account_info_iter)?;
    let platform_treasury = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;

    // Verify buyer is signer
    if !buyer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Deserialize bonding curve
    let mut bonding_curve = BondingCurve::try_from_slice(&bonding_curve_account.data.borrow())?;
    
    // Check if token is graduated
    if bonding_curve.is_graduated {
        return Err(ProgramError::InvalidAccountData);
    }

    // Calculate tokens to receive
    let tokens_out = bonding_curve.calculate_tokens_out(sol_amount);
    if tokens_out == 0 {
        return Err(ProgramError::InvalidAccountData);
    }

    // Calculate fees
    let trading_fee = sol_amount * TRADING_FEE_BPS as u64 / 10000;
    let liquidity_fee = trading_fee * LIQUIDITY_FEE_BPS as u64 / 10000;
    let platform_fee = trading_fee - liquidity_fee;

    // Transfer SOL to bonding curve
    solana_program::program::invoke(
        &system_instruction::transfer(
            buyer.key,
            bonding_curve_account.key,
            sol_amount - trading_fee,
        ),
        &[
            buyer.clone(),
            bonding_curve_account.clone(),
            system_program.clone(),
        ],
    )?;

    // Transfer platform fee
    if platform_fee > 0 {
        solana_program::program::invoke(
            &system_instruction::transfer(
                buyer.key,
                platform_treasury.key,
                platform_fee,
            ),
            &[
                buyer.clone(),
                platform_treasury.clone(),
                system_program.clone(),
            ],
        )?;
    }

    // Mint tokens to buyer
    solana_program::program::invoke(
        &mint_to(
            token_program.key,
            bonding_curve.token_mint,
            buyer_token_account.key,
            bonding_curve_account.key,
            &[],
            tokens_out,
        )?,
        &[
            bonding_curve_account.clone(),
            buyer_token_account.clone(),
            token_program.clone(),
        ],
    )?;

    // Update bonding curve reserves
    bonding_curve.update_reserves(sol_amount as i64, -(tokens_out as i64));
    
    // Check for graduation
    if bonding_curve.get_market_cap() >= GRADUATION_MARKET_CAP {
        bonding_curve.is_graduated = true;
        msg!("Token graduated! Market cap: {}", bonding_curve.get_market_cap());
    }

    // Save updated bonding curve
    bonding_curve.serialize(&mut &mut bonding_curve_account.data.borrow_mut()[..])?;

    msg!("Bought {} tokens for {} lamports", tokens_out, sol_amount);
    msg!("Current price: {}", bonding_curve.get_current_price());
    msg!("Market cap: {}", bonding_curve.get_market_cap());
    msg!("Graduation progress: {}%", bonding_curve.get_graduation_progress());

    Ok(())
}

/// Sell tokens for SOL
fn sell_tokens(accounts: &[AccountInfo], token_amount: u64) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    let seller = next_account_info(account_info_iter)?;
    let bonding_curve_account = next_account_info(account_info_iter)?;
    let seller_token_account = next_account_info(account_info_iter)?;
    let platform_treasury = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;

    // Verify seller is signer
    if !seller.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Deserialize bonding curve
    let mut bonding_curve = BondingCurve::try_from_slice(&bonding_curve_account.data.borrow())?;
    
    // Check if token is graduated
    if bonding_curve.is_graduated {
        return Err(ProgramError::InvalidAccountData);
    }

    // Calculate SOL to receive
    let sol_out = bonding_curve.calculate_sol_out(token_amount);
    if sol_out == 0 {
        return Err(ProgramError::InvalidAccountData);
    }

    // Calculate fees
    let trading_fee = sol_out * TRADING_FEE_BPS as u64 / 10000;
    let liquidity_fee = trading_fee * LIQUIDITY_FEE_BPS as u64 / 10000;
    let platform_fee = trading_fee - liquidity_fee;

    // Transfer tokens from seller to bonding curve (burn)
    solana_program::program::invoke(
        &transfer(
            token_program.key,
            seller_token_account.key,
            bonding_curve_account.key,
            seller.key,
            &[],
            token_amount,
        )?,
        &[
            seller_token_account.clone(),
            bonding_curve_account.clone(),
            seller.clone(),
            token_program.clone(),
        ],
    )?;

    // Transfer SOL to seller
    solana_program::program::invoke(
        &system_instruction::transfer(
            bonding_curve_account.key,
            seller.key,
            sol_out - trading_fee,
        ),
        &[
            bonding_curve_account.clone(),
            seller.clone(),
            system_program.clone(),
        ],
    )?;

    // Transfer platform fee
    if platform_fee > 0 {
        solana_program::program::invoke(
            &system_instruction::transfer(
                bonding_curve_account.key,
                platform_treasury.key,
                platform_fee,
            ),
            &[
                bonding_curve_account.clone(),
                platform_treasury.clone(),
                system_program.clone(),
            ],
        )?;
    }

    // Update bonding curve reserves
    bonding_curve.update_reserves(-(sol_out as i64), token_amount as i64);

    // Save updated bonding curve
    bonding_curve.serialize(&mut &mut bonding_curve_account.data.borrow_mut()[..])?;

    msg!("Sold {} tokens for {} lamports", token_amount, sol_out);
    msg!("Current price: {}", bonding_curve.get_current_price());
    msg!("Market cap: {}", bonding_curve.get_market_cap());
    msg!("Graduation progress: {}%", bonding_curve.get_graduation_progress());

    Ok(())
}

/// Graduate token to external DEX
fn graduate_token(accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    let creator = next_account_info(account_info_iter)?;
    let bonding_curve_account = next_account_info(account_info_iter)?;
    let token_mint = next_account_info(account_info_iter)?;
    let liquidity_pool = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;

    // Verify creator is signer
    if !creator.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Deserialize bonding curve
    let mut bonding_curve = BondingCurve::try_from_slice(&bonding_curve_account.data.borrow())?;
    
    // Check if already graduated
    if bonding_curve.is_graduated {
        return Err(ProgramError::InvalidAccountData);
    }

    // Check if market cap threshold is reached
    if bonding_curve.get_market_cap() < GRADUATION_MARKET_CAP {
        return Err(ProgramError::InvalidAccountData);
    }

    // Transfer all SOL to liquidity pool
    if bonding_curve.sol_reserve > 0 {
        solana_program::program::invoke(
            &system_instruction::transfer(
                bonding_curve_account.key,
                liquidity_pool.key,
                bonding_curve.sol_reserve,
            ),
            &[
                bonding_curve_account.clone(),
                liquidity_pool.clone(),
                system_program.clone(),
            ],
        )?;
    }

    // Transfer remaining tokens to liquidity pool
    if bonding_curve.token_reserve > 0 {
        solana_program::program::invoke(
            &mint_to(
                token_program.key,
                bonding_curve.token_mint,
                liquidity_pool.key,
                bonding_curve_account.key,
                &[],
                bonding_curve.token_reserve,
            )?,
            &[
                bonding_curve_account.clone(),
                liquidity_pool.clone(),
                token_program.clone(),
            ],
        )?;
    }

    // Mark as graduated
    bonding_curve.is_graduated = true;
    bonding_curve.sol_reserve = 0;
    bonding_curve.token_reserve = 0;

    // Save updated bonding curve
    bonding_curve.serialize(&mut &mut bonding_curve_account.data.borrow_mut()[..])?;

    msg!("Token graduated successfully!");
    msg!("Liquidity transferred to external DEX");
    msg!("Final market cap: {}", bonding_curve.get_market_cap());

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bonding_curve_calculations() {
        let bonding_curve = BondingCurve {
            token_mint: Pubkey::new_unique(),
            sol_reserve: 1_000_000, // 1 SOL
            token_reserve: 1_000_000_000, // 1B tokens
            total_supply: 1_000_000_000,
            is_graduated: false,
            creator: Pubkey::new_unique(),
            platform_treasury: Pubkey::new_unique(),
        };

        // Test price calculation
        let price = bonding_curve.get_current_price();
        assert_eq!(price, 1_000_000); // 1 SOL per 1B tokens = 0.000001 SOL per token

        // Test market cap calculation
        let market_cap = bonding_curve.get_market_cap();
        assert_eq!(market_cap, 1_000_000); // 1 SOL

        // Test graduation progress
        let progress = bonding_curve.get_graduation_progress();
        assert_eq!(progress, 0); // 1 SOL << 69,000 SOL

        // Test token calculation
        let tokens_out = bonding_curve.calculate_tokens_out(100_000); // 0.1 SOL
        assert!(tokens_out > 0);
    }
}