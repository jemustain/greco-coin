/**
 * About Page - Everything about the Greco unit, methodology, and data sources
 */

import Link from 'next/link'

export default function AboutPage() {
  const sources = [
    { name: 'USGS', what: 'Metal & mineral prices and production', url: 'https://www.usgs.gov/centers/national-minerals-information-center' },
    { name: 'FRED', what: 'Commodity prices, exchange rates', url: 'https://fred.stlouisfed.org/' },
    { name: 'USDA NASS', what: 'Grain and agricultural prices', url: 'https://www.nass.usda.gov/' },
    { name: 'EIA', what: 'Oil and natural gas prices and production', url: 'https://www.eia.gov/' },
    { name: 'FAOSTAT', what: 'World crop and animal product production', url: 'https://www.fao.org/faostat/' },
    { name: 'NBER', what: 'Pre-1950 historical commodity prices', url: 'https://www.nber.org/research/data/nber-macrohistory-database' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">About the Greco Unit</h1>
          <p className="text-lg text-gray-600">
            A commodity-backed measure of purchasing power
          </p>
        </div>

        <div className="space-y-6">
          {/* What is a Greco */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">What is a Greco?</h2>
            <p className="text-gray-700 mb-4">
              The Greco is a unit of value defined by a basket of <strong>33 essential commodities</strong> — metals,
              energy, grains, and agricultural goods. Unlike fiat currencies subject to inflation and monetary policy,
              the Greco anchors value to real-world goods with intrinsic utility.
            </p>
            <p className="text-gray-700">
              The concept builds on <strong>Ralph Borsodi&apos;s</strong> &quot;Constant&quot; currency experiment (1972)
              and was further developed by <strong>Thomas H. Greco Jr.</strong> in{' '}
              <em>The End of Money and the Future of Civilization</em> (2009).
            </p>
          </section>

          {/* The 33 Commodities */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">The 33 Commodities</h2>
            <p className="text-gray-700 mb-4">
              Each commodity is equally weighted (1/33 ≈ 3.03%). Equal weighting keeps it simple,
              prevents any single commodity from dominating, and stays consistent across time periods.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Metals (10)</p>
                <p>Gold, Silver, Iron, Copper, Aluminum, Tin, Lead, Zinc, Nickel, Platinum</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Energy (2)</p>
                <p>Petroleum (crude oil), Natural Gas</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Materials (3)</p>
                <p>Cement, Rubber, Sulphur</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Grains (6)</p>
                <p>Rice, Wheat, Corn, Barley, Oats, Rye</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Soft Commodities (7)</p>
                <p>Peanuts, Soybeans, Coffee, Cocoa, Sugar, Cotton Seed, Cotton</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Animal Products (5)</p>
                <p>Wool, Jute, Hides, Copra, Tallow</p>
              </div>
            </div>
          </section>

          {/* How It Works / Methodology */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
            <ol className="space-y-3 text-gray-700 mb-6">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span><strong>Collect prices</strong> for each commodity in native units (troy oz, metric ton, bushel, etc.)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span><strong>Normalize to USD</strong> — all prices converted to US dollars</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span><strong>Compute basket value</strong> — equally weighted average (each commodity = 1/33)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span><strong>Normalize to baseline</strong> — divide by the baseline year&apos;s value so baseline = 1.0</span>
              </li>
            </ol>

            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm text-gray-700 mb-6">
              Greco(t) = Σ(Price<sub>i,t</sub> × 1/33) / Greco(baseline)
            </div>

            <p className="text-gray-700 text-sm">
              Values above 1.0 mean the basket costs more (currency lost purchasing power);
              below 1.0 means it costs less. The market value treemap on the homepage shows
              what production-weighted values would look like for comparison.
            </p>
          </section>

          {/* Data Handling */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Data Handling</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• <strong>Missing data:</strong> Linear interpolation for gaps &lt; 5 years; excluded otherwise</li>
              <li>• <strong>Minimum completeness:</strong> 80% of commodities required for a valid data point</li>
              <li>• <strong>Downsampling:</strong> Long date ranges are sampled for chart performance (up to 500 points)</li>
              <li>• <strong>Production data:</strong> Annual volumes from USGS, FAO, EIA</li>
            </ul>
          </section>

          {/* Data Sources */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sources</h2>
            <div className="space-y-3">
              {sources.map((s, i) => (
                <div key={i} className="flex flex-wrap items-baseline gap-x-3 text-sm">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                    {s.name}
                  </a>
                  <span className="text-gray-600">— {s.what}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Reference */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">References</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Greco, Thomas H. Jr. (2009). <em>The End of Money and the Future of Civilization</em>.
                Chelsea Green Publishing.
              </p>
              <p>
                Borsodi, Ralph (1972). The &quot;Constant&quot; — a commodity-backed private currency experiment
                using 30 basic commodities.
              </p>
            </div>
          </section>

          {/* Disclaimer + Explore */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 text-sm text-yellow-800">
            This is an educational tool, not financial advice. Historical commodity data may contain
            gaps or inconsistencies, especially pre-1950.
          </div>

          <Link
            href="/data"
            className="block p-5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <h3 className="text-lg font-semibold text-blue-900 mb-1">Explore Data</h3>
            <p className="text-blue-700 text-sm">View and export the full dataset</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
