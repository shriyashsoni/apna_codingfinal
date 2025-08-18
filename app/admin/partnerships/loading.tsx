export default function AdminPartnershipsLoading() {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 bg-gray-800 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-800 rounded w-96"></div>
            </div>
            <div className="h-10 bg-gray-800 rounded w-40"></div>
          </div>

          {/* Partnerships Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg"></div>
                    <div>
                      <div className="h-5 bg-gray-800 rounded w-32 mb-1"></div>
                      <div className="h-4 bg-gray-800 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                </div>
                <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-800 rounded w-16"></div>
                  <div className="h-6 bg-gray-800 rounded w-20"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-800 rounded w-20"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-800 rounded"></div>
                    <div className="h-8 w-8 bg-gray-800 rounded"></div>
                    <div className="h-8 w-8 bg-gray-800 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
