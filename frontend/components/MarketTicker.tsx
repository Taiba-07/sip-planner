'use client'
import { useEffect, useState } from 'react'
import { getMarketIndices } from '../lib/api'

interface Index {
  name: string
  price: number
  changePct: number
}

export default function MarketTicker() {
  const [indices, setIndices] = useState<Index[]>([])

  useEffect(() => {
    // Fetch immediately
    fetchIndices()
    // Then every 60 seconds
    const interval = setInterval(fetchIndices, 60000)
    return () => clearInterval(interval)
  }, [])

  async function fetchIndices() {
    try {
      const data = await getMarketIndices()
      setIndices(data)
    } catch {
      // silently fail — don't crash UI if market API is down
    }
  }

  if (indices.length === 0) return null

  return (
    <div className="bg-gray-900 text-white px-6 py-2">
      <div className="max-w-6xl mx-auto flex items-center gap-8 overflow-x-auto">
        <span className="text-xs text-gray-400 flex-shrink-0 font-medium">
          LIVE
        </span>
        {indices.map((index) => (
          <div key={index.name} className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-gray-400">{index.name}</span>
            <span className="text-sm font-semibold">
              {index.price.toLocaleString('en-IN')}
            </span>
            <span className={`text-xs font-medium ${
              index.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {index.changePct >= 0 ? '+' : ''}{index.changePct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}