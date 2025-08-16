"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, isAdmin, getAllUsers, type User } from "@/lib/supabase"
import {
  getUserPermissions,
  grantPermission,
  revokePermission,
  assignOrganizerRole,
  removeOrganizerRole,
  getOrganizerRoles,
  getPermissionStats,
  type UserPermission,
  type OrganizerRole,
} from "@/lib/permissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Users,
  Search,
  Shield,
  Plus,
  Trash2,
  Calendar,
  BookOpen,
  Briefcase,
  Crown,
  Clock,
  UserPlus,
  AlertTriangle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminPermissions() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adminAccess, setAdminAccess] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: UserPermission[] }>({})
  const [organizerRoles, setOrganizerRoles] = useState<{ [key: string]: OrganizerRole[] }>({})
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const checkAdminAccess = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.email !== "sonishriyash@gmail.com") {
        router.push("/")
        return
      }

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
    try {
      const [usersResult, statsResult] = await Promise.all([getAllUsers(), getPermissionStats()])

      if (usersResult.error) {
        console.error("Error loading users:", usersResult.error)
        return
      }

      const allUsers = usersResult.data || []
      setUsers(allUsers)
      setStats(statsResult)

      // Load permissions and roles for each user
      const permissionsMap: { [key: string]: UserPermission[] } = {}
      const rolesMap: { [key: string]: OrganizerRole[] } = {}

      for (const user of allUsers) {
        const { data: permissions } = await getUserPermissions(user.id)
        const { data: roles } = await getOrganizerRoles(user.id)

        permissionsMap[user.id] = permissions || []
        rolesMap[user.id] = roles || []
      }

      setUserPermissions(permissionsMap)
      setOrganizerRoles(rolesMap)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const handleGrantPermission = async (
    userId: string,
    permissionType: string,
    permissionLevel: string,
    expiresAt?: string,
  ) => {
    try {
      const { error } = await grantPermission(userId, permissionType, permissionLevel, expiresAt)
      if (error) {
        alert("Error granting permission: " + error.message)
        return
      }

      await loadData()
      setShowPermissionDialog(false)
      alert("Permission granted successfully!")
    } catch (error) {
      console.error("Error granting permission:", error)
      alert("Error granting permission")
    }
  }

  const handleRevokePermission = async (permissionId: string) => {
    if (!confirm("Are you sure you want to revoke this permission?")) {
      return
    }

    try {
      const { error } = await revokePermission(permissionId)
      if (error) {
        alert("Error revoking permission: " + error.message)
        return
      }

      await loadData()
      alert("Permission revoked successfully!")
    } catch (error) {
      console.error("Error revoking permission:", error)
      alert("Error revoking permission")
    }
  }

  const handleAssignRole = async (userId: string, roleName: string) => {
    try {
      const { error } = await assignOrganizerRole(userId, roleName)
      if (error) {
        alert("Error assigning role: " + error.message)
        return
      }

      await loadData()
      setShowRoleDialog(false)
      alert("Role assigned successfully!")
    } catch (error) {
      console.error("Error assigning role:", error)
      alert("Error assigning role")
    }
  }

  const handleRemoveRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to remove this role?")) {
      return
    }

    try {
      const { error } = await removeOrganizerRole(roleId)
      if (error) {
        alert("Error removing role: " + error.message)
        return
      }

      await loadData()
      alert("Role removed successfully!")
    } catch (error) {
      console.error("Error removing role:", error)
      alert("Error removing role")
    }
  }

  const getPermissionIcon = (type: string) => {
    switch (type) {
      case "hackathons":
        return <Calendar className="w-4 h-4" />
      case "courses":
        return <BookOpen className="w-4 h-4" />
      case "jobs":
        return <Briefcase className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "hackathon_organizer":
        return <Calendar className="w-4 h-4" />
      case "course_instructor":
        return <BookOpen className="w-4 h-4" />
      case "job_poster":
        return <Briefcase className="w-4 h-4" />
      default:
        return <Crown className="w-4 h-4" />
    }
  }

  const getPermissionLevelColor = (level: string) => {
    switch (level) {
      case "admin":
        return "bg-red-500"
      case "write":
        return "bg-yellow-500"
      case "read":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-white mt-4">Loading Permissions...</p>
        </div>
      </div>
    )
  }

  if (!adminAccess || user?.email !== "sonishriyash@gmail.com") {
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Shield className="w-8 h-8 text-yellow-400" />🔒 Admin & Permission Control
              </h1>
              <p className="text-gray-400 mt-1">Manage user permissions and organizer roles</p>
            </div>
            <Button
              onClick={() => router.push("/admin")}
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Permission Rules Warning */}
        <Card className="bg-red-900/20 border-red-500/50 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-red-400 font-bold text-lg mb-2">🔒 STRICT PERMISSION RULES</h3>
                <div className="text-gray-300 space-y-2">
                  <p>
                    <strong>✅ Only Admins can:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Grant permissions to users</li>
                    <li>Create and manage Organizers</li>
                    <li>Access this admin portal</li>
                  </ul>
                  <p>
                    <strong>✅ Organizers can only:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Post content in their assigned category (Hackathons/Courses/Jobs)</li>
                    <li>Only after explicit Admin approval</li>
                  </ul>
                  <p>
                    <strong>❌ Regular users:</strong> Cannot post any content without permissions
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.total_permissions || 0}</div>
              <p className="text-xs text-gray-500">Custom permissions granted</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Organizers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats?.active_organizers || 0}</div>
              <p className="text-xs text-gray-500">Users with organizer roles</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Hackathon Organizers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {stats?.organizer_types?.hackathon_organizer || 0}
              </div>
              <p className="text-xs text-gray-500">Can manage hackathons</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Course Instructors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats?.organizer_types?.course_instructor || 0}</div>
              <p className="text-xs text-gray-500">Can manage courses</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Search Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                {filteredUsers.length} users
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((userData) => (
            <Card key={userData.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">{userData.full_name || "No Name"}</h3>
                        <Badge
                          className={userData.role === "admin" ? "bg-yellow-400 text-black" : "bg-gray-600 text-white"}
                        >
                          {userData.role}
                        </Badge>
                        {userData.email === "sonishriyash@gmail.com" && (
                          <Badge className="bg-red-500 text-white">Super Admin</Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{userData.email}</p>
                      <p className="text-gray-500 text-xs">
                        Joined {new Date(userData.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog
                      open={showPermissionDialog && selectedUser?.id === userData.id}
                      onOpenChange={setShowPermissionDialog}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white bg-transparent"
                          onClick={() => setSelectedUser(userData)}
                          disabled={userData.email === "sonishriyash@gmail.com"}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Grant Permission
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Grant Permission</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Grant specific permissions to {userData.full_name}
                          </DialogDescription>
                        </DialogHeader>
                        <PermissionForm
                          onSubmit={(type, level, expires) => handleGrantPermission(userData.id, type, level, expires)}
                          onCancel={() => setShowPermissionDialog(false)}
                        />
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showRoleDialog && selectedUser?.id === userData.id} onOpenChange={setShowRoleDialog}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent"
                          onClick={() => setSelectedUser(userData)}
                          disabled={userData.email === "sonishriyash@gmail.com"}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Make Organizer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Assign Organizer Role</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Assign an organizer role to {userData.full_name}
                          </DialogDescription>
                        </DialogHeader>
                        <RoleForm
                          onSubmit={(role) => handleAssignRole(userData.id, role)}
                          onCancel={() => setShowRoleDialog(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Current Permissions */}
                {userPermissions[userData.id] && userPermissions[userData.id].length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-2">Current Permissions:</h4>
                    <div className="flex flex-wrap gap-2">
                      {userPermissions[userData.id].map((permission) => (
                        <div key={permission.id} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                          {getPermissionIcon(permission.permission_type)}
                          <span className="text-white text-sm">{permission.permission_type}</span>
                          <Badge
                            className={`${getPermissionLevelColor(permission.permission_level)} text-white text-xs`}
                          >
                            {permission.permission_level}
                          </Badge>
                          {permission.expires_at && (
                            <div className="flex items-center text-gray-400 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(permission.expires_at).toLocaleDateString()}
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 p-1 h-auto"
                            onClick={() => handleRevokePermission(permission.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Roles */}
                {organizerRoles[userData.id] && organizerRoles[userData.id].length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-2">Organizer Roles:</h4>
                    <div className="flex flex-wrap gap-2">
                      {organizerRoles[userData.id].map((role) => (
                        <div key={role.id} className="flex items-center gap-2 bg-blue-900 rounded-lg px-3 py-2">
                          {getRoleIcon(role.role_name)}
                          <span className="text-white text-sm">
                            {role.role_name.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 p-1 h-auto"
                            onClick={() => handleRemoveRole(role.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
              <p className="text-gray-400">
                {searchTerm ? "No users match your search criteria." : "No users registered yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function PermissionForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (type: string, level: string, expires?: string) => void
  onCancel: () => void
}) {
  const [permissionType, setPermissionType] = useState("")
  const [permissionLevel, setPermissionLevel] = useState("")
  const [expiresAt, setExpiresAt] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!permissionType || !permissionLevel) return
    onSubmit(permissionType, permissionLevel, expiresAt || undefined)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="permission-type" className="text-white">
          Permission Type
        </Label>
        <Select value={permissionType} onValueChange={setPermissionType}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Select permission type" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="hackathons">Hackathons</SelectItem>
            <SelectItem value="courses">Courses</SelectItem>
            <SelectItem value="jobs">Jobs</SelectItem>
            <SelectItem value="all">All Content</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="permission-level" className="text-white">
          Permission Level
        </Label>
        <Select value={permissionLevel} onValueChange={setPermissionLevel}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Select permission level" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="read">Read Only</SelectItem>
            <SelectItem value="write">Read & Write</SelectItem>
            <SelectItem value="admin">Full Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="expires-at" className="text-white">
          Expires At (Optional)
        </Label>
        <Input
          id="expires-at"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Grant Permission
        </Button>
      </div>
    </form>
  )
}

function RoleForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (role: string) => void
  onCancel: () => void
}) {
  const [roleName, setRoleName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleName) return
    onSubmit(roleName)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="role-name" className="text-white">
          Organizer Role
        </Label>
        <Select value={roleName} onValueChange={setRoleName}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Select organizer role" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="hackathon_organizer">Hackathon Organizer</SelectItem>
            <SelectItem value="course_instructor">Course Instructor</SelectItem>
            <SelectItem value="job_poster">Job Poster</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
        <h4 className="text-blue-400 font-semibold mb-2">Role Permissions:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          {roleName === "hackathon_organizer" && (
            <>
              <li>✅ Can post and manage hackathon events</li>
              <li>✅ Can edit hackathon details</li>
              <li>❌ Cannot access courses or jobs</li>
            </>
          )}
          {roleName === "course_instructor" && (
            <>
              <li>✅ Can post and manage courses</li>
              <li>✅ Can edit course content</li>
              <li>❌ Cannot access hackathons or jobs</li>
            </>
          )}
          {roleName === "job_poster" && (
            <>
              <li>✅ Can post and manage job listings</li>
              <li>✅ Can edit job details</li>
              <li>❌ Cannot access hackathons or courses</li>
            </>
          )}
        </ul>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Assign Role
        </Button>
      </div>
    </form>
  )
}
