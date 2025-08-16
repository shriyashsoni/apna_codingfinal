export default function AdminCommunityLoading() {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 bg-gray-800 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-800 rounded w-96"></div>
            </div>
            <div className="h-10 bg-gray-800 rounded w-32"></div>
          </div>

          {/* Stats Card Skeleton */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <div className="h-6 bg-gray-800 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-800 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Platforms Card Skeleton */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <div className="h-6 bg-gray-800 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4">
                  <div className="h-5 bg-gray-700 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Card Skeleton */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="h-6 bg-gray-800 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4">
                  <div className="h-5 bg-gray-700 rounded w-32 mb-1"></div>
                  <div className="h-4 bg-gray-700 rounded w-48 mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
