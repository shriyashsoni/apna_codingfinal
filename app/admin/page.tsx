"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, FileText, Calendar, Briefcase, Settings, Shield, BarChart3, MessageSquare } from "lucide-react"
import Link from "next/link"

interface AdminStats {
  totalUsers: number
  totalHackathons: number
  totalJobs: number
  totalCourses: number
  pendingApprovals: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalHackathons: 0,
    totalJobs: 0,
    totalCourses: 0,
    pendingApprovals: 0,
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    checkAdminAccess()
    loadStats()
  }, [])

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

  const loadStats = async () => {
    try {
      const [usersRes, hackathonsRes, jobsRes, coursesRes] = await Promise.all([
        supabase.from("user_profiles").select("id", { count: "exact" }),
        supabase.from("hackathons").select("id", { count: "exact" }),
        supabase.from("jobs").select("id", { count: "exact" }),
        supabase.from("courses").select("id", { count: "exact" }),
      ])

      setStats({
        totalUsers: usersRes.count || 0,
        totalHackathons: hackathonsRes.count || 0,
        totalJobs: jobsRes.count || 0,
        totalCourses: coursesRes.count || 0,
        pendingApprovals: 0,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
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

  const adminCards = [
    {
      title: "Users",
      description: "Manage user accounts and profiles",
      icon: Users,
      count: stats.totalUsers,
      href: "/admin/users",
      color: "bg-blue-500",
    },
    {
      title: "Hackathons",
      description: "Manage hackathon events",
      icon: Calendar,
      count: stats.totalHackathons,
      href: "/admin/hackathons",
      color: "bg-green-500",
    },
    {
      title: "Jobs",
      description: "Manage job postings",
      icon: Briefcase,
      count: stats.totalJobs,
      href: "/admin/jobs",
      color: "bg-orange-500",
    },
    {
      title: "Courses",
      description: "Manage course content",
      icon: FileText,
      count: stats.totalCourses,
      href: "/admin/courses",
      color: "bg-purple-500",
    },
    {
      title: "Analytics",
      description: "View platform analytics",
      icon: BarChart3,
      count: null,
      href: "/admin/analytics",
      color: "bg-indigo-500",
    },
    {
      title: "Community",
      description: "Manage community features",
      icon: MessageSquare,
      count: null,
      href: "/admin/community",
      color: "bg-pink-500",
    },
    {
      title: "Permissions",
      description: "Manage user permissions",
      icon: Shield,
      count: null,
      href: "/admin/permissions",
      color: "bg-red-500",
    },
    {
      title: "Settings",
      description: "Platform configuration",
      icon: Settings,
      count: null,
      href: "/admin/settings",
      color: "bg-gray-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.email}</p>
          <Badge variant="secondary" className="mt-2">
            <Shield className="w-4 h-4 mr-1" />
            Administrator
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminCards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <div className={`p-2 rounded-md ${card.color}`}>
                    <card.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.count !== null ? card.count : "—"}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/admin/hackathons/new">Add Hackathon</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/jobs/new">Post Job</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/courses/new">Create Course</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/permissions">Manage Permissions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
