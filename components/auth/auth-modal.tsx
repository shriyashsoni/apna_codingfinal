"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  mode?: "login" | "signup"
}

export default function AuthModal({ isOpen, onClose, onSuccess, mode = "login" }: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState<"login" | "signup">(mode)

  const handleSuccess = () => {
    onClose()
    if (onSuccess) {
      onSuccess()
    }
  }

  const switchMode = () => {
    setCurrentMode(currentMode === "login" ? "signup" : "login")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {currentMode === "login" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {currentMode === "login" ? <LoginForm onSuccess={handleSuccess} /> : <SignupForm onSuccess={handleSuccess} />}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {currentMode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <Button
              variant="link"
              onClick={switchMode}
              className="text-yellow-400 hover:text-yellow-300 p-0 h-auto font-medium"
            >
              {currentMode === "login" ? "Sign up" : "Sign in"}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
