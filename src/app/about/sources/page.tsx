/**
 * Data Sources Page - Complete bibliography and citations
 * Lists all data sources with links to primary sources
 */

import Link from 'next/link'

export default function SourcesPage() {
  const dataSources = [
    {
      category: 'Metals (Precious & Industrial)',
      sources: [
        {
          name: 'USGS Mineral Commodity Summaries',
          organization: 'U.S. Geological Survey',
          description: 'Comprehensive annual review of non-fuel mineral commodity data covering production, consumption, and pricing',
          coverage: '1900-Present',
          url: 'https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries',
          quality: 'High',
        },
        {
          name: 'London Metal Exchange (LME)',
          organization: 'London Metal Exchange',
          description: 'Historical pricing data for copper, aluminum, zinc, lead, nickel, tin',
          coverage: '1877-Present',
          url: 'https://www.lme.com/',
          quality: 'High',
        },
        {
          name: 'London Bullion Market Association (LBMA)',
          organization: 'London Bullion Market Association',
          description: 'Gold and silver price fixing data',
          coverage: '1968-Present',
          url: 'https://www.lbma.org.uk/',
          quality: 'High',
        },
      ],
    },
    {
      category: 'Energy',
      sources: [
        {
          name: 'EIA Petroleum & Other Liquids',
          organization: 'U.S. Energy Information Administration',
          description: 'Crude oil prices (WTI, Brent) and historical petroleum data',
          coverage: '1861-Present',
          url: 'https://www.eia.gov/petroleum/',
          quality: 'High',
        },
        {
          name: 'BP Statistical Review of World Energy',
          organization: 'BP plc',
          description: 'Historical energy prices and production statistics',
          coverage: '1965-Present',
          url: 'https://www.bp.com/en/global/corporate/energy-economics/statistical-review-of-world-energy.html',
          quality: 'High',
        },
      ],
    },
    {
      category: 'Agricultural Commodities (Grains & Softs)',
      sources: [
        {
          name: 'USDA National Agricultural Statistics Service (NASS)',
          organization: 'U.S. Department of Agriculture',
          description: 'Comprehensive agricultural commodity prices and production data',
          coverage: '1866-Present',
          url: 'https://www.nass.usda.gov/',
          quality: 'High',
        },
        {
          name: 'FAO Food Price Index',
          organization: 'Food and Agriculture Organization (UN)',
          description: 'International food commodity prices and agricultural statistics',
          coverage: '1961-Present',
          url: 'https://www.fao.org/worldfoodsituation/foodpricesindex/en/',
          quality: 'High',
        },
        {
          name: 'CME Group Agricultural Products',
          organization: 'CME Group (Chicago Mercantile Exchange)',
          description: 'Futures and spot prices for grains, oilseeds, and livestock',
          coverage: '1850s-Present',
          url: 'https://www.cmegroup.com/markets/agriculture.html',
          quality: 'High',
        },
      ],
    },
    {
      category: 'Materials & Industrial Commodities',
      sources: [
        {
          name: 'Portland Cement Association',
          organization: 'Portland Cement Association',
          description: 'Cement production and pricing statistics',
          coverage: '1900-Present',
          url: 'https://www.cement.org/',
          quality: 'Medium',
        },
        {
          name: 'International Rubber Study Group (IRSG)',
          organization: 'International Rubber Study Group',
          description: 'Natural rubber prices and production data',
          coverage: '1960-Present',
          url: 'https://www.rubberstudy.org/',
          quality: 'High',
        },
      ],
    },
    {
      category: 'Exchange Rates',
      sources: [
        {
          name: 'FRED Economic Data',
          organization: 'Federal Reserve Bank of St. Louis',
          description: 'Historical foreign exchange rates for major currencies',
          coverage: '1971-Present (floating rates)',
          url: 'https://fred.stlouisfed.org/',
          quality: 'High',
        },
        {
          name: 'Bank of England Historical Exchange Rates',
          organization: 'Bank of England',
          description: 'Sterling exchange rates and historical currency data',
          coverage: '1800-Present',
          url: 'https://www.bankofengland.co.uk/statistics',
          quality: 'High',
        },
        {
          name: 'European Central Bank Statistical Data Warehouse',
          organization: 'European Central Bank',
          description: 'Euro and predecessor currency exchange rates',
          coverage: '1999-Present (Euro); historical for predecessor currencies',
          url: 'https://sdw.ecb.europa.eu/',
          quality: 'High',
        },
      ],
    },
    {
      category: 'Historical Data (Pre-1950)',
      sources: [
        {
          name: 'Global Financial Data',
          organization: 'Global Financial Data, Inc.',
          description: 'Long-term historical commodity and financial data',
          coverage: '1265-Present',
          url: 'https://globalfinancialdata.com/',
          quality: 'Medium',
        },
        {
          name: 'NBER Macrohistory Database',
          organization: 'National Bureau of Economic Research',
          description: 'Historical macroeconomic and commodity price data',
          coverage: '1800-1950',
          url: 'https://www.nber.org/research/data/nber-macrohistory-database',
          quality: 'Medium',
        },
        {
          name: 'Measuring Worth',
          organization: 'MeasuringWorth.com',
          description: 'Historical economic statistics and purchasing power calculators',
          coverage: '1200-Present',
          url: 'https://www.measuringworth.com/',
          quality: 'Medium',
        },
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Sources</h1>
          <p className="text-xl text-gray-600">
            Complete bibliography and citations for all commodity price and exchange rate data
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Overview */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Quality & Transparency</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                This tracker relies on authoritative, publicly available data sources from government agencies, 
                international organizations, and established commodity exchanges. All data sources are documented 
                here for transparency and reproducibility.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
                <h4 className="font-semibold text-blue-900 mb-2">Data Quality Indicators</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 mr-2">
                      High
                    </span>
                    <span className="text-sm">Official government statistics, peer-reviewed sources, major exchanges</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800 mr-2">
                      Medium
                    </span>
                    <span className="text-sm">Industry associations, reputable private data providers, interpolated estimates</span>
                  </li>
                </ul>
              </div>
              <p>
                For periods where complete data is unavailable (particularly pre-1950), we use historical estimates 
                from academic sources and mark them with appropriate quality indicators.
              </p>
            </div>
          </section>

          {/* Data Sources by Category */}
          {dataSources.map((category, idx) => (
            <section key={idx} className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">{category.category}</h2>
              <div className="space-y-6">
                {category.sources.map((source, sidx) => (
                  <div key={sidx} className="border-l-4 border-blue-500 pl-6 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{source.name}</h3>
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                        source.quality === 'High' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {source.quality} Quality
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{source.organization}</p>
                    <p className="text-gray-700 mb-3">{source.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Coverage:</span>{' '}
                        <span className="text-gray-700">{source.coverage}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">URL:</span>{' '}
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {source.url.replace('https://', '').replace('http://', '').split('/')[0]}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Academic References */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Academic & Theoretical Foundation</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-green-500 pl-6 py-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  The End of Money and the Future of Civilization
                </h3>
                <p className="text-sm text-gray-600 mb-2">Thomas H. Greco Jr. (2009)</p>
                <p className="text-gray-700 mb-3">
                  Foundational work on monetary reform, alternative exchange systems, and commodity-backed value standards. 
                  This book provides the theoretical framework for using commodity baskets as stable references.
                </p>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Publisher:</span>{' '}
                  <span className="text-gray-700">Chelsea Green Publishing</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">ISBN:</span>{' '}
                  <span className="text-gray-700">978-1603580786</span>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-6 py-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Commodity Prices and Markets
                </h3>
                <p className="text-sm text-gray-600 mb-2">Jeffrey A. Frankel (Editor) (2008)</p>
                <p className="text-gray-700 mb-3">
                  Academic analysis of commodity price dynamics, indexing methodologies, and historical trends. 
                  Provides context for understanding long-term commodity value relationships.
                </p>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Publisher:</span>{' '}
                  <span className="text-gray-700">University of Chicago Press</span>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-6 py-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  A History of the Dollar
                </h3>
                <p className="text-sm text-gray-600 mb-2">Craig K. Elwell (2012)</p>
                <p className="text-gray-700 mb-3">
                  Congressional Research Service report providing historical context for US dollar purchasing power 
                  and currency valuation from colonial times to present.
                </p>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Publisher:</span>{' '}
                  <span className="text-gray-700">Congressional Research Service</span>
                </div>
              </div>
            </div>
          </section>

          {/* Methodology Notes */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Processing Notes</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <h3 className="text-lg font-semibold">Unit Conversions</h3>
              <p>
                Commodities are priced in various units (Troy Ounce, Metric Ton, Bushel, Barrel, etc.). We maintain 
                conversion factors for all units and normalize prices to enable basket aggregation.
              </p>

              <h3 className="text-lg font-semibold mt-6">Missing Data Handling</h3>
              <p>
                When commodity price data is unavailable for a specific date:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Linear interpolation between known data points (for gaps less than 5 years)</li>
                <li>Exclusion from basket calculation (reduces completeness percentage)</li>
                <li>Historical estimates from academic sources (marked as lower quality)</li>
              </ul>
              <p>
                Greco values are only calculated when basket completeness is ≥80% (at least 26 of 32 commodities available).
              </p>

              <h3 className="text-lg font-semibold mt-6">Exchange Rate Adjustments</h3>
              <p>
                Historical exchange rates account for currency redenominations, regime changes (e.g., Bretton Woods), 
                and the introduction of new currencies (e.g., Euro in 1999, Bitcoin in 2009).
              </p>
            </div>
          </section>

          {/* Links */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Related Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/about/methodology"
                className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Calculation Methodology</h3>
                <p className="text-blue-700 text-sm">
                  Learn how we use this data to calculate Greco values
                </p>
              </Link>
              <Link
                href="/data"
                className="block p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-green-900 mb-2">Export the Data</h3>
                <p className="text-green-700 text-sm">
                  Download the complete dataset in CSV format for your own analysis
                </p>
              </Link>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Data Accuracy Disclaimer</h3>
            <p className="text-yellow-800 text-sm">
              While we strive for accuracy and use reputable sources, historical commodity price data may contain 
              errors, gaps, or inconsistencies. This tracker is intended for educational and research purposes only. 
              Users should verify data independently before making financial decisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
