import { getFundHistory } from '../../../lib/api'
import { FundHistory } from '../../../lib/types'
import FundChart from '../../../components/FundChart'
import Link from 'next/link'

export default async function FundDetailPage({
  params,
}: {
  params: { fundId: string }
}) {
  let fund: FundHistory | null = null
  let error = false

  try {
    fund = await getFundHistory(Number(params.fundId))
  } catch {
    error = true
  }

  if (error || !fund) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link href="/funds" className="text-sm text-emerald-600 hover:underline">
          ← Back to funds
        </Link>
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          Could not load fund data. Make sure the backend is running.
        </div>
      </div>
    )
  }

  const data = fund.data
  const latestNav = data[data.length - 1]?.nav ?? 0
  const oldestNav = data[0]?.nav ?? 0
  const oneYearReturn = ((latestNav - oldestNav) / oldestNav) * 100
  const isPositive = oneYearReturn >= 0

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/funds" className="text-sm text-emerald-600 hover:underline">
        ← Back to funds
      </Link>

      <div className="mt-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{fund.schemeName}</h1>
        <div className="flex items-center gap-6 mt-4">
          <div>
            <p className="text-xs text-gray-400">Current NAV</p>
            <p className="text-3xl font-bold text-gray-900">
              ₹{latestNav.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">1 Year Return</p>
            <p className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{oneYearReturn.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Data points</p>
            <p className="text-2xl font-bold text-gray-700">{data.length} days</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-sm font-medium text-gray-500 mb-4">
          NAV History — Last 1 Year
        </h2>
        <FundChart data={data} />
      </div>
    </div>
  )
}