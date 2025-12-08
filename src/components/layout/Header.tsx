/**
 * Header component with navigation
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [showAboutMenu, setShowAboutMenu] = useState(false)
  const aboutButtonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname?.startsWith(path)
  }

  // Handle Escape key to close dropdown
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAboutMenu) {
        setShowAboutMenu(false)
        aboutButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showAboutMenu])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !aboutButtonRef.current?.contains(e.target as Node)
      ) {
        setShowAboutMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              className="text-2xl font-bold text-greco-primary focus:outline-none focus:ring-2 focus:ring-greco-primary focus:ring-offset-2 rounded"
              aria-label="Greco Coin - Home"
            >
              Greco Coin
            </Link>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Historical Currency Tracker
            </span>
          </div>
          <nav className="flex gap-6" aria-label="Main navigation">
            <Link
              href="/"
              className={`font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-greco-primary focus:ring-offset-2 rounded px-2 py-1 ${
                isActive('/') && pathname === '/'
                  ? 'text-greco-primary border-b-2 border-greco-primary'
                  : 'text-gray-700 hover:text-greco-primary'
              }`}
              title="View interactive charts of Greco values over time"
              aria-current={isActive('/') && pathname === '/' ? 'page' : undefined}
            >
              Home
            </Link>
            <Link
              href="/compare"
              className={`font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-greco-primary focus:ring-offset-2 rounded px-2 py-1 ${
                isActive('/compare')
                  ? 'text-greco-primary border-b-2 border-greco-primary'
                  : 'text-gray-700 hover:text-greco-primary'
              }`}
              title="Compare multiple currencies side-by-side"
              aria-current={isActive('/compare') ? 'page' : undefined}
            >
              Compare
            </Link>
            <Link
              href="/data"
              className={`font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-greco-primary focus:ring-offset-2 rounded px-2 py-1 ${
                isActive('/data')
                  ? 'text-greco-primary border-b-2 border-greco-primary'
                  : 'text-gray-700 hover:text-greco-primary'
              }`}
              title="Access raw data with filters, pivots, and CSV export"
              aria-current={isActive('/data') ? 'page' : undefined}
            >
              Data
            </Link>
            
            {/* About Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowAboutMenu(true)}
              onMouseLeave={() => setShowAboutMenu(false)}
            >
              <button
                ref={aboutButtonRef}
                onClick={() => setShowAboutMenu(!showAboutMenu)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setShowAboutMenu(!showAboutMenu)
                  }
                }}
                className={`font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-greco-primary focus:ring-offset-2 rounded px-2 py-1 ${
                  isActive('/about')
                    ? 'text-greco-primary border-b-2 border-greco-primary'
                    : 'text-gray-700 hover:text-greco-primary'
                }`}
                aria-expanded={showAboutMenu}
                aria-haspopup="true"
                aria-label="About menu"
              >
                About
                <span className="ml-1 text-xs" aria-hidden="true">▾</span>
              </button>
              
              {/* Dropdown Menu */}
              {showAboutMenu && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  role="menu"
                  aria-label="About submenu"
                >
                  <Link
                    href="/about"
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-100"
                    role="menuitem"
                    onClick={() => setShowAboutMenu(false)}
                  >
                    <div className="font-semibold text-gray-900 text-sm">About the Greco Unit</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Learn about Tom Greco&apos;s concept and commodity-backed value
                    </div>
                  </Link>
                  <Link
                    href="/about/methodology"
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-100"
                    role="menuitem"
                    onClick={() => setShowAboutMenu(false)}
                  >
                    <div className="font-semibold text-gray-900 text-sm">Methodology</div>
                    <div className="text-xs text-gray-600 mt-1">
                      32 commodities, weighting scheme, and calculation steps
                    </div>
                  </Link>
                  <Link
                    href="/about/sources"
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-100"
                    role="menuitem"
                    onClick={() => setShowAboutMenu(false)}
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
