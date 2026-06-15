const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getTopFunds() {
  const res = await fetch(`${API}/funds/`, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Failed to fetch funds')
  return res.json()
}

export async function getFundHistory(fundCode: number, days = 365) {
  const res = await fetch(
    `${API}/funds/${fundCode}/history?days=${days}`,
    { next: { revalidate: 300 } }
  )
  if (!res.ok) throw new Error('Failed to fetch history')
  return res.json()
}

export async function getMarketIndices() {
  const res = await fetch(`${API}/market/indices`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error('Failed to fetch market data')
  return res.json()
}