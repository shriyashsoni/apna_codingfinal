import { Card, CardContent } from "@/components/ui/card"

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section Skeleton */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="h-12 bg-gray-200 rounded-lg mb-6 max-w-md mx-auto animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-lg mb-4 max-w-2xl mx-auto animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-lg mb-8 max-w-xl mx-auto animate-pulse" />
          <div className="h-12 bg-gray-200 rounded-full max-w-md mx-auto animate-pulse" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Featured Posts Skeleton */}
        <section className="mb-16">
          <div className="h-8 bg-gray-200 rounded-lg mb-8 max-w-xs animate-pulse" />
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <CardContent className="p-6">
                  <div className="flex gap-4 mb-3">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-3 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4 animate-pulse" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Category Filter Skeleton */}
        <section className="mb-8">
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-full w-24 animate-pulse" />
            ))}
          </div>
        </section>

        {/* All Posts Skeleton */}
        <section>
          <div className="h-8 bg-gray-200 rounded-lg mb-8 max-w-xs animate-pulse" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <CardContent className="p-6">
                  <div className="flex gap-4 mb-3">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-3 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4 animate-pulse" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
