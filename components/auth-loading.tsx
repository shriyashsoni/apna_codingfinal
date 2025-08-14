"use client"

import { motion } from "framer-motion"

export default function AuthLoading() {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center max-w-sm mx-4"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <h3 className="text-white text-lg font-semibold mb-2">Signing you in...</h3>
        <p className="text-gray-400 text-sm">Please wait while we authenticate your account</p>
      </motion.div>
    </div>
  )
}
