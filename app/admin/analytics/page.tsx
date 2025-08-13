"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, isAdmin, getAnalytics } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Calendar,
  Briefcase,
  BookOpen,
  TrendingUp,
  Activity,
  ArrowLeft,
  BarChart3,
  PieChart,
} from "lucide-react"

interface AnalyticsData {
  totalUsers: number
  userGrowth: number
  activeHackathons: number
  hackathonGrowth: number
  jobListings: number
  jobGrowth: number
  courses: number
  courseGrowth: number
  monthlyRegistrations: number[]
  topTechnologies: { name: string; count: number }[]
  usersByRole: { role: string; count: number }[]
  recentActivity: { type: string; description: string; timestamp: string }[]
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adminAccess, setAdminAccess] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    userGrowth: 0,
    activeHackathons: 0,
    hackathonGrowth: 0,
    jobListings: 0,
    jobGrowth: 0,
    courses: 0,
    courseGrowth: 0,
    monthlyRegistrations: [],
    topTechnologies: [],
    usersByRole: [],
    recentActivity: [],
  })
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.email !== "sonishriyash@gmail.com") {
        router.push("/admin")
        return
      }

      const hasAdminAccess = await isAdmin(currentUser.email)
      if (!hasAdminAccess) {
        router.push("/admin")
        return
      }

      setUser(currentUser)
      setAdminAccess(true)
      await loadAnalytics()
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/admin")
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      const data = await getAnalytics()

      // Calculate real analytics from database
      const totalUsers = data.users.length
      const activeHackathons = data.hackathons.filter((h) => h.status === "upcoming" || h.status === "ongoing").length
      const jobListings = data.jobs.filter((j) => j.status === "active").length
      const courses = data.courses.filter((c) => c.status === "active").length

      // Calculate growth percentages (mock calculation for demo)
      const userGrowth = 20.1
      const hackathonGrowth = 16.7
      const jobGrowth = 13.5
      const courseGrowth = 11.1

      // Top technologies from courses and hackathons
      const techCount: { [key: string]: number } = {}
      data.courses.forEach((course) => {
        if (course.technologies) {
          course.technologies.forEach((tech: string) => {
            techCount[tech] = (techCount[tech] || 0) + 1
          })
        }
      })
      data.hackathons.forEach((hackathon) => {
        if (hackathon.technologies) {
          hackathon.technologies.forEach((tech: string) => {
            techCount[tech] = (techCount[tech] || 0) + 1
          })
        }
      })

      const topTechnologies = Object.entries(techCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Users by role
      const roleCount: { [key: string]: number } = {}
      data.users.forEach((user) => {
        roleCount[user.role] = (roleCount[user.role] || 0) + 1
      })
      const usersByRole = Object.entries(roleCount).map(([role, count]) => ({ role, count }))

      // Recent activity (mock data)
      const recentActivity = [
        { type: "user", description: "New user registered", timestamp: "2 minutes ago" },
        { type: "hackathon", description: "BNB AI Hack registration opened", timestamp: "1 hour ago" },
        { type: "course", description: "React Masterclass published", timestamp: "3 hours ago" },
        { type: "job", description: "Senior Developer position posted", timestamp: "5 hours ago" },
        { type: "user", description: "Profile updated by user", timestamp: "1 day ago" },
      ]

      setAnalytics({
        totalUsers,
        userGrowth,
        activeHackathons,
        hackathonGrowth,
        jobListings,
        jobGrowth,
        courses,
        courseGrowth,
        monthlyRegistrations: [45, 52, 48, 61, 55, 67, 73, 69, 76, 82, 89, 95],
        topTechnologies,
        usersByRole,
        recentActivity,
      })
    } catch (error) {
      console.error("Error loading analytics:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white mt-4">Loading Analytics...</p>
        </div>
      </div>
    )
  }

  if (!adminAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <Button onClick={() => router.push("/admin")} className="bg-purple-400 hover:bg-purple-500 text-black">
            Return to Admin Dashboard
          </Button>
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
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/admin")}
                variant="outline"
                size="sm"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                  Analytics Dashboard
                </h1>
                <p className="text-gray-400 mt-1">Detailed platform analytics and insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800 hover:border-purple-400 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />+{analytics.userGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 hover:border-purple-400 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Hackathons</CardTitle>
              <Calendar className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.activeHackathons}</div>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />+{analytics.hackathonGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 hover:border-purple-400 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Job Listings</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.jobListings}</div>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />+{analytics.jobGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 hover:border-purple-400 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.courses}</div>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />+{analytics.courseGrowth}% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Technologies */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PieChart className="h-5 w-5 text-purple-400" />
                Top Technologies
              </CardTitle>
              <CardDescription className="text-gray-400">
                Most popular technologies in courses and hackathons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topTechnologies.slice(0, 8).map((tech, index) => (
                  <div key={tech.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <span className="text-white text-sm">{tech.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-400 rounded-full"
                          style={{ width: `${(tech.count / analytics.topTechnologies[0]?.count) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-400 text-sm w-8">{tech.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Users by Role */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-purple-400" />
                Users by Role
              </CardTitle>
              <CardDescription className="text-gray-400">Distribution of user roles on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.usersByRole.map((role, index) => (
                  <div key={role.role} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${role.role === "admin" ? "bg-yellow-400" : "bg-blue-400"}`}
                      ></div>
                      <span className="text-white text-sm capitalize">{role.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">{role.count} users</span>
                      <span className="text-xs text-gray-500">
                        ({((role.count / analytics.totalUsers) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-purple-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-400">Latest platform activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "user"
                        ? "bg-blue-400"
                        : activity.type === "hackathon"
                          ? "bg-green-400"
                          : activity.type === "course"
                            ? "bg-purple-400"
                            : "bg-yellow-400"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.description}</p>
                    <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
