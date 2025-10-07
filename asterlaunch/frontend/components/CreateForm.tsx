"use client"
import { useState } from 'react'

export function CreateForm() {
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [desc, setDesc] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pending, setPending] = useState(false)
  const [feeSol] = useState(0.02)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !ticker) return
    setPending(true)
    try {
      const body = new FormData()
      body.set('name', name)
      body.set('ticker', ticker.toUpperCase().slice(0, 5))
      body.set('desc', desc)
      if (file) body.set('image', file)
      const res = await fetch('/api/tokens', { method: 'POST', body })
      const data = await res.json()
      if (data?.ok) {
        window.location.href = `/coin/${data.ticker}`
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-xl">
      <div>
        <label className="block text-sm text-muted mb-1">Token Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-black/40 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-aster" placeholder="Aster Coin" />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Ticker (max 5)</label>
        <input value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase().slice(0,5))} className="w-full bg-black/40 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-aster font-mono" placeholder="ASTER" />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Short Description</label>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} className="w-full bg-black/40 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-aster" rows={3} placeholder="To the moon" />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Image</label>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
      </div>
      <button disabled={pending} className="bg-aster text-white px-4 py-2 rounded hover:shadow-glow disabled:opacity-60">{pending ? 'Launching...' : `Launch Coin (fee ${feeSol} SOL)`}</button>
    </form>
  )
}
