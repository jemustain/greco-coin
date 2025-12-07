/**
 * Root layout with metadata, Header, and Footer
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Greco Coin - Historical Currency Tracker',
  description:
    'Visualize purchasing power trends of a standardized basket of 32 commodities (the Greco unit) across 9 currencies/assets from 1900 to present. Based on Tom Greco\'s alternative monetary theory.',
  keywords: [
    'currency',
    'purchasing power',
    'commodities',
    'Tom Greco',
    'historical data',
    'economics',
    'inflation',
  ],
  authors: [{ name: 'Greco Coin Project' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full flex flex-col`}>
        <ErrorBoundary>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  )
}
