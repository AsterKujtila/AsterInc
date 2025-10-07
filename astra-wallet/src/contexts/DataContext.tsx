import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Token {
  id: string;
  name: string;
  ticker: string;
  marketCap: number;
  change24h: number;
  graduationProgress: number;
  image?: string;
  description: string;
  creator: string;
  createdAt: Date;
  holders: number;
  totalSupply: number;
  price: number;
  volume24h: number;
  liquidity: number;
  priceHistory: { timestamp: number; price: number }[];
}

export interface DataContextType {
  tokens: Token[];
  loading: boolean;
  refreshTokens: () => void;
  addToken: (token: Omit<Token, 'id' | 'createdAt' | 'priceHistory'>) => void;
  getToken: (ticker: string) => Token | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

// Mock data generator
const generateMockTokens = (): Token[] => {
  const mockNames = [
    'DogeCoin2.0', 'PepeFrog', 'ShibaInu++', 'ElonMusk', 'ToTheMoon',
    'DiamondHands', 'HODL', 'Lambo', 'Rocket', 'Ape', 'Banana', 'Chad'
  ];
  
  const mockTickers = [
    'DOGE2', 'PEPE', 'SHIB2', 'ELON', 'MOON',
    'DMNDS', 'HODL', 'LAMBO', 'RCKT', 'APE', 'NANA', 'CHAD'
  ];

  return mockNames.map((name, index) => {
    const basePrice = Math.random() * 0.001 + 0.0001;
    const priceHistory = Array.from({ length: 100 }, (_, i) => ({
      timestamp: Date.now() - (99 - i) * 60000,
      price: basePrice * (1 + (Math.random() - 0.5) * 0.1)
    }));

    return {
      id: `token-${index}`,
      name,
      ticker: mockTickers[index],
      marketCap: Math.random() * 50000 + 5000,
      change24h: (Math.random() - 0.5) * 200,
      graduationProgress: Math.random() * 100,
      description: `${name} is the next big meme coin on Solana!`,
      creator: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      holders: Math.floor(Math.random() * 1000) + 10,
      totalSupply: 1000000000,
      price: priceHistory[priceHistory.length - 1].price,
      volume24h: Math.random() * 100000 + 1000,
      liquidity: Math.random() * 200000 + 10000,
      priceHistory
    };
  });
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTokens = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTokens(generateMockTokens());
      setLoading(false);
    }, 500);
  };

  const addToken = (newToken: Omit<Token, 'id' | 'createdAt' | 'priceHistory'>) => {
    const token: Token = {
      ...newToken,
      id: `token-${Date.now()}`,
      createdAt: new Date(),
      priceHistory: [{ timestamp: Date.now(), price: newToken.price }]
    };
    setTokens(prev => [token, ...prev]);
  };

  const getToken = (ticker: string) => {
    return tokens.find(token => token.ticker.toLowerCase() === ticker.toLowerCase());
  };

  useEffect(() => {
    refreshTokens();
    
    // Set up real-time updates every 5 seconds
    const interval = setInterval(() => {
      setTokens(prev => prev.map(token => ({
        ...token,
        marketCap: token.marketCap * (1 + (Math.random() - 0.5) * 0.02),
        change24h: token.change24h + (Math.random() - 0.5) * 5,
        price: token.price * (1 + (Math.random() - 0.5) * 0.01),
        priceHistory: [
          ...token.priceHistory.slice(-99),
          { timestamp: Date.now(), price: token.price * (1 + (Math.random() - 0.5) * 0.01) }
        ]
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const value: DataContextType = {
    tokens,
    loading,
    refreshTokens,
    addToken,
    getToken,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};