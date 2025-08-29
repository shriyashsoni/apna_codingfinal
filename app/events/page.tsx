"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FloatingElements } from "@/components/floating-elements"
import { AuthModal } from "@/components/auth/auth-modal"
import { supabase, getCurrentUser, type User } from "@/lib/supabase"
import { Calendar, MapPin, Users, Search, Clock, Eye, Lock, Globe, Building, DollarSign, Code } from "lucide-react"
import Image from "next/image"

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
  event_mode: "online" | "offline" | "hybrid"
  max_participants: number
  registration_count: number
  event_type: string
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  image_url?: string
  price: number
  technologies: string[]
  organizer_name: string
  requirements?: string
  agenda?: string
  speaker_info?: string
  created_at: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedMode, setSelectedMode] = useState("all")
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    fetchEvents()
    checkUser()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, selectedType, selectedMode])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: true })

      if (error) {
        console.error("Error fetching events:", error)
      } else {
        setEvents(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.organizer_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((event) => event.event_type === selectedType)
    }

    if (selectedMode !== "all") {
      filtered = filtered.filter((event) => event.event_mode === selectedMode)
    }

    setFilteredEvents(filtered)
  }

  const handleEventClick = (eventId: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    // Navigate to event details
    window.location.href = `/events/${eventId}`
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      workshop: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      hackathon: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      conference: "bg-green-500/20 text-green-400 border-green-500/30",
      meetup: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      webinar: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      competition: "bg-red-500/20 text-red-400 border-red-500/30",
    }
    return colors[type as keyof typeof colors] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      ongoing: "bg-green-500/20 text-green-400 border-green-500/30",
      completed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    }
    return colors[status as keyof typeof colors] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "online":
        return <Globe className="h-4 w-4" />
      case "offline":
        return <Building className="h-4 w-4" />
      case "hybrid":
        return <Code className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-white mt-4">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <FloatingElements />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-400 to-white bg-clip-text text-transparent">
              Upcoming Events
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Join our community events, workshops, and hackathons to level up your coding skills
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:border-yellow-400"
              >
                <option value="all">All Types</option>
                <option value="workshop">Workshop</option>
                <option value="hackathon">Hackathon</option>
                <option value="conference">Conference</option>
                <option value="meetup">Meetup</option>
                <option value="webinar">Webinar</option>
                <option value="competition">Competition</option>
              </select>

              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:border-yellow-400"
              >
                <option value="all">All Modes</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎪</div>
              <h3 className="text-2xl font-bold mb-4">No Events Found</h3>
              <p className="text-gray-400">
                {searchTerm || selectedType !== "all" || selectedMode !== "all"
                  ? "Try adjusting your filters to see more events."
                  : "Check back soon for upcoming events!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <Card
                  key={event.id}
                  className="bg-gray-900/30 backdrop-blur-sm border-gray-800 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <CardHeader className="p-0">
                    {event.image_url && (
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <Image
                          src={event.image_url || "/placeholder.svg"}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge className={getEventTypeColor(event.event_type)}>{event.event_type}</Badge>
                          <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="h-4 w-4 text-yellow-400" />
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                          <Clock className="h-4 w-4 text-yellow-400 ml-2" />
                          <span>{event.event_time}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="h-4 w-4 text-yellow-400" />
                          <span className="truncate">{event.location}</span>
                          <div className="flex items-center gap-1 ml-2">
                            {getModeIcon(event.event_mode)}
                            <span className="capitalize">{event.event_mode}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-300">
                          <Users className="h-4 w-4 text-yellow-400" />
                          <span>
                            {event.registration_count}/{event.max_participants} registered
                          </span>
                        </div>

                        {event.price > 0 && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <DollarSign className="h-4 w-4 text-yellow-400" />
                            <span>₹{event.price}</span>
                          </div>
                        )}
                      </div>

                      {event.technologies && event.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {event.technologies.slice(0, 3).map((tech, techIndex) => (
                            <Badge key={techIndex} variant="outline" className="text-xs border-gray-600 text-gray-300">
                              {tech}
                            </Badge>
                          ))}
                          {event.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                              +{event.technologies.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-800">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">by {event.organizer_name}</span>
                          <Button
                            onClick={() => handleEventClick(event.id)}
                            className={`${
                              user
                                ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                                : "bg-gray-700 hover:bg-gray-600 text-white"
                            } transition-colors`}
                            size="sm"
                          >
                            {user ? (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4 mr-1" />
                                Sign in to View
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto bg-gray-900/20 backdrop-blur-sm rounded-2xl p-12 border border-gray-800">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Want to Host an Event?</h2>
            <p className="text-xl text-gray-300 mb-8">Share your knowledge with the community and help others grow</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                Become an Organizer
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false)
          checkUser()
        }}
      />
    </div>
  )
}
