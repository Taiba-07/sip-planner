'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Fund {
  schemeCode: number
  schemeName: string
  category?: string
  nav?: number
  date?: string
}

interface SearchResult {
  schemeCode: number
  schemeName: string
}

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

export default function FundsPage() {
  const [topFunds, setTopFunds] = useState<Fund[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [category, setCategory] = useState('all')
  const [error, setError] = useState(false)

  // Load top 8 funds on mount
  useEffect(() => {
    fetch(`${API}/funds/`)
      .then(r => r.json())
      .then(setTopFunds)
      .catch(() => setError(true))
  }, [])

  // Search with debounce
  const doSearch = useCallback(async (q: string, cat: string) => {
    if (!q && cat === 'all') {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(
        `${API}/funds/search?q=${encodeURIComponent(q)}&category=${cat}&limit=30`
      )
      const data = await res.json()
      setSearchResults(data)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(searchQuery, category), 400)
    return () => clearTimeout(timer)
  }, [searchQuery, category, doSearch])

  const isSearching = searchQuery.length > 0 || category !== 'all'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mutual Funds</h1>
        <p className="text-gray-500 mt-1">
          Search across 1500+ funds · Live NAV data
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search funds... e.g. Parag Parikh, Nippon Small Cap"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-emerald-500
                       focus:border-transparent bg-white"
          />
          {searching && (
            <div className="absolute right-3 top-3.5 text-gray-400 text-xs">
              searching...
            </div>
          )}
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-emerald-500
                     bg-white text-gray-700"
        >
          <option value="all">All categories</option>
          <option value="large">Large Cap</option>
          <option value="mid">Mid Cap</option>
          <option value="small">Small Cap</option>
          <option value="flexi">Flexi Cap</option>
          <option value="index">Index Funds</option>
          <option value="debt">Debt Funds</option>
        </select>
      </div>

      {/* Search results */}
      {isSearching && (
        <div>
          <p className="text-xs text-gray-400 mb-3">
            {searchResults.length} funds found
          </p>
          <div className="grid grid-cols-1 gap-3">
            {searchResults.map((fund) => (
              <Link
                key={fund.schemeCode}
                href={`/funds/${fund.schemeCode}`}
                className="bg-white border border-gray-200 rounded-xl p-4
                           hover:shadow-md hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900
                                  group-hover:text-emerald-700 transition-colors truncate">
                      {fund.schemeName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Code: {fund.schemeCode}
                    </p>
                  </div>
                  <span className="text-gray-300 group-hover:text-emerald-500
                                   transition-colors ml-4 flex-shrink-0">
                    →
                  </span>
                </div>
              </Link>
            ))}
            {searchResults.length === 0 && !searching && (
              <div className="text-center text-gray-400 py-8 text-sm">
                No funds found. Try a different search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top 8 curated funds — shown when not searching */}
      {!isSearching && (
        <div>
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">
            Featured funds — live NAV
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700
                            px-4 py-3 rounded-xl mb-4 text-sm">
              Could not load funds. Make sure backend is running at localhost:8000
            </div>
          )}
          <div className="grid grid-cols-1 gap-4">
            {topFunds.map((fund) => (
              <Link
                key={fund.schemeCode}
                href={`/funds/${fund.schemeCode}`}
                className="bg-white border border-gray-200 rounded-2xl p-5
                           hover:shadow-md hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                        ${categoryColors[fund.category || ''] || 'bg-gray-100 text-gray-600'}`}>
                        {categoryLabel[fund.category || ''] || fund.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900
                                   group-hover:text-emerald-700 transition-colors truncate">
                      {fund.schemeName}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      NAV as of {fund.date}
                    </p>
                  </div>
                  <div className="text-right ml-6 flex-shrink-0">
                    <div className="text-xl font-bold text-gray-900">
                      ₹{fund.nav?.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">per unit</div>
                  </div>
                  <div className="ml-4 text-gray-300 group-hover:text-emerald-500 transition-colors">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}