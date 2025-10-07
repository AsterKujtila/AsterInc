import Link from 'next/link'
import { TokenTable } from '@/components/TokenTable'

export default function Home() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Active Tokens</h1>
        <Link href="/create" className="px-3 py-1.5 rounded bg-aster text-white">Create Coin</Link>
      </div>
      <TokenTable />
    </div>
  )
}
