/**
 * Methodology Page - Detailed explanation of Greco calculation
 * Lists all 32 commodities, weighting rationale, and calculation steps
 */

import Link from 'next/link'

export default function MethodologyPage() {
  const commoditiesByCategory = [
    {
      category: 'Metals',
      description: 'Industrial and precious metals essential for manufacturing, construction, and store of value',
      commodities: [
        { name: 'Gold', unit: 'Troy Ounce', symbol: 'Au' },
        { name: 'Silver', unit: 'Troy Ounce', symbol: 'Ag' },
        { name: 'Iron', unit: 'Metric Ton', symbol: 'Fe' },
        { name: 'Copper', unit: 'Metric Ton', symbol: 'Cu' },
        { name: 'Aluminum', unit: 'Metric Ton', symbol: 'Al' },
        { name: 'Tin', unit: 'Metric Ton', symbol: 'Sn' },
        { name: 'Lead', unit: 'Metric Ton', symbol: 'Pb' },
        { name: 'Zinc', unit: 'Metric Ton', symbol: 'Zn' },
        { name: 'Nickel', unit: 'Metric Ton', symbol: 'Ni' },
        { name: 'Platinum', unit: 'Troy Ounce', symbol: 'Pt' },
      ],
    },
    {
      category: 'Energy',
      description: 'Fossil fuels powering transportation and industry',
      commodities: [
        { name: 'Petroleum (Crude Oil)', unit: 'Barrel', symbol: 'WTI' },
      ],
    },
    {
      category: 'Materials',
      description: 'Industrial materials for construction and manufacturing',
      commodities: [
        { name: 'Cement', unit: 'Metric Ton', symbol: 'CEM' },
        { name: 'Rubber (Natural)', unit: 'Metric Ton', symbol: 'RUB' },
        { name: 'Sulphur', unit: 'Metric Ton', symbol: 'S' },
      ],
    },
    {
      category: 'Grains',
      description: 'Staple food crops providing global nutrition',
      commodities: [
        { name: 'Rice', unit: 'Hundredweight', symbol: 'RICE' },
        { name: 'Wheat', unit: 'Bushel', symbol: 'WHEAT' },
        { name: 'Corn (Maize)', unit: 'Bushel', symbol: 'CORN' },
        { name: 'Barley', unit: 'Bushel', symbol: 'BARLEY' },
        { name: 'Oats', unit: 'Bushel', symbol: 'OATS' },
        { name: 'Rye', unit: 'Bushel', symbol: 'RYE' },
      ],
    },
    {
      category: 'Soft Commodities',
      description: 'Agricultural products for food, beverages, and textiles',
      commodities: [
        { name: 'Peanuts', unit: 'Pound', symbol: 'PNUT' },
        { name: 'Soybeans', unit: 'Bushel', symbol: 'SOY' },
        { name: 'Coffee', unit: 'Pound', symbol: 'COFFEE' },
        { name: 'Cocoa', unit: 'Metric Ton', symbol: 'COCOA' },
        { name: 'Sugar', unit: 'Pound', symbol: 'SUGAR' },
        { name: 'Cotton Seed', unit: 'Ton', symbol: 'CSEED' },
        { name: 'Cotton', unit: 'Pound', symbol: 'COTTON' },
      ],
    },
    {
      category: 'Animal Products',
      description: 'Products derived from animals for textiles and industry',
      commodities: [
        { name: 'Wool', unit: 'Pound', symbol: 'WOOL' },
        { name: 'Jute', unit: 'Metric Ton', symbol: 'JUTE' },
        { name: 'Hides', unit: 'Pound', symbol: 'HIDE' },
        { name: 'Copra (Coconut)', unit: 'Metric Ton', symbol: 'COPRA' },
        { name: 'Tallow (Beef Fat)', unit: 'Pound', symbol: 'TALLOW' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-12">
          <Link href="/about" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to About
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Calculation Methodology</h1>
          <p className="text-xl text-gray-600">
            How we calculate Greco values from commodity prices and exchange rates
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Overview */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                The Greco unit is calculated as the <strong>weighted average cost</strong> of purchasing a fixed 
                basket of 32 essential commodities. Each commodity contributes equally to the basket (3.125% weight), 
                ensuring diversification and stability.
              </p>
              <p>
                This methodology allows us to track how much of any given currency is needed to purchase one Greco 
                unit over time, revealing changes in that currency's purchasing power.
              </p>
            </div>
          </section>

          {/* The 32 Commodities */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">The 32 Commodities</h2>
            <p className="text-gray-700 mb-8">
              The basket includes commodities from six major categories, chosen for their economic importance, 
              global availability, and historical price data quality.
            </p>

            <div className="space-y-8">
              {commoditiesByCategory.map((category, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{category.category}</h3>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    <p className="text-sm text-blue-600 mt-1">
                      {category.commodities.length} {category.commodities.length === 1 ? 'commodity' : 'commodities'} 
                      {' '}({(category.commodities.length / 32 * 100).toFixed(1)}% of basket)
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Commodity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Weight</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {category.commodities.map((commodity, cidx) => (
                          <tr key={cidx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{commodity.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{commodity.unit}</td>
                            <td className="px-4 py-2 text-sm text-gray-500 font-mono">{commodity.symbol}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">3.125%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-blue-900">Total Commodities:</span>
                <span className="text-2xl font-bold text-blue-600">32 (100%)</span>
              </div>
            </div>
          </section>

          {/* Calculation Steps */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Calculation Steps</h2>
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Collect Commodity Prices</h3>
                  <p className="text-gray-700">
                    Gather historical price data for each of the 32 commodities from authoritative sources. Prices are 
                    recorded in their native trading units (e.g., Troy Ounce for gold, Bushel for wheat).
                  </p>
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Example:</strong> Gold price on January 1, 2000 = $282.75 per Troy Ounce
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Normalize to USD</h3>
                  <p className="text-gray-700">
                    Convert all commodity prices to US Dollars (USD) to enable aggregation. This creates a common 
                    denominator for the basket calculation.
                  </p>
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Example:</strong> Wheat price in USD × exchange rate = normalized price
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Basket Value</h3>
                  <p className="text-gray-700">
                    Compute the weighted sum of all 32 commodity prices. Since each commodity has equal weight (1/32), 
                    this is simply the average price across all commodities.
                  </p>
                  <div className="mt-3 bg-gray-100 p-4 rounded-lg font-mono text-sm">
                    <div className="text-gray-700">
                      Greco Value (USD) = Σ (Price<sub>i</sub> × Weight<sub>i</sub>)
                    </div>
                    <div className="text-gray-700 mt-2">
                      Where Weight<sub>i</sub> = 1/32 = 0.03125 for all i
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Convert to Target Currency</h3>
                  <p className="text-gray-700">
                    Use historical exchange rates to express the Greco value in other currencies (EUR, GBP, JPY, etc.). 
                    This shows how many units of each currency are needed to purchase one Greco.
                  </p>
                  <div className="mt-3 bg-gray-100 p-4 rounded-lg font-mono text-sm">
                    <div className="text-gray-700">
                      Greco Value (EUR) = Greco Value (USD) × Exchange Rate (USD/EUR)
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  5
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Data Quality</h3>
                  <p className="text-gray-700">
                    Calculate completeness percentage based on how many of the 32 commodities have available price data 
                    for that time period. A minimum of 80% completeness (26 commodities) is required for a valid calculation.
                  </p>
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Quality Thresholds:</strong> High (&ge;90%), Medium (80-89%), Low (&lt;80%)
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Calculation Example */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Calculation Example</h2>
            <p className="text-gray-700 mb-6">
              Let's calculate the Greco value for January 1, 2000 in USD:
            </p>

            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Commodity</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price (USD)</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Weight</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Contribution</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr><td className="px-4 py-2">Gold</td><td className="px-4 py-2 text-right">$282.75/oz</td><td className="px-4 py-2 text-right">3.125%</td><td className="px-4 py-2 text-right">$8.84</td></tr>
                  <tr><td className="px-4 py-2">Silver</td><td className="px-4 py-2 text-right">$5.30/oz</td><td className="px-4 py-2 text-right">3.125%</td><td className="px-4 py-2 text-right">$0.17</td></tr>
                  <tr><td className="px-4 py-2">Wheat</td><td className="px-4 py-2 text-right">$2.62/bu</td><td className="px-4 py-2 text-right">3.125%</td><td className="px-4 py-2 text-right">$0.08</td></tr>
                  <tr><td className="px-4 py-2">Petroleum</td><td className="px-4 py-2 text-right">$25.50/bbl</td><td className="px-4 py-2 text-right">3.125%</td><td className="px-4 py-2 text-right">$0.80</td></tr>
                  <tr><td className="px-4 py-2 text-gray-500" colSpan={4}>... (28 more commodities)</td></tr>
                  <tr className="bg-blue-50 font-semibold">
                    <td className="px-4 py-2">Total (32 commodities)</td>
                    <td className="px-4 py-2 text-right">—</td>
                    <td className="px-4 py-2 text-right">100%</td>
                    <td className="px-4 py-2 text-right">$125.43</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-900 font-semibold text-lg">
                Result: 1 Greco = $125.43 USD on January 1, 2000
              </p>
              <p className="text-green-700 text-sm mt-2">
                (This is a simplified example. Actual calculations use all 32 commodities with real historical prices.)
              </p>
            </div>
          </section>

          {/* Why Equal Weighting? */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Equal Weighting?</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                The Greco basket uses <strong>equal weighting</strong> (1/32 per commodity) rather than market-cap 
                weighting or consumption-based weighting for several reasons:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Simplicity:</strong> Equal weights are easy to understand and transparent
                </li>
                <li>
                  <strong>Stability:</strong> Prevents domination by volatile commodities (e.g., gold or oil)
                </li>
                <li>
                  <strong>Diversification:</strong> Ensures broad exposure across all economic sectors
                </li>
                <li>
                  <strong>Historical Consistency:</strong> Weighting schemes don't change over time, making comparisons valid
                </li>
                <li>
                  <strong>Philosophical Alignment:</strong> Reflects the idea that all essential commodities have intrinsic value
                </li>
              </ul>
              <p>
                Alternative weighting schemes (e.g., by production volume or economic importance) could be explored 
                in future versions of this tracker.
              </p>
            </div>
          </section>

          {/* Links */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Related Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/about/sources"
                className="block p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-green-900 mb-2">Data Sources</h3>
                <p className="text-green-700 text-sm">
                  See where we get our commodity price and exchange rate data
                </p>
              </Link>
              <Link
                href="/data"
                className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Explore the Data</h3>
                <p className="text-blue-700 text-sm">
                  View, filter, pivot, and export the complete historical dataset
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
