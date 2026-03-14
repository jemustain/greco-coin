/**
 * Methodology Page - How the Greco value is calculated
 */

import Link from 'next/link'

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link href="/about" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to About
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Methodology</h1>
          <p className="text-lg text-gray-600">
            How we calculate and display Greco values
          </p>
        </div>

        <div className="space-y-6">
          {/* Calculation */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Calculation</h2>
            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span><strong>Collect prices</strong> for each of the 32 commodities in their native units (troy oz, metric ton, bushel, etc.)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span><strong>Normalize to USD</strong> — all prices converted to US dollars</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span><strong>Compute basket value</strong> — equally weighted average (each commodity = 1/32)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span><strong>Normalize to baseline year</strong> — divide all values by the baseline year&apos;s value so baseline = 1.0</span>
              </li>
            </ol>

            <div className="mt-5 bg-gray-50 p-4 rounded-lg font-mono text-sm text-gray-700">
              Greco(t) = Σ(Price<sub>i,t</sub> × 1/32) / Greco(baseline)
            </div>
          </section>

          {/* Equal weighting */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Why Equal Weighting?</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• <strong>Simple and transparent</strong> — no subjective decisions about importance</li>
              <li>• <strong>Stable over time</strong> — weights don&apos;t change, so historical comparisons are consistent</li>
              <li>• <strong>Diversified</strong> — no single commodity (like petroleum) dominates the index</li>
            </ul>
            <p className="text-gray-600 text-sm mt-3">
              The market value treemap on the homepage shows what production-weighted values would look like for comparison.
            </p>
          </section>

          {/* Data quality */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Handling</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• <strong>Missing data:</strong> Linear interpolation for gaps &lt; 5 years; excluded otherwise</li>
              <li>• <strong>Minimum completeness:</strong> 80% of commodities (26/32) required for a valid data point</li>
              <li>• <strong>Downsampling:</strong> Long date ranges are sampled for chart performance (up to 500 points)</li>
              <li>• <strong>Production data:</strong> Annual volumes from USGS, FAO, EIA — normalized the same way as prices</li>
            </ul>
          </section>

          {/* Reference */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Reference</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
              <p>
                Greco, Thomas H. Jr. (2009). <em>The End of Money and the Future of Civilization</em>.
                Chelsea Green Publishing. ISBN: 978-1603580786
              </p>
            </div>
          </section>

          {/* Nav */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/about/sources"
              className="block p-5 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-green-900 mb-1">Data Sources</h3>
              <p className="text-green-700 text-sm">Where the price and production data comes from</p>
            </Link>
            <Link
              href="/data"
              className="block p-5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Explore Data</h3>
              <p className="text-blue-700 text-sm">View and export the dataset</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
