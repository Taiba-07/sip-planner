'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL

export default function PortfolioPage() {
  const { data: session } = useSession()
  const [holdings, setHoldings] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [fundSuggestions, setFundSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [form, setForm] = useState({
    fund_code: '', fund_name: '', units: '', buy_nav: '', invested_on: ''
  })
  const [errors, setErrors] = useState<any>({})
  const suggestRef = useRef<HTMLDivElement>(null)
  const email = session?.user?.email

  useEffect(() => {
    if (email) fetchPortfolio()
  }, [email])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function searchFunds(query: string) {
    setForm(f => ({ ...f, fund_name: query }))
    if (query.length < 3) { setFundSuggestions([]); setShowSuggestions(false); return }
    try {
      const res = await fetch(`${API}/funds/search?q=${encodeURIComponent(query)}&limit=6`)
      const data = await res.json()
      setFundSuggestions(Array.isArray(data) ? data : (data.funds || []))
      setShowSuggestions(true)
    } catch { setFundSuggestions([]) }
  }

  function selectFund(fund: any) {
    setForm(f => ({ ...f, fund_code: String(fund.schemeCode), fund_name: fund.schemeName }))
    setShowSuggestions(false)
    setFundSuggestions([])
  }

  function validate() {
    const e: any = {}
    if (!form.fund_code) e.fund_code = 'Required'
    if (!form.fund_name) e.fund_name = 'Required'
    if (!form.units || Number(form.units) <= 0) e.units = 'Must be > 0'
    if (!form.buy_nav || Number(form.buy_nav) <= 0) e.buy_nav = 'Must be > 0'
    if (!form.invested_on) e.invested_on = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function fetchPortfolio() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/portfolio/${email}`)
      const data = await res.json()
      setHoldings(data.holdings || [])
      setSummary(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function addHolding() {
    if (!email || !validate()) return
    setAdding(true)
    try {
      await fetch(`${API}/portfolio/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, email,
          fund_code: Number(form.fund_code),
          units: Number(form.units),
          buy_nav: Number(form.buy_nav)
        })
      })
      setForm({ fund_code: '', fund_name: '', units: '', buy_nav: '', invested_on: '' })
      setErrors({})
      await fetchPortfolio()
    } catch (e) { console.error(e) }
    setAdding(false)
  }

  async function deleteHolding(id: number) {
    if (!confirm('Remove this holding?')) return
    await fetch(`${API}/portfolio/${id}`, { method: 'DELETE' })
    fetchPortfolio()
  }

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Please sign in to view your portfolio.</p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-1">My Portfolio</h1>
      <p className="text-gray-500 mb-8">Track your mutual fund holdings and returns</p>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Invested', value: `₹${summary.total_invested?.toLocaleString()}` },
            { label: 'Current Value', value: `₹${summary.total_current?.toLocaleString()}` },
            { label: 'Total P&L', value: `₹${summary.total_pnl?.toLocaleString()}`, color: summary.total_pnl >= 0 ? 'text-green-600' : 'text-red-500' },
            { label: 'Returns', value: `${summary.total_pnl_pct?.toFixed(2)}%`, color: summary.total_pnl_pct >= 0 ? 'text-green-600' : 'text-red-500' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl border p-4">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-xl font-bold ${c.color || 'text-gray-900'}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Holding Form */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Holding</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Fund Search with Autocomplete */}
          <div className="relative md:col-span-2" ref={suggestRef}>
            <input
              className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.fund_name ? 'border-red-400' : ''}`}
              placeholder="Search fund name (e.g. Mirae, Parag Parikh)..."
              value={form.fund_name}
              onChange={e => searchFunds(e.target.value)}
              onFocus={() => fundSuggestions.length > 0 && setShowSuggestions(true)}
            />
            {errors.fund_name && <p className="text-red-400 text-xs mt-1">{errors.fund_name}</p>}
            {showSuggestions && fundSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {fundSuggestions.map((f: any) => (
                  <div
                    key={f.schemeCode}
                    className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b last:border-0"
                    onMouseDown={() => selectFund(f)}
                  >
                    <p className="font-medium text-gray-800">{f.schemeName}</p>
                    <p className="text-xs text-gray-400">Code: {f.schemeCode}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            className={`border rounded-lg px-3 py-2 text-sm ${errors.fund_code ? 'border-red-400' : ''}`}
            placeholder="Fund Code (auto-filled)"
            value={form.fund_code}
            onChange={e => setForm({ ...form, fund_code: e.target.value })}
          />
          {errors.fund_code && <p className="text-red-400 text-xs -mt-3">{errors.fund_code}</p>}

          <input
            className={`border rounded-lg px-3 py-2 text-sm ${errors.units ? 'border-red-400' : ''}`}
            placeholder="Units purchased"
            type="number"
            min="0"
            value={form.units}
            onChange={e => setForm({ ...form, units: e.target.value })}
          />
          {errors.units && <p className="text-red-400 text-xs -mt-3">{errors.units}</p>}

          <input
            className={`border rounded-lg px-3 py-2 text-sm ${errors.buy_nav ? 'border-red-400' : ''}`}
            placeholder="Buy NAV (price per unit)"
            type="number"
            min="0"
            value={form.buy_nav}
            onChange={e => setForm({ ...form, buy_nav: e.target.value })}
          />
          {errors.buy_nav && <p className="text-red-400 text-xs -mt-3">{errors.buy_nav}</p>}

          <input
            className={`border rounded-lg px-3 py-2 text-sm ${errors.invested_on ? 'border-red-400' : ''}`}
            type="date"
            value={form.invested_on}
            onChange={e => setForm({ ...form, invested_on: e.target.value })}
          />
          {errors.invested_on && <p className="text-red-400 text-xs -mt-3">{errors.invested_on}</p>}

          <button
            onClick={addHolding}
            disabled={adding}
            className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {adding ? 'Adding...' : '+ Add Holding'}
          </button>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              {['Fund', 'Units', 'Buy NAV', 'Current NAV', 'Invested', 'Current Value', 'P&L', 'P&L %', 'Remove'].map(h => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-8 text-gray-400">Loading portfolio...</td></tr>
            ) : holdings.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-gray-400">No holdings yet. Add your first fund above!</td></tr>
            ) : holdings.map(h => (
              <tr key={h.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium max-w-[160px]">
                  <p className="truncate capitalize">{h.fund_name.toLowerCase()}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{h.units}</td>
                <td className="px-4 py-3 whitespace-nowrap">₹{h.buy_nav}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {h.current_nav > 0 ? `₹${h.current_nav}` : <span className="text-gray-400">Fetching...</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">₹{h.invested?.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {h.current_value > 0 ? `₹${h.current_value?.toLocaleString()}` : '—'}
                </td>
                <td className={`px-4 py-3 font-medium whitespace-nowrap ${h.pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {h.current_value > 0 ? `₹${h.pnl?.toLocaleString()}` : '—'}
                </td>
                <td className={`px-4 py-3 whitespace-nowrap ${h.pnl_pct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {h.current_value > 0 ? `${h.pnl_pct?.toFixed(2)}%` : '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteHolding(h.id)}
                    className="text-xs bg-red-50 text-red-500 hover:bg-red-100 px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}