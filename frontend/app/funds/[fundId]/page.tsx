import { getFundHistory } from '../../../lib/api'
import { FundHistory } from '../../../lib/types'
import FundChart from '../../../components/FundChart'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getFundMetrics(fundCode: number) {
  try {
    const res = await fetch(`${API}/funds/${fundCode}/metrics`, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function FundDetailPage({
  params,
}: {
  params: Promise<{ fundId: string }>
}) {
  let fund: FundHistory | null = null
  let metrics: any = null
  let error = false

  const { fundId } = await params

  try {
    fund = await getFundHistory(Number(fundId))
    metrics = await getFundMetrics(Number(fundId))
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/funds" className="text-sm text-emerald-600 hover:underline">
        ← Back to funds
      </Link>

      {/* Fund header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{fund.schemeName}</h1>
      </div>

      {/* Key metrics row */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Current NAV"
            value={`₹${metrics.currentNav}`}
            sub="per unit"
            color="blue"
          />
          <MetricCard
            label="CAGR"
            value={`${metrics.cagr}%`}
            sub="annualized"
            color={metrics.cagr >= 0 ? 'green' : 'red'}
          />
          <MetricCard
            label="Sharpe Ratio"
            value={`${metrics.sharpe}`}
            sub="risk-adjusted return"
            color={metrics.sharpe >= 1 ? 'green' : 'amber'}
          />
          <MetricCard
            label="Max Drawdown"
            value={`${metrics.maxDrawdown}%`}
            sub="worst peak-to-trough"
            color="red"
          />
        </div>
      )}

      {/* Returns row */}
      {metrics && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-4">
            Period Returns
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ReturnItem label="1 Month" value={metrics.return1M} />
            <ReturnItem label="3 Months" value={metrics.return3M} />
            <ReturnItem label="6 Months" value={metrics.return6M} />
            <ReturnItem label="1 Year" value={metrics.return1Y} />
          </div>
        </div>
      )}

      {/* Risk metrics */}
      {metrics && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-4">
            Risk Metrics
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-400">Volatility</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {metrics.volatility}%
              </p>
              <p className="text-xs text-gray-400 mt-1">annualized std dev</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Sortino Ratio</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {metrics.sortino}
              </p>
              <p className="text-xs text-gray-400 mt-1">downside risk adjusted</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Data Points</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {metrics.dataPoints}
              </p>
              <p className="text-xs text-gray-400 mt-1">trading days</p>
            </div>
          </div>
        </div>
      )}

      {/* NAV Chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-sm font-medium text-gray-500 mb-4">
          NAV History — Last 1 Year
        </h2>
        <FundChart data={data} />
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub, color }: {
  label: string; value: string; sub: string
  color: 'blue' | 'green' | 'red' | 'amber'
}) {
  const styles = {
    blue:  'bg-blue-50 border-blue-200',
    green: 'bg-emerald-50 border-emerald-200',
    red:   'bg-red-50 border-red-200',
    amber: 'bg-amber-50 border-amber-200',
  }
  const valueStyles = {
    blue:  'text-blue-700',
    green: 'text-emerald-700',
    red:   'text-red-600',
    amber: 'text-amber-700',
  }
  return (
    <div className={`border rounded-2xl p-4 ${styles[color]}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueStyles[color]}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}

function ReturnItem({ label, value }: { label: string; value: number }) {
  const isPositive = value >= 0
  return (
    <div className="text-center p-3 rounded-xl bg-gray-50">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{value}%
      </p>
    </div>
  )
}