"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Shield, Plus, Search, ArrowLeft, Crown, Calendar, Briefcase, BookOpen } from "lucide-react"
import Link from "next/link"

interface UserPermission {
  id: string
  user_id: string
  permission_type: string
  granted_by: string
  granted_at: string
  expires_at: string | null
  user_profiles: {
    email: string
    full_name: string
  }
}

interface UserProfile {
  user_id: string
  email: string
  full_name: string
}

export default function AdminPermissions() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPermissions, setFilteredPermissions] = useState<UserPermission[]>([])
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedPermission, setSelectedPermission] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const supabase = createClientComponentClient()

  const permissionTypes = [
    { value: "hackathons", label: "Hackathons", icon: Calendar },
    { value: "jobs", label: "Jobs", icon: Briefcase },
    { value: "courses", label: "Courses", icon: BookOpen },
  ]

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadPermissions()
      loadUsers()
    }
  }, [isAdmin])

  useEffect(() => {
    const filtered = permissions.filter(
      (permission) =>
        permission.user_profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.permission_type.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredPermissions(filtered)
  }, [permissions, searchTerm])

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

  const loadPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from("user_permissions")
        .select(`
          *,
          user_profiles (
            email,
            full_name
          )
        `)
        .order("granted_at", { ascending: false })

      if (error) throw error
      setPermissions(data || [])
    } catch (error) {
      console.error("Error loading permissions:", error)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.from("user_profiles").select("user_id, email, full_name").order("email")

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const grantPermission = async () => {
    if (!selectedUser || !selectedPermission) return

    try {
      const { error } = await supabase.from("user_permissions").insert({
        user_id: selectedUser,
        permission_type: selectedPermission,
        granted_by: user.id,
        granted_at: new Date().toISOString(),
      })

      if (error) throw error

      // Reload permissions
      loadPermissions()
      setIsDialogOpen(false)
      setSelectedUser("")
      setSelectedPermission("")
    } catch (error) {
      console.error("Error granting permission:", error)
    }
  }

  const revokePermission = async (permissionId: string) => {
    try {
      const { error } = await supabase.from("user_permissions").delete().eq("id", permissionId)

      if (error) throw error

      // Reload permissions
      loadPermissions()
    } catch (error) {
      console.error("Error revoking permission:", error)
    }
  }

  const getPermissionIcon = (type: string) => {
    const permission = permissionTypes.find((p) => p.value === type)
    return permission ? permission.icon : Shield
  }

  const getPermissionBadgeVariant = (type: string) => {
    switch (type) {
      case "hackathons":
        return "default"
      case "jobs":
        return "secondary"
      case "courses":
        return "outline"
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
                <Shield className="w-8 h-8" />
                Permission Management
              </h1>
              <p className="text-gray-600 mt-2">Manage organizer permissions</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Grant Permission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Grant Permission</DialogTitle>
                <DialogDescription>Grant organizer permissions to a user</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select User</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Permission Type</label>
                  <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose permission type" />
                    </SelectTrigger>
                    <SelectContent>
                      {permissionTypes.map((permission) => (
                        <SelectItem key={permission.value} value={permission.value}>
                          {permission.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={grantPermission} className="w-full">
                  Grant Permission
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Permissions</CardTitle>
            <CardDescription>Find permissions by user or type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Permissions ({filteredPermissions.length})</CardTitle>
            <CardDescription>All granted organizer permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPermissions.map((permission) => {
                const PermissionIcon = getPermissionIcon(permission.permission_type)
                return (
                  <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <PermissionIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{permission.user_profiles?.full_name || "No name"}</h3>
                        <p className="text-sm text-gray-600">{permission.user_profiles?.email}</p>
                        <p className="text-xs text-gray-400">
                          Granted: {new Date(permission.granted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPermissionBadgeVariant(permission.permission_type)}>
                        <Crown className="w-3 h-3 mr-1" />
                        {permission.permission_type}
                      </Badge>
                      <Button size="sm" variant="destructive" onClick={() => revokePermission(permission.id)}>
                        Revoke
                      </Button>
                    </div>
                  </div>
                )
              })}
              {filteredPermissions.length === 0 && (
                <div className="text-center py-8 text-gray-500">No permissions found matching your search.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
