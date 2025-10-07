import React, { useState, useEffect } from 'react';
import { WalletContextProvider } from './contexts/WalletContext';
import Layout from './components/Layout';
import CreateTokenForm from './components/CreateTokenForm';
import TokenList from './components/TokenList';
import TradingView from './components/TradingView';
import { Token, CreateTokenForm as CreateTokenFormType, TradeForm } from './types';

// Mock data for demonstration
const generateMockTokens = (): Token[] => [
  {
    id: '1',
    name: 'Doge Killer',
    ticker: 'DOGEK',
    description: 'The ultimate meme coin that will moon to Mars!',
    image: '',
    marketCap: 45000,
    price: 0.000045,
    change24h: 12.5,
    graduationProgress: 65.2,
    liquidity: 22500,
    totalSupply: 1000000000,
    holders: 1250,
    volume24h: 8500,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isGraduated: false,
  },
  {
    id: '2',
    name: 'Pepe Coin',
    ticker: 'PEPE',
    description: 'Ribbit ribbit! The greenest coin in the pond!',
    image: '',
    marketCap: 32000,
    price: 0.000032,
    change24h: -5.2,
    graduationProgress: 46.4,
    liquidity: 16000,
    totalSupply: 1000000000,
    holders: 890,
    volume24h: 4200,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isGraduated: false,
  },
  {
    id: '3',
    name: 'Shiba Inu',
    ticker: 'SHIB',
    description: 'Woof woof! The doge killer is here!',
    image: '',
    marketCap: 69000,
    price: 0.000069,
    change24h: 25.8,
    graduationProgress: 100,
    liquidity: 34500,
    totalSupply: 1000000000,
    holders: 2100,
    volume24h: 15000,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isGraduated: true,
  },
  {
    id: '4',
    name: 'Safe Moon',
    ticker: 'SAFEM',
    description: 'To the moon and beyond! HODL strong!',
    image: '',
    marketCap: 28000,
    price: 0.000028,
    change24h: 8.3,
    graduationProgress: 40.6,
    liquidity: 14000,
    totalSupply: 1000000000,
    holders: 750,
    volume24h: 3200,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    isGraduated: false,
  },
  {
    id: '5',
    name: 'Floki Inu',
    ticker: 'FLOKI',
    description: 'The Viking doge that will conquer all!',
    image: '',
    marketCap: 15000,
    price: 0.000015,
    change24h: -12.1,
    graduationProgress: 21.7,
    liquidity: 7500,
    totalSupply: 1000000000,
    holders: 420,
    volume24h: 1800,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    isGraduated: false,
  },
];

function App() {
  const [activeView, setActiveView] = useState<'create' | 'tokens' | 'portfolio' | 'trading'>('tokens');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    setTokens(generateMockTokens());
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prevTokens => 
        prevTokens.map(token => ({
          ...token,
          price: token.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% random change
          change24h: token.change24h + (Math.random() - 0.5) * 0.5, // Small random change
          marketCap: token.price * token.totalSupply,
          graduationProgress: Math.min(100, token.graduationProgress + Math.random() * 0.1),
          holders: token.holders + Math.floor(Math.random() * 3), // Random holder growth
        }))
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCreateToken = async (formData: CreateTokenFormType) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newToken: Token = {
      id: Date.now().toString(),
      name: formData.name,
      ticker: formData.ticker,
      description: formData.description,
      image: formData.image ? URL.createObjectURL(formData.image) : '',
      marketCap: 0,
      price: 0.000001,
      change24h: 0,
      graduationProgress: 0,
      liquidity: 0,
      totalSupply: 1000000000,
      holders: 1,
      volume24h: 0,
      createdAt: new Date(),
      isGraduated: false,
    };
    
    setTokens(prev => [newToken, ...prev]);
    setSelectedToken(newToken);
    setActiveView('trading');
    setIsLoading(false);
  };

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setActiveView('trading');
  };

  const handleTrade = async (formData: TradeForm) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update token data based on trade
    setTokens(prevTokens => 
      prevTokens.map(token => 
        token.id === selectedToken?.id 
          ? {
              ...token,
              price: formData.type === 'buy' 
                ? token.price * 1.001 // Price increases on buy
                : token.price * 0.999, // Price decreases on sell
              holders: formData.type === 'buy' 
                ? token.holders + 1 
                : Math.max(1, token.holders - 1),
              volume24h: token.volume24h + parseFloat(formData.amount),
            }
          : token
      )
    );
    
    // Update selected token
    if (selectedToken) {
      const updatedToken = tokens.find(t => t.id === selectedToken.id);
      if (updatedToken) {
        setSelectedToken(updatedToken);
      }
    }
    
    setIsLoading(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'create':
        return (
          <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <CreateTokenForm 
              onSubmit={handleCreateToken}
              isLoading={isLoading}
            />
          </div>
        );
      
      case 'tokens':
        return (
          <div className="p-6">
            <TokenList 
              tokens={tokens}
              onTokenSelect={handleTokenSelect}
              selectedToken={selectedToken}
            />
          </div>
        );
      
      case 'portfolio':
        return (
          <div className="p-6">
            <div className="bg-dark-surface rounded-lg border border-dark-border p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">My Portfolio</h2>
              <p className="text-gray-400 mb-6">Portfolio tracking coming soon!</p>
              <div className="text-sm text-gray-500">
                Connect your wallet to view your token holdings and trading history.
              </div>
            </div>
          </div>
        );
      
      case 'trading':
        return selectedToken ? (
          <div className="p-6">
            <TradingView 
              token={selectedToken}
              onTrade={handleTrade}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-dark-surface rounded-lg border border-dark-border p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Select a Token</h2>
              <p className="text-gray-400">
                Choose a token from the list to start trading.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <WalletContextProvider>
      <Layout 
        activeView={activeView}
        onViewChange={setActiveView}
        selectedToken={selectedToken?.ticker}
      >
        {renderContent()}
      </Layout>
    </WalletContextProvider>
  );
}

export default App;
