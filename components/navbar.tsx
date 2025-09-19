"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getCurrentUser, signOut } from "@/lib/supabase"
import type { User } from "@/lib/supabase"
import { AuthModal } from "@/components/auth/auth-modal"

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for auth errors in URL parameters
    const error = searchParams.get("error")
    if (error) {
      setAuthError(decodeURIComponent(error))
      // Clear the error from URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [searchParams])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      setLoading(true)
      const currentUser = await getCurrentUser()
      console.log("Current user in navbar:", currentUser)
      setUser(currentUser)
    } catch (error) {
      console.error("Error checking user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      console.log("Signing out user...")
      await signOut()
      setUser(null)
      console.log("User signed out successfully")

      // Redirect to home page
      router.push("/")

      // Force page refresh to clear any cached state
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    setAuthError(null)
    checkUser() // Refresh user state

    // Redirect to dashboard after successful auth
    router.push("/dashboard")
  }

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setShowAuthModal(true)
    setAuthError(null)
  }

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Apna Coding</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/events" className="text-gray-700 hover:text-blue-600 transition-colors">
                Events
              </Link>
              <Link href="/hackathons" className="text-gray-700 hover:text-blue-600 transition-colors">
                Hackathons
              </Link>
              <Link href="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors">
                Jobs
              </Link>
              <Link href="/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
                Courses
              </Link>
              <Link href="/ai-tools" className="text-gray-700 hover:text-blue-600 transition-colors">
                AI Tools
              </Link>
              <Link href="/community" className="text-gray-700 hover:text-blue-600 transition-colors">
                Community
              </Link>
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                      Dashboard
                    </Button>
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="ghost" className="text-purple-600 hover:text-purple-700">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center space-x-2">
                    {user.avatar_url && (
                      <img
                        src={user.avatar_url || "/placeholder.svg"}
                        alt={user.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm text-gray-700">Hi, {user.full_name}</span>
                  </div>
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => openAuthModal("login")}
                    variant="ghost"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => openAuthModal("signup")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Link href="/events" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Events
                </Link>
                <Link href="/hackathons" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Hackathons
                </Link>
                <Link href="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Jobs
                </Link>
                <Link href="/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Courses
                </Link>
                <Link href="/ai-tools" className="text-gray-700 hover:text-blue-600 transition-colors">
                  AI Tools
                </Link>
                <Link href="/community" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Community
                </Link>

                {loading ? (
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : user ? (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                    <Link href="/dashboard">
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-blue-600">
                        Dashboard
                      </Button>
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start text-purple-600 hover:text-purple-700">
                          Admin
                        </Button>
                      </Link>
                    )}
                    <div className="flex items-center space-x-2 px-3 py-2">
                      {user.avatar_url && (
                        <img
                          src={user.avatar_url || "/placeholder.svg"}
                          alt={user.full_name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="text-sm text-gray-700">Hi, {user.full_name}</span>
                    </div>
                    <Button onClick={handleSignOut} variant="outline" className="w-full bg-transparent">
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => openAuthModal("login")}
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:text-blue-600"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => openAuthModal("signup")}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false)
          setAuthError(null)
        }}
        mode={authMode}
        onModeChange={setAuthMode}
        onSuccess={handleAuthSuccess}
        initialError={authError}
      />
    </>
  )
}
