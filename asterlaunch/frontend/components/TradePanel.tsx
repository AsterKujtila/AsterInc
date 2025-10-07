"use client"
import { useEffect, useState } from 'react'

export function TradePanel({ ticker }: { ticker: string }) {
  const [price, setPrice] = useState<number>(0)
  const [solIn, setSolIn] = useState('')
  const [tokenIn, setTokenIn] = useState('')

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/trades/${ticker}`)
      const data = await res.json()
      setPrice(data?.price || 0)
    }
    load()
    const id = setInterval(load, 5000)
    return () => clearInterval(id)
  }, [ticker])

  const buy = async () => {
    alert(`Buying with ${solIn} SOL on ${ticker}`)
  }
  const sell = async () => {
    alert(`Selling ${tokenIn} tokens on ${ticker}`)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-black/30 rounded p-2">Price: <span className="font-mono">{price.toFixed(6)} SOL</span></div>
        <div className="bg-black/30 rounded p-2">Fee: <span className="font-mono">1% (0.5% liq, 0.5% treasury)</span></div>
      </div>
      <div className="bg-black/30 rounded p-3 space-y-2">
        <div className="text-sm text-muted">Buy</div>
        <input value={solIn} onChange={e=>setSolIn(e.target.value)} placeholder="SOL amount" className="w-full bg-black/40 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-aster" />
        <button onClick={buy} className="w-full bg-aster text-white rounded px-4 py-2">Pump it! (Buy)</button>
      </div>
      <div className="bg-black/30 rounded p-3 space-y-2">
        <div className="text-sm text-muted">Sell</div>
        <input value={tokenIn} onChange={e=>setTokenIn(e.target.value)} placeholder="Token amount" className="w-full bg-black/40 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-aster" />
        <button onClick={sell} className="w-full bg-down/90 hover:bg-down text-white rounded px-4 py-2">Dump it! (Sell)</button>
      </div>
    </div>
  )
}
