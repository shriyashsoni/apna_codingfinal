import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Home, Search, ArrowLeft } from "lucide-react"

export default function EventNotFound() {
  return (
    <div className="min-h-screen pt-20 bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-12">
              {/* 404 Icon */}
              <div className="mb-8">
                <Calendar className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                <div className="text-6xl font-bold text-yellow-400 mb-2">404</div>
              </div>

              {/* Error Message */}
              <h1 className="text-3xl font-bold text-white mb-4">Event Not Found</h1>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Sorry, we couldn't find the event you're looking for. The event may have been removed, the URL might be
                incorrect, or the event might not exist.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/events">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Events
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800 bg-transparent px-6 py-3"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
                <Link href="/events">
                  <Button
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800 bg-transparent px-6 py-3"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search Events
                  </Button>
                </Link>
              </div>

              {/* Help Text */}
              <div className="mt-8 pt-8 border-t border-gray-800">
                <p className="text-sm text-gray-500">
                  Need help?{" "}
                  <Link href="/contact" className="text-yellow-400 hover:text-yellow-300">
                    Contact us
                  </Link>{" "}
                  or{" "}
                  <Link href="/community" className="text-yellow-400 hover:text-yellow-300">
                    join our community
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
