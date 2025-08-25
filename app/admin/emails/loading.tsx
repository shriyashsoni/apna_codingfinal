export default function AdminEmailsLoading() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Header */}
          <div className="mb-8">
            <div className="h-10 bg-gray-800 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-800 rounded w-1/2"></div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-800 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-800 rounded w-16"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Send Email Form */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-800 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-800 rounded w-full"></div>
                  </div>
                ))}
                <div className="h-12 bg-gray-800 rounded w-full"></div>
              </div>
            </div>

            {/* Templates */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-800 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mt-8">
            <div className="h-6 bg-gray-800 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <div className="h-6 bg-gray-700 rounded w-16"></div>
                        <div className="h-6 bg-gray-700 rounded w-20"></div>
                      </div>
                      <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2 mb-1"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                    </div>
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
