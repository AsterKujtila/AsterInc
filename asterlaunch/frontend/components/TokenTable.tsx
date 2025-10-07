"use client"
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type TokenRow = {
  name: string
  ticker: string
  marketCapUsd: number
  change24h: number
  progress: number // 0..100
}

export function TokenTable() {
  const [rows, setRows] = useState<TokenRow[]>([])

  useEffect(() => {
    let timer: any
    const load = async () => {
      try {
        const res = await fetch('/api/tokens', { cache: 'no-store' })
        const data = await res.json()
        setRows(data.tokens || [])
      } catch (e) {
        // noop
      }
      timer = setTimeout(load, 4000)
    }
    load()
    return () => timer && clearTimeout(timer)
  }, [])

  const header = useMemo(() => (
    <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr] px-3 py-2 text-sm text-muted sticky top-0 bg-bg z-10 border-b border-white/5">
      <div>Coin</div>
      <div>Ticker</div>
      <div className="text-right">Market Cap (USD)</div>
      <div className="text-right">24H</div>
      <div className="text-right">Graduation</div>
    </div>
  ), [])

  return (
    <div className="bg-bg-elev rounded border border-white/5 overflow-hidden">
      {header}
      <div className="divide-y divide-white/5 max-h-[70vh] overflow-auto">
        {rows.map((r) => (
          <Link href={`/coin/${r.ticker}`} key={r.ticker} className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr] px-3 py-3 hover:bg-white/5">
            <div className="truncate">{r.name}</div>
            <div className="font-mono">{r.ticker}</div>
            <div className="text-right tabular-nums">${r.marketCapUsd.toLocaleString()}</div>
            <div className={`text-right tabular-nums ${r.change24h >= 0 ? 'text-up' : 'text-down'}`}>{r.change24h.toFixed(2)}%</div>
            <div className="text-right">
              <div className="inline-block w-28 h-2 bg-black/40 rounded">
                <div className="h-2 bg-aster rounded" style={{ width: `${Math.min(100, Math.max(0, r.progress))}%` }} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
