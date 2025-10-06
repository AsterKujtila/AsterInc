import { useAccount, useBalance, useSendTransaction } from 'wagmi'
import { useState } from 'react'
import { parseEther } from 'viem'
import { formatAddress } from '../utils/formatAddress'

function AccountOverview() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address, chainId: 11155111 })
  const [recipient, setRecipient] = useState('')
  const { sendTransaction, isPending, isSuccess, data, error } = useSendTransaction()

  if (!isConnected) return null

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800/60 p-6 shadow-sm">
      <h2 className="text-lg font-medium mb-2">Account Overview</h2>
      <div className="text-sm text-slate-300 mb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono">{address ? formatAddress(address) : ''}</span>
          <span className="h-1 w-1 rounded-full bg-slate-500" />
          <span>{balance ? `${Number(balance.formatted).toFixed(6)} ${balance.symbol}` : '—'}</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm text-slate-300">Send 0.0001 ETH (Sepolia)</label>
        <div className="flex gap-2">
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0xRecipient..."
            className="flex-1 rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium"
            onClick={() =>
              sendTransaction?.({ to: recipient as `0x${string}`, value: parseEther('0.0001'), chainId: 11155111 })
            }
            disabled={isPending || !recipient}
          >
            {isPending ? 'Sending…' : 'Send'}
          </button>
        </div>
        {isSuccess && data && (
          <a
            href={`https://sepolia.etherscan.io/tx/${data}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-violet-400 hover:underline"
          >
            View on Etherscan
          </a>
        )}
        {error && <p className="text-xs text-red-400">{(error as Error).message}</p>}
      </div>
    </section>
  )
}

export default AccountOverview
