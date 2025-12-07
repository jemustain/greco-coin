/**
 * Footer component with links
 */

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              About
            </h3>
            <p className="text-gray-600 text-sm">
              Visualizing purchasing power trends through Tom Greco&apos;s basket of 32
              commodities across 9 currencies from 1900 to present.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about/methodology"
                  className="text-gray-600 hover:text-greco-primary text-sm transition-colors"
                >
                  Methodology
                </Link>
              </li>
              <li>
                <Link
                  href="/about/sources"
                  className="text-gray-600 hover:text-greco-primary text-sm transition-colors"
                >
                  Data Sources
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/jemustain/greco-coin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-greco-primary text-sm transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>

          {/* Constitutional Principles Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Principles
            </h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>✓ Data Integrity</li>
              <li>✓ Accessibility</li>
              <li>✓ Transparency</li>
              <li>✓ Historical Depth</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {currentYear} Greco Coin. Built with Next.js and Vercel.
          </p>
        </div>
      </div>
    </footer>
  )
}
