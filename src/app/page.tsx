/**
 * Homepage - Greco unit time-series visualization
 */

export default function HomePage() {
  return (
    <div className="container-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Greco Historical Currency Tracker
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Visualize purchasing power trends of a standardized basket of 32 commodities
          across 9 currencies from 1900 to present.
        </p>

        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-600">
            Interactive time-series charts and multi-currency comparisons will be
            available here. Phase 2 Foundational infrastructure is complete!
          </p>
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-2">32 Commodities in the Greco Basket:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
              <div>Gold</div>
              <div>Silver</div>
              <div>Iron</div>
              <div>Copper</div>
              <div>Aluminum</div>
              <div>Tin</div>
              <div>Lead</div>
              <div>Zinc</div>
              <div>Nickel</div>
              <div>Platinum</div>
              <div>Petroleum</div>
              <div>Cement</div>
              <div>Rubber</div>
              <div>Sulphur</div>
              <div>Rice</div>
              <div>Wheat</div>
              <div>Corn</div>
              <div>Barley</div>
              <div>Oats</div>
              <div>Rye</div>
              <div>Peanuts</div>
              <div>Soy Beans</div>
              <div>Coffee</div>
              <div>Cocoa</div>
              <div>Sugar</div>
              <div>Cotton Seed</div>
              <div>Cotton</div>
              <div>Wool</div>
              <div>Jute</div>
              <div>Hides</div>
              <div>Copra</div>
              <div>Tallow</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
