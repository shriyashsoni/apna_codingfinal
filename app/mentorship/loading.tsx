export default function MentorshipLoading() {
  return (
    <div className="min-h-screen pt-20 bg-black">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 bg-gray-800 rounded-lg w-96 mx-auto mb-6 animate-pulse"></div>
          <div className="h-6 bg-gray-800 rounded-lg w-full max-w-3xl mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-800 rounded-lg w-2/3 max-w-2xl mx-auto mb-8 animate-pulse"></div>

          {/* Search Bar Skeleton */}
          <div className="max-w-2xl mx-auto">
            <div className="h-12 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Stats Section Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-12 bg-gray-800 rounded-lg w-20 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-800 rounded-lg w-24 mx-auto animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Featured Programs Skeleton */}
        <div className="mb-16">
          <div className="h-8 bg-gray-800 rounded-lg w-48 mb-8 animate-pulse"></div>
          <div className="grid md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-800 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-800 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-6 bg-gray-800 rounded w-full mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-800 rounded w-32 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-800 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-6 animate-pulse"></div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-800 rounded animate-pulse"></div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="h-10 bg-gray-800 rounded flex-1 animate-pulse"></div>
                  <div className="h-10 bg-gray-800 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regular Programs Skeleton */}
        <div className="h-8 bg-gray-800 rounded-lg w-48 mb-8 animate-pulse"></div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-800 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-800 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-5 bg-gray-800 rounded w-full mb-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-800 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-800 rounded w-2/3 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-3 bg-gray-800 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-800 rounded flex-1 animate-pulse"></div>
                <div className="h-8 bg-gray-800 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
