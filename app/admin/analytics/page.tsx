"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, Calendar, Briefcase, BookOpen, TrendingUp, Activity, Shield, ArrowLeft, UserCheck } from "lucide-react"
import { getCurrentUser, isAdmin, getDetailedAnalytics } from "@/lib/supabase"

const COLORS = ["#8B5CF6", "#A855F7", "#C084FC", "#DDD6FE", "#EDE9FE"]

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adminAccess, setAdminAccess] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

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
      await loadAnalytics()
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      const data = await getDetailedAnalytics()
      setAnalytics(data)
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
                <Activity className="w-8 h-8 text-purple-400" />
                Platform Analytics
              </h1>
              <p className="text-gray-400 mt-1">Detailed insights and performance metrics</p>
            </div>
            <Button
              onClick={() => router.push("/admin")}
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{analytics?.totals.totalUsers || 0}</p>
                  <p className="text-green-400 text-sm flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />+{analytics?.growth.userGrowth || 0}% from last month
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Hackathons</p>
                  <p className="text-2xl font-bold text-white">{analytics?.totals.activeHackathons || 0}</p>
                  <p className="text-green-400 text-sm flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />+{analytics?.growth.hackathonGrowth || 0}% this week
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Job Listings</p>
                  <p className="text-2xl font-bold text-white">{analytics?.totals.jobListings || 0}</p>
                  <p className="text-green-400 text-sm flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />+{analytics?.growth.jobGrowth || 0}% this week
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Courses</p>
                  <p className="text-2xl font-bold text-white">{analytics?.totals.courses || 0}</p>
                  <p className="text-green-400 text-sm flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />+{analytics?.growth.courseGrowth || 0}% this month
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Technologies */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Top Technologies</CardTitle>
              <CardDescription className="text-gray-400">Most popular technologies across platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.topTechnologies || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">User Distribution</CardTitle>
              <CardDescription className="text-gray-400">Users by role</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.usersByRole || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ role, count }) => `${role}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(analytics?.usersByRole || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-gray-400">Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.rawData.users.slice(0, 5).map((user: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">New user registered</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-green-400 text-green-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              ))}

              {analytics?.rawData.hackathons.slice(0, 3).map((hackathon: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">New hackathon created</p>
                      <p className="text-gray-400 text-sm">{hackathon.title}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-purple-400 text-purple-400">
                    {new Date(hackathon.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              ))}

              {analytics?.rawData.jobs.slice(0, 3).map((job: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">New job posted</p>
                      <p className="text-gray-400 text-sm">
                        {job.title} at {job.company}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-blue-400 text-blue-400">
                    {new Date(job.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
