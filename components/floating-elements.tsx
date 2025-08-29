"use client"

import { useEffect, useState } from "react"

export default function FloatingElements() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-yellow-400/20 rounded-full animate-pulse" />
      <div className="absolute top-40 right-20 w-6 h-6 bg-blue-400/20 rounded-full animate-bounce" />
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-green-400/20 rounded-full animate-ping" />
      <div className="absolute bottom-20 right-10 w-5 h-5 bg-purple-400/20 rounded-full animate-pulse" />

      {/* Floating code symbols */}
      <div className="absolute top-60 left-1/4 text-yellow-400/10 text-6xl font-mono animate-float">{"{"}</div>
      <div className="absolute top-80 right-1/4 text-blue-400/10 text-4xl font-mono animate-float-delayed">{"</>"}</div>
      <div className="absolute bottom-60 left-1/3 text-green-400/10 text-5xl font-mono animate-float">{"()"}</div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/2 w-32 h-32 bg-gradient-to-r from-yellow-400/5 to-orange-400/5 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/2 w-40 h-40 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-xl animate-pulse" />
    </div>
  )
}
