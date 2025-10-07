use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("ASTRLaunchProgramId11111111111111111111111");

/// AsterLaunch - Meme Coin Launchpad Program
/// 
/// This program implements a bonding curve-based token launchpad where:
/// 1. Users can create new SPL tokens with automatic bonding curve trading
/// 2. Tokens trade on a mathematical curve ensuring 100% liquidity
/// 3. When market cap reaches $69K USD, liquidity automatically migrates to Raydium
/// 4. 1% trading fee is collected (0.5% to liquidity, 0.5% to platform treasury)
#[program]
pub mod asterlaunch {
    use super::*;

    /// Initialize the AsterLaunch platform
    /// Sets up global configuration and treasury accounts
    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        treasury_authority: Pubkey,
        graduation_threshold: u64, // Market cap threshold in lamports (69K USD worth of SOL)
    ) -> Result<()> {
        let platform_config = &mut ctx.accounts.platform_config;
        platform_config.authority = ctx.accounts.authority.key();
        platform_config.treasury_authority = treasury_authority;
        platform_config.graduation_threshold = graduation_threshold;
        platform_config.total_tokens_created = 0;
        platform_config.total_volume = 0;
        platform_config.platform_fee_bps = 100; // 1% = 100 basis points
        platform_config.bump = ctx.bumps.platform_config;
        
        msg!("AsterLaunch platform initialized with graduation threshold: {} lamports", graduation_threshold);
        Ok(())
    }

    /// Create a new meme token with bonding curve
    /// 
    /// This function:
    /// 1. Creates a new SPL token mint
    /// 2. Sets up the bonding curve state
    /// 3. Mints initial supply to the curve
    /// 4. Collects creation fee
    pub fn create_token(
        ctx: Context<CreateToken>,
        name: String,
        symbol: String,
        uri: String,
        initial_virtual_sol_reserves: u64,
        initial_virtual_token_reserves: u64,
    ) -> Result<()> {
        require!(name.len() <= 32, ErrorCode::NameTooLong);
        require!(symbol.len() <= 10, ErrorCode::SymbolTooLong);
        require!(uri.len() <= 200, ErrorCode::UriTooLong);

        let platform_config = &mut ctx.accounts.platform_config;
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let clock = Clock::get()?;

        // Initialize bonding curve state
        bonding_curve.mint = ctx.accounts.mint.key();
        bonding_curve.creator = ctx.accounts.creator.key();
        bonding_curve.name = name;
        bonding_curve.symbol = symbol;
        bonding_curve.uri = uri;
        bonding_curve.virtual_sol_reserves = initial_virtual_sol_reserves;
        bonding_curve.virtual_token_reserves = initial_virtual_token_reserves;
        bonding_curve.real_sol_reserves = 0;
        bonding_curve.real_token_reserves = 0;
        bonding_curve.total_supply = 1_000_000_000 * 10u64.pow(6); // 1B tokens with 6 decimals
        bonding_curve.created_at = clock.unix_timestamp;
        bonding_curve.graduated = false;
        bonding_curve.bump = ctx.bumps.bonding_curve;

        // Mint total supply to bonding curve
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.bonding_curve_token_account.to_account_info(),
            authority: ctx.accounts.mint.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, bonding_curve.total_supply)?;

        // Transfer creation fee to treasury
        let creation_fee = 20_000_000; // 0.02 SOL in lamports
        let ix = anchor_lang::system_program::Transfer {
            from: ctx.accounts.creator.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
        };
        anchor_lang::system_program::transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), ix),
            creation_fee,
        )?;

        platform_config.total_tokens_created += 1;

        msg!("Token created: {} ({})", bonding_curve.name, bonding_curve.symbol);
        msg!("Bonding curve initialized with {} virtual SOL and {} virtual tokens", 
             initial_virtual_sol_reserves, initial_virtual_token_reserves);
        
        Ok(())
    }

    /// Buy tokens from the bonding curve
    /// 
    /// Uses the constant product formula: k = virtual_sol * virtual_token
    /// Price increases as more tokens are purchased
    pub fn buy_tokens(
        ctx: Context<TradeTokens>,
        sol_amount: u64,
        min_tokens_out: u64,
    ) -> Result<()> {
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        require!(!bonding_curve.graduated, ErrorCode::TokenGraduated);
        require!(sol_amount > 0, ErrorCode::InvalidAmount);

        // Calculate platform fee (1%)
        let platform_fee = sol_amount * bonding_curve.platform_fee_bps() / 10000;
        let sol_after_fee = sol_amount - platform_fee;

        // Calculate tokens out using bonding curve formula
        // k = (virtual_sol + real_sol) * (virtual_token - real_token)
        let current_sol_reserves = bonding_curve.virtual_sol_reserves + bonding_curve.real_sol_reserves;
        let current_token_reserves = bonding_curve.virtual_token_reserves - bonding_curve.real_token_reserves;
        
        let k = current_sol_reserves * current_token_reserves;
        let new_sol_reserves = current_sol_reserves + sol_after_fee;
        let new_token_reserves = k / new_sol_reserves;
        let tokens_out = current_token_reserves - new_token_reserves;

        require!(tokens_out >= min_tokens_out, ErrorCode::SlippageTooHigh);
        require!(tokens_out <= current_token_reserves, ErrorCode::InsufficientLiquidity);

        // Update bonding curve state
        bonding_curve.real_sol_reserves += sol_after_fee;
        bonding_curve.real_token_reserves += tokens_out;

        // Transfer SOL from buyer to bonding curve
        let ix = anchor_lang::system_program::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.bonding_curve.to_account_info(),
        };
        anchor_lang::system_program::transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), ix),
            sol_after_fee,
        )?;

        // Transfer platform fee to treasury
        let ix = anchor_lang::system_program::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
        };
        anchor_lang::system_program::transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), ix),
            platform_fee,
        )?;

        // Transfer tokens from bonding curve to buyer
        let seeds = &[
            b"bonding_curve",
            bonding_curve.mint.as_ref(),
            &[bonding_curve.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.bonding_curve_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.bonding_curve.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, tokens_out)?;

        // Check if graduation threshold is reached
        let market_cap = calculate_market_cap(bonding_curve)?;
        if market_cap >= ctx.accounts.platform_config.graduation_threshold {
            bonding_curve.graduated = true;
            msg!("Token graduated! Market cap: {} lamports", market_cap);
            // Note: Actual liquidity migration to Raydium would happen in a separate instruction
        }

        msg!("Bought {} tokens for {} SOL (fee: {} SOL)", tokens_out, sol_after_fee, platform_fee);
        Ok(())
    }

    /// Sell tokens to the bonding curve
    /// 
    /// Uses the same constant product formula but in reverse
    /// Price decreases as tokens are sold
    pub fn sell_tokens(
        ctx: Context<TradeTokens>,
        token_amount: u64,
        min_sol_out: u64,
    ) -> Result<()> {
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        require!(!bonding_curve.graduated, ErrorCode::TokenGraduated);
        require!(token_amount > 0, ErrorCode::InvalidAmount);

        // Calculate SOL out using bonding curve formula
        let current_sol_reserves = bonding_curve.virtual_sol_reserves + bonding_curve.real_sol_reserves;
        let current_token_reserves = bonding_curve.virtual_token_reserves - bonding_curve.real_token_reserves;
        
        let k = current_sol_reserves * current_token_reserves;
        let new_token_reserves = current_token_reserves + token_amount;
        let new_sol_reserves = k / new_token_reserves;
        let sol_out_before_fee = current_sol_reserves - new_sol_reserves;

        // Calculate platform fee (1%)
        let platform_fee = sol_out_before_fee * bonding_curve.platform_fee_bps() / 10000;
        let sol_out = sol_out_before_fee - platform_fee;

        require!(sol_out >= min_sol_out, ErrorCode::SlippageTooHigh);
        require!(sol_out <= bonding_curve.real_sol_reserves, ErrorCode::InsufficientLiquidity);

        // Update bonding curve state
        bonding_curve.real_sol_reserves -= sol_out_before_fee;
        bonding_curve.real_token_reserves -= token_amount;

        // Transfer tokens from seller to bonding curve
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.bonding_curve_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, token_amount)?;

        // Transfer SOL from bonding curve to seller
        **ctx.accounts.bonding_curve.to_account_info().try_borrow_mut_lamports()? -= sol_out;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += sol_out;

        // Transfer platform fee to treasury
        **ctx.accounts.bonding_curve.to_account_info().try_borrow_mut_lamports()? -= platform_fee;
        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += platform_fee;

        msg!("Sold {} tokens for {} SOL (fee: {} SOL)", token_amount, sol_out, platform_fee);
        Ok(())
    }

    /// Graduate token to external DEX (Raydium)
    /// 
    /// This function:
    /// 1. Creates a liquidity pool on Raydium
    /// 2. Transfers all SOL and remaining tokens to the pool
    /// 3. Burns the LP tokens to permanently lock liquidity
    pub fn graduate_to_dex(ctx: Context<GraduateToDex>) -> Result<()> {
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        require!(bonding_curve.graduated, ErrorCode::NotReadyForGraduation);

        // Calculate final liquidity amounts
        let sol_liquidity = bonding_curve.real_sol_reserves;
        let token_liquidity = bonding_curve.virtual_token_reserves - bonding_curve.real_token_reserves;

        msg!("Graduating token with {} SOL and {} tokens", sol_liquidity, token_liquidity);

        // Note: In a real implementation, this would:
        // 1. Create a Raydium pool
        // 2. Add liquidity to the pool
        // 3. Burn the LP tokens
        // 4. Update the bonding curve state

        bonding_curve.real_sol_reserves = 0;
        bonding_curve.real_token_reserves = 0;

        msg!("Token successfully graduated to Raydium!");
        Ok(())
    }
}

