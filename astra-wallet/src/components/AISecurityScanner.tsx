import { useState } from 'react'

function scanTransaction(hexData: string): { ok: boolean; message: string } {
  const data = (hexData || '').trim().toLowerCase()
  if (!data.startsWith('0x') || data.length < 10) {
    return { ok: false, message: 'Paste raw transaction input data (hex starting with 0x).' }
  }

  // Simple heuristic: flag approve(address,uint256) calls
  const APPROVE_SELECTOR = '095ea7b3'
  if (data.includes(APPROVE_SELECTOR)) {
    return { ok: false, message: '🚨 ASTRA WARNING: High Risk Token Approval Detected.' }
  }

  return { ok: true, message: '✅ ASTRA AI Clear: Transaction Appears Safe.' }
}

function AISecurityScanner() {
  const [hex, setHex] = useState('')
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800/60 p-6 shadow-sm">
      <h2 className="text-lg font-medium mb-3">AI Security Co-Pilot</h2>
      <p className="text-sm text-slate-300 mb-3">Paste raw transaction input data to simulate a pre-sign scan.</p>

      <textarea
        value={hex}
        onChange={(e) => setHex(e.target.value)}
        placeholder="0x..."
        rows={6}
        className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <div className="mt-3">
        <button
          onClick={() => setResult(scanTransaction(hex))}
          className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 text-sm font-semibold"
        >
          Scan with ASTRA AI
        </button>
      </div>

      {result && (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            result.ok ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'
          }`}
        >
          {result.message}
        </div>
      )}
    </section>
  )
}

export default AISecurityScanner
