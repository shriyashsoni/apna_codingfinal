export default function AdminEnhancedHackathonsLoading() {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Header Skeleton */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-gray-800 rounded mb-2 w-80 animate-pulse"></div>
              <div className="h-4 bg-gray-800 rounded w-96 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 h-10 bg-gray-800 rounded animate-pulse"></div>
              <div className="w-40 h-10 bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters Skeleton */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="h-6 bg-gray-800 rounded mb-4 w-48 animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-10 bg-gray-800 rounded animate-pulse"></div>
            <div className="w-32 h-10 bg-gray-800 rounded animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Hackathons Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex gap-2 mb-3">
                <div className="w-16 h-6 bg-gray-800 rounded animate-pulse"></div>
                <div className="w-20 h-6 bg-gray-800 rounded animate-pulse"></div>
              </div>
              <div className="h-6 bg-gray-800 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-800 rounded mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-800 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-800 rounded flex-1 animate-pulse"></div>
                  </div>
                ))}
              </div>
              <div className="flex gap-1 mt-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="w-16 h-6 bg-gray-800 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <div className="flex-1 h-8 bg-gray-800 rounded animate-pulse"></div>
                <div className="w-10 h-8 bg-gray-800 rounded animate-pulse"></div>
                <div className="w-10 h-8 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