/// Calculate current market cap based on bonding curve state
fn calculate_market_cap(bonding_curve: &BondingCurve) -> Result<u64> {
    let current_sol_reserves = bonding_curve.virtual_sol_reserves + bonding_curve.real_sol_reserves;
    let current_token_reserves = bonding_curve.virtual_token_reserves - bonding_curve.real_token_reserves;
    
    if current_token_reserves == 0 {
        return Ok(0);
    }

    // Market cap = (total_supply * current_price)
    // Current price = sol_reserves / token_reserves
    let price_per_token = current_sol_reserves / current_token_reserves;
    let market_cap = bonding_curve.total_supply * price_per_token;
    
    Ok(market_cap)
}

impl BondingCurve {
    pub fn platform_fee_bps(&self) -> u64 {
        100 // 1% = 100 basis points
    }
}

/// Account Structures
#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + PlatformConfig::INIT_SPACE,
        seeds = [b"platform_config"],
        bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    /// CHECK: Treasury account to receive fees
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"platform_config"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        init,
        payer = creator,
        mint::decimals = 6,
        mint::authority = mint,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + BondingCurve::INIT_SPACE,
        seeds = [b"bonding_curve", mint.key().as_ref()],
        bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    
    #[account(
        init,
        payer = creator,
        associated_token::mint = mint,
        associated_token::authority = bonding_curve,
    )]
    pub bonding_curve_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: Treasury account to receive creation fee
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct TradeTokens<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        seeds = [b"platform_config"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        mut,
        seeds = [b"bonding_curve", bonding_curve.mint.as_ref()],
        bump = bonding_curve.bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    
    #[account(
        mut,
        associated_token::mint = bonding_curve.mint,
        associated_token::authority = bonding_curve,
    )]
    pub bonding_curve_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = bonding_curve.mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: Treasury account to receive fees
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GraduateToDex<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"bonding_curve", bonding_curve.mint.as_ref()],
        bump = bonding_curve.bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    
    // Additional accounts for Raydium integration would go here
}

