import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Coins, 
  TrendingUp, 
  Portfolio, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
  activeView: 'create' | 'tokens' | 'portfolio' | 'trading';
  onViewChange: (view: 'create' | 'tokens' | 'portfolio' | 'trading') => void;
  selectedToken?: string | null;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  onViewChange, 
  selectedToken 
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigationItems = [
    { id: 'create', label: 'Create Coin', icon: Coins },
    { id: 'tokens', label: 'Active Tokens', icon: TrendingUp },
    { id: 'portfolio', label: 'My Portfolio', icon: Portfolio },
  ] as const;

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-dark-surface border-r border-dark-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-dark-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-aster to-success rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AsterLaunch</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-dark-border"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                    isActive 
                      ? "bg-aster text-white" 
                      : "text-gray-300 hover:bg-dark-border hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 px-4">
            <div className="p-4 bg-dark-border rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Wallet Status</div>
              <WalletMultiButton className="w-full" />
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-dark-surface border-b border-dark-border">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-border"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              {selectedToken && (
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
                  <span>Active:</span>
                  <span className="text-aster font-mono">{selectedToken}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;