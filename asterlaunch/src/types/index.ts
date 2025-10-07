export interface Token {
  id: string;
  name: string;
  ticker: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  creator: string;
  
  // Market data
  currentMarketCap: number;
  price: number;
  change24h: number;
  volume24h: number;
  totalSupply: number;
  
  // Bonding curve data
  tokensSold: number;
  liquidityLocked: number;
  graduationProgress: number; // 0-100 percentage
  isGraduated: boolean;
  
  // Trading data
  holderCount: number;
  trades: Trade[];
  priceHistory: PricePoint[];
}

export interface Trade {
  id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: Date;
  wallet: string;
  txHash: string;
}

export interface PricePoint {
  timestamp: number;
  price: number;
  marketCap: number;
}

export interface CreateTokenForm {
  name: string;
  ticker: string;
  description: string;
  image: File | null;
}

export interface WalletContextState {
  connected: boolean;
  publicKey: string | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const GRADUATION_THRESHOLD = 69000; // $69,000 USD
export const PLATFORM_FEE = 0.01; // 1% total fee
export const CREATION_FEE = 0.02; // 0.02 SOL to create token