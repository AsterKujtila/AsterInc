'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Sidebar = () => {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Active Tokens', href: '/', icon: '🔥' },
    { name: 'Create Coin', href: '/create', icon: '✨' },
    { name: 'My Portfolio', href: '/portfolio', icon: '💼' },
  ];

  return (
    <div className="w-64 h-screen bg-background-secondary border-r border-background-tertiary flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-background-tertiary">
        <h1 className="text-2xl font-bold gradient-text">AsterLaunch</h1>
        <p className="text-xs text-text-secondary mt-1">Meme Coin Launchpad</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-aster-primary text-white font-semibold' 
                  : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'}
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Wallet Connection */}
      <div className="p-4 border-t border-background-tertiary">
        <WalletMultiButton className="w-full !bg-aster-primary hover:!bg-aster-secondary !rounded-lg !py-3" />
        
        <div className="mt-4 p-3 bg-background-tertiary rounded-lg">
          <p className="text-xs text-text-secondary mb-2">Platform Stats</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Total Volume</span>
              <span className="text-text-primary font-semibold">$2.4M</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Active Tokens</span>
              <span className="text-text-primary font-semibold">142</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;