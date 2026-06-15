export interface SIPInput {
  monthlyAmount: number
  durationYears: number
  expectedReturnRate: number
}

export interface YearlyDataPoint {
  year: number
  invested: number
  corpus: number
}

export interface SIPResult {
  totalInvested: number
  estimatedReturns: number
  totalCorpus: number
  yearlyData: YearlyDataPoint[]
}

export interface Fund {
  schemeCode: number
  schemeName: string
  category: string
  nav: number
  date: string
}

export interface FundHistory {
  schemeCode: number
  schemeName: string
  data: { date: string; nav: number }[]
}