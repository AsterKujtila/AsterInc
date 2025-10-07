import { NextRequest, NextResponse } from 'next/server'

let TOKENS = [
  { name: 'Aster Coin', ticker: 'ASTER', marketCapUsd: 125000, change24h: 12.5, progress: Math.min(100, (125000 / 69000) * 100) },
  { name: 'Meme X', ticker: 'MEMEX', marketCapUsd: 54000, change24h: -3.12, progress: Math.min(100, (54000 / 69000) * 100) },
]

export async function GET() {
  return NextResponse.json({ tokens: TOKENS })
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const name = String(form.get('name') || '')
  const ticker = String(form.get('ticker') || '').toUpperCase().slice(0,5)
  const desc = String(form.get('desc') || '')
  if (!name || !ticker) return NextResponse.json({ ok: false }, { status: 400 })

  const item = { name, ticker, marketCapUsd: 0, change24h: 0, progress: 0 }
  TOKENS = [item, ...TOKENS.filter(t => t.ticker !== ticker)]
  return NextResponse.json({ ok: true, ticker })
}
