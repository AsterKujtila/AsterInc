'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Portfolio() {
  const { connected, publicKey } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👛</div>
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-text-secondary">
            Please connect your wallet to view your portfolio
          </p>
        </div>
      </div>
    );
  }

  // Mock portfolio data
  const holdings = [
    { ticker: 'PEPA', name: 'Pepe Aster', amount: 12500, value: 562.5, change: 125.5 },
    { ticker: 'SHMN', name: 'Shiba Moon', amount: 8900, value: 516.2, change: 89.3 },
  ];

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          <span className="gradient-text">My Portfolio</span>
        </h1>

        {/* Portfolio Summary */}
        <div className="bg-background-secondary border border-background-tertiary rounded-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-text-secondary mb-2">Total Value</p>
              <p className="text-4xl font-bold text-text-primary">${totalValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-2">Wallet Address</p>
              <p className="text-sm font-mono text-text-primary">
                {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-2">Holdings</p>
              <p className="text-2xl font-bold text-text-primary">{holdings.length} Tokens</p>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-background-secondary border border-background-tertiary rounded-xl overflow-hidden">
          <div className="p-6 border-b border-background-tertiary">
            <h2 className="text-xl font-bold">Your Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-tertiary">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Token</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-text-secondary">Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-text-secondary">Value</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-text-secondary">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr key={holding.ticker} className="border-t border-background-tertiary hover:bg-background-tertiary/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-text-primary">{holding.name}</p>
                        <p className="text-sm text-text-secondary">${holding.ticker}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-text-primary font-semibold">
                      {holding.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-text-primary font-semibold">
                      ${holding.value.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${holding.change >= 0 ? 'text-pump-green' : 'text-dump-red'}`}>
                        {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}