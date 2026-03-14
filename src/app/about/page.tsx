/**
 * About Page - Concise overview of the Greco unit and this tracker
 */

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">About the Greco Unit</h1>
          <p className="text-lg text-gray-600">
            A commodity-backed measure of purchasing power
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* What is it */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">What is a Greco?</h2>
            <p className="text-gray-700">
              The Greco is a unit of value defined by a basket of <strong>32 essential commodities</strong> — metals,
              energy, grains, and agricultural goods. Unlike fiat currencies subject to inflation and monetary policy,
              the Greco anchors value to real-world goods with intrinsic utility. The concept is inspired by{' '}
              <strong>Thomas H. Greco Jr.&apos;s</strong> work on monetary reform in{' '}
              <em>The End of Money and the Future of Civilization</em> (2009).
            </p>
          </section>

          {/* How the tracker works */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">How This Tracker Works</h2>
            <p className="text-gray-700 mb-4">
              We collect historical commodity prices from public sources (USGS, FRED, USDA, FAO), compute the
              equally-weighted basket cost in USD, then normalize to a baseline year so you can see how purchasing
              power changes over time. The tracker also shows individual commodity price trends, production volumes,
              and market-value-weighted breakdowns.
            </p>
            <p className="text-gray-700">
              All values are shown as ratios to the baseline year (1.0). Above 1.0 means the basket costs more
              (currency lost purchasing power); below 1.0 means it costs less.
            </p>
          </section>

          {/* The 33 commodities */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">The 33 Commodities</h2>
            <p className="text-gray-700 mb-4">
              Each commodity is equally weighted (1/33 ≈ 3.03%). This keeps it simple, prevents any single commodity
              from dominating, and stays consistent across time periods.
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

          {/* Links */}
          <section className="border-t pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/about/methodology"
                className="block p-5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-blue-900 mb-1">Methodology</h3>
                <p className="text-blue-700 text-sm">Calculation steps, weighting, and data handling</p>
              </Link>
              <Link
                href="/about/sources"
                className="block p-5 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-green-900 mb-1">Data Sources</h3>
                <p className="text-green-700 text-sm">Where the price and production data comes from</p>
              </Link>
            </div>
          </section>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          This is an educational tool, not financial advice.
        </p>
      </div>
    </div>
  )
}
