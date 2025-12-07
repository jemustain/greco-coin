/**
 * Header component with navigation
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [showAboutMenu, setShowAboutMenu] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname?.startsWith(path)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-bold text-greco-primary">
              Greco Coin
            </Link>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Historical Currency Tracker
            </span>
          </div>
          <nav className="flex gap-6" aria-label="Main navigation">
            <Link
              href="/"
              className={`font-medium transition-colors ${
                isActive('/') && pathname === '/'
                  ? 'text-greco-primary border-b-2 border-greco-primary'
                  : 'text-gray-700 hover:text-greco-primary'
              }`}
              title="View interactive charts of Greco values over time"
            >
              Home
            </Link>
            <Link
              href="/compare"
              className={`font-medium transition-colors ${
                isActive('/compare')
                  ? 'text-greco-primary border-b-2 border-greco-primary'
                  : 'text-gray-700 hover:text-greco-primary'
              }`}
              title="Compare multiple currencies side-by-side"
            >
              Compare
            </Link>
            <Link
              href="/data"
              className={`font-medium transition-colors ${
                isActive('/data')
                  ? 'text-greco-primary border-b-2 border-greco-primary'
                  : 'text-gray-700 hover:text-greco-primary'
              }`}
              title="Access raw data with filters, pivots, and CSV export"
            >
              Data
            </Link>
            
            {/* About Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowAboutMenu(true)}
              onMouseLeave={() => setShowAboutMenu(false)}
            >
              <Link
                href="/about"
                className={`font-medium transition-colors ${
                  isActive('/about')
                    ? 'text-greco-primary border-b-2 border-greco-primary'
                    : 'text-gray-700 hover:text-greco-primary'
                }`}
              >
                About
              </Link>
              
              {/* Dropdown Menu */}
              {showAboutMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="/about"
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-gray-900 text-sm">About the Greco Unit</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Learn about Tom Greco's concept and commodity-backed value
                    </div>
                  </Link>
                  <Link
                    href="/about/methodology"
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-gray-900 text-sm">Methodology</div>
                    <div className="text-xs text-gray-600 mt-1">
                      32 commodities, weighting scheme, and calculation steps
                    </div>
                  </Link>
                  <Link
                    href="/about/sources"
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-gray-900 text-sm">Data Sources</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Complete bibliography and citations for all data
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
