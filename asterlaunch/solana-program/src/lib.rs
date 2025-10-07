/*
 * AsterLaunch Solana Program
 * 
 * A comprehensive meme coin launchpad program for Solana featuring:
 * - Token factory with bonding curve mechanics
 * - Automatic liquidity provision
 * - DEX graduation at $69K market cap
 * - 1% trading fees (0.5% to liquidity, 0.5% to platform)
 */

pub mod instruction;
pub mod processor;
pub mod state;
pub mod error;
pub mod bonding_curve;

use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

#[cfg(not(feature = "no-entrypoint"))]
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    processor::Processor::process(program_id, accounts, instruction_data)
}