import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateCoin from './pages/CreateCoin';
import TradingView from './pages/TradingView';
import Portfolio from './pages/Portfolio';
import './App.css';

function App() {
  return (
    <WalletProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-primary">
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/create" element={<CreateCoin />} />
                <Route path="/coin/:ticker" element={<TradingView />} />
                <Route path="/portfolio" element={<Portfolio />} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </DataProvider>
    </WalletProvider>
  );
}

export default App;