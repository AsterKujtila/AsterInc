import { RainbowKitProvider, ConnectButton, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { sepolia } from 'wagmi/chains'
import AccountOverview from './components/AccountOverview'
import AISecurityScanner from './components/AISecurityScanner'

const config = getDefaultConfig({
  appName: 'ASTRA Wallet',
  projectId: 'ASTRA-DEMO',
  chains: [sepolia],
  ssr: false,
  transports: {
    [sepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: '#8b5cf6' })}>
          <div className="min-h-screen bg-slate-900 text-slate-100">
            <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
              <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">ASTRA Wallet</h1>
                <ConnectButton />
              </header>

              <main className="space-y-8">
                <AccountOverview />
                <AISecurityScanner />
              </main>
            </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
