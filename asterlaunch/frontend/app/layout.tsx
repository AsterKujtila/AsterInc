import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { SolanaWalletProvider } from '@/components/WalletProvider'

export const metadata: Metadata = {
  title: 'AsterLaunch',
  description: 'Meme coin launchpad on Solana',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-text">
        <SolanaWalletProvider>
        <div className="min-h-screen grid grid-cols-[240px,1fr,420px] max-xl:grid-cols-[240px,1fr] max-lg:grid-cols-1">
          <aside className="hidden lg:block border-r border-white/5 bg-bg-elev">
            <nav className="p-4 space-y-2">
              <div className="text-2xl font-bold text-aster">AsterLaunch</div>
              <a className="block px-3 py-2 rounded hover:bg-white/5" href="/create">Create Coin</a>
              <a className="block px-3 py-2 rounded hover:bg-white/5" href="/">Active Tokens</a>
              <a className="block px-3 py-2 rounded hover:bg-white/5" href="#">My Portfolio</a>
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
              <a href="#" className="w-full inline-flex items-center justify-center bg-aster hover:shadow-glow transition text-white font-medium px-4 py-2 rounded">Connect Wallet</a>
            </div>
          </aside>
          <main className="min-h-screen border-r border-white/5">{children}</main>
          <section id="panel" className="hidden xl:block bg-bg-elev min-h-screen"></section>
        </div>
        </SolanaWalletProvider>
      </body>
    </html>
  )
}
