export default function BlogLoading() {
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

        {/* Featured Posts Skeleton */}
        <div className="mb-16">
          <div className="h-8 bg-gray-800 rounded-lg w-48 mb-8 animate-pulse"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-800 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-800 rounded w-24 mb-3 animate-pulse"></div>
                  <div className="h-6 bg-gray-800 rounded w-full mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regular Posts Skeleton */}
        <div className="h-8 bg-gray-800 rounded-lg w-48 mb-8 animate-pulse"></div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="h-48 bg-gray-800 animate-pulse"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-800 rounded w-24 mb-3 animate-pulse"></div>
                <div className="h-6 bg-gray-800 rounded w-full mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-800 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-800 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
