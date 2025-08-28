"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getCurrentUser,
  getEvents,
  getHackathons,
  getJobs,
  type User,
  type Event,
  type Hackathon,
  type Job,
} from "@/lib/supabase"
import { Trophy, Briefcase, UserIcon, Calendar, MapPin, Clock, Star, Users, DollarSign } from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()

    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData(false) // Don't show loading on refresh
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)

      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }

      setUser(currentUser)

      // Load dashboard data with real-time updates
      const [eventsResult, hackathonsResult, jobsResult] = await Promise.all([getEvents(), getHackathons(), getJobs()])

      // Update events
      if (eventsResult.data) {
        const sortedEvents = eventsResult.data
          .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
          .slice(0, 3)
        setEvents(sortedEvents)
      }

      // Update hackathons - prioritize featured ones
      if (hackathonsResult.data) {
        const featuredHackathons = hackathonsResult.data
          .filter((h) => h.featured && (h.status === "upcoming" || h.status === "ongoing"))
          .slice(0, 2)

        const otherHackathons = hackathonsResult.data
          .filter((h) => !h.featured && (h.status === "upcoming" || h.status === "ongoing"))
          .slice(0, 3 - featuredHackathons.length)

        setHackathons([...featuredHackathons, ...otherHackathons])
      }

      // Update jobs - show active ones
      if (jobsResult.data) {
        const activeJobs = jobsResult.data
          .filter((j) => j.status === "active")
          .sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime())
          .slice(0, 3)
        setJobs(activeJobs)
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading dashboard:", error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your dashboard...</p>
        </div>
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
    <div className="min-h-screen bg-black pt-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-purple-600/5" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-yellow-400">{user.full_name || "Developer"}</span>! 👋
          </h1>
          <p className="text-gray-300 text-lg">Ready to continue your coding journey?</p>
          <p className="text-gray-500 text-sm mt-2">
            Last updated: {formatTimeAgo(lastUpdated)} •
            <button onClick={() => loadDashboardData(false)} className="text-yellow-400 hover:text-yellow-300 ml-1">
              Refresh
            </button>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Events Available</p>
                  <p className="text-2xl font-bold text-white">{events.length}+</p>
                  <p className="text-yellow-400 text-xs">Live updates</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Hackathons</p>
                  <p className="text-2xl font-bold text-white">{hackathons.length}+</p>
                  <p className="text-yellow-400 text-xs">Featured first</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Job Opportunities</p>
                  <p className="text-2xl font-bold text-white">{jobs.length}+</p>
                  <p className="text-yellow-400 text-xs">Latest first</p>
                </div>
                <Briefcase className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Your Role</p>
                  <p className="text-2xl font-bold text-white capitalize">{user.role}</p>
                  <p className="text-yellow-400 text-xs">Member since {new Date(user.created_at).getFullYear()}</p>
                </div>
                <UserIcon className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Featured Events */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-yellow-400" />
                  Upcoming Events
                </div>
                <Badge className="bg-green-500/20 text-green-400 text-xs">Live</Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">Join workshops, webinars, and conferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.length > 0 ? (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-yellow-400/30 transition-all duration-300"
                  >
                    <h4 className="font-semibold text-white mb-2 line-clamp-1">{event.title}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 capitalize text-xs">
                        {event.event_type}
                      </Badge>
                      <div className="flex items-center text-yellow-400">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {event.current_participants}/{event.max_participants}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                      <span className="text-yellow-400 font-semibold flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {event.registration_fee > 0 ? `$${event.registration_fee}` : "FREE"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">No upcoming events</p>
                </div>
              )}
              <Button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                onClick={() => router.push("/events")}
              >
                View All Events
              </Button>
            </CardContent>
          </Card>

          {/* Featured Hackathons */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Featured Hackathons
                </div>
                <Badge className="bg-green-500/20 text-green-400 text-xs">Live</Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">Join exciting competitions and win prizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hackathons.length > 0 ? (
                hackathons.map((hackathon) => (
                  <div
                    key={hackathon.id}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-yellow-400/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white line-clamp-1 flex-1">{hackathon.title}</h4>
                      {hackathon.featured && <Star className="w-4 h-4 text-yellow-400 ml-2 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="bg-green-400/20 text-green-400 text-xs">
                        {hackathon.status}
                      </Badge>
                      <span className="text-yellow-400 font-semibold text-sm">{hackathon.prize_pool}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(hackathon.start_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-400 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="line-clamp-1">{hackathon.location}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">No active hackathons</p>
                </div>
              )}
              <Button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                onClick={() => router.push("/hackathons")}
              >
                View All Hackathons
              </Button>
            </CardContent>
          </Card>

          {/* Latest Jobs */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-yellow-400" />
                  Latest Jobs
                </div>
                <Badge className="bg-green-500/20 text-green-400 text-xs">Live</Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">Find your dream job in tech</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-yellow-400/30 transition-all duration-300"
                  >
                    <h4 className="font-semibold text-white mb-2 line-clamp-1">{job.title}</h4>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-1">{job.company}</p>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="bg-blue-400/20 text-blue-400 text-xs">
                        {job.type}
                      </Badge>
                      <span className="text-yellow-400 font-semibold text-sm">{job.salary}</span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="line-clamp-1">{job.location}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">No active jobs</p>
                </div>
              )}
              <Button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                onClick={() => router.push("/jobs")}
              >
                View All Jobs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Profile Section */}
        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
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
