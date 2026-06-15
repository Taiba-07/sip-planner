import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="inline-block bg-emerald-100 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
        AI-Powered SIP Planner
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Plan your wealth with <span className="text-emerald-600">AI</span>
      </h1>
      <p className="text-gray-500 text-lg mb-8 max-w-md">
        Live mutual fund data, smart SIP projections, and AI-powered recommendations.
      </p>
      <div className="flex gap-4">
        <Link
          href="/calculator"
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
          Try Calculator
        </Link>
        <Link
          href="/funds"
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
          Browse Funds
        </Link>
      </div>
    </div>
  )
}