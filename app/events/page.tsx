"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users, Search, Filter, Eye, Lock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FloatingElements } from "@/components/floating-elements"
import { AuthModal } from "@/components/auth/auth-modal"
import { getEvents, searchEvents, getCurrentUser, type Event, type User } from "@/lib/supabase"
import Link from "next/link"

const eventTypes = ["All", "workshop", "webinar", "conference", "meetup", "bootcamp", "seminar"]

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    loadEvents()
    checkUser()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchQuery, selectedType])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error checking user:", error)
    }
  }

  const loadEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await getEvents()

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

  const filterEvents = async () => {
    try {
      if (searchQuery || selectedType !== "All") {
        const { data, error } = await searchEvents(searchQuery, selectedType === "All" ? undefined : selectedType)

        if (error) {
          console.error("Error searching events:", error)
          setFilteredEvents(events)
          return
        }

        setFilteredEvents(data || [])
      } else {
        setFilteredEvents(events)
      }
    } catch (error) {
      console.error("Error filtering events:", error)
      setFilteredEvents(events)
    }
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      workshop: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      webinar: "bg-green-500/20 text-green-400 border-green-500/30",
      conference: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      meetup: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      bootcamp: "bg-red-500/20 text-red-400 border-red-500/30",
      seminar: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    }
    return colors[type as keyof typeof colors] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: "bg-green-500/20 text-green-400 border-green-500/30",
      ongoing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      completed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    }
    return colors[status as keyof typeof colors] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  const handleEventClick = (event: Event) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    // Navigate to event details if user is logged in
    window.location.href = `/events/${event.id}`
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

  const calculateProgress = (current: number, max: number) => {
    return max > 0 ? (current / max) * 100 : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <FloatingElements />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading events...</p>
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
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-400 to-white bg-clip-text text-transparent">
              Upcoming Events
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Join our community events, workshops, and conferences to enhance your coding skills
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900/30 backdrop-blur-sm border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400"
                />
              </div>

              {/* Event Type Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-md text-white focus:border-yellow-400 focus:outline-none appearance-none cursor-pointer"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type} className="bg-gray-900">
                      {type === "All" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredEvents.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">No Events Found</h3>
              <p className="text-gray-500">
                {searchQuery || selectedType !== "All"
                  ? "Try adjusting your search criteria"
                  : "Check back soon for upcoming events"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              {filteredEvents.map((event, index) => (
                <motion.div key={event.id} variants={fadeInUp}>
                  <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 group cursor-pointer">
                    <CardContent className="p-0">
                      {/* Event Image */}
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={
                            event.image_url ||
                            `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(event.title)}`
                          }
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Status and Type Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge className={`${getStatusColor(event.status)} border`}>{event.status}</Badge>
                          <Badge className={`${getEventTypeColor(event.event_type)} border`}>{event.event_type}</Badge>
                        </div>

                        {/* Registration Status */}
                        <div className="absolute top-4 right-4">
                          {event.registration_open ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">Open</Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border">Closed</Badge>
                          )}
                        </div>
                      </div>

                      {/* Event Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-yellow-400 transition-colors">
                          {event.title}
                        </h3>

                        <p className="text-gray-400 mb-4 line-clamp-2">{event.description}</p>

                        {/* Event Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-400">
                            <Calendar className="w-4 h-4 mr-2 text-yellow-400" />
                            <span>
                              {formatDate(event.event_date)} at {formatTime(event.event_date)}
                            </span>
                          </div>

                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="w-4 h-4 mr-2 text-yellow-400" />
                            <span>{event.location}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-400">
                            <Users className="w-4 h-4 mr-2 text-yellow-400" />
                            <span>
                              {event.current_participants} / {event.max_participants} participants
                            </span>
                          </div>

                          {event.registration_fee > 0 && (
                            <div className="flex items-center text-sm text-gray-400">
                              <DollarSign className="w-4 h-4 mr-2 text-yellow-400" />
                              <span>₹{event.registration_fee}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>Registration Progress</span>
                            <span>
                              {Math.round(calculateProgress(event.current_participants, event.max_participants))}%
                            </span>
                          </div>
                          <Progress
                            value={calculateProgress(event.current_participants, event.max_participants)}
                            className="h-2"
                          />
                        </div>

                        {/* Technologies */}
                        {event.technologies && event.technologies.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {event.technologies.slice(0, 3).map((tech, techIndex) => (
                                <Badge
                                  key={techIndex}
                                  variant="outline"
                                  className="text-xs border-gray-600 text-gray-300"
                                >
                                  {tech}
                                </Badge>
                              ))}
                              {event.technologies.length > 3 && (
                                <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                                  +{event.technologies.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <Button
                          onClick={() => handleEventClick(event)}
                          className={`w-full ${
                            user
                              ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                              : "bg-gray-700 hover:bg-gray-600 text-white"
                          } transition-colors`}
                        >
                          {user ? (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Sign in to View Details
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-4xl mx-auto bg-gray-900/20 backdrop-blur-sm rounded-2xl p-12 border border-gray-800"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Don't Miss Out on Future Events</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join our community to get notified about upcoming events, workshops, and exclusive opportunities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3"
                  >
                    Join Community
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 bg-transparent"
                    asChild
                  >
                    <Link href="/about">Learn More</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3" asChild>
                    <Link href="/dashboard">View Dashboard</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 bg-transparent"
                    asChild
                  >
                    <Link href="/community">Join Communities</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
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
