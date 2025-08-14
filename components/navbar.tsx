"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown, Settings, LogOut, Shield } from "lucide-react"
import { getCurrentUser, signOut, isAdmin } from "@/lib/supabase"
import AuthModal from "@/components/auth/auth-modal"

interface AppUser {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: "user" | "admin"
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<AppUser | null>(null)
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        const adminStatus = await isAdmin(currentUser.email)
        setIsUserAdmin(adminStatus)
      }
    } catch (error) {
      console.error("Error checking auth:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      setIsUserAdmin(false)
      setShowUserMenu(false)
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    checkAuth()
  }

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  return (
    <>
      <nav className="bg-black/95 backdrop-blur-sm border-b border-yellow-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/logo.png" alt="Apna Coding" width={40} height={40} className="w-10 h-10" priority />
              <span className="text-xl font-bold text-white">Apna Coding</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/courses" className="text-gray-300 hover:text-yellow-400 transition-colors">
                Courses
              </Link>
              <Link href="/hackathons" className="text-gray-300 hover:text-yellow-400 transition-colors">
                Hackathons
              </Link>
              <Link href="/jobs" className="text-gray-300 hover:text-yellow-400 transition-colors">
                Jobs
              </Link>
              <Link href="/ai-tools" className="text-gray-300 hover:text-yellow-400 transition-colors">
                AI Tools
              </Link>
              <Link href="/community-partnerships" className="text-gray-300 hover:text-yellow-400 transition-colors">
                Community
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-yellow-400 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-yellow-400 transition-colors">
                Contact
              </Link>
            </div>

            {/* Auth Buttons / User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors"
                  >
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url || "/placeholder.svg"}
                        alt={user.full_name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Settings className="w-4 h-4 text-black" />
                      </div>
                    )}
                    <span className="text-sm font-medium">{user.full_name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-black border border-yellow-500/20 rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Link>
                      {isUserAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => openAuthModal("login")}
                    className="text-white border border-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => openAuthModal("signup")}
                    className="bg-yellow-500 text-black hover:bg-yellow-400 font-medium"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/95 border-t border-yellow-500/20">
                <Link
                  href="/courses"
                  className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Courses
                </Link>
                <Link
                  href="/hackathons"
                  className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Hackathons
                </Link>
                <Link
                  href="/jobs"
                  className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Jobs
                </Link>
                <Link
                  href="/ai-tools"
                  className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  AI Tools
                </Link>
                <Link
                  href="/community-partnerships"
                  className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Community
                </Link>
                <Link
                  href="/about"
                  className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>

                {/* Mobile Auth Section */}
                <div className="border-t border-yellow-500/20 pt-4">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center px-3 py-2">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url || "/placeholder.svg"}
                            alt={user.full_name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                            <Settings className="w-4 h-4 text-black" />
                          </div>
                        )}
                        <span className="text-white font-medium">{user.full_name}</span>
                      </div>
                      <Link
                        href="/dashboard"
                        className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      {isUserAdmin && (
                        <Link
                          href="/admin"
                          className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 px-3">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          openAuthModal("login")
                          setIsOpen(false)
                        }}
                        className="w-full text-white border border-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                      >
                        Login
                      </Button>
                      <Button
                        onClick={() => {
                          openAuthModal("signup")
                          setIsOpen(false)
                        }}
                        className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-medium"
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}
