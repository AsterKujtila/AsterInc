import { Token, PricePoint, Trade } from '@/types';

// Generate mock price history for bonding curve
const generatePriceHistory = (basePrice: number, points: number): PricePoint[] => {
  const history: PricePoint[] = [];
  const now = Date.now();
  
  for (let i = 0; i < points; i++) {
    const timestamp = now - (points - i) * 60000; // 1 minute intervals
    const randomFactor = 0.8 + Math.random() * 0.4; // ±20% variation
    const price = basePrice * (1 + (i / points) * 0.5) * randomFactor;
    const marketCap = price * 1000000000; // Assuming 1B supply
    
    history.push({ timestamp, price, marketCap });
  }
  
  return history;
};

// Generate mock trades
const generateTrades = (count: number): Trade[] => {
  const trades: Trade[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    trades.push({
      id: `trade-${i}`,
      type: Math.random() > 0.5 ? 'buy' : 'sell',
      amount: Math.random() * 100 + 10,
      price: 0.00001 + Math.random() * 0.00005,
      timestamp: new Date(now - i * 120000),
      wallet: `${Math.random().toString(36).substring(7)}...${Math.random().toString(36).substring(7)}`,
      txHash: Math.random().toString(36).substring(2, 15),
    });
  }
  
  return trades.reverse();
};

export const mockTokens: Token[] = [
  {
    id: '1',
    name: 'Pepe Aster',
    ticker: 'PEPA',
    description: 'The official Pepe token on AsterLaunch. To the moon! 🚀',
    imageUrl: '/tokens/pepe.png',
    createdAt: new Date(Date.now() - 86400000),
    creator: 'DjKM...x7Yn',
    currentMarketCap: 45000,
    price: 0.000045,
    change24h: 125.5,
    volume24h: 12500,
    totalSupply: 1000000000,
    tokensSold: 650000000,
    liquidityLocked: 22500,
    graduationProgress: 65.2,
    isGraduated: false,
    holderCount: 234,
    trades: generateTrades(20),
    priceHistory: generatePriceHistory(0.000035, 100),
  },
  {
    id: '2',
    name: 'Doge King',
    ticker: 'DGKNG',
    description: 'Much wow, very moon. The king of all doges.',
    imageUrl: '/tokens/doge.png',
    createdAt: new Date(Date.now() - 172800000),
    creator: 'A9pL...m2Zq',
    currentMarketCap: 32000,
    price: 0.000032,
    change24h: -15.2,
    volume24h: 8900,
    totalSupply: 1000000000,
    tokensSold: 480000000,
    liquidityLocked: 16000,
    graduationProgress: 46.4,
    isGraduated: false,
    holderCount: 187,
    trades: generateTrades(15),
    priceHistory: generatePriceHistory(0.000038, 100),
  },
  {
    id: '3',
    name: 'Shiba Moon',
    ticker: 'SHMN',
    description: 'Shiba going to the moon. Join the pack!',
    imageUrl: '/tokens/shiba.png',
    createdAt: new Date(Date.now() - 259200000),
    creator: 'K3nX...p9Wt',
    currentMarketCap: 58000,
    price: 0.000058,
    change24h: 89.3,
    volume24h: 15200,
    totalSupply: 1000000000,
    tokensSold: 720000000,
    liquidityLocked: 29000,
    graduationProgress: 84.1,
    isGraduated: false,
    holderCount: 312,
    trades: generateTrades(25),
    priceHistory: generatePriceHistory(0.000032, 100),
  },
  {
    id: '4',
    name: 'Cat Coin',
    ticker: 'MEOW',
    description: 'Cats rule, dogs drool. Meow to the moon! 🐱',
    imageUrl: '/tokens/cat.png',
    createdAt: new Date(Date.now() - 3600000),
    creator: 'R7vB...k4Lm',
    currentMarketCap: 12000,
    price: 0.000012,
    change24h: 245.7,
    volume24h: 3200,
    totalSupply: 1000000000,
    tokensSold: 280000000,
    liquidityLocked: 6000,
    graduationProgress: 17.4,
    isGraluated: false,
    holderCount: 89,
    trades: generateTrades(10),
    priceHistory: generatePriceHistory(0.000005, 100),
  },
  {
    id: '5',
    name: 'Rocket Fuel',
    ticker: 'RKTFL',
    description: 'Fuel for your rocket to the moon. LFG!',
    imageUrl: '/tokens/rocket.png',
    createdAt: new Date(Date.now() - 7200000),
    creator: 'N9tQ...h6Ps',
    currentMarketCap: 28000,
    price: 0.000028,
    change24h: 156.8,
    volume24h: 7800,
    totalSupply: 1000000000,
    tokensSold: 420000000,
    liquidityLocked: 14000,
    graduationProgress: 40.6,
    isGraduated: false,
    holderCount: 156,
    trades: generateTrades(18),
    priceHistory: generatePriceHistory(0.000012, 100),
  },
];

export const getTokenByTicker = (ticker: string): Token | undefined => {
  return mockTokens.find(token => token.ticker.toLowerCase() === ticker.toLowerCase());
};

export const getTokenById = (id: string): Token | undefined => {
  return mockTokens.find(token => token.id === id);
};