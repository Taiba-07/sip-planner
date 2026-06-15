'use client'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { formatCurrency } from '../lib/sip'
import { YearlyDataPoint } from '../lib/types'

export default function CorpusChart({ data }: { data: YearlyDataPoint[] }) {
  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium text-gray-500 mb-4">
        Corpus growth over time
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="year"
            tickFormatter={v => `Yr ${v}`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <YAxis
            tickFormatter={v => formatCurrency(v)}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            width={80}
          />
          <Tooltip
            formatter={(value: unknown, name: unknown) => [
            formatCurrency(value as number),
            name === 'corpus' ? 'Total Corpus' : 'Amount Invested',
            ]}
            labelFormatter={label => `Year ${label}`}
            contentStyle={{
              fontSize: 12,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
            }}
          />
          <Area
            type="monotone"
            dataKey="invested"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#colorInvested)"
            name="invested"
          />
          <Area
            type="monotone"
            dataKey="corpus"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorCorpus)"
            name="corpus"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-6 justify-center mt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs text-gray-500">Amount Invested</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-500">Total Corpus</span>
        </div>
      </div>
    </div>
  )
}