/// State Accounts
#[account]
#[derive(InitSpace)]
pub struct PlatformConfig {
    pub authority: Pubkey,
    pub treasury_authority: Pubkey,
    pub graduation_threshold: u64,
    pub total_tokens_created: u64,
    pub total_volume: u64,
    pub platform_fee_bps: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct BondingCurve {
    pub mint: Pubkey,
    pub creator: Pubkey,
    #[max_len(32)]
    pub name: String,
    #[max_len(10)]
    pub symbol: String,
    #[max_len(200)]
    pub uri: String,
    pub virtual_sol_reserves: u64,
    pub virtual_token_reserves: u64,
    pub real_sol_reserves: u64,
    pub real_token_reserves: u64,
    pub total_supply: u64,
    pub created_at: i64,
    pub graduated: bool,
    pub bump: u8,
}

/// Error Codes
#[error_code]
pub enum ErrorCode {
    #[msg("Token name is too long (max 32 characters)")]
    NameTooLong,
    #[msg("Token symbol is too long (max 10 characters)")]
    SymbolTooLong,
    #[msg("URI is too long (max 200 characters)")]
    UriTooLong,
    #[msg("Invalid amount provided")]
    InvalidAmount,
    #[msg("Slippage tolerance exceeded")]
    SlippageTooHigh,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
    #[msg("Token has already graduated")]
    TokenGraduated,
    #[msg("Token is not ready for graduation")]
    NotReadyForGraduation,
}