"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, getDetailedAnalytics, type User } from "@/lib/supabase"
import { getPermissionStats } from "@/lib/permissions"
import {
  Users,
  BookOpen,
  Trophy,
  Briefcase,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Plus,
  Shield,
  AlertTriangle,
} from "lucide-react"

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [permissionStats, setPermissionStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }

      if (currentUser.role !== "admin") {
        router.push("/dashboard")
        return
      }

      setUser(currentUser)

      // Load analytics and permission data
      const [analyticsData, permissionsData] = await Promise.all([getDetailedAnalytics(), getPermissionStats()])

      setAnalytics(analyticsData)
      setPermissionStats(permissionsData)
    } catch (error) {
      console.error("Error loading admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Access denied. Admin privileges required.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔒 Admin <span className="text-yellow-400">Dashboard</span> 🛠️
          </h1>
          <p className="text-gray-300 text-lg">Manage your platform and monitor performance</p>
        </div>

        {/* Permission System Alert */}
        <Card className="bg-yellow-900/20 border-yellow-500/50 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-yellow-400 font-bold text-lg mb-2">🔒 PERMISSION SYSTEM ACTIVE</h3>
                <p className="text-gray-300 mb-3">
                  Database and Admin Portal are now connected. Only Admins can grant permissions to users and create
                  Organizers.
                </p>
                <div className="flex gap-4">
                  <Link href="/admin/permissions">
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                      <Shield className="w-4 h-4 mr-2" />
                      Manage Permissions
                    </Button>
                  </Link>
                  <Badge className="bg-green-500 text-white px-3 py-1">System Protected ✅</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{analytics?.totals?.totalUsers || 0}</p>
                  <div className="flex items-center mt-1">
                    {analytics?.growth?.userGrowth >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                    )}
                    <span
                      className={`text-sm ${analytics?.growth?.userGrowth >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {analytics?.growth?.userGrowth || 0}%
                    </span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Courses</p>
                  <p className="text-2xl font-bold text-white">{analytics?.totals?.courses || 0}</p>
                  <div className="flex items-center mt-1">
                    {analytics?.growth?.courseGrowth >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                    )}
                    <span
                      className={`text-sm ${analytics?.growth?.courseGrowth >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {analytics?.growth?.courseGrowth || 0}%
                    </span>
                  </div>
                </div>
                <BookOpen className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Hackathons</p>
                  <p className="text-2xl font-bold text-white">{analytics?.totals?.activeHackathons || 0}</p>
                  <div className="flex items-center mt-1">
                    {analytics?.growth?.hackathonGrowth >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                    )}
                    <span
                      className={`text-sm ${analytics?.growth?.hackathonGrowth >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {analytics?.growth?.hackathonGrowth || 0}%
                    </span>
                  </div>
                </div>
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Job Listings</p>
                  <p className="text-2xl font-bold text-white">{analytics?.totals?.jobListings || 0}</p>
                  <div className="flex items-center mt-1">
                    {analytics?.growth?.jobGrowth >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                    )}
                    <span
                      className={`text-sm ${analytics?.growth?.jobGrowth >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {analytics?.growth?.jobGrowth || 0}%
                    </span>
                  </div>
                </div>
                <Briefcase className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Management Actions */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2 text-yellow-400" />
                Content Management
              </CardTitle>
              <CardDescription className="text-gray-400">Manage courses, hackathons, jobs, and users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/courses">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Courses
                  </Button>
                </Link>
                <Link href="/admin/hackathons">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    <Trophy className="w-4 h-4 mr-2" />
                    Hackathons
                  </Button>
                </Link>
                <Link href="/admin/jobs">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Jobs
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    <Users className="w-4 h-4 mr-2" />
                    Users
                  </Button>
                </Link>
                <Link href="/admin/hackathons/enhanced">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    <Trophy className="w-4 h-4 mr-2" />
                    Enhanced Hackathons
                  </Button>
                </Link>
              </div>

              {/* NEW: Permissions Management */}
              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-yellow-400" />🔒 Permissions & Roles
                </h4>
                <Link href="/admin/permissions">
                  <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold mb-3">
                    <Shield className="w-4 h-4 mr-2" />
                    Manage Permissions
                  </Button>
                </Link>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Assign organizer roles to users</p>
                  <p>• Grant specific content permissions</p>
                  <p>• Set time-limited access</p>
                  <p>• Manage user access levels</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-white font-semibold mb-3">Quick Add</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/admin/courses/new">
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Course
                    </Button>
                  </Link>
                  <Link href="/admin/hackathons/new">
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Hackathon
                    </Button>
                  </Link>
                  <Link href="/admin/jobs/new">
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Job
                    </Button>
                  </Link>
                  <Link href="/admin/hackathons/enhanced/new">
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Enhanced Hackathon
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics & Settings */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
                Analytics & Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                View detailed analytics and manage site settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Link href="/admin/analytics">
                  <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Site Settings
                  </Button>
                </Link>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-white font-semibold mb-3">User Roles</h4>
                <div className="space-y-2">
                  {analytics?.usersByRole?.map((roleData: any) => (
                    <div key={roleData.role} className="flex items-center justify-between">
                      <span className="text-gray-400 capitalize">{roleData.role}s:</span>
                      <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400">
                        {roleData.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NEW: Permissions Overview Card */}
        <Card className="bg-gray-900/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="w-5 h-5 mr-2 text-yellow-400" />🔒 Permissions Overview
            </CardTitle>
            <CardDescription className="text-gray-400">Current user permissions and organizer roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Active Organizers</span>
                  <Badge className="bg-blue-500 text-white">{permissionStats?.active_organizers || 0}</Badge>
                </div>
                <div className="text-xs text-gray-400">Users with organizer roles assigned</div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Custom Permissions</span>
                  <Badge className="bg-green-500 text-white">{permissionStats?.total_permissions || 0}</Badge>
                </div>
                <div className="text-xs text-gray-400">Individual permissions granted</div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Permission Types</span>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="border-blue-400 text-blue-400 text-xs">
                      H: {permissionStats?.permission_types?.hackathons || 0}
                    </Badge>
                    <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                      C: {permissionStats?.permission_types?.courses || 0}
                    </Badge>
                    <Badge variant="outline" className="border-orange-400 text-orange-400 text-xs">
                      J: {permissionStats?.permission_types?.jobs || 0}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-gray-400">H: Hackathons, C: Courses, J: Jobs</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/permissions">
                <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                  <Shield className="w-4 h-4 mr-2" />
                  Manage All Permissions
                </Button>
              </Link>
              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 font-semibold text-sm">Permission System Active</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">All content posting is now protected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-gray-400">Latest updates and changes to your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white">🔒 Permission system activated</span>
                </div>
                <span className="text-gray-400 text-sm">Just now</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-white">Database backup completed</span>
                </div>
                <span className="text-gray-400 text-sm">2 hours ago</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-white">New user registrations: +{analytics?.growth?.userGrowth || 0}%</span>
                </div>
                <span className="text-gray-400 text-sm">Today</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-white">
                    Organizer roles assigned: {permissionStats?.active_organizers || 0}
                  </span>
                </div>
                <span className="text-gray-400 text-sm">This week</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
