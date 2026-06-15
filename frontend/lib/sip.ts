import { SIPInput, SIPResult, YearlyDataPoint } from './types'

export function calculateSIP(input: SIPInput): SIPResult {
  const { monthlyAmount, durationYears, expectedReturnRate } = input
  const r = expectedReturnRate / 100 / 12
  const n = durationYears * 12

  const totalCorpus =
    monthlyAmount * (((Math.pow(1 + r, n) - 1) / r) * (1 + r))
  const totalInvested = monthlyAmount * n
  const estimatedReturns = totalCorpus - totalInvested

  const yearlyData: YearlyDataPoint[] = []
  for (let year = 1; year <= durationYears; year++) {
    const months = year * 12
    const corpus =
      monthlyAmount * (((Math.pow(1 + r, months) - 1) / r) * (1 + r))
    yearlyData.push({
      year,
      invested: Math.round(monthlyAmount * months),
      corpus: Math.round(corpus),
    })
  }

  return {
    totalInvested: Math.round(totalInvested),
    estimatedReturns: Math.round(estimatedReturns),
    totalCorpus: Math.round(totalCorpus),
    yearlyData,
  }
}

export function formatCurrency(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function getRequiredSIP(
  targetCorpus: number,
  durationYears: number,
  returnRate: number
): number {
  const r = returnRate / 100 / 12
  const n = durationYears * 12
  const factor = ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
  return Math.round(targetCorpus / factor)
}