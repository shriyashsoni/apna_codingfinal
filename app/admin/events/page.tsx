"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, isAdmin, getAllEvents, deleteEvent, getUserOrganizerStatus, type Event } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Search, Shield, Edit, Trash2, Plus, Users, MapPin, Clock } from "lucide-react"

export default function AdminEvents() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adminAccess, setAdminAccess] = useState(false)
  const [organizerStatus, setOrganizerStatus] = useState({ is_organizer: false, organizer_types: [] })
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAccess()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.technologies.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredEvents(filtered)
    } else {
      setFilteredEvents(events)
    }
  }, [searchTerm, events])

  const checkAccess = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }

      const hasAdminAccess = await isAdmin(currentUser.email)
      const orgStatus = await getUserOrganizerStatus(currentUser.id)

      // Check if user has admin access or event organizer permission
      if (!hasAdminAccess && !orgStatus.organizer_types.includes("event_organizer")) {
        router.push("/")
        return
      }

      setUser(currentUser)
      setAdminAccess(hasAdminAccess)
      setOrganizerStatus(orgStatus)
      await loadEvents()
    } catch (error) {
      console.error("Error checking access:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const loadEvents = async () => {
    try {
      const { data, error } = await getAllEvents()
      if (error) {
        console.error("Error loading events:", error)
        return
      }
      setEvents(data || [])
    } catch (error) {
      console.error("Error loading events:", error)
    }
  }

  const canDeleteEvent = (event: Event) => {
    // Admin can delete any event
    if (adminAccess) return true

    // Organizer can only delete their own events
    return event.created_by === user?.id
  }

  const handleDelete = async (id: string, title: string, event: Event) => {
    if (!canDeleteEvent(event)) {
      alert("You don't have permission to delete this event.")
      return
    }

    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await deleteEvent(id)
      if (error) {
        alert("Error deleting event: " + error.message)
        return
      }

      await loadEvents()
      alert("Event deleted successfully!")
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Error deleting event")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500"
      case "ongoing":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      workshop: "bg-blue-500",
      webinar: "bg-green-500",
      conference: "bg-purple-500",
      meetup: "bg-orange-500",
      bootcamp: "bg-red-500",
      seminar: "bg-indigo-500",
    }
    return colors[type as keyof typeof colors] || "bg-gray-500"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white mt-4">Loading Events...</p>
        </div>
      </div>
    )
  }

  if (!adminAccess && !organizerStatus.organizer_types.includes("event_organizer")) {
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

  const upcomingEvents = events.filter((event) => event.status === "upcoming").length
  const totalParticipants = events.reduce((sum, event) => sum + event.current_participants, 0)
  const averageParticipants = events.length > 0 ? Math.round(totalParticipants / events.length) : 0

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-8 h-8 text-purple-400" />
                Manage Events
              </h1>
              <p className="text-gray-400 mt-1">Create and manage tech events and workshops</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/admin/events/new")}
                className="bg-purple-400 hover:bg-purple-500 text-black font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{upcomingEvents}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalParticipants}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg Participants</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{averageParticipants}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events by title, organizer, or technology..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Badge variant="outline" className="border-purple-400 text-purple-400">
                {filteredEvents.length} events
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="bg-gray-900 border-gray-800 hover:border-purple-400 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2">{event.title}</CardTitle>
                    <p className="text-purple-400 font-medium mb-2">{event.organizer}</p>
                    <div className="flex gap-2 mb-2">
                      <Badge className={`${getStatusColor(event.status)} text-white`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                      <Badge className={`${getEventTypeColor(event.event_type)} text-white capitalize`}>
                        {event.event_type}
                      </Badge>
                      {event.created_by === user?.id && (
                        <Badge className="bg-green-500 text-white text-xs">Your Event</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="text-gray-400 line-clamp-2">{event.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300 text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                    {formatDate(event.event_date)}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-purple-400" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Users className="w-4 h-4 mr-2 text-purple-400" />
                    {event.current_participants}/{event.max_participants} participants
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Clock className="w-4 h-4 mr-2 text-purple-400" />
                    {event.event_mode}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {event.technologies.slice(0, 3).map((tech, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {event.technologies.length > 3 && (
                      <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                        +{event.technologies.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                      onClick={() => router.push(`/admin/events/edit/${event.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {canDeleteEvent(event) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
                        onClick={() => handleDelete(event.id, event.title, event)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm ? "No events match your search criteria." : "Get started by creating your first event."}
              </p>
              <Button
                onClick={() => router.push("/admin/events/new")}
                className="bg-purple-400 hover:bg-purple-500 text-black font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
