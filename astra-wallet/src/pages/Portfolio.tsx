import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useData } from '../contexts/DataContext';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  ExternalLink 
} from 'lucide-react';

const Portfolio: React.FC = () => {
  const { connected, publicKey, balance } = useWallet();
  const { tokens } = useData();

  // Mock portfolio data - in a real app, this would come from the blockchain
  const portfolioTokens = tokens.slice(0, 5).map((token, index) => ({
    ...token,
    balance: Math.random() * 10000 + 100,
    value: (Math.random() * 10000 + 100) * token.price,
    pnl: (Math.random() - 0.5) * 1000,
    pnlPercent: (Math.random() - 0.5) * 200
  }));

  const totalPortfolioValue = portfolioTokens.reduce((sum, token) => sum + token.value, 0);
  const totalPnL = portfolioTokens.reduce((sum, token) => sum + token.pnl, 0);
  const totalPnLPercent = totalPortfolioValue > 0 ? (totalPnL / totalPortfolioValue) * 100 : 0;

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(2)}M`;
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(1)}K`;
    } else {
      return balance.toFixed(0);
    }
  };

  const formatPnL = (pnl: number, percent: number) => {
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}${formatValue(pnl)} (${sign}${percent.toFixed(1)}%)`;
  };

  const getPnLColor = (pnl: number) => {
    return pnl >= 0 ? 'text-green' : 'text-red';
  };

  const getPnLIcon = (pnl: number) => {
    return pnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  if (!connected) {
    return (
      <div className="text-center py-2xl">
        <Wallet size={64} className="mx-auto mb-lg text-muted" />
        <h2 className="mb-md">Connect Your Wallet</h2>
        <p className="text-muted mb-lg">
          Connect your wallet to view your portfolio and trading history.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Portfolio Header */}
      <div className="mb-xl">
        <h1 className="mb-md">My Portfolio</h1>
        <div className="flex items-center gap-md text-muted">
          <span>Wallet: {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}</span>
          <span>•</span>
          <span>SOL Balance: {balance.toFixed(4)}</span>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        <div className="card">
          <div className="stat-label">Total Portfolio Value</div>
          <div className="stat-value">{formatValue(totalPortfolioValue)}</div>
          <div className={`stat-change flex items-center gap-xs ${getPnLColor(totalPnL)}`}>
            {getPnLIcon(totalPnL)}
            {formatPnL(totalPnL, totalPnLPercent)}
          </div>
        </div>

        <div className="card">
          <div className="stat-label">SOL Balance</div>
          <div className="stat-value">{balance.toFixed(4)} SOL</div>
          <div className="stat-change text-muted">
            ~{formatValue(balance * 180)} {/* Assuming 1 SOL = $180 */}
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Active Positions</div>
          <div className="stat-value">{portfolioTokens.length}</div>
          <div className="stat-change text-green">
            +2 this week
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card mb-xl">
        <div className="flex justify-between items-center mb-lg">
          <h3>Token Holdings</h3>
          <Link to="/create" className="btn btn-primary btn-sm">
            <Plus size={16} />
            Create Token
          </Link>
        </div>

        {portfolioTokens.length === 0 ? (
          <div className="text-center py-xl">
            <p className="text-muted mb-lg">No token holdings found.</p>
            <Link to="/" className="btn btn-secondary">
              Browse Tokens
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th className="text-right">Balance</th>
                  <th className="text-right">Value</th>
                  <th className="text-right">PnL</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolioTokens.map((token) => (
                  <tr key={token.id}>
                    <td>
                      <div className="flex items-center gap-md">
                        <div className="token-image" style={{ width: '32px', height: '32px' }}>
                          {token.ticker.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{token.name}</div>
                          <div className="text-sm text-muted">${token.ticker}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <div>{formatBalance(token.balance)}</div>
                      <div className="text-sm text-muted">
                        ${(token.price * 1000000).toFixed(6)}
                      </div>
                    </td>
                    <td className="text-right font-medium">
                      {formatValue(token.value)}
                    </td>
                    <td className={`text-right ${getPnLColor(token.pnl)}`}>
                      <div className="flex items-center justify-end gap-xs">
                        {getPnLIcon(token.pnl)}
                        <div>
                          <div>{formatPnL(token.pnl, token.pnlPercent)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-sm">
                        <Link 
                          to={`/coin/${token.ticker}`}
                          className="btn btn-secondary btn-sm"
                        >
                          Trade
                        </Link>
                        <button className="btn btn-secondary btn-sm">
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="mb-lg">Recent Activity</h3>
        <div className="space-y-md">
          {[
            { type: 'buy', token: 'PEPE', amount: '1,000', value: '$45.67', time: '2 hours ago' },
            { type: 'sell', token: 'DOGE2', amount: '500', value: '$23.45', time: '5 hours ago' },
            { type: 'create', token: 'MOON', amount: '1,000,000', value: '$0.02', time: '1 day ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-md bg-tertiary rounded-md">
              <div className="flex items-center gap-md">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  activity.type === 'buy' ? 'bg-green text-primary' :
                  activity.type === 'sell' ? 'bg-red text-white' :
                  'bg-accent-primary text-white'
                }`}>
                  {activity.type === 'buy' ? '↗' : activity.type === 'sell' ? '↘' : '+'}
                </div>
                <div>
                  <div className="font-medium">
                    {activity.type === 'buy' ? 'Bought' : 
                     activity.type === 'sell' ? 'Sold' : 'Created'} {activity.token}
                  </div>
                  <div className="text-sm text-muted">
                    {activity.amount} tokens • {activity.value}
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-lg">
          <button className="btn btn-secondary">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;