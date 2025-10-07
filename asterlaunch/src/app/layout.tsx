import type { Metadata } from "next";
import "./globals.css";
import WalletContextProvider from "@/components/WalletProvider";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AsterLaunch - Meme Coin Launchpad",
  description: "The fastest way to launch your meme coin on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="ml-64 flex-1">
              {children}
            </main>
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}