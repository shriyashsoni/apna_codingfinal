"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, isAdmin, getDetailedAnalytics, getUserOrganizerStatus, type User } from "@/lib/supabase"
import {
  Shield,
  Users,
  Trophy,
  Briefcase,
  Calendar,
  TrendingUp,
  Settings,
  BarChart3,
  Mail,
  Plus,
  Crown,
  BookOpen,
} from "lucide-react"

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminAccess, setAdminAccess] = useState(false)
  const [organizerStatus, setOrganizerStatus] = useState({ is_organizer: false, organizer_types: [] })
  const [analytics, setAnalytics] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }

      const hasAdminAccess = await isAdmin(currentUser.email)
      const orgStatus = await getUserOrganizerStatus(currentUser.id)

      // Check if user has admin access or any organizer permission
      if (!hasAdminAccess && !orgStatus.is_organizer) {
        router.push("/")
        return
      }

      setUser(currentUser)
      setAdminAccess(hasAdminAccess)
      setOrganizerStatus(orgStatus)

      // Load analytics data
      if (hasAdminAccess) {
        const analyticsData = await getDetailedAnalytics()
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error("Error checking access:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-white mt-4">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!adminAccess && !organizerStatus.is_organizer) {
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

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case "hackathon_organizer":
        return "Hackathon Organizer"
      case "event_organizer":
        return "Event Organizer"
      case "job_poster":
        return "Job Poster"
      default:
        return roleName.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                {adminAccess ? (
                  <>
                    <Shield className="w-8 h-8 text-yellow-400" />
                    Admin Dashboard
                  </>
                ) : (
                  <>
                    <Crown className="w-8 h-8 text-purple-400" />
                    Organizer Dashboard
                  </>
                )}
              </h1>
              <p className="text-gray-400 mt-1">
                {adminAccess
                  ? "Manage your platform and monitor performance"
                  : `Manage your ${organizerStatus.organizer_types.map(getRoleDisplayName).join(", ")} content`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {adminAccess && (
                <Badge className="bg-yellow-400 text-black">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
              {organizerStatus.is_organizer && (
                <Badge className="bg-purple-400 text-black">
                  <Crown className="w-3 h-3 mr-1" />
                  Organizer
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Analytics */}
        {adminAccess && analytics && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics.totals.totalUsers}</div>
                  <p className="text-xs text-green-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />+{analytics.growth.userGrowth}% this month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Active Events</CardTitle>
                  <Calendar className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics.totals.events}</div>
                  <p className="text-xs text-green-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />+{analytics.growth.eventGrowth}% this month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Active Hackathons</CardTitle>
                  <Trophy className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics.totals.activeHackathons}</div>
                  <p className="text-xs text-green-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />+{analytics.growth.hackathonGrowth}% this month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Job Listings</CardTitle>
                  <Briefcase className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics.totals.jobListings}</div>
                  <p className="text-xs text-green-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />+{analytics.growth.jobGrowth}% this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Admin Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-yellow-400" />
                    User Management
                  </CardTitle>
                  <CardDescription className="text-gray-400">Manage users and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/admin/users">
                      <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">Manage Users</Button>
                    </Link>
                    <Link href="/admin/permissions">
                      <Button
                        variant="outline"
                        className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                      >
                        Manage Permissions
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
                    Analytics
                  </CardTitle>
                  <CardDescription className="text-gray-400">View detailed analytics and reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/admin/analytics">
                      <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">View Analytics</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-yellow-400" />
                    Email Management
                  </CardTitle>
                  <CardDescription className="text-gray-400">Send emails and manage notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/admin/emails">
                      <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">Email Dashboard</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Content Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Events Management */}
          {(adminAccess || organizerStatus.organizer_types.includes("event_organizer")) && (
            <Card className="bg-gray-900 border-gray-800 hover:border-purple-400 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                  Events Management
                </CardTitle>
                <CardDescription className="text-gray-400">Create and manage tech events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/admin/events/new">
                    <Button className="w-full bg-purple-400 hover:bg-purple-500 text-black">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                  <Link href="/admin/events">
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      Manage Events
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hackathons Management */}
          {(adminAccess || organizerStatus.organizer_types.includes("hackathon_organizer")) && (
            <Card className="bg-gray-900 border-gray-800 hover:border-green-400 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-green-400" />
                  Hackathons Management
                </CardTitle>
                <CardDescription className="text-gray-400">Create and manage hackathons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/admin/hackathons/new">
                    <Button className="w-full bg-green-400 hover:bg-green-500 text-black">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Hackathon
                    </Button>
                  </Link>
                  <Link href="/admin/hackathons">
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      Manage Hackathons
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Jobs Management */}
          {(adminAccess || organizerStatus.organizer_types.includes("job_poster")) && (
            <Card className="bg-gray-900 border-gray-800 hover:border-blue-400 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
                  Jobs Management
                </CardTitle>
                <CardDescription className="text-gray-400">Post and manage job listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/admin/jobs/new">
                    <Button className="w-full bg-blue-400 hover:bg-blue-500 text-black">
                      <Plus className="w-4 h-4 mr-2" />
                      Post Job
                    </Button>
                  </Link>
                  <Link href="/admin/jobs">
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      Manage Jobs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Additional Admin Features */}
        {adminAccess && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-yellow-400" />
                  Platform Settings
                </CardTitle>
                <CardDescription className="text-gray-400">Configure platform settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/settings">
                  <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">Platform Settings</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-yellow-400" />
                  Community Management
                </CardTitle>
                <CardDescription className="text-gray-400">Manage community partnerships</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/partnerships">
                  <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">Manage Partnerships</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-yellow-400" />
                  Content Management
                </CardTitle>
                <CardDescription className="text-gray-400">Manage all platform content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black" disabled>
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
