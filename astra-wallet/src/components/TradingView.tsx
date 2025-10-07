import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Token, BondingCurveData, TradeForm } from '../types';
import { cn } from '../utils/cn';

interface TradingViewProps {
  token: Token;
  onTrade: (formData: TradeForm) => void;
  isLoading: boolean;
}

const TradingView: React.FC<TradingViewProps> = ({ token, onTrade, isLoading }) => {
  const [tradeForm, setTradeForm] = useState<TradeForm>({
    amount: '',
    type: 'buy'
  });
  const [chartData, setChartData] = useState<BondingCurveData[]>([]);

  // Generate mock chart data based on token data
  useEffect(() => {
    const generateChartData = () => {
      const data: BondingCurveData[] = [];
      const now = Date.now();
      const hours = 24;
      
      for (let i = hours; i >= 0; i--) {
        const timestamp = now - (i * 60 * 60 * 1000);
        const progress = Math.min((hours - i) / hours * 100, token.graduationProgress);
        const price = token.price * (1 + (progress / 100) * 0.5); // Simulate price growth
        const marketCap = price * token.totalSupply;
        
        data.push({
          price,
          marketCap,
          liquidity: token.liquidity * (1 + progress / 100),
          totalSold: token.totalSupply * (progress / 100),
          timestamp
        });
      }
      
      setChartData(data);
    };

    generateChartData();
  }, [token]);

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(2);
  };

  const formatPrice = (price: number): string => {
    if (price < 0.000001) return price.toExponential(2);
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const calculateTradeAmount = (): { tokens: number; sol: number } => {
    const amount = parseFloat(tradeForm.amount) || 0;
    if (tradeForm.type === 'buy') {
      return {
        tokens: amount / token.price,
        sol: amount
      };
    } else {
      return {
        tokens: amount,
        sol: amount * token.price
      };
    }
  };

  const handleTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(tradeForm.amount) > 0) {
      onTrade(tradeForm);
    }
  };

  const tradeAmount = calculateTradeAmount();

  return (
    <div className="space-y-6">
      {/* Token Header */}
      <div className="bg-dark-surface rounded-lg border border-dark-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-aster to-success flex items-center justify-center text-white font-bold text-lg">
              {token.ticker.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{token.name}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-mono text-gray-400">{token.ticker}</span>
                {token.isGraduated && (
                  <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                    Graduated
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white font-mono">
              ${formatPrice(token.price)}
            </div>
            <div className={cn(
              "flex items-center justify-end space-x-1 text-sm font-mono",
              token.change24h >= 0 ? "text-success" : "text-danger"
            )}>
              {token.change24h >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-border/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-1">
              <DollarSign className="w-4 h-4" />
              <span>Market Cap</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              ${formatNumber(token.marketCap)}
            </div>
          </div>
          
          <div className="bg-dark-border/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Liquidity</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              ${formatNumber(token.liquidity)}
            </div>
          </div>
          
          <div className="bg-dark-border/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Total Sold</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {formatNumber(token.totalSupply * (token.graduationProgress / 100))}
            </div>
          </div>
          
          <div className="bg-dark-border/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-1">
              <Users className="w-4 h-4" />
              <span>Holders</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {token.holders}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-dark-surface rounded-lg border border-dark-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Price Chart</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-aster rounded-full animate-pulse" />
            <span>Live</span>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `$${formatPrice(value)}`}
                stroke="#666"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1E1E',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => [`$${formatPrice(value)}`, 'Price']}
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#6E56F8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#6E56F8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trading Panel */}
      <div className="bg-dark-surface rounded-lg border border-dark-border p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Trade</h2>
        
        <form onSubmit={handleTrade} className="space-y-4">
          {/* Trade Type Toggle */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setTradeForm(prev => ({ ...prev, type: 'buy' }))}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2",
                tradeForm.type === 'buy'
                  ? "bg-success text-white"
                  : "bg-dark-border text-gray-400 hover:text-white"
              )}
            >
              <ArrowUpRight className="w-5 h-5" />
              <span>Pump it! (Buy)</span>
            </button>
            <button
              type="button"
              onClick={() => setTradeForm(prev => ({ ...prev, type: 'sell' }))}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2",
                tradeForm.type === 'sell'
                  ? "bg-danger text-white"
                  : "bg-dark-border text-gray-400 hover:text-white"
              )}
            >
              <ArrowDownRight className="w-5 h-5" />
              <span>Dump it! (Sell)</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {tradeForm.type === 'buy' ? 'SOL Amount' : 'Token Amount'}
            </label>
            <input
              type="number"
              value={tradeForm.amount}
              onChange={(e) => setTradeForm(prev => ({ ...prev, amount: e.target.value }))}
              placeholder={tradeForm.type === 'buy' ? '0.1' : '1000'}
              step="0.000001"
              min="0"
              className="w-full px-4 py-3 bg-dark-border border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-aster font-mono"
            />
          </div>

          {/* Trade Preview */}
          {tradeForm.amount && parseFloat(tradeForm.amount) > 0 && (
            <div className="bg-dark-border/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Trade Preview</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">
                  {tradeForm.type === 'buy' ? 'You will receive:' : 'You will get:'}
                </span>
                <span className="text-white font-mono">
                  {tradeForm.type === 'buy' 
                    ? `${formatNumber(tradeAmount.tokens)} ${token.ticker}`
                    : `${formatNumber(tradeAmount.sol)} SOL`
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-300">Fee (1%):</span>
                <span className="text-gray-400 font-mono">
                  {tradeForm.type === 'buy' 
                    ? `${(parseFloat(tradeForm.amount) * 0.01).toFixed(6)} SOL`
                    : `${(tradeAmount.sol * 0.01).toFixed(6)} SOL`
                  }
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !tradeForm.amount || parseFloat(tradeForm.amount) <= 0}
            className={cn(
              "w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2",
              isLoading || !tradeForm.amount || parseFloat(tradeForm.amount) <= 0
                ? "bg-gray-600 cursor-not-allowed"
                : tradeForm.type === 'buy'
                ? "bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 transform hover:scale-105 active:scale-95"
                : "bg-gradient-to-r from-danger to-danger/80 hover:from-danger/90 hover:to-danger/70 transform hover:scale-105 active:scale-95"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>
                  {tradeForm.type === 'buy' ? 'Pump it!' : 'Dump it!'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TradingView;