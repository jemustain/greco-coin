/**
 * About Page - Introduction to the Greco Unit Concept
 * Explains Tom Greco's theory and the basket of goods approach
 */

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About the Greco Unit</h1>
          <p className="text-xl text-gray-600">
            Understanding stable value measurement through commodity-backed currency
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What is a Greco?</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                The <strong>Greco</strong> is a proposed unit of value based on a diversified basket of essential commodities. 
                Unlike fiat currencies that can be subject to inflation and manipulation, the Greco aims to provide a 
                stable measure of purchasing power by anchoring value to real-world goods that have intrinsic utility.
              </p>
              <p>
                This concept draws inspiration from <strong>Thomas H. Greco Jr.'s</strong> work on monetary reform and 
                alternative exchange systems. The name "Greco" honors his contributions to rethinking how we measure 
                and exchange value in modern economies.
              </p>
            </div>
          </section>

          {/* The Basket of Goods Approach */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Basket of Goods Approach</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                The Greco unit is defined by a fixed basket of <strong>32 essential commodities</strong> spanning 
                six major categories:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Metals:</strong> Gold, Silver, Iron, Copper, Aluminum, Tin, Lead, Zinc, Nickel, Platinum</li>
                <li><strong>Energy:</strong> Petroleum (crude oil)</li>
                <li><strong>Materials:</strong> Cement, Rubber, Sulphur</li>
                <li><strong>Grains:</strong> Rice, Wheat, Corn, Barley, Oats, Rye</li>
                <li><strong>Soft Commodities:</strong> Peanuts, Soybeans, Coffee, Cocoa, Sugar, Cotton Seed, Cotton</li>
                <li><strong>Animal Products:</strong> Wool, Jute, Hides, Copra, Tallow</li>
              </ul>
              <p>
                Each commodity is assigned an equal weight in the basket (1/32 ≈ 3.125%), ensuring diversification 
                and reducing the impact of volatility in any single commodity market. This balanced approach provides 
                a more stable reference point than gold-only standards or single-commodity indices.
              </p>
            </div>
          </section>

          {/* Why Commodity-Backed Value? */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Commodity-Backed Value?</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Traditional fiat currencies can lose purchasing power over time due to inflation, monetary policy, 
                and economic conditions. The Greco unit addresses this by:
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span><strong>Intrinsic Value:</strong> Commodities have real-world utility and cannot be created arbitrarily</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span><strong>Historical Stability:</strong> Commodity prices tend to track real purchasing power over long periods</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span><strong>Diversification:</strong> A basket of 32 commodities smooths out individual market fluctuations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span><strong>Global Relevance:</strong> These commodities are traded worldwide with transparent pricing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span><strong>Independence:</strong> Not subject to any single government's monetary policy</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tom Greco's Vision */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tom Greco's Vision for Monetary Reform</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Thomas H. Greco Jr. is a researcher, author, and advocate for monetary innovation and community 
                economic empowerment. In his influential book <em className="font-semibold">"The End of Money and 
                the Future of Civilization"</em> (2009), Greco explores how alternative exchange mechanisms can 
                create more equitable and sustainable economic systems.
              </p>
              <p>
                Key themes from Greco's work that inform this project:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The need for <strong>value standards independent of political control</strong></li>
                <li>The importance of <strong>transparency and verifiability</strong> in monetary systems</li>
                <li>The potential for <strong>decentralized exchange</strong> based on mutual credit</li>
                <li>The role of <strong>commodity baskets</strong> in providing stable reference points</li>
              </ul>
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 my-6">
                <p className="text-sm text-gray-600 mb-2"><strong>Citation:</strong></p>
                <p className="text-gray-800">
                  Greco, Thomas H. Jr. (2009). <em>The End of Money and the Future of Civilization</em>. 
                  Chelsea Green Publishing. ISBN: 978-1603580786
                </p>
              </div>
            </div>
          </section>

          {/* How This Tracker Works */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How This Tracker Works</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                The Greco Historical Currency Tracker calculates the value of various currencies in terms of 
                Greco units from 1900 to the present. Here's how it works:
              </p>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li>
                  <strong>Collect Historical Prices:</strong> Gather commodity price data from authoritative sources 
                  (USGS, FRED, historical archives)
                </li>
                <li>
                  <strong>Normalize to USD:</strong> Convert all commodity prices to a common currency (USD) for 
                  the calculation period
                </li>
                <li>
                  <strong>Calculate Basket Value:</strong> Compute the weighted average cost of the 32-commodity 
                  basket for each time period
                </li>
                <li>
                  <strong>Convert to Target Currency:</strong> Use historical exchange rates to express the basket 
                  value in different currencies (EUR, GBP, etc.)
                </li>
                <li>
                  <strong>Track Over Time:</strong> Visualize how many units of each currency were needed to purchase 
                  one Greco unit throughout history
                </li>
              </ol>
              <p>
                This approach reveals how currencies have gained or lost purchasing power relative to a stable 
                commodity basket over time.
              </p>
            </div>
          </section>

          {/* Learn More */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Learn More</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/about/methodology"
                className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Calculation Methodology</h3>
                <p className="text-blue-700 text-sm">
                  Detailed explanation of how we calculate Greco values, including the 32 commodities, 
                  weighting scheme, and data sources.
                </p>
              </Link>
              <Link
                href="/about/sources"
                className="block p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-green-900 mb-2">Data Sources</h3>
                <p className="text-green-700 text-sm">
                  Complete bibliography and citations for all commodity price data and historical exchange rates 
                  used in this tracker.
                </p>
              </Link>
            </div>
          </section>

          {/* Call to Action */}
          <section className="border-t pt-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-semibold mb-4">Explore the Data</h3>
              <p className="mb-6">
                Use our interactive tools to visualize historical currency values, compare multiple currencies, 
                and export data for your own analysis.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/"
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  View Charts
                </Link>
                <Link
                  href="/compare"
                  className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Compare Currencies
                </Link>
                <Link
                  href="/data"
                  className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Access Raw Data
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This project is an educational tool for exploring commodity-backed value measurement. 
            It is not financial advice and should not be used for investment decisions.
          </p>
        </div>
      </div>
    </div>
  )
}
