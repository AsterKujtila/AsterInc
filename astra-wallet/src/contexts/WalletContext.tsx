import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock wallet address
      const mockAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
      const mockBalance = Math.random() * 10 + 1; // 1-11 SOL
      
      setPublicKey(mockAddress);
      setBalance(mockBalance);
      setConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setPublicKey(null);
    setBalance(0);
  }, []);

  const value: WalletContextType = {
    connected,
    connecting,
    publicKey,
    balance,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};