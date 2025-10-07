use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Burn, Mint, MintTo, Token, TokenAccount, Transfer},
};

// Placeholder for Pyth type to keep compiling if dependency differs.
pub mod pyth_placeholder {
    use super::*;
    #[account]
    pub struct PriceUpdateV2 {}
}
use pyth_placeholder::PriceUpdateV2;

declare_id!("AsterLaunch111111111111111111111111111111111");

pub const BPS_DIVISOR: u64 = 10_000;
pub const TOTAL_FEE_BPS: u64 = 100;  // 1%
pub const TREASURY_FEE_BPS: u64 = 50; // 0.5%

#[program]
pub mod aster_launch {
    use super::*;

    pub fn initialize_platform(ctx: Context<InitializePlatform>, treasury_bump: u8) -> Result<()> {
        let cfg = &mut ctx.accounts.config;
        cfg.authority = ctx.accounts.authority.key();
        cfg.treasury = ctx.accounts.treasury.key();
        cfg.usd_graduation_cents = 6_900_000; // $69,000.00
        cfg.bump = *ctx.bumps.get("config").unwrap();
        cfg.treasury_bump = treasury_bump;
        Ok(())
    }

    pub fn create_token(ctx: Context<CreateToken>, args: CreateTokenArgs) -> Result<()> {
        let sale = &mut ctx.accounts.sale;
        sale.config = ctx.accounts.config.key();
        sale.mint = ctx.accounts.mint.key();
        sale.token_vault = ctx.accounts.token_vault.key();
        sale.reserve = ctx.accounts.reserve.key();
        sale.creator = ctx.accounts.creator.key();
        sale.ticker = args.ticker;
        sale.base_price_lamports = args.base_price_lamports;
        sale.slope_lamports = args.slope_lamports;
        sale.tokens_sold = 0;
        sale.is_graduated = false;
        sale.bump = *ctx.bumps.get("sale").unwrap();

        // Mint initial supply to vault
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_vault.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
                &[&[
                    b"mint_auth",
                    ctx.accounts.mint.key().as_ref(),
                    &[ctx.accounts.mint_authority_bump],
                ]],
            ),
            args.initial_supply,
        )?;
        Ok(())
    }

    pub fn buy(ctx: Context<Buy>, tokens_out: u64) -> Result<()> {
        let sale = &mut ctx.accounts.sale;
        require!(!sale.is_graduated, AsterError::AlreadyGraduated);

        let base_cost = curve_cost_for_buy(
            sale.base_price_lamports,
            sale.slope_lamports,
            sale.tokens_sold,
            tokens_out,
        )?;

        let total_fee = (base_cost * TOTAL_FEE_BPS as u128 / BPS_DIVISOR as u128) as u64;
        let fee_to_treasury = (base_cost as u128 * TREASURY_FEE_BPS as u128 / BPS_DIVISOR as u128) as u64;
        let _fee_to_liquidity = total_fee - fee_to_treasury;
        let _total_payment = base_cost
            .checked_add(total_fee as u128)
            .ok_or(AsterError::MathOverflow)? as u64;

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.token_vault.to_account_info(),
                    to: ctx.accounts.user_token.to_account_info(),
                    authority: ctx.accounts.sale_signer.to_account_info(),
                },
                &[&[b"sale", ctx.accounts.mint.key().as_ref(), &[sale.bump]]],
            ),
            tokens_out,
        )?;

        sale.tokens_sold = sale.tokens_sold.checked_add(tokens_out).ok_or(AsterError::MathOverflow)?;
        Ok(())
    }

    pub fn sell(ctx: Context<Sell>, tokens_in: u64) -> Result<()> {
        let sale = &mut ctx.accounts.sale;
        require!(!sale.is_graduated, AsterError::AlreadyGraduated);
        require!(tokens_in <= sale.tokens_sold, AsterError::NotEnoughLiquidity);

        let base_payout = curve_refund_for_sell(
            sale.base_price_lamports,
            sale.slope_lamports,
            sale.tokens_sold,
            tokens_in,
        )?;

        let total_fee = (base_payout * TOTAL_FEE_BPS as u128 / BPS_DIVISOR as u128) as u64;
        let _fee_to_treasury = (base_payout as u128 * TREASURY_FEE_BPS as u128 / BPS_DIVISOR as u128) as u64;
        let _fee_retained = total_fee - _fee_to_treasury;
        let _payout_to_seller = (base_payout as u128)
            .checked_sub(total_fee as u128)
            .ok_or(AsterError::MathOverflow)? as u64;

        // Receive tokens from user into vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token.to_account_info(),
                    to: ctx.accounts.token_vault.to_account_info(),
                    authority: ctx.accounts.seller.to_account_info(),
                },
            ),
            tokens_in,
        )?;

        sale.tokens_sold = sale.tokens_sold.checked_sub(tokens_in).ok_or(AsterError::MathOverflow)?;
        Ok(())
    }

    pub fn graduate(_ctx: Context<Graduate>) -> Result<()> {
        // Placeholder: would verify Pyth price and perform CPI to DEX pool, then burn LP.
        Ok(())
    }
}

