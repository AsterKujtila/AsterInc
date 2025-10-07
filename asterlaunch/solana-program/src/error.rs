use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum AsterLaunchError {
    #[error("Invalid Instruction")]
    InvalidInstruction,

    #[error("Not Rent Exempt")]
    NotRentExempt,

    #[error("Insufficient Funds")]
    InsufficientFunds,

    #[error("Token Already Exists")]
    TokenAlreadyExists,

    #[error("Invalid Token Metadata")]
    InvalidTokenMetadata,

    #[error("Bonding Curve Not Initialized")]
    BondingCurveNotInitialized,

    #[error("Invalid Trade Amount")]
    InvalidTradeAmount,

    #[error("Slippage Tolerance Exceeded")]
    SlippageExceeded,

    #[error("Token Already Graduated")]
    TokenAlreadyGraduated,

    #[error("Graduation Threshold Not Met")]
    GraduationThresholdNotMet,

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Invalid Fee Structure")]
    InvalidFeeStructure,

    #[error("Math Overflow")]
    MathOverflow,
}

impl From<AsterLaunchError> for ProgramError {
    fn from(e: AsterLaunchError) -> Self {
        ProgramError::Custom(e as u32)
    }
}