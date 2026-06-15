'use client'
import { useState, useMemo } from 'react'
import { calculateSIP, formatCurrency } from '../lib/sip'
import CorpusChart from './CorpusChart'

export default function SIPCalculator() {
  const [monthly, setMonthly] = useState(10000)
  const [years, setYears]     = useState(10)
  const [rate, setRate]       = useState(12)

  const result = useMemo(
    () => calculateSIP({
      monthlyAmount: monthly,
      durationYears: years,
      expectedReturnRate: rate,
    }),
    [monthly, years, rate]
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SIP Calculator</h1>
        <p className="text-gray-500 mt-1">
          Estimate how much your monthly SIP will grow over time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Sliders */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-8">
          <Slider
            label="Monthly SIP amount"
            value={monthly}
            min={500} max={100000} step={500}
            display={`₹${monthly.toLocaleString('en-IN')}`}
            onChange={setMonthly}
          />
          <Slider
            label="Investment duration"
            value={years}
            min={1} max={30} step={1}
            display={`${years} year${years > 1 ? 's' : ''}`}
            onChange={setYears}
          />
          <Slider
            label="Expected annual return"
            value={rate}
            min={6} max={24} step={0.5}
            display={`${rate}% p.a.`}
            onChange={setRate}
          />
        </div>

        {/* Results */}
        <div className="space-y-4">
          <ResultCard
            label="Amount invested"
            value={formatCurrency(result.totalInvested)}
            sub={`₹${monthly.toLocaleString('en-IN')} × ${years * 12} months`}
            color="gray"
          />
          <ResultCard
            label="Estimated returns"
            value={formatCurrency(result.estimatedReturns)}
            sub={`${((result.estimatedReturns / result.totalInvested) * 100).toFixed(0)}% profit on invested amount`}
            color="green"
          />
          <ResultCard
            label="Total corpus"
            value={formatCurrency(result.totalCorpus)}
            sub={`At ${rate}% return over ${years} years`}
            color="blue"
            highlight
          />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
        <CorpusChart data={result.yearlyData} />
      </div>
    </div>
  )
}

function Slider({
  label, value, min, max, step, display, onChange
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm text-gray-600">{label}</label>
        <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                   bg-gray-200
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-emerald-600
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:shadow-md"
      />
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-gray-400">{min.toLocaleString('en-IN')}</span>
        <span className="text-xs text-gray-400">{max.toLocaleString('en-IN')}</span>
      </div>
    </div>
  )
}

function ResultCard({
  label, value, sub, color, highlight
}: {
  label: string
  value: string
  sub: string
  color: 'gray' | 'green' | 'blue'
  highlight?: boolean
}) {
  const styles = {
    gray:  'bg-gray-50 border-gray-200',
    green: 'bg-emerald-50 border-emerald-200',
    blue:  'bg-blue-50 border-blue-200',
  }
  const valueColor = {
    gray:  'text-gray-800',
    green: 'text-emerald-700',
    blue:  'text-blue-700',
  }
  return (
    <div className={`p-5 rounded-2xl border ${styles[color]}
                     ${highlight ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${valueColor[color]}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-2">{sub}</p>
    </div>
  )
}