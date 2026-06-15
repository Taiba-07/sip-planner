'use client'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'

interface DataPoint {
  date: string
  nav: number
}

export default function FundChart({ data }: { data: DataPoint[] }) {
  // Show only every 30th label to avoid crowding
  const formatted = data.map((d, i) => ({
    ...d,
    label: i % 30 === 0 ? d.date : '',
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          interval={0}
        />
        <YAxis
          domain={['auto', 'auto']}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          width={70}
          tickFormatter={v => `₹${v}`}
        />
        <Tooltip
          formatter={(value: unknown) => [`₹${(value as number).toFixed(2)}`, 'NAV']}
          labelFormatter={label => label ? `Date: ${label}` : ''}
          contentStyle={{
            fontSize: 12,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
          }}
        />
        <Line
          type="monotone"
          dataKey="nav"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}