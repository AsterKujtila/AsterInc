'use client';

import Link from 'next/link';
import { Token } from '@/types';

interface TokenCardProps {
  token: Token;
}

const TokenCard = ({ token }: TokenCardProps) => {
  const formatMarketCap = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatChange = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <Link href={`/coin/${token.ticker}`}>
      <div className="bg-background-secondary hover:bg-background-tertiary border border-background-tertiary hover:border-aster-primary rounded-lg p-4 transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-aster-primary to-aster-secondary rounded-full flex items-center justify-center text-2xl">
              {token.ticker[0]}
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">{token.name}</h3>
              <p className="text-sm text-text-secondary">${token.ticker}</p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            token.change24h >= 0 
              ? 'bg-pump-green/20 text-pump-green' 
              : 'bg-dump-red/20 text-dump-red'
          }`}>
            {formatChange(token.change24h)}
          </div>
        </div>

        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
          {token.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-text-secondary mb-1">Market Cap</p>
            <p className="text-sm font-bold text-text-primary">{formatMarketCap(token.currentMarketCap)}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">Holders</p>
            <p className="text-sm font-bold text-text-primary">{token.holderCount}</p>
          </div>
        </div>

        {/* Graduation Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-text-secondary">Graduation Progress</p>
            <p className="text-xs font-semibold text-aster-primary">{token.graduationProgress.toFixed(1)}%</p>
          </div>
          <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-aster-primary to-aster-secondary transition-all duration-500"
              style={{ width: `${token.graduationProgress}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {formatMarketCap(token.currentMarketCap)} / $69K
          </p>
        </div>
      </div>
    </Link>
  );
};

export default TokenCard;