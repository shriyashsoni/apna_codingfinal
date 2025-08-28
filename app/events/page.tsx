"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Play,
  Award,
  ChevronRight,
  Share2,
  Bookmark,
  ExternalLink,
  Lock,
  User,
  Clock,
  Globe,
  Filter,
  Zap,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  getCurrentUser,
  getEvents,
  searchEvents,
  generateSlug,
  registerForEvent,
  checkEventRegistration,
  type Event,
} from "@/lib/supabase"

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [bookmarkedEvents, setBookmarkedEvents] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([])

  const eventTypes = ["All", "workshop", "webinar", "conference", "meetup", "bootcamp", "seminar"]

  useEffect(() => {
    checkUser()
    loadEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [searchTerm, selectedType, events])

  useEffect(() => {
    if (user && events.length > 0) {
      checkUserRegistrations()
    }
  }, [user, events])

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

  const checkUserRegistrations = async () => {
    if (!user) return

    try {
      const registrations = await Promise.all(events.map((event) => checkEventRegistration(event.id, user.id)))

      const registeredEventIds = events.filter((_, index) => registrations[index]).map((event) => event.id)

      setRegisteredEvents(registeredEventIds)
    } catch (error) {
      console.error("Error checking registrations:", error)
    }
  }

  const filterEvents = async () => {
    try {
      const { data, error } = await searchEvents(searchTerm, selectedType)
      if (error) {
        console.error("Error searching events:", error)
        return
      }
      setFilteredEvents(data || [])
    } catch (error) {
      console.error("Error filtering events:", error)
      setFilteredEvents(events)
    }
  }

  const handleBookmark = (eventId: string) => {
    setBookmarkedEvents((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
  }

  const handleEventRegistration = async (event: Event) => {
    if (!user) {
      alert("Please login to register for events!")
      return
    }

    if (registeredEvents.includes(event.id)) {
      alert("You are already registered for this event!")
      return
    }

    if (event.current_participants >= event.max_participants) {
      alert("This event is full!")
      return
    }

    try {
      const result = await registerForEvent(event.id, user.id)
      if (result.success) {
        alert("Successfully registered for the event!")
        setRegisteredEvents((prev) => [...prev, event.id])
        // Reload events to update participant count
        loadEvents()
      } else {
        alert("Failed to register: " + result.error)
      }
    } catch (error) {
      console.error("Error registering for event:", error)
      alert("An error occurred while registering")
    }
  }

  const handleShare = (event: Event) => {
    const eventSlug = generateSlug(event.title, event.id)
    const eventUrl = `${window.location.origin}/events/${eventSlug}`

    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: eventUrl,
      })
    } else {
      navigator.clipboard.writeText(`${event.title} - ${eventUrl}`)
      alert("Link copied to clipboard!")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
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

  const getDaysUntilEvent = (dateString: string) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading amazing events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge className="bg-yellow-400 text-black px-4 py-2 font-bold text-lg">
                <Zap className="w-4 h-4 mr-2" />
                LIVE EVENTS
              </Badge>
              <Badge className="bg-green-500 text-white px-4 py-2 font-bold text-lg">
                <Star className="w-4 h-4 mr-2" />
                JOIN NOW
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-yellow-400">{events.length}+</span> Tech Events
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              Join workshops, webinars, conferences, and meetups to enhance your coding skills and connect with the
              <span className="text-yellow-400 font-semibold"> Apna Coding community</span>
            </p>

            {!user && (
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4 max-w-2xl mx-auto mb-8">
                <p className="text-yellow-300 text-lg">
                  <Lock className="w-5 h-5 inline mr-2" />
                  <span className="font-semibold">Login Required:</span> Register for events and join our tech
                  community.
                  <Link href="/auth" className="text-yellow-400 hover:underline ml-2 font-semibold">
                    Sign up now for free!
                  </Link>
                </p>
              </div>
            )}
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search events, technologies, topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400 h-12"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {eventTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 capitalize backdrop-blur-sm ${
                          selectedType === type
                            ? "bg-yellow-400 text-black"
                            : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700"
                        }`}
                      >
                        <Filter className="w-4 h-4 mr-2 inline" />
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {filteredEvents.length} Event{filteredEvents.length !== 1 ? "s" : ""} Available
            </h2>
            <p className="text-gray-300 text-lg">
              {selectedType !== "All" ? `Showing ${selectedType} events` : "All upcoming events from Apna Coding"}
            </p>
          </div>

          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-4">No Events Found</h3>
              <p className="text-gray-400 mb-8">
                {searchTerm || selectedType !== "All"
                  ? "Try adjusting your search criteria or filters."
                  : "No events are currently available. Check back soon for exciting new events!"}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedType("All")
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => {
                const daysUntilEvent = getDaysUntilEvent(event.event_date)
                const eventSlug = generateSlug(event.title, event.id)

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="h-full"
                  >
                    <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-800 hover:border-yellow-400/50 transition-all duration-300 group overflow-hidden h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <Link href={`/events/${eventSlug}`}>
                          <Image
                            src={
                              event.image_url ||
                              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EVENT%20COSTOM%20TEMPLATE-kZL4AvoUZPDjOKW6HBkYlCocOyCR7I.png" ||
                              "/placeholder.svg"
                            }
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          />
                        </Link>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Event Type Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className={`${getEventTypeColor(event.event_type)} text-white font-bold`}>
                            {event.event_type.toUpperCase()}
                          </Badge>
                        </div>

                        {/* Days Left Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-yellow-400 text-black font-bold">
                            {daysUntilEvent > 0 ? `${daysUntilEvent} DAYS` : daysUntilEvent === 0 ? "TODAY" : "PAST"}
                          </Badge>
                        </div>

                        {/* Free Badge */}
                        {event.registration_fee === 0 && (
                          <div className="absolute bottom-3 left-3">
                            <Badge className="bg-green-500 text-white font-bold">FREE</Badge>
                          </div>
                        )}

                        {/* Participant Count */}
                        <div className="absolute bottom-3 right-3">
                          <Badge className="bg-black/70 text-white backdrop-blur-sm">
                            <Users className="w-3 h-3 mr-1" />
                            {event.current_participants}/{event.max_participants}
                          </Badge>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.preventDefault()
                              handleBookmark(event.id)
                            }}
                            className={`bg-black/50 hover:bg-black/70 p-2 h-8 w-8 backdrop-blur-sm ${bookmarkedEvents.includes(event.id) ? "text-yellow-400" : "text-white"}`}
                          >
                            <Bookmark className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.preventDefault()
                              handleShare(event)
                            }}
                            className="bg-black/50 hover:bg-black/70 text-white p-2 h-8 w-8 backdrop-blur-sm"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {!user && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Lock className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs capitalize">
                            {event.event_type}
                          </Badge>
                          <div className="flex items-center text-yellow-400">
                            <Users className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              {event.current_participants}/{event.max_participants}
                            </span>
                          </div>
                        </div>

                        <Link href={`/events/${eventSlug}`}>
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors line-clamp-2 cursor-pointer">
                            {event.title}
                          </h3>
                        </Link>

                        <p className="text-gray-400 mb-4 text-sm line-clamp-3 flex-grow">{event.description}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-400">
                            <Calendar className="w-4 h-4 mr-2 text-yellow-400" />
                            <span>{formatDate(event.event_date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                            <span>{formatTime(event.event_date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="w-4 h-4 mr-2 text-yellow-400" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <User className="w-4 h-4 mr-2 text-yellow-400" />
                            <span>by {event.organizer}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <Globe className="w-4 h-4 mr-2 text-yellow-400" />
                            <span className="capitalize">{event.event_mode}</span>
                          </div>
                        </div>

                        {/* Technologies */}
                        {event.technologies && event.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {event.technologies.slice(0, 3).map((tech, techIndex) => (
                              <Badge key={techIndex} className="bg-yellow-400/20 text-yellow-400 text-xs px-2 py-1">
                                {tech}
                              </Badge>
                            ))}
                            {event.technologies.length > 3 && (
                              <Badge className="bg-gray-700 text-gray-300 text-xs px-2 py-1">
                                +{event.technologies.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm">
                            {event.registration_fee > 0 ? (
                              <span className="text-yellow-400 font-semibold text-lg">${event.registration_fee}</span>
                            ) : (
                              <span className="text-green-400 font-semibold text-lg">FREE</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-auto">
                          <Link href={`/events/${eventSlug}`} className="flex-1">
                            <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                              View Details
                            </Button>
                          </Link>

                          {event.registration_link && (
                            <Button
                              onClick={() => window.open(event.registration_link, "_blank")}
                              variant="outline"
                              size="sm"
                              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent px-3"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-400/10 to-orange-500/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Award className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Join <span className="text-yellow-400">Apna Coding Events</span>?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect with fellow developers, learn cutting-edge technologies, and stay updated with the latest tech
              trends through our carefully curated events and workshops.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 text-lg">
                  <Calendar className="mr-2 w-5 h-5" />
                  Browse All Events
                </Button>
              ) : (
                <Link href="/auth">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 text-lg">
                    <Play className="mr-2 w-5 h-5" />
                    Sign Up to Join Events
                  </Button>
                </Link>
              )}
              <Link href="/hackathons">
                <Button className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3 text-lg backdrop-blur-sm bg-transparent">
                  <Zap className="mr-2 w-5 h-5" />
                  Explore Hackathons
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="border border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg backdrop-blur-sm bg-transparent">
                  <ChevronRight className="mr-2 w-5 h-5" />
                  Contact Support
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
