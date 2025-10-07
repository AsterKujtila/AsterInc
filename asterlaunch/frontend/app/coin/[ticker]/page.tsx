import { TradePanel } from '@/components/TradePanel'
import { ChartPanel } from '@/components/ChartPanel'
import { notFound } from 'next/navigation'

export default function CoinPage({ params }: { params: { ticker: string } }) {
  const ticker = params.ticker?.toUpperCase()
  if (!ticker || ticker.length > 5) return notFound()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{ticker}</h1>
        <span className="text-sm text-muted">Bonding Curve</span>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-bg-elev rounded p-3 border border-white/5">
          <ChartPanel ticker={ticker} />
        </div>
        <div className="bg-bg-elev rounded p-3 border border-white/5">
          <TradePanel ticker={ticker} />
        </div>
      </div>
    </div>
  )
}
