import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { Token } from '../types';
import { cn } from '../utils/cn';

interface TokenListProps {
  tokens: Token[];
  onTokenSelect: (token: Token) => void;
  selectedToken: Token | null;
}

const TokenList: React.FC<TokenListProps> = ({ tokens, onTokenSelect, selectedToken }) => {
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

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Active Tokens</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Live updates</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-border/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Token
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Market Cap
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                24h Change
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {tokens.map((token) => (
              <tr
                key={token.id}
                onClick={() => onTokenSelect(token)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-dark-border/30",
                  selectedToken?.id === token.id && "bg-aster/10"
                )}
              >
                {/* Token Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-aster to-success flex items-center justify-center text-white font-bold text-sm">
                      {token.ticker.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-white">
                          {token.name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {token.ticker}
                        </div>
                        {token.isGraduated && (
                          <div className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                            Graduated
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-32">
                        {token.description}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-mono text-white">
                    ${formatPrice(token.price)}
                  </div>
                </td>

                {/* Market Cap */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-mono text-white">
                    ${formatNumber(token.marketCap)}
                  </div>
                </td>

                {/* 24h Change */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
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
                </td>

                {/* Graduation Progress */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <div className="w-16 bg-dark-border rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          token.graduationProgress >= 100 
                            ? "bg-success" 
                            : "bg-gradient-to-r from-aster to-success"
                        )}
                        style={{ width: `${Math.min(token.graduationProgress, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {token.graduationProgress.toFixed(1)}%
                    </span>
                  </div>
                </td>

                {/* Time */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-xs text-gray-400">
                    {getTimeAgo(token.createdAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-dark-border bg-dark-border/20">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{tokens.length} tokens</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>Total: ${formatNumber(tokens.reduce((sum, token) => sum + token.marketCap, 0))}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-aster">
            <ArrowUpRight className="w-4 h-4" />
            <span>Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenList;