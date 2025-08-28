import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Calendar } from "lucide-react"

export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">404</h1>
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Event Not Found</h2>
            <p className="text-gray-400 leading-relaxed">
              Sorry, we couldn't find the event you're looking for. It may have been moved, deleted, or the URL might be
              incorrect.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/events" className="block">
              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                <Calendar className="w-4 h-4 mr-2" />
                Browse All Events
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <Link href="/contact" className="text-yellow-400 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
