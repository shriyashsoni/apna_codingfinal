"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab)

  const handleClose = () => {
    onClose()
    // Reset to login tab when modal closes
    setTimeout(() => setActiveTab("login"), 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">{activeTab === "login" ? "Sign In" : "Sign Up"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tab Switcher */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === "login" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setActiveTab("login")}
            >
              Sign In
            </Button>
            <Button
              variant={activeTab === "signup" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </Button>
          </div>

          {/* Form Content */}
          {activeTab === "login" ? <LoginForm onClose={handleClose} /> : <SignupForm onClose={handleClose} />}

          {/* Switch Tab Link */}
          <div className="text-center text-sm text-gray-600">
            {activeTab === "login" ? (
              <>
                {"Don't have an account? "}
                <button
                  type="button"
                  className="text-blue-600 hover:underline font-medium"
                  onClick={() => setActiveTab("signup")}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                {"Already have an account? "}
                <button
                  type="button"
                  className="text-blue-600 hover:underline font-medium"
                  onClick={() => setActiveTab("login")}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
