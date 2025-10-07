import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { 
  Home, 
  Plus, 
  TrendingUp, 
  Wallet, 
  RefreshCw,
  Zap
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { connected, connecting, publicKey, balance, connect, disconnect } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: number) => {
    return `${balance.toFixed(2)} SOL`;
  };

  const navItems = [
    { path: '/', label: 'Active Tokens', icon: Home },
    { path: '/create', label: 'Create Coin', icon: Plus },
    { path: '/portfolio', label: 'My Portfolio', icon: TrendingUp },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar - Navigation */}
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">
            <Zap size={20} />
          </div>
          AsterLaunch
        </div>

        <nav>
          <ul className="nav-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path} className="nav-item">
                  <Link 
                    to={item.path} 
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="nav-icon" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="wallet-section">
          {connected ? (
            <div>
              <button 
                onClick={disconnect}
                className="wallet-button wallet-connected"
              >
                <Wallet size={20} />
                <div>
                  <div>{formatAddress(publicKey!)}</div>
                  <div className="wallet-address">{formatBalance(balance)}</div>
                </div>
              </button>
            </div>
          ) : (
            <button 
              onClick={connect}
              disabled={connecting}
              className="wallet-button"
            >
              <Wallet size={20} />
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {children}
      </div>

      {/* Interaction Panel */}
      <div className="interaction-panel">
        <InteractionPanel />
      </div>
    </div>
  );
};

const InteractionPanel: React.FC = () => {
  const location = useLocation();
  const { connected } = useWallet();

  if (location.pathname === '/create') {
    return <CreateTokenPanel />;
  }

  if (location.pathname.startsWith('/coin/')) {
    return <TradingPanel />;
  }

  return <DefaultPanel />;
};

const DefaultPanel: React.FC = () => {
  return (
    <div>
      <h3 className="mb-lg">Quick Actions</h3>
      <div className="flex flex-col gap-md">
        <Link to="/create" className="btn btn-primary btn-lg">
          <Plus size={20} />
          Launch New Coin
        </Link>
        <div className="card">
          <h4 className="mb-md">Platform Stats</h4>
          <div className="flex flex-col gap-sm">
            <div className="flex justify-between">
              <span className="text-muted">Total Coins:</span>
              <span>1,234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">24h Volume:</span>
              <span className="text-green">$2.4M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Graduated:</span>
              <span>89</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateTokenPanel: React.FC = () => {
  return (
    <div>
      <h3 className="mb-lg">Launch Requirements</h3>
      <div className="card">
        <div className="flex flex-col gap-md">
          <div className="flex justify-between">
            <span>Launch Fee:</span>
            <span className="text-green">0.02 SOL</span>
          </div>
          <div className="flex justify-between">
            <span>Initial Liquidity:</span>
            <span>Auto-generated</span>
          </div>
          <div className="flex justify-between">
            <span>Graduation Target:</span>
            <span>$69,000 Market Cap</span>
          </div>
        </div>
      </div>
      
      <div className="card mt-lg">
        <h4 className="mb-md">Bonding Curve Info</h4>
        <p className="text-muted text-sm">
          Your token will trade on a bonding curve until it reaches $69K market cap, 
          then liquidity will be automatically deposited to Raydium and LP tokens burned.
        </p>
      </div>
    </div>
  );
};

const TradingPanel: React.FC = () => {
  const { connected } = useWallet();
  
  return (
    <div>
      <h3 className="mb-lg">Trade Token</h3>
      {connected ? (
        <TradingForm />
      ) : (
        <div className="card text-center">
          <p className="text-muted mb-md">Connect your wallet to start trading</p>
          <button className="btn btn-primary">Connect Wallet</button>
        </div>
      )}
    </div>
  );
};

const TradingForm: React.FC = () => {
  const [amount, setAmount] = React.useState('');
  const [isBuying, setIsBuying] = React.useState(true);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex gap-sm">
        <button 
          onClick={() => setIsBuying(true)}
          className={`btn flex-1 ${isBuying ? 'btn-success' : 'btn-secondary'}`}
        >
          Buy
        </button>
        <button 
          onClick={() => setIsBuying(false)}
          className={`btn flex-1 ${!isBuying ? 'btn-danger' : 'btn-secondary'}`}
        >
          Sell
        </button>
      </div>

      <div>
        <label className="block text-sm text-muted mb-sm">
          Amount ({isBuying ? 'SOL' : 'Tokens'})
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={isBuying ? '0.1' : '1000'}
          className="input"
        />
      </div>

      <div className="card">
        <div className="flex justify-between mb-sm">
          <span className="text-muted">You'll receive:</span>
          <span>~1,234 tokens</span>
        </div>
        <div className="flex justify-between mb-sm">
          <span className="text-muted">Price impact:</span>
          <span className="text-green">0.5%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Fee:</span>
          <span>1%</span>
        </div>
      </div>

      <button className={`btn btn-lg ${isBuying ? 'btn-success' : 'btn-danger'}`}>
        {isBuying ? '🚀 Pump it!' : '📉 Dump it!'}
      </button>
    </div>
  );
};

export default Layout;