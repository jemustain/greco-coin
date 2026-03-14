/**
 * Data Sources Page - Where the data comes from
 */

import Link from 'next/link'

export default function SourcesPage() {
  const sources = [
    {
      category: 'Commodity Prices',
      items: [
        { name: 'USGS Mineral Commodity Summaries', org: 'U.S. Geological Survey', what: 'Metal prices (gold, silver, copper, iron, etc.), cement, sulphur', coverage: '1900–present', url: 'https://www.usgs.gov/centers/national-minerals-information-center' },
        { name: 'FRED Economic Data', org: 'Federal Reserve Bank of St. Louis', what: 'Commodity prices, exchange rates, economic indicators', coverage: '1947–present', url: 'https://fred.stlouisfed.org/' },
        { name: 'USDA NASS', org: 'U.S. Dept. of Agriculture', what: 'Grain and agricultural commodity prices', coverage: '1866–present', url: 'https://www.nass.usda.gov/' },
        { name: 'EIA', org: 'U.S. Energy Information Administration', what: 'Crude oil (WTI) prices', coverage: '1861–present', url: 'https://www.eia.gov/petroleum/' },
      ],
    },
    {
      category: 'Production Volumes',
      items: [
        { name: 'USGS', org: 'U.S. Geological Survey', what: 'World metal and mineral production', coverage: '1970–present', url: 'https://www.usgs.gov/centers/national-minerals-information-center' },
        { name: 'FAOSTAT', org: 'Food and Agriculture Organization (UN)', what: 'World crop, fiber, and animal product production', coverage: '1970–present', url: 'https://www.fao.org/faostat/' },
        { name: 'EIA', org: 'U.S. Energy Information Administration', what: 'World petroleum production', coverage: '1970–present', url: 'https://www.eia.gov/' },
        { name: 'IRSG', org: 'International Rubber Study Group', what: 'World rubber production', coverage: '1970–present', url: 'https://www.rubberstudy.org/' },
      ],
    },
    {
      category: 'Historical & Supplementary',
      items: [
        { name: 'NBER Macrohistory Database', org: 'National Bureau of Economic Research', what: 'Pre-1950 commodity prices', coverage: '1800–1950', url: 'https://www.nber.org/research/data/nber-macrohistory-database' },
        { name: 'MeasuringWorth', org: 'MeasuringWorth.com', what: 'Historical economic statistics', coverage: '1200–present', url: 'https://www.measuringworth.com/' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link href="/about" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to About
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Data Sources</h1>
          <p className="text-lg text-gray-600">
            Where the commodity price and production data comes from
          </p>
        </div>

        <div className="space-y-6">
          {sources.map((group, idx) => (
            <section key={idx} className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{group.category}</h2>
              <div className="space-y-4">
                {group.items.map((s, sidx) => (
                  <div key={sidx} className="border-l-4 border-blue-400 pl-4 py-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <h3 className="text-sm font-semibold text-gray-900">{s.name}</h3>
                      <span className="text-xs text-gray-500">({s.org})</span>
                    </div>
                    <p className="text-sm text-gray-700">{s.what}</p>
                    <div className="flex flex-wrap gap-x-4 text-xs text-gray-500 mt-1">
                      <span>{s.coverage}</span>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {s.url.replace('https://', '').split('/')[0]}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 text-sm text-yellow-800">
            Historical commodity data may contain gaps or inconsistencies, especially pre-1950.
            This tracker is for educational purposes — verify independently before making financial decisions.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/about/methodology"
              className="block p-5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Methodology</h3>
              <p className="text-blue-700 text-sm">How we calculate Greco values</p>
            </Link>
            <Link
              href="/data"
              className="block p-5 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-green-900 mb-1">Explore Data</h3>
              <p className="text-green-700 text-sm">View and export the dataset</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
