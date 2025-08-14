"use client"

import { Loader2 } from "lucide-react"

export default function AuthLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mb-4" />
      <p className="text-white text-lg font-medium">Connecting with Google...</p>
      <p className="text-gray-400 text-sm mt-2">Please wait while we redirect you</p>
    </div>
  )
}
