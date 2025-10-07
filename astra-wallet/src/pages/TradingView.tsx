import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useWallet } from '../contexts/WalletContext';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Droplets,
  Target,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const TradingView: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const { getToken } = useData();
  const { connected, balance } = useWallet();
  
  const [token, setToken] = useState(getToken(ticker || ''));
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const foundToken = getToken(ticker || '');
    setToken(foundToken);
  }, [ticker, getToken]);

  if (!token) {
    return (
      <div className="text-center py-2xl">
        <h2 className="mb-md">Token Not Found</h2>
        <p className="text-muted mb-lg">The token you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price < 0.000001) {
      return price.toExponential(2);
    }
    return price.toFixed(6);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(2)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`;
    } else {
      return `$${marketCap.toFixed(0)}`;
    }
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green' : 'text-red';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const calculateBuyOutput = (solAmount: number) => {
    // Simplified bonding curve calculation
    const currentSupply = token.totalSupply * (token.graduationProgress / 100);
    const k = 0.000001; // Curve steepness
    const tokensOut = solAmount / (k * Math.sqrt(currentSupply + solAmount * 1000000));
    return tokensOut;
  };

  const calculateSellOutput = (tokenAmount: number) => {
    // Simplified bonding curve calculation for selling
    const currentSupply = token.totalSupply * (token.graduationProgress / 100);
    const k = 0.000001;
    const solOut = tokenAmount * k * Math.sqrt(currentSupply);
    return solOut;
  };

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    const amount = type === 'buy' ? parseFloat(buyAmount) : parseFloat(sellAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Simulate trade
    console.log(`${type === 'buy' ? 'Buying' : 'Selling'} ${amount} ${type === 'buy' ? 'SOL worth of' : ''} ${token.ticker}`);
    
    // Reset form
    if (type === 'buy') {
      setBuyAmount('');
    } else {
      setSellAmount('');
    }
  };

  // Prepare chart data
  const chartData = token.priceHistory.map((point, index) => ({
    time: index,
    price: point.price * 1000000, // Convert to more readable numbers
    timestamp: point.timestamp
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-md mb-xl">
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={20} />
        </Link>
        <div className="token-image" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>
          {token.ticker.charAt(0)}
        </div>
        <div>
          <h1 className="mb-xs">{token.name}</h1>
          <div className="flex items-center gap-md">
            <span className="text-muted">${token.ticker}</span>
            <button 
              onClick={() => copyToClipboard(token.id)}
              className="flex items-center gap-xs text-muted hover:text-primary transition-colors"
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              <span className="text-sm">
                {token.id.slice(0, 8)}...{token.id.slice(-8)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Price and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-xl">
        <div className="card">
          <div className="stat-label">Current Price</div>
          <div className="stat-value">${formatPrice(token.price)}</div>
          <div className={`stat-change flex items-center gap-xs ${getChangeColor(token.change24h)}`}>
            {getChangeIcon(token.change24h)}
            {formatChange(token.change24h)}
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Market Cap</div>
          <div className="stat-value">{formatMarketCap(token.marketCap)}</div>
          <div className="stat-change text-muted">
            Target: $69K
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Holders</div>
          <div className="stat-value flex items-center gap-xs">
            <Users size={20} />
            {token.holders.toLocaleString()}
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Liquidity</div>
          <div className="stat-value flex items-center gap-xs">
            <Droplets size={20} />
            {formatMarketCap(token.liquidity)}
          </div>
        </div>
      </div>

      {/* Graduation Progress */}
      <div className="card mb-xl">
        <div className="flex items-center justify-between mb-md">
          <h3>Graduation Progress</h3>
          <div className="flex items-center gap-xs text-accent-primary">
            <Target size={20} />
            <span>{token.graduationProgress.toFixed(1)}%</span>
          </div>
        </div>
        <div className="progress-bar" style={{ height: '12px' }}>
          <div 
            className="progress-bar-fill"
            style={{ width: `${Math.min(token.graduationProgress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-sm text-sm text-muted">
          <span>Current: {formatMarketCap(token.marketCap)}</span>
          <span>Target: $69,000</span>
        </div>
        {token.graduationProgress >= 100 && (
          <div className="mt-md p-md bg-green/10 border border-green/20 rounded-md">
            <div className="flex items-center gap-md">
              <CheckCircle className="text-green" size={24} />
              <div>
                <h4 className="text-green">Graduated!</h4>
                <p className="text-sm text-muted">
                  This token has graduated and liquidity has been sent to Raydium.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm ml-auto">
                <ExternalLink size={16} />
                View on Raydium
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Price Chart */}
      <div className="card mb-xl">
        <h3 className="mb-lg">Price Chart</h3>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)'
                }}
                formatter={(value: number) => [`$${(value / 1000000).toFixed(6)}`, 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="var(--accent-primary)" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--accent-primary)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Token Info */}
      <div className="card">
        <h3 className="mb-lg">About {token.name}</h3>
        <p className="text-muted mb-lg">{token.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div>
            <h4 className="mb-md">Token Details</h4>
            <div className="space-y-sm text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Total Supply:</span>
                <span>{token.totalSupply.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Created:</span>
                <span>{token.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Creator:</span>
                <span className="font-mono text-xs">
                  {token.creator.slice(0, 8)}...{token.creator.slice(-8)}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="mb-md">Trading Stats</h4>
            <div className="space-y-sm text-sm">
              <div className="flex justify-between">
                <span className="text-muted">24h Volume:</span>
                <span>{formatMarketCap(token.volume24h)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Trading Fee:</span>
                <span>1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Liquidity Pool:</span>
                <span>{formatMarketCap(token.liquidity)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingView;