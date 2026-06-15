import type { Metadata } from 'next'
import './globals.css'
import MarketTicker from '../components/MarketTicker'

export const metadata: Metadata = {
  title: 'SIPsmart — AI Powered SIP Planner',
  description: 'Plan your SIP investments with AI-powered insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <MarketTicker />
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-8">
            <a href="/" className="font-bold text-gray-900 text-lg">
              SIP<span className="text-emerald-600">smart</span>
            </a>
            <div className="flex gap-6">
              <a href="/calculator"
                className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                Calculator
              </a>
              <a href="/funds"
                className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                Funds
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}