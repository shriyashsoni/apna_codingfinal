"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signUp, resetPassword } from "@/lib/supabase"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "login" | "signup"
  onSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, mode: initialMode, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setFullName("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
    setShowPassword(false)
    setShowConfirmPassword(false)
    setShowForgotPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleModeSwitch = (newMode: "login" | "signup") => {
    setMode(newMode)
    setError("")
    setSuccess("")
    setShowForgotPassword(false)
  }

  const validateForm = () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return false
    }

    if (!showForgotPassword && (!password || password.length < 6)) {
      setError("Password must be at least 6 characters long")
      return false
    }

    if (mode === "signup") {
      if (!fullName.trim()) {
        setError("Please enter your full name")
        return false
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) return

    setLoading(true)

    try {
      if (showForgotPassword) {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message || "Failed to send reset email")
        } else {
          setSuccess("Password reset email sent! Check your inbox.")
          setTimeout(() => {
            setShowForgotPassword(false)
            setSuccess("")
          }, 3000)
        }
      } else if (mode === "signup") {
        const { data, error } = await signUp(email, password, fullName)
        if (error) {
          setError(error.message || "Failed to create account")
        } else {
          setSuccess("Account created successfully! Please check your email to verify your account.")
          setTimeout(() => {
            onSuccess()
            handleClose()
          }, 2000)
        }
      } else {
        const { data, error } = await signIn(email, password)
        if (error) {
          setError(error.message || "Failed to sign in")
        } else {
          setSuccess("Signed in successfully!")
          setTimeout(() => {
            onSuccess()
            handleClose()
          }, 1000)
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                {showForgotPassword ? "Reset Password" : mode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!showForgotPassword && (
                <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => handleModeSwitch("login")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      mode === "login" ? "bg-yellow-400 text-black" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleModeSwitch("signup")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      mode === "signup" ? "bg-yellow-400 text-black" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && !showForgotPassword && (
                  <div>
                    <Label htmlFor="fullName" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 bg-gray-800 border-gray-700 text-white"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {!showForgotPassword && (
                  <div>
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white pr-10"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "signup" && !showForgotPassword && (
                  <div>
                    <Label htmlFor="confirmPassword" className="text-white">
                      Confirm Password
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white pr-10"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg">
                    <p className="text-green-300 text-sm">{success}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {showForgotPassword ? "Sending..." : mode === "login" ? "Signing In..." : "Creating Account..."}
                    </>
                  ) : showForgotPassword ? (
                    "Send Reset Email"
                  ) : mode === "login" ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>

                {mode === "login" && !showForgotPassword && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-yellow-400 hover:text-yellow-300 text-sm"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {showForgotPassword && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="text-yellow-400 hover:text-yellow-300 text-sm"
                    >
                      Back to login
                    </button>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
