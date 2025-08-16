"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Shield, Crown, User, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string
  role: string
  created_at: string
  last_sign_in_at: string
}

export default function AdminUsers() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])

  const supabase = createClientComponentClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const checkAdminAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = "/auth/login"
        return
      }

      setUser(user)

      // Check if user is super admin
      if (user.email === "sonishriyash@gmail.com") {
        setIsAdmin(true)
        setLoading(false)
        return
      }

      // Check database for admin role
      const { data: profile } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

      if (profile?.role === "admin") {
        setIsAdmin(true)
      }
    } catch (error) {
      console.error("Error checking admin access:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.from("user_profiles").update({ role: newRole }).eq("user_id", userId)

      if (error) throw error

      // Reload users
      loadUsers()
    } catch (error) {
      console.error("Error updating user role:", error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />
      case "organizer":
        return <Crown className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "organizer":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You don't have admin permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-8 h-8" />
                User Management
              </h1>
              <p className="text-gray-600 mt-2">Manage user accounts and roles</p>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Users</CardTitle>
            <CardDescription>Find users by email or name</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>All registered users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((userProfile) => (
                <div key={userProfile.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      {getRoleIcon(userProfile.role)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{userProfile.full_name || "No name"}</h3>
                      <p className="text-sm text-gray-600">{userProfile.email}</p>
                      <p className="text-xs text-gray-400">
                        Joined: {new Date(userProfile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(userProfile.role)}>{userProfile.role || "user"}</Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateUserRole(userProfile.user_id, "admin")}
                        disabled={userProfile.role === "admin"}
                      >
                        Make Admin
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateUserRole(userProfile.user_id, "organizer")}
                        disabled={userProfile.role === "organizer"}
                      >
                        Make Organizer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateUserRole(userProfile.user_id, "user")}
                        disabled={userProfile.role === "user" || !userProfile.role}
                      >
                        Make User
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">No users found matching your search.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
