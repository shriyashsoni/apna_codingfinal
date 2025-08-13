"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getCurrentUser,
  getCourses,
  getHackathons,
  getJobs,
  type User,
  type Course,
  type Hackathon,
  type Job,
} from "@/lib/supabase"
import { BookOpen, Trophy, Briefcase, UserIcon, Calendar, MapPin, Clock, Star } from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }

      setUser(currentUser)

      // Load dashboard data
      const [coursesResult, hackathonsResult, jobsResult] = await Promise.all([
        getCourses(),
        getHackathons(),
        getJobs(),
      ])

      if (coursesResult.data) setCourses(coursesResult.data.slice(0, 3))
      if (hackathonsResult.data) setHackathons(hackathonsResult.data.slice(0, 3))
      if (jobsResult.data) setJobs(jobsResult.data.slice(0, 3))
    } catch (error) {
      console.error("Error loading dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading your dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Please log in to access your dashboard.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-yellow-400">{user.full_name || "Developer"}</span>! 👋
          </h1>
          <p className="text-gray-300 text-lg">Ready to continue your coding journey?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Courses Available</p>
                  <p className="text-2xl font-bold text-white">{courses.length}+</p>
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
                  <p className="text-2xl font-bold text-white">{hackathons.length}+</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Job Opportunities</p>
                  <p className="text-2xl font-bold text-white">{jobs.length}+</p>
                </div>
                <Briefcase className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Your Role</p>
                  <p className="text-2xl font-bold text-white capitalize">{user.role}</p>
                </div>
                <UserIcon className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Featured Courses */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-yellow-400" />
                Featured Courses
              </CardTitle>
              <CardDescription className="text-gray-400">Start learning with our top-rated courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">{course.title}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400">
                      {course.level}
                    </Badge>
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 mr-1" />
                      <span className="text-sm">{course.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration}
                    </span>
                    <span className="text-yellow-400 font-semibold">${course.price}</span>
                  </div>
                </div>
              ))}
              <Button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                onClick={() => router.push("/courses")}
              >
                View All Courses
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Hackathons */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Upcoming Hackathons
              </CardTitle>
              <CardDescription className="text-gray-400">Join exciting competitions and win prizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hackathons.map((hackathon) => (
                <div key={hackathon.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">{hackathon.title}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-green-400/20 text-green-400">
                      {hackathon.status}
                    </Badge>
                    <span className="text-yellow-400 font-semibold">{hackathon.prize_pool}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(hackathon.start_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {hackathon.location}
                    </div>
                  </div>
                </div>
              ))}
              <Button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                onClick={() => router.push("/hackathons")}
              >
                View All Hackathons
              </Button>
            </CardContent>
          </Card>

          {/* Latest Jobs */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-yellow-400" />
                Latest Job Opportunities
              </CardTitle>
              <CardDescription className="text-gray-400">Find your dream job in tech</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">{job.title}</h4>
                  <p className="text-gray-400 text-sm mb-2">{job.company}</p>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-blue-400/20 text-blue-400">
                      {job.type}
                    </Badge>
                    <span className="text-yellow-400 font-semibold">{job.salary}</span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                </div>
              ))}
              <Button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                onClick={() => router.push("/jobs")}
              >
                View All Jobs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Profile Section */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-yellow-400" />
              Your Profile
            </CardTitle>
            <CardDescription className="text-gray-400">Manage your account and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-2">Account Information</h4>
                <div className="space-y-2">
                  <p className="text-gray-400">
                    <span className="font-medium">Name:</span> {user.full_name || "Not set"}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium">Role:</span> {user.role}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium">Member since:</span> {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    onClick={() => router.push("/dashboard/profile")}
                  >
                    Edit Profile
                  </Button>
                  {user.role === "admin" && (
                    <Button
                      variant="outline"
                      className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
                      onClick={() => router.push("/admin")}
                    >
                      Admin Panel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
