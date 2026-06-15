import Link from 'next/link'
import { getTopFunds, getMarketIndices } from '../lib/api'
import { formatCurrency, calculateSIP } from '../lib/sip'

export default async function Dashboard() {
  let funds: any[] = []
  let indices: any[] = []

  try { funds = await getTopFunds() } catch {}
  try { indices = await getMarketIndices() } catch {}

  // Example projection: ₹10,000/month, 10 years, 12%
  const projection = calculateSIP({
    monthlyAmount: 10000,
    durationYears: 10,
    expectedReturnRate: 12
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Plan your wealth with AI
            </h1>
            <p className="text-emerald-100 text-lg">
              Live mutual fund data · Real financial metrics · AI-powered insights
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/calculator"
              className="bg-white text-emerald-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-50 transition-colors text-sm">
              Try Calculator
            </Link>
            <Link href="/funds"
              className="border border-emerald-400 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-600 transition-colors text-sm">
              Browse Funds
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="₹10K SIP · 10 Years"
          value={formatCurrency(projection.totalCorpus)}
          sub="at 12% returns"
          color="blue"
        />
        <StatCard
          label="Total returns"
          value={formatCurrency(projection.estimatedReturns)}
          sub={`${((projection.estimatedReturns / projection.totalInvested) * 100).toFixed(0)}% profit`}
          color="green"
        />
        <StatCard
          label="Funds tracked"
          value={`${funds.length}`}
          sub="live NAV data"
          color="purple"
        />
        <StatCard
          label="Nifty 50"
          value={indices[0] ? indices[0].price.toLocaleString('en-IN') : '—'}
          sub={indices[0] ? `${indices[0].changePct > 0 ? '+' : ''}${indices[0].changePct}% today` : 'loading'}
          color={indices[0]?.changePct >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Top Funds */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Top Funds — Live NAV</h2>
          <Link href="/funds"
            className="text-sm text-emerald-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {funds.slice(0, 4).map((fund: any) => (
            <Link
              key={fund.schemeCode}
              href={`/funds/${fund.schemeCode}`}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-emerald-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor(fund.category)}`}>
                    {categoryLabel(fund.category)}
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-2 text-sm group-hover:text-emerald-700 transition-colors truncate">
                    {fund.schemeName}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">as of {fund.date}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-gray-900">₹{fund.nav.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">per unit</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-900 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Start your SIP journey</h2>
        <p className="text-gray-400 mb-6">
          Use our calculator to find the right SIP amount for your goals
        </p>
        <Link href="/calculator"
          className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors">
          Calculate my SIP →
        </Link>
      </div>

    </div>
  )
}

function StatCard({ label, value, sub, color }: {
  label: string; value: string; sub: string
  color: 'blue' | 'green' | 'purple' | 'red'
}) {
  const colors = {
    blue:   'bg-blue-50 border-blue-200',
    green:  'bg-emerald-50 border-emerald-200',
    purple: 'bg-purple-50 border-purple-200',
    red:    'bg-red-50 border-red-200',
  }
  const valueColors = {
    blue:   'text-blue-700',
    green:  'text-emerald-700',
    purple: 'text-purple-700',
    red:    'text-red-700',
  }
  return (
    <div className={`border rounded-2xl p-4 ${colors[color]}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${valueColors[color]}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    large: 'bg-blue-100 text-blue-700',
    mid:   'bg-purple-100 text-purple-700',
    small: 'bg-orange-100 text-orange-700',
    flexi: 'bg-green-100 text-green-700',
  }
  return map[cat] || 'bg-gray-100 text-gray-600'
}

function categoryLabel(cat: string) {
  const map: Record<string, string> = {
    large: 'Large Cap',
    mid:   'Mid Cap',
    small: 'Small Cap',
    flexi: 'Flexi Cap',
  }
  return map[cat] || cat
}