#[account]
pub struct GlobalConfig {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub usd_graduation_cents: u64,
    pub bump: u8,
    pub treasury_bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateTokenArgs {
    pub ticker: [u8; 5],
    pub initial_supply: u64,
    pub base_price_lamports: u64,
    pub slope_lamports: u64,
}

#[account]
pub struct TokenSale {
    pub config: Pubkey,
    pub mint: Pubkey,
    pub token_vault: Pubkey,
    pub reserve: Pubkey,
    pub creator: Pubkey,
    pub ticker: [u8; 5],
    pub base_price_lamports: u64,
    pub slope_lamports: u64,
    pub tokens_sold: u64,
    pub is_graduated: bool,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        seeds = [b"config"],
        bump,
        space = 8 + 32 + 32 + 8 + 1 + 1
    )]
    pub config: Account<'info, GlobalConfig>,
    /// CHECK: treasury PDA or system account
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    /// CHECK: PDA as mint authority signer
    pub mint_authority: UncheckedAccount<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = creator,
        associated_token::mint = mint,
        associated_token::authority = sale_signer
    )]
    pub token_vault: Account<'info, TokenAccount>,
    /// CHECK: SOL reserve PDA
    #[account(mut)]
    pub reserve: UncheckedAccount<'info>,
    /// CHECK: Sale signer PDA (authority for vault)
    pub sale_signer: UncheckedAccount<'info>,
    #[account(
        init,
        payer = creator,
        seeds = [b"sale", mint.key().as_ref()],
        bump,
        space = 8 + 32*5 + 1 + 1 + 8*5 + 1
    )]
    pub sale: Account<'info, TokenSale>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub sale: Account<'info, TokenSale>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token: Account<'info, TokenAccount>,
    /// CHECK: sale signer PDA
    pub sale_signer: UncheckedAccount<'info>,
    /// CHECK: SOL reserve PDA
    #[account(mut)]
    pub reserve: UncheckedAccount<'info>,
    /// CHECK: treasury account
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Sell<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(mut)]
    pub sale: Account<'info, TokenSale>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token: Account<'info, TokenAccount>,
    /// CHECK: SOL reserve PDA
    #[account(mut)]
    pub reserve: UncheckedAccount<'info>,
    /// CHECK: treasury account
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Graduate<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub sale: Account<'info, TokenSale>,
    /// CHECK: Token vault and reserve would be moved to DEX pool via CPI.
    #[account(mut)]
    pub token_vault: UncheckedAccount<'info>,
    /// CHECK: SOL reserve PDA
    #[account(mut)]
    pub reserve: UncheckedAccount<'info>,
    /// CHECK: LP token vault for burn (simulated)
    #[account(mut)]
    pub lp_vault: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum AsterError {
    #[msg("Math overflow")] MathOverflow,
    #[msg("Sale already graduated")] AlreadyGraduated,
    #[msg("Not enough liquidity")] NotEnoughLiquidity,
}

// --- Curve utils ---
pub fn curve_cost_for_buy(base: u64, slope: u64, s_sold: u64, n: u64) -> Result<u128> {
    let n128 = n as u128;
    let s128 = s_sold as u128;
    let base_cost = n128 * base as u128;
    let series = n128
        .checked_mul((2u128.checked_mul(s128).ok_or(AsterError::MathOverflow)?)
        .checked_add(n128.checked_sub(1).ok_or(AsterError::MathOverflow)?).ok_or(AsterError::MathOverflow)?)
        .ok_or(AsterError::MathOverflow)?;
    let k_term = (slope as u128)
        .checked_mul(series)
        .ok_or(AsterError::MathOverflow)?
        .checked_div(2)
        .ok_or(AsterError::MathOverflow)?;
    Ok(base_cost.checked_add(k_term).ok_or(AsterError::MathOverflow)?)
}

pub fn curve_refund_for_sell(base: u64, slope: u64, s_sold: u64, n: u64) -> Result<u128> {
    require!(n <= s_sold, AsterError::NotEnoughLiquidity);
    let n128 = n as u128;
    let s1 = (s_sold - 1) as u128;
    let base_amt = n128 * base as u128;
    let series = n128
        .checked_mul(
            (2u128.checked_mul(s1).ok_or(AsterError::MathOverflow)?)
                .checked_sub(n128.checked_sub(1).ok_or(AsterError::MathOverflow)?)
                .ok_or(AsterError::MathOverflow)?,
        )
        .ok_or(AsterError::MathOverflow)?;
    let k_term = (slope as u128)
        .checked_mul(series)
        .ok_or(AsterError::MathOverflow)?
        .checked_div(2)
        .ok_or(AsterError::MathOverflow)?;
    Ok(base_amt.checked_add(k_term).ok_or(AsterError::MathOverflow)?)
}
