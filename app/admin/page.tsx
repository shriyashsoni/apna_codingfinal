"use client"

import { useRouter } from "next/router"
import { useState } from "react"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import { Shield } from "lucide-react"

const AdminPage = () => {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [adminAccess, setAdminAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAdminAccess = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }

      // Always allow sonishriyash@gmail.com as super admin
      if (currentUser.email === "sonishriyash@gmail.com") {
        setUser(currentUser)
        setAdminAccess(true)
        await loadData()
        setLoading(false)
        return
      }

      // Check database for other admin users
      const hasAdminAccess = await isAdmin(currentUser.email)
      if (!hasAdminAccess) {
        router.push("/")
        return
      }

      setUser(currentUser)
      setAdminAccess(true)
      await loadData()
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    // Load data logic here
  }

  if (!adminAccess || !user?.email || (user.email !== "sonishriyash@gmail.com" && user?.role !== "admin")) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  // Render admin page content here

  return <div>{/* Admin page content */}</div>
}

export default AdminPage
