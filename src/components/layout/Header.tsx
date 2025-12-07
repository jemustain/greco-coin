/**
 * Header component with navigation
 */

import Link from 'next/link'

export default function Header() {
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
              className="text-gray-700 hover:text-greco-primary font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/compare"
              className="text-gray-700 hover:text-greco-primary font-medium transition-colors"
            >
              Compare
            </Link>
            <Link
              href="/data"
              className="text-gray-700 hover:text-greco-primary font-medium transition-colors"
            >
              Data
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-greco-primary font-medium transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
