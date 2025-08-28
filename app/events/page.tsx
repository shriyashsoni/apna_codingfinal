"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users, Search, Filter, Star, ExternalLink, Play, Globe, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getAllEvents, generateSlug, type Event } from "@/lib/supabase"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")

  const eventTypes = ["All", "workshop", "webinar", "conference", "meetup", "bootcamp", "seminar"]
  const eventStatuses = ["All", "upcoming", "ongoing", "completed", "cancelled"]

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, selectedType, selectedStatus])

  const loadEvents = async () => {
    try {
      setLoading(true)
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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.technologies.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase())),
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

    // Sort by event date (upcoming first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.event_date).getTime()
      const dateB = new Date(b.event_date).getTime()
      return dateA - dateB
    })

    setFilteredEvents(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysUntilEvent = (dateString: string) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tech <span className="text-yellow-400">Events</span> & Workshops
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join the most exciting tech events, workshops, and conferences. Learn from industry experts, network with
              peers, and advance your coding skills.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">{events.length}</div>
                <div className="text-gray-400">Total Events</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {events.filter((e) => e.status === "upcoming").length}
                </div>
                <div className="text-gray-400">Upcoming Events</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {events.reduce((sum, event) => sum + event.current_participants, 0)}
                </div>
                <div className="text-gray-400">Total Participants</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-gray-900/20">
        <div className="container mx-auto px-4">
          <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-yellow-400" />
                Search & Filter Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Event Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "All" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                >
                  {eventStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Results Count */}
                <div className="flex items-center">
                  <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                    {filteredEvents.length} events found
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">No Events Found</h3>
              <p className="text-gray-400 mb-8">
                {searchTerm || selectedType !== "All" || selectedStatus !== "All"
                  ? "No events match your search criteria. Try adjusting your filters."
                  : "No events are currently available. Check back soon for new events!"}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedType("All")
                  setSelectedStatus("All")
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => {
                const daysUntilEvent = getDaysUntilEvent(event.event_date)
                const eventSlug = generateSlug(event.title, event.id)

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm hover:border-yellow-400 transition-all duration-300 group h-full">
                      {/* Event Image */}
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <Image
                          src={
                            event.image_url ||
                            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EVENT%20COSTOM%20TEMPLATE-kZL4AvoUZPDjOKW6HBkYlCocOyCR7I.png" ||
                            "/placeholder.svg"
                          }
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Event Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className={`${getEventTypeColor(event.event_type)} text-white font-bold`}>
                            {event.event_type.toUpperCase()}
                          </Badge>
                          <Badge className={`${getStatusColor(event.status)} text-white font-bold`}>
                            {event.status.toUpperCase()}
                          </Badge>
                        </div>

                        {/* Days Until Event */}
                        {event.status === "upcoming" && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-yellow-400 text-black font-bold">
                              {daysUntilEvent > 0 ? `${daysUntilEvent}d left` : daysUntilEvent === 0 ? "Today" : "Past"}
                            </Badge>
                          </div>
                        )}

                        {/* Free Badge */}
                        {event.registration_fee === 0 && (
                          <div className="absolute bottom-3 left-3">
                            <Badge className="bg-green-500 text-white font-bold">FREE</Badge>
                          </div>
                        )}
                      </div>

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-white text-lg line-clamp-2 group-hover:text-yellow-400 transition-colors">
                            {event.title}
                          </CardTitle>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {/* Event Details */}
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-300 text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-yellow-400" />
                              {formatDate(event.event_date)} at {formatTime(event.event_date)}
                            </div>
                            <div className="flex items-center text-gray-300 text-sm">
                              <MapPin className="w-4 h-4 mr-2 text-yellow-400" />
                              {event.location}
                            </div>
                            <div className="flex items-center text-gray-300 text-sm">
                              <Users className="w-4 h-4 mr-2 text-yellow-400" />
                              {event.current_participants}/{event.max_participants} participants
                            </div>
                            <div className="flex items-center text-gray-300 text-sm">
                              <Globe className="w-4 h-4 mr-2 text-yellow-400" />
                              {event.event_mode}
                            </div>
                            {event.registration_fee > 0 && (
                              <div className="flex items-center text-gray-300 text-sm">
                                <DollarSign className="w-4 h-4 mr-2 text-yellow-400" />${event.registration_fee}
                              </div>
                            )}
                          </div>

                          {/* Organizer */}
                          <div className="flex items-center text-gray-300 text-sm">
                            <Star className="w-4 h-4 mr-2 text-yellow-400" />
                            <span className="font-medium">{event.organizer}</span>
                          </div>

                          {/* Technologies */}
                          {event.technologies && event.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {event.technologies.slice(0, 3).map((tech, techIndex) => (
                                <Badge
                                  key={techIndex}
                                  variant="outline"
                                  className="border-gray-600 text-gray-300 text-xs"
                                >
                                  {tech}
                                </Badge>
                              ))}
                              {event.technologies.length > 3 && (
                                <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                                  +{event.technologies.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-3">
                            <Link href={`/events/${eventSlug}`} className="flex-1">
                              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                                <Play className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                            {event.registration_link && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                                onClick={() => window.open(event.registration_link, "_blank")}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-900/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Want to Host an Event?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join our community of organizers and share your knowledge with fellow developers. Host workshops,
              webinars, and meetups.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3">
                  Contact Us
                </Button>
              </Link>
              <Link href="/community">
                <Button
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800 bg-transparent px-8 py-3"
                >
                  Join Community
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
