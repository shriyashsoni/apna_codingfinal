export default function PartnershipsLoading() {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Hero Section */}
          <div className="text-center py-20">
            <div className="h-12 bg-gray-800 rounded w-96 mx-auto mb-6"></div>
            <div className="h-6 bg-gray-800 rounded w-2/3 mx-auto mb-8"></div>
            <div className="flex justify-center gap-6">
              <div className="h-4 bg-gray-800 rounded w-32"></div>
              <div className="h-4 bg-gray-800 rounded w-28"></div>
              <div className="h-4 bg-gray-800 rounded w-36"></div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-8">
            <div className="h-10 bg-gray-800 rounded w-80"></div>
            <div className="h-10 bg-gray-800 rounded w-48"></div>
          </div>

          {/* Featured Section */}
          <div className="mb-12">
            <div className="h-8 bg-gray-800 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-900 border border-yellow-400 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-lg"></div>
                    <div>
                      <div className="h-5 bg-gray-800 rounded w-32 mb-1"></div>
                      <div className="h-4 bg-gray-800 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-800 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-800 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-800 rounded w-full"></div>
                    <div className="h-3 bg-gray-800 rounded w-5/6"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-800 rounded w-16"></div>
                    <div className="h-6 bg-gray-800 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Partnerships */}
          <div className="mb-12">
            <div className="h-8 bg-gray-800 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg"></div>
                    <div>
                      <div className="h-5 bg-gray-800 rounded w-32 mb-1"></div>
                      <div className="h-4 bg-gray-800 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-800 rounded w-16"></div>
                    <div className="h-6 bg-gray-800 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
