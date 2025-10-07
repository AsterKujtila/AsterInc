'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getTokenByTicker } from '@/lib/mockData';
import { Token } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TokenPage() {
  const params = useParams();
  const ticker = params.ticker as string;
  const [token, setToken] = useState<Token | null>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    const foundToken = getTokenByTicker(ticker);
    setToken(foundToken || null);
  }, [ticker]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary text-lg">Token not found</p>
      </div>
    );
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const handleTrade = () => {
    console.log(`${tradeType} ${tradeAmount} ${tradeType === 'buy' ? 'SOL' : token.ticker}`);
    setTradeAmount('');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-background-tertiary bg-background-secondary">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-aster-primary to-aster-secondary rounded-full flex items-center justify-center text-3xl font-bold">
              {token.ticker[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{token.name}</h1>
              <p className="text-text-secondary">${token.ticker}</p>
            </div>
          </div>
          <p className="text-text-secondary max-w-2xl">{token.description}</p>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Chart & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background-secondary border border-background-tertiary rounded-lg p-4">
              <p className="text-xs text-text-secondary mb-1">Market Cap</p>
              <p className="text-xl font-bold text-text-primary">{formatMarketCap(token.currentMarketCap)}</p>
            </div>
            <div className="bg-background-secondary border border-background-tertiary rounded-lg p-4">
              <p className="text-xs text-text-secondary mb-1">24h Change</p>
              <p className={`text-xl font-bold ${token.change24h >= 0 ? 'text-pump-green' : 'text-dump-red'}`}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%
              </p>
            </div>
            <div className="bg-background-secondary border border-background-tertiary rounded-lg p-4">
              <p className="text-xs text-text-secondary mb-1">Holders</p>
              <p className="text-xl font-bold text-text-primary">{token.holderCount}</p>
            </div>
            <div className="bg-background-secondary border border-background-tertiary rounded-lg p-4">
              <p className="text-xs text-text-secondary mb-1">Volume 24h</p>
              <p className="text-xl font-bold text-text-primary">{formatMarketCap(token.volume24h)}</p>
            </div>
          </div>

          {/* Bonding Curve Chart */}
          <div className="bg-background-secondary border border-background-tertiary rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Bonding Curve</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={token.priceHistory}>
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    stroke="#a0a0a0"
                  />
                  <YAxis 
                    tickFormatter={(val) => `$${(val * 1000).toFixed(2)}`}
                    stroke="#a0a0a0"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #252525' }}
                    labelFormatter={(ts) => new Date(ts).toLocaleString()}
                    formatter={(value: any) => [`$${(value * 1000).toFixed(4)}`, 'Price']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#6E56F8" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graduation Progress */}
          <div className="bg-background-secondary border border-background-tertiary rounded-lg p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Graduation to DEX</h2>
              <span className="text-2xl font-bold text-aster-primary">{token.graduationProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full h-4 bg-background-tertiary rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-aster-primary to-aster-secondary transition-all duration-500"
                style={{ width: `${token.graduationProgress}%` }}
              />
            </div>
            <p className="text-sm text-text-secondary">
              {formatMarketCap(token.currentMarketCap)} / $69K market cap required for DEX graduation
            </p>
          </div>

          {/* Recent Trades */}
          <div className="bg-background-secondary border border-background-tertiary rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
            <div className="space-y-2">
              {token.trades.slice(0, 10).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between py-2 border-b border-background-tertiary">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      trade.type === 'buy' ? 'bg-pump-green/20 text-pump-green' : 'bg-dump-red/20 text-dump-red'
                    }`}>
                      {trade.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-text-secondary">{trade.wallet}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">{trade.amount.toFixed(2)} {token.ticker}</p>
                    <p className="text-xs text-text-secondary">{trade.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Trading Panel */}
        <div className="lg:col-span-1">
          <div className="bg-background-secondary border border-background-tertiary rounded-lg p-6 sticky top-8">
            <h2 className="text-2xl font-bold mb-6">Trade {token.ticker}</h2>

            {/* Buy/Sell Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setTradeType('buy')}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  tradeType === 'buy'
                    ? 'bg-pump-green text-white'
                    : 'bg-background-tertiary text-text-secondary'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setTradeType('sell')}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  tradeType === 'sell'
                    ? 'bg-dump-red text-white'
                    : 'bg-background-tertiary text-text-secondary'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Amount ({tradeType === 'buy' ? 'SOL' : token.ticker})
              </label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                placeholder="0.0"
                step="0.01"
                className="w-full px-4 py-3 bg-background-tertiary border border-background-tertiary rounded-lg text-text-primary text-lg focus:outline-none focus:border-aster-primary"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[0.1, 0.5, 1, 5].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTradeAmount(amount.toString())}
                  className="py-2 bg-background-tertiary hover:bg-background-tertiary/80 rounded-lg text-sm font-medium text-text-primary transition-colors"
                >
                  {amount}
                </button>
              ))}
            </div>

            {/* Estimated Output */}
            {tradeAmount && (
              <div className="bg-background-tertiary rounded-lg p-4 mb-6">
                <p className="text-xs text-text-secondary mb-1">You will receive (estimated)</p>
                <p className="text-xl font-bold text-text-primary">
                  {tradeType === 'buy' 
                    ? `~${(parseFloat(tradeAmount) / token.price).toFixed(2)} ${token.ticker}`
                    : `~${(parseFloat(tradeAmount) * token.price).toFixed(4)} SOL`
                  }
                </p>
              </div>
            )}

            {/* Trade Button */}
            <button
              onClick={handleTrade}
              disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                tradeAmount && parseFloat(tradeAmount) > 0
                  ? tradeType === 'buy'
                    ? 'bg-pump-green hover:bg-pump-green/90 text-white pulse-glow'
                    : 'bg-dump-red hover:bg-dump-red/90 text-white pulse-glow'
                  : 'bg-background-tertiary text-text-secondary cursor-not-allowed'
              }`}
            >
              {tradeType === 'buy' ? '🚀 Pump it!' : '📉 Dump it!'}
            </button>

            <p className="text-xs text-text-secondary text-center mt-4">
              Trading fee: 1% (0.5% to liquidity, 0.5% to platform)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}