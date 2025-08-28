export default function EventsLoading() {
  return (
    <div className="min-h-screen pt-20 bg-black">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section Skeleton */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-20 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-800 rounded animate-pulse"></div>
            </div>
            <div className="h-12 w-80 bg-gray-800 rounded animate-pulse mb-6"></div>
            <div className="space-y-2 mb-8">
              <div className="h-4 w-full bg-gray-800 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-12 w-32 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-12 w-36 bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-80 w-full bg-gray-800 rounded-2xl animate-pulse"></div>
        </div>

        {/* Search Section Skeleton */}
        <div className="bg-gray-900/50 rounded-2xl p-6 mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="h-10 w-full max-w-md bg-gray-800 rounded animate-pulse"></div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-20 bg-gray-800 rounded-full animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid Skeleton */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden">
              <div className="h-48 bg-gray-800 animate-pulse"></div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-16 bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-3/4 bg-gray-800 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-3 w-2/3 bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-1/2 bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-4 w-1/3 bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-4 w-12 bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-4 w-14 bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-full bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
