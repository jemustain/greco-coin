/**
 * Header component with responsive navigation
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [showAboutMenu, setShowAboutMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const aboutButtonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname?.startsWith(path)
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setShowAboutMenu(false)
  }, [pathname])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAboutMenu) {
          setShowAboutMenu(false)
          aboutButtonRef.current?.focus()
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false)
        }
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showAboutMenu, mobileMenuOpen])

  // Handle click outside to close about dropdown
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

  const navLinkClass = (path: string, exact = false) => {
    const active = exact ? (isActive(path) && pathname === path) : isActive(path)
    return `font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-greco-primary focus:ring-offset-2 rounded px-2 py-1 ${
      active
        ? 'text-greco-primary border-b-2 border-greco-primary'
        : 'text-gray-700 hover:text-greco-primary'
    }`
  }

  const mobileNavLinkClass = (path: string, exact = false) => {
    const active = exact ? (isActive(path) && pathname === path) : isActive(path)
    return `block px-4 py-3 text-base font-medium transition-colors ${
      active
        ? 'text-greco-primary bg-greco-primary/5 border-l-4 border-greco-primary'
        : 'text-gray-700 hover:text-greco-primary hover:bg-gray-50 border-l-4 border-transparent'
    }`
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              className="text-xl sm:text-2xl font-bold text-greco-primary focus:outline-none focus:ring-2 focus:ring-greco-primary focus:ring-offset-2 rounded"
              aria-label="Greco Coin - Home"
            >
              Greco Coin
            </Link>
            <span className="text-sm text-gray-500 hidden md:inline">
              Historical Currency Tracker
            </span>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-greco-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-greco-primary"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-6" aria-label="Main navigation">
            <Link href="/" className={navLinkClass('/', true)}
              aria-current={isActive('/') && pathname === '/' ? 'page' : undefined}>
              Home
            </Link>
            <Link href="/compare" className={navLinkClass('/compare')}
              aria-current={isActive('/compare') ? 'page' : undefined}>
              Compare
            </Link>
            <Link href="/data" className={navLinkClass('/data')}
              aria-current={isActive('/data') ? 'page' : undefined}>
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
                className={navLinkClass('/about')}
                aria-expanded={showAboutMenu}
                aria-haspopup="true"
                aria-label="About menu"
              >
                About
                <span className="ml-1 text-xs" aria-hidden="true">▾</span>
              </button>
              
              {showAboutMenu && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  role="menu"
                  aria-label="About submenu"
                >
                  <Link href="/about" className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                    role="menuitem" onClick={() => setShowAboutMenu(false)}>
                    <div className="font-semibold text-gray-900 text-sm">About the Greco Unit</div>
                    <div className="text-xs text-gray-600 mt-1">Tom Greco&apos;s concept and commodity-backed value</div>
                  </Link>
                  <Link href="/about/methodology" className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                    role="menuitem" onClick={() => setShowAboutMenu(false)}>
                    <div className="font-semibold text-gray-900 text-sm">Methodology</div>
                    <div className="text-xs text-gray-600 mt-1">33 commodities, weighting, and calculations</div>
                  </Link>
                  <Link href="/about/sources" className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                    role="menuitem" onClick={() => setShowAboutMenu(false)}>
                    <div className="font-semibold text-gray-900 text-sm">Data Sources</div>
                    <div className="text-xs text-gray-600 mt-1">Bibliography and citations for all data</div>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile nav menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-gray-200 bg-white" aria-label="Mobile navigation">
          <div className="py-2">
            <Link href="/" className={mobileNavLinkClass('/', true)}>
              Home
            </Link>
            <Link href="/compare" className={mobileNavLinkClass('/compare')}>
              Compare
            </Link>
            <Link href="/data" className={mobileNavLinkClass('/data')}>
              Data
            </Link>
            <div className="border-t border-gray-100 my-1" />
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              About
            </div>
            <Link href="/about" className={mobileNavLinkClass('/about')}>
              About the Greco Unit
            </Link>
            <Link href="/about/methodology" className={mobileNavLinkClass('/about/methodology')}>
              Methodology
            </Link>
            <Link href="/about/sources" className={mobileNavLinkClass('/about/sources')}>
              Data Sources
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
