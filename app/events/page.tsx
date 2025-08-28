"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Users, Search, Filter, ExternalLink, Globe, Monitor, Building } from "lucide-react"
import { getAllEvents, generateSlug, type Event } from "@/lib/supabase"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchQuery, selectedType, selectedStatus])

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
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.technologies.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Filter by event type
    if (selectedType !== "All") {
      filtered = filtered.filter((event) => event.event_type === selectedType)
    }

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter((event) => event.status === selectedStatus)
    }

    setFilteredEvents(filtered)
  }

  const getEventStatus = (event: Event) => {
    const now = new Date()
    const eventDate = new Date(event.event_date)
    const endDate = event.end_date ? new Date(event.end_date) : eventDate

    if (event.status === "cancelled") return "cancelled"
    if (now < eventDate) return "upcoming"
    if (now >= eventDate && now <= endDate) return "ongoing"
    return "completed"
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

  const getEventModeIcon = (mode: string) => {
    switch (mode) {
      case "online":
        return <Monitor className="w-4 h-4" />
      case "offline":
        return <Building className="w-4 h-4" />
      case "hybrid":
        return <Globe className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const getDaysUntilEvent = (eventDate: string) => {
    const now = new Date()
    const event = new Date(eventDate)
    const diffTime = event.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getEventUrl = (event: Event) => {
    // Generate SEO-friendly slug from event title and ID
    const slug = generateSlug(event.title, event.id)
    return `/events/${slug}`
  }

  const eventTypes = ["All", "workshop", "webinar", "conference", "meetup", "bootcamp", "seminar"]
  const statusOptions = ["All", "upcoming", "ongoing", "completed", "cancelled"]

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent" />
        <div className="relative max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6 text-white"
          >
            Upcoming <span className="text-gradient">Events</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Join workshops, webinars, conferences, and meetups to enhance your coding skills and network with fellow
            developers.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search events by title, location, technology..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "All" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "All" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>
                Showing {filteredEvents.length} of {events.length} events
              </span>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p>Try adjusting your search criteria or check back later for new events.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => {
              const status = getEventStatus(event)
              const daysUntil = getDaysUntilEvent(event.event_date)

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-glass hover:border-yellow-400/50 transition-all duration-300 group card-hover h-full">
                    <div className="relative">
                      <div
                        className="h-48 bg-cover bg-center rounded-t-lg"
                        style={{
                          backgroundImage: `url(${event.image_url || "/placeholder.svg?height=200&width=400"})`,
                        }}
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={`${getStatusColor(status)} text-white`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                        {event.registration_fee === 0 && <Badge className="bg-green-500 text-white">Free</Badge>}
                        {daysUntil > 0 && daysUntil <= 7 && (
                          <Badge className="bg-orange-500 text-white">{daysUntil}d left</Badge>
                        )}
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                          {event.event_type}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          {getEventModeIcon(event.event_mode)}
                          <span className="capitalize">{event.event_mode}</span>
                        </div>
                      </div>
                      <CardTitle className="text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
                        {event.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      <p className="text-gray-300 text-sm line-clamp-3 flex-1">{event.description}</p>

                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(event.event_date).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        {event.max_participants > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>
                              {event.current_participants}/{event.max_participants} registered
                            </span>
                          </div>
                        )}
                      </div>

                      {event.technologies && event.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {event.technologies.slice(0, 3).map((tech, techIndex) => (
                            <Badge key={techIndex} variant="outline" className="text-xs text-gray-400 border-gray-600">
                              {tech}
                            </Badge>
                          ))}
                          {event.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                              +{event.technologies.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="pt-4 mt-auto">
                        <Link href={getEventUrl(event)}>
                          <Button className="w-full btn-primary group-hover:scale-105 transition-transform">
                            View Details
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
