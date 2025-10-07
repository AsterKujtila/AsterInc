'use client';

import { useState, useEffect } from 'react';
import TokenCard from '@/components/TokenCard';
import { mockTokens } from '@/lib/mockData';
import { Token } from '@/types';

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>(mockTokens);
  const [sortBy, setSortBy] = useState<'marketCap' | 'change' | 'created'>('marketCap');

  // Simulate real-time updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prevTokens => 
        prevTokens.map(token => ({
          ...token,
          change24h: token.change24h + (Math.random() - 0.5) * 10,
          currentMarketCap: token.currentMarketCap * (1 + (Math.random() - 0.5) * 0.05),
          price: token.price * (1 + (Math.random() - 0.5) * 0.05),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const sortedTokens = [...tokens].sort((a, b) => {
    switch (sortBy) {
      case 'marketCap':
        return b.currentMarketCap - a.currentMarketCap;
      case 'change':
        return b.change24h - a.change24h;
      case 'created':
        return b.createdAt.getTime() - a.createdAt.getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-background-tertiary bg-background-secondary sticky top-0 z-10">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Active Tokens</span>
          </h1>
          <p className="text-text-secondary">
            Discover and trade the hottest meme coins on Solana
          </p>
        </div>

        {/* Filters */}
        <div className="px-8 pb-4 flex items-center gap-4">
          <span className="text-sm text-text-secondary">Sort by:</span>
          <div className="flex gap-2">
            {[
              { key: 'marketCap', label: 'Market Cap' },
              { key: 'change', label: '24h Change' },
              { key: 'created', label: 'Recently Created' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === key
                    ? 'bg-aster-primary text-white'
                    : 'bg-background-tertiary text-text-secondary hover:bg-background-tertiary/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Token Grid */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTokens.map(token => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>

        {tokens.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg">No tokens found</p>
          </div>
        )}
      </div>
    </div>
  );
}