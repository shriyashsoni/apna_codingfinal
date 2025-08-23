export default function EnhancedHackathonsLoading() {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="h-16 bg-gray-800 rounded-lg mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-800 rounded-lg mb-8 max-w-3xl mx-auto animate-pulse"></div>
            <div className="flex items-center justify-center gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-800 rounded animate-pulse"></div>
                  <div className="w-20 h-4 bg-gray-800 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters Skeleton */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <div className="h-6 bg-gray-800 rounded mb-4 w-48 animate-pulse"></div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 h-10 bg-gray-800 rounded animate-pulse"></div>
            <div className="w-32 h-10 bg-gray-800 rounded animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="grid grid-cols-3 gap-2 bg-gray-900 border border-gray-800 rounded-lg p-1 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-800 rounded animate-pulse"></div>
          ))}
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
                {[1, 2, 3].map((j) => (
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
              <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-800">
                <div className="w-24 h-4 bg-gray-800 rounded animate-pulse"></div>
                <div className="w-16 h-8 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
