import { getTopFunds } from '../../lib/api'
import { Fund } from '../../lib/types'
import Link from 'next/link'

const categoryColors: Record<string, string> = {
  large: 'bg-blue-100 text-blue-700',
  mid:   'bg-purple-100 text-purple-700',
  small: 'bg-orange-100 text-orange-700',
  flexi: 'bg-green-100 text-green-700',
}

const categoryLabel: Record<string, string> = {
  large: 'Large Cap',
  mid:   'Mid Cap',
  small: 'Small Cap',
  flexi: 'Flexi Cap',
}

export default async function FundsPage() {
  let funds: Fund[] = []
  let error = false

  try {
    funds = await getTopFunds()
  } catch {
    error = true
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mutual Funds</h1>
        <p className="text-gray-500 mt-1">
          Live NAV data updated every market day
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          Could not load fund data. Please make sure the backend is running at localhost:8000
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {funds.map((fund) => (
          <Link
            key={fund.schemeCode}
            href={`/funds/${fund.schemeCode}`}
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-emerald-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[fund.category] || 'bg-gray-100 text-gray-600'}`}>
                    {categoryLabel[fund.category] || fund.category}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                  {fund.schemeName}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  NAV as of {fund.date}
                </p>
              </div>
              <div className="text-right ml-6 flex-shrink-0">
                <div className="text-xl font-bold text-gray-900">
                  ₹{fund.nav.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  per unit
                </div>
              </div>
              <div className="ml-4 text-gray-300 group-hover:text-emerald-500 transition-colors">
                →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {funds.length === 0 && !error && (
        <div className="text-center text-gray-400 py-12">
          Loading funds...
        </div>
      )}
    </div>
  )
}