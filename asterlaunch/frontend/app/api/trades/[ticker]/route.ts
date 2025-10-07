import { NextRequest, NextResponse } from 'next/server'

// Very simple per-ticker in-memory data
const store = new Map<string, { price: number, history: { t: number, v: number }[] }>()

function ensure(ticker: string) {
  let s = store.get(ticker)
  if (!s) {
    const now = Math.floor(Date.now() / 1000)
    const base = Math.random() * 0.01 + 0.002
    s = { price: base, history: Array.from({ length: 30 }, (_, i) => ({ t: now - (30 - i) * 60, v: base })) }
    store.set(ticker, s)
  }
  return s
}

export async function GET(_: NextRequest, { params }: { params: { ticker: string } }) {
  const s = ensure(params.ticker.toUpperCase())
  // Simulate small random walk
  const last = s.history[s.history.length - 1]?.v ?? s.price
  const next = Math.max(0.0001, last + (Math.random() - 0.5) * 0.0002)
  const t = Math.floor(Date.now() / 1000)
  s.price = next
  s.history.push({ t, v: next })
  if (s.history.length > 120) s.history.shift()
  return NextResponse.json({ price: s.price, history: s.history })
}
