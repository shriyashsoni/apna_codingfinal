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
  DollarSign,
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

    // Set up real-time updates
    const interval = setInterval(() => {
      loadEvents()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
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
        alert("Successfully registered for the event! Check your email for confirmation.")
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-purple-600/5" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-yellow-400 text-black px-4 py-2 font-bold text-sm">🎉 TECH EVENTS</Badge>
                <Badge className="bg-green-500 text-white px-4 py-2 font-bold text-sm">JOIN NOW</Badge>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                <span className="text-yellow-400">{events.length}+</span> Amazing
                <br />
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Tech Events
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-lg">
                Join workshops, webinars, conferences, and meetups to enhance your skills and network with fellow
                developers from around the world!
                {!user && (
                  <span className="block mt-2 text-yellow-400 font-semibold">
                    🔐 Login required to register for events.
                  </span>
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <>
                    <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                      Browse Events
                      <Calendar className="ml-2 w-6 h-6" />
                    </Button>
                    <Button
                      onClick={() => window.open("/hackathons", "_blank")}
                      className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 text-lg rounded-full backdrop-blur-sm transition-all duration-300"
                    >
                      View Hackathons
                      <ExternalLink className="ml-2 w-6 h-6" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth">
                      <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                        Login to Register
                        <Lock className="ml-2 w-6 h-6" />
                      </Button>
                    </Link>
                    <Button
                      onClick={() => window.open("/hackathons", "_blank")}
                      className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 text-lg rounded-full backdrop-blur-sm transition-all duration-300"
                    >
                      View Hackathons
                      <ExternalLink className="ml-2 w-6 h-6" />
                    </Button>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EVENT%20COSTOM%20TEMPLATE-kZL4AvoUZPDjOKW6HBkYlCocOyCR7I.png"
                  alt="Tech Events"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Learn & Network</h3>
                  <p className="text-lg opacity-90">Join the Tech Community</p>
                </div>
                <div className="absolute top-6 right-6">
                  <Badge className="bg-yellow-400 text-black px-3 py-1 font-bold">{events.length}+ Events</Badge>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Login Warning for Non-Users */}
      {!user && (
        <section className="py-8 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border-y border-yellow-400/20 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4 text-center">
              <Lock className="w-8 h-8 text-yellow-400" />
              <p className="text-yellow-300 text-xl">
                <span className="font-bold">Login Required:</span> Register for events and join our tech community.
                <Link href="/auth" className="text-yellow-400 hover:underline ml-2 font-bold">
                  Sign up now for free! →
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Search and Filter Section */}
      <section className="py-12 bg-gray-900/20 backdrop-blur-sm border-y border-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search events by title, technology, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400 rounded-full text-lg"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 capitalize backdrop-blur-sm ${
                    selectedType === type
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg"
                      : "bg-gray-900/50 text-gray-300 hover:bg-gray-800/50 border-2 border-gray-700 hover:border-yellow-400"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h2 className="text-4xl font-bold text-white mb-4">
                <span className="text-yellow-400">{filteredEvents.length}</span> Event
                {filteredEvents.length !== 1 ? "s" : ""} Available
              </h2>
              <p className="text-xl text-gray-300">
                {selectedType !== "All" ? `Showing ${selectedType} events` : "All upcoming events"}
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="h-full"
              >
                <Card
                  className={`bg-gray-900/30 backdrop-blur-sm border-2 border-gray-800 hover:border-yellow-400 transition-all duration-300 group overflow-hidden h-full flex flex-col shadow-xl hover:shadow-2xl ${!user ? "opacity-75" : ""}`}
                >
                  <Link href={`/events/${generateSlug(event.title, event.id)}`}>
                    <div className="relative h-56 overflow-hidden cursor-pointer">
                      <Image
                        src={
                          event.image_url ||
                          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EVENT%20COSTOM%20TEMPLATE-kZL4AvoUZPDjOKW6HBkYlCocOyCR7I.png"
                        }
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge
                          className={`${getEventTypeColor(event.event_type)} text-white text-xs capitalize font-bold px-3 py-1`}
                        >
                          {event.event_type}
                        </Badge>
                        <Badge className="bg-green-500 text-white text-xs font-bold px-3 py-1">
                          {event.event_mode}
                        </Badge>
                      </div>

                      <div className="absolute top-4 right-4 flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault()
                            handleBookmark(event.id)
                          }}
                          className={`bg-black/50 hover:bg-black/70 p-2 h-9 w-9 backdrop-blur-sm rounded-full ${bookmarkedEvents.includes(event.id) ? "text-yellow-400" : "text-white"}`}
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
                          className="bg-black/50 hover:bg-black/70 text-white p-2 h-9 w-9 backdrop-blur-sm rounded-full"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-black/70 text-white text-sm backdrop-blur-sm px-3 py-1">
                          {event.current_participants}/{event.max_participants} spots
                        </Badge>
                      </div>

                      {!user && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <div className="text-center">
                            <Lock className="w-12 h-12 text-white mx-auto mb-2" />
                            <p className="text-white font-bold">Login Required</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>

                  <CardContent className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-4">
                      <Badge
                        variant="outline"
                        className="text-yellow-400 border-yellow-400 text-xs capitalize font-bold px-3 py-1"
                      >
                        {event.event_type}
                      </Badge>
                      <div className="flex items-center text-yellow-400">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm font-bold">
                          {event.current_participants}/{event.max_participants}
                        </span>
                      </div>
                    </div>

                    <Link href={`/events/${generateSlug(event.title, event.id)}`}>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors line-clamp-2 cursor-pointer">
                        {event.title}
                      </h3>
                    </Link>

                    <p className="text-gray-400 mb-6 text-sm line-clamp-3 flex-grow leading-relaxed">
                      {event.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-300">
                        <Calendar className="w-4 h-4 mr-3 text-yellow-400" />
                        <span className="font-medium">{formatDate(event.event_date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <MapPin className="w-4 h-4 mr-3 text-yellow-400" />
                        <span className="font-medium">{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <User className="w-4 h-4 mr-3 text-yellow-400" />
                        <span className="font-medium">by {event.organizer}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {event.technologies.slice(0, 3).map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs bg-yellow-400/20 text-yellow-400 font-medium px-2 py-1"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {event.technologies.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-yellow-400/20 text-yellow-400 font-medium px-2 py-1"
                        >
                          +{event.technologies.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                        {event.registration_fee > 0 ? (
                          <span className="text-yellow-400 font-bold text-lg">${event.registration_fee}</span>
                        ) : (
                          <span className="text-green-400 font-bold text-lg">FREE</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">
                          {Math.ceil(
                            (new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                          )}{" "}
                          days left
                        </span>
                      </div>
                    </div>

                    <Button
                      className={`w-full text-sm py-3 font-bold rounded-full transition-all duration-300 ${
                        !user
                          ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                          : registeredEvents.includes(event.id)
                            ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                            : event.current_participants >= event.max_participants
                              ? "bg-red-600 text-white cursor-not-allowed"
                              : "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-lg hover:shadow-xl"
                      }`}
                      onClick={() => handleEventRegistration(event)}
                      disabled={
                        !user ||
                        registeredEvents.includes(event.id) ||
                        event.current_participants >= event.max_participants
                      }
                    >
                      {!user ? (
                        <>
                          Login Required
                          <Lock className="ml-2 w-4 h-4" />
                        </>
                      ) : registeredEvents.includes(event.id) ? (
                        <>
                          ✓ Registered
                          <Calendar className="ml-2 w-4 h-4" />
                        </>
                      ) : event.current_participants >= event.max_participants ? (
                        <>
                          Event Full
                          <Users className="ml-2 w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Register Now
                          <Play className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-3xl font-bold text-white mb-4">No events found</h3>
              <p className="text-xl text-gray-400 mb-8">Try adjusting your search or filter criteria</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedType("All")
                }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-8 py-3 rounded-full"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900/40 to-gray-800/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Award className="w-20 h-20 text-yellow-400 mx-auto mb-8" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Join <span className="text-yellow-400">Tech Events</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Connect with fellow developers, learn new skills, and stay updated with the latest tech trends through our
              curated events. Join thousands of developers already part of our community!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {user ? (
                <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-10 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  Browse All Events
                  <Calendar className="ml-2 w-6 h-6" />
                </Button>
              ) : (
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-10 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                    Sign Up to Join Events
                    <Play className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
              )}
              <Link href="/contact">
                <Button className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-10 py-4 text-lg rounded-full backdrop-blur-sm transition-all duration-300">
                  Contact Support
                  <ChevronRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
