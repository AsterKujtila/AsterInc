import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { tokens, loading, refreshTokens } = useData();

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`;
    } else {
      return `$${marketCap.toFixed(0)}`;
    }
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const formatProgress = (progress: number) => {
    return `${progress.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green' : 'text-red';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  const totalMarketCap = tokens.reduce((sum, token) => sum + token.marketCap, 0);
  const avgChange = tokens.length > 0 
    ? tokens.reduce((sum, token) => sum + token.change24h, 0) / tokens.length 
    : 0;
  const graduatedTokens = tokens.filter(token => token.graduationProgress >= 100).length;

  return (
    <div>
      {/* Platform Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Market Cap</div>
          <div className="stat-value">{formatMarketCap(totalMarketCap)}</div>
          <div className={`stat-change ${getChangeColor(avgChange)}`}>
            {formatChange(avgChange)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Tokens</div>
          <div className="stat-value">{tokens.length}</div>
          <div className="stat-change text-green">+12 today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Graduated</div>
          <div className="stat-value">{graduatedTokens}</div>
          <div className="stat-change text-green">+3 today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">24h Volume</div>
          <div className="stat-value">$2.4M</div>
          <div className="stat-change text-green">+15.2%</div>
        </div>
      </div>

      {/* Token List */}
      <div className="token-table-container">
        <div className="token-table-header">
          <h2 className="token-table-title">Live Tokens</h2>
          <button 
            onClick={refreshTokens}
            className="refresh-button"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="p-lg text-center">
            <div className="animate-pulse text-muted">Loading tokens...</div>
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div className="token-row" style={{ borderBottom: '2px solid var(--border)' }}>
              <div></div>
              <div className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                TOKEN
              </div>
              <div className="text-muted text-right" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                MARKET CAP
              </div>
              <div className="text-muted text-center" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                24H
              </div>
              <div className="text-muted text-right" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                PROGRESS
              </div>
            </div>

            {/* Token Rows */}
            {tokens.map((token) => (
              <Link 
                key={token.id} 
                to={`/coin/${token.ticker}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="token-row">
                  <div className="token-image">
                    {token.ticker.charAt(0)}
                  </div>
                  
                  <div className="token-info">
                    <div className="token-name">{token.name}</div>
                    <div className="token-ticker">${token.ticker}</div>
                  </div>
                  
                  <div className="token-market-cap text-right">
                    {formatMarketCap(token.marketCap)}
                  </div>
                  
                  <div className={`flex items-center justify-center gap-xs ${getChangeColor(token.change24h)}`}>
                    {getChangeIcon(token.change24h)}
                    {formatChange(token.change24h)}
                  </div>
                  
                  <div className="token-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${Math.min(token.graduationProgress, 100)}%` }}
                      />
                    </div>
                    <div className="progress-text">
                      {formatProgress(token.graduationProgress)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;