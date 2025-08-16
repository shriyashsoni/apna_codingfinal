"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, getUserOrganizerStatus } from "@/lib/supabase"
import { getOrganizerRoles } from "@/lib/permissions"
import {
  Crown,
  Calendar,
  BookOpen,
  Briefcase,
  Users,
  TrendingUp,
  Plus,
  Shield,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

export default function OrganizerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [organizerStatus, setOrganizerStatus] = useState<{ is_organizer: boolean; organizer_types: string[] }>({
    is_organizer: false,
    organizer_types: [],
  })
  const [organizerRoles, setOrganizerRoles] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    checkOrganizerAccess()
  }, [])

  const checkOrganizerAccess = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }

      setUser(currentUser)

      // Check organizer status
      const orgStatus = await getUserOrganizerStatus(currentUser.id)
      setOrganizerStatus(orgStatus)

      // Load organizer roles
      const { data: roles } = await getOrganizerRoles(currentUser.id)
      setOrganizerRoles(roles || [])

      // If not an organizer, redirect to dashboard
      if (!orgStatus.is_organizer) {
        router.push("/dashboard")
        return
      }
    } catch (error) {
      console.error("Error checking organizer access:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case "hackathon_organizer":
        return "Hackathon Organizer"
      case "course_instructor":
        return "Course Instructor"
      case "job_poster":
        return "Job Poster"
      default:
        return roleName.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "hackathon_organizer":
        return <Calendar className="w-6 h-6" />
      case "course_instructor":
        return <BookOpen className="w-6 h-6" />
      case "job_poster":
        return <Briefcase className="w-6 h-6" />
      default:
        return <Crown className="w-6 h-6" />
    }
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case "hackathon_organizer":
        return "from-purple-500 to-blue-500"
      case "course_instructor":
        return "from-blue-500 to-green-500"
      case "job_poster":
        return "from-green-500 to-yellow-500"
      default:
        return "from-purple-500 to-blue-500"
    }
  }

  const getManagementLink = (roleName: string) => {
    switch (roleName) {
      case "hackathon_organizer":
        return "/admin/hackathons"
      case "course_instructor":
        return "/admin/courses"
      case "job_poster":
        return "/admin/jobs"
      default:
        return "/organizer/dashboard"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading organizer dashboard...</div>
      </div>
    )
  }

  if (!organizerStatus.is_organizer) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have organizer privileges.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Crown className="w-10 h-10 text-purple-400" />
              Organizer <span className="text-purple-400">Dashboard</span>
            </h1>
            <p className="text-gray-300 text-lg">Manage your assigned content areas</p>
          </div>

          {/* Welcome Card */}
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-purple-400 font-bold text-xl mb-2">
                    🎉 Welcome, {user?.full_name || user?.email?.split("@")[0]}!
                  </h3>
                  <p className="text-gray-300 mb-4">
                    You have been granted organizer privileges by an Admin. You can now manage content in your assigned
                    areas.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {organizerRoles.map((role) => (
                      <Badge key={role.id} className="bg-purple-400 text-black">
                        {getRoleDisplayName(role.role_name)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {organizerRoles.map((role) => (
              <Card key={role.id} className="bg-gray-900 border-gray-800 hover:border-purple-400 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${getRoleColor(role.role_name)}`}>
                      {getRoleIcon(role.role_name)}
                    </div>
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <CardTitle className="text-white">{getRoleDisplayName(role.role_name)}</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage and create{" "}
                    {role.role_name === "hackathon_organizer"
                      ? "hackathon events"
                      : role.role_name === "course_instructor"
                        ? "educational courses"
                        : "job listings and opportunities"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-400">
                      <p>✅ Create and edit content</p>
                      <p>✅ Manage submissions</p>
                      <p>✅ Update information</p>
                      <p>❌ No admin dashboard access</p>
                    </div>
                    <Link href={getManagementLink(role.role_name)}>
                      <Button className="w-full bg-purple-400 hover:bg-purple-500 text-black font-semibold">
                        <Plus className="w-4 h-4 mr-2" />
                        Manage{" "}
                        {role.role_name === "hackathon_organizer"
                          ? "Hackathons"
                          : role.role_name === "course_instructor"
                            ? "Courses"
                            : "Jobs"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Roles</p>
                    <p className="text-2xl font-bold text-white">{organizerRoles.length}</p>
                  </div>
                  <Crown className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Content Areas</p>
                    <p className="text-2xl font-bold text-white">{organizerStatus.organizer_types.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <p className="text-2xl font-bold text-green-400">Active</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guidelines */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                Organizer Guidelines
              </CardTitle>
              <CardDescription className="text-gray-400">
                Important information about your organizer role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">✅ What You Can Do</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Create and edit content in your assigned areas</li>
                    <li>• Manage submissions and applications</li>
                    <li>• Update event/course/job information</li>
                    <li>• View analytics for your content</li>
                  </ul>
                </div>

                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="text-red-400 font-semibold mb-2">❌ What You Cannot Do</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Access the admin dashboard</li>
                    <li>• Create or manage other organizers</li>
                    <li>• Modify user permissions</li>
                    <li>• Access areas outside your assigned roles</li>
                  </ul>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Important Notes</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Your organizer status was granted by an Admin</li>
                    <li>• Only Admins can modify or revoke organizer privileges</li>
                    <li>• Follow platform guidelines when creating content</li>
                    <li>• Contact Admin for any permission-related issues</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
