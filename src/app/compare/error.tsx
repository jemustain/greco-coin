'use client'

export default function CompareError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Comparison failed
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'Unable to load comparison data. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
