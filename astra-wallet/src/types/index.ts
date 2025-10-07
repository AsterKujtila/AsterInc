export interface Token {
  id: string;
  name: string;
  ticker: string;
  description: string;
  image: string;
  marketCap: number;
  price: number;
  change24h: number;
  graduationProgress: number;
  liquidity: number;
  totalSupply: number;
  holders: number;
  volume24h: number;
  createdAt: Date;
  isGraduated: boolean;
}

export interface BondingCurveData {
  price: number;
  marketCap: number;
  liquidity: number;
  totalSold: number;
  timestamp: number;
}

export interface WalletContextType {
  connected: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export interface CreateTokenForm {
  name: string;
  ticker: string;
  description: string;
  image: File | null;
}

export interface TradeForm {
  amount: string;
  type: 'buy' | 'sell';
}