"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Search,
  Grid,
  List,
  Star,
  Zap,
  Globe,
  Play,
  ArrowRight,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getAllEvents, generateSlug, type Event } from "@/lib/supabase"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const eventTypes = ["All", "workshop", "webinar", "conference", "meetup", "bootcamp", "seminar"]
  const eventStatuses = ["All", "upcoming", "ongoing", "completed", "cancelled"]

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
      } else {
        setEvents(data || [])
      }
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
          event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.technologies.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Filter by type
    if (selectedType !== "All") {
      filtered = filtered.filter((event) => event.event_type === selectedType)
    }

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter((event) => event.status === selectedStatus)
    }

    setFilteredEvents(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysUntilEvent = (eventDate: string) => {
    const event = new Date(eventDate)
    const today = new Date()
    const diffTime = event.getTime() - today.getTime()
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

  const upcomingEvents = filteredEvents.filter((event) => event.status === "upcoming")
  const totalParticipants = filteredEvents.reduce((sum, event) => sum + event.current_participants, 0)

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
      <section className="py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Tech Events & Workshops
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join our community events, workshops, and conferences to level up your coding skills and network with
              fellow developers.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
                <div className="text-3xl font-bold text-yellow-400 mb-2">{filteredEvents.length}</div>
                <div className="text-gray-400">Total Events</div>
              </div>
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
                <div className="text-3xl font-bold text-green-400 mb-2">{upcomingEvents.length}</div>
                <div className="text-gray-400">Upcoming Events</div>
              </div>
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
                <div className="text-3xl font-bold text-blue-400 mb-2">{totalParticipants}</div>
                <div className="text-gray-400">Total Participants</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-gray-900/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Event Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-900/50 border border-gray-700 text-white rounded-md px-4 py-2"
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
                className="bg-gray-900/50 border border-gray-700 text-white rounded-md px-4 py-2"
              >
                {eventStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "All" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-900/50 border border-gray-700 rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-yellow-400 text-black" : "text-white hover:bg-gray-800"}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-yellow-400 text-black" : "text-white hover:bg-gray-800"}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">No Events Found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6 max-w-4xl mx-auto"
              }
            >
              {filteredEvents.map((event, index) => {
                const daysUntil = getDaysUntilEvent(event.event_date)
                const eventSlug = generateSlug(event.title, event.id)

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card
                      className={`bg-gray-900/30 border-gray-800 backdrop-blur-sm hover:bg-gray-900/50 transition-all duration-300 group ${
                        viewMode === "list" ? "flex flex-row" : ""
                      }`}
                    >
                      {/* Event Image */}
                      <div className={viewMode === "list" ? "w-1/3" : "w-full"}>
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <Image
                            src={
                              event.image_url ||
                              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EVENT%20COSTOM%20TEMPLATE-kZL4AvoUZPDjOKW6HBkYlCocOyCR7I.png" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                          {/* Event Badges */}
                          <div className="absolute top-4 left-4 flex gap-2">
                            <Badge className={`${getEventTypeColor(event.event_type)} text-white font-bold`}>
                              {event.event_type.toUpperCase()}
                            </Badge>
                            <Badge className={`${getStatusColor(event.status)} text-white font-bold`}>
                              {event.status.toUpperCase()}
                            </Badge>
                          </div>

                          {/* Days Until Event */}
                          {event.status === "upcoming" && (
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-yellow-400 text-black font-bold">
                                {daysUntil > 0 ? `${daysUntil} DAYS` : daysUntil === 0 ? "TODAY" : "PAST"}
                              </Badge>
                            </div>
                          )}

                          {/* Free Badge */}
                          {event.registration_fee === 0 && (
                            <div className="absolute bottom-4 left-4">
                              <Badge className="bg-green-500 text-white font-bold">FREE</Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Event Content */}
                      <div className={viewMode === "list" ? "w-2/3" : "w-full"}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                                {event.title}
                              </CardTitle>
                              <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Event Details */}
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Calendar className="w-4 h-4 text-yellow-400" />
                              <span>
                                {formatDate(event.event_date)} at {formatTime(event.event_date)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <MapPin className="w-4 h-4 text-yellow-400" />
                              <span>{event.location}</span>
                              <Globe className="w-4 h-4 text-green-400 ml-2" />
                              <span className="capitalize">{event.event_mode}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <User className="w-4 h-4 text-yellow-400" />
                              <span>{event.organizer}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Users className="w-4 h-4 text-yellow-400" />
                              <span>
                                {event.current_participants}/{event.max_participants} participants
                              </span>
                            </div>

                            {event.registration_fee > 0 && (
                              <div className="flex items-center gap-2 text-sm text-gray-300">
                                <DollarSign className="w-4 h-4 text-yellow-400" />
                                <span className="font-semibold text-yellow-400">${event.registration_fee}</span>
                              </div>
                            )}
                          </div>

                          {/* Technologies */}
                          {event.technologies && event.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {event.technologies.slice(0, 3).map((tech, techIndex) => (
                                <Badge key={techIndex} className="bg-gray-700 text-gray-300 text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {event.technologies.length > 3 && (
                                <Badge className="bg-gray-700 text-gray-300 text-xs">
                                  +{event.technologies.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="pt-4">
                            <Link href={`/events/${event.id}`}>
                              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold group">
                                <Play className="w-4 h-4 mr-2" />
                                View Event Details
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-400/10 to-orange-500/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Want to Organize an Event?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join our community of organizers and create amazing tech events for developers worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3">
                  <Star className="w-4 h-4 mr-2" />
                  Become an Organizer
                </Button>
              </Link>
              <Link href="/community">
                <Button
                  variant="outline"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3 bg-transparent"
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
