"use client"
import { useEffect, useRef } from 'react'
import { createChart, ISeriesApi } from 'lightweight-charts'

export function ChartPanel({ ticker }: { ticker: string }) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = createChart(ref.current, { layout: { background: { color: '#18181B' }, textColor: '#EDEDED' }, grid: { vertLines: { color: 'rgba(255,255,255,0.04)' }, horzLines: { color: 'rgba(255,255,255,0.04)' } }, rightPriceScale: { borderVisible: false }, timeScale: { borderVisible: false } })
    const series: ISeriesApi<'Line'> = chart.addLineSeries({ color: '#6E56F8' })

    let timer: any
    const load = async () => {
      try {
        const res = await fetch(`/api/trades/${ticker}`)
        const data = await res.json()
        const points = (data.history || []).map((p: any) => ({ time: p.t, value: p.v }))
        series.setData(points)
      } catch {}
      timer = setTimeout(load, 4000)
    }
    load()
    return () => { timer && clearTimeout(timer); chart.remove() }
  }, [ticker])

  return <div ref={ref} style={{ height: 280 }} />
}
