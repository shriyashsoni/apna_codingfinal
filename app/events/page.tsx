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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-black">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-purple-500 text-white px-3 py-1">🎉 EVENTS</Badge>
                <Badge className="bg-green-500 text-white px-3 py-1">JOIN NOW</Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                <span className="text-purple-400">{events.length}+</span> Tech Events
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Join workshops, webinars, conferences, and meetups to enhance your skills and network with fellow
                developers!
                {!user && (
                  <span className="text-purple-400 font-semibold"> Login required to register for events.</span>
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <>
                    <Button className="bg-purple-400 hover:bg-purple-500 text-black font-semibold px-6 py-3">
                      Browse Events
                      <Calendar className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                      onClick={() => window.open("/hackathons", "_blank")}
                      className="border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black px-6 py-3"
                    >
                      View Hackathons
                      <ExternalLink className="ml-2 w-5 h-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="bg-purple-400 hover:bg-purple-500 text-black font-semibold px-6 py-3"
                      onClick={() => alert("Please login to register for events!")}
                    >
                      Login to Register
                      <Lock className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                      onClick={() => window.open("/hackathons", "_blank")}
                      className="border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black px-6 py-3"
                    >
                      View Hackathons
                      <ExternalLink className="ml-2 w-5 h-5" />
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
              <div className="relative w-full h-80 rounded-2xl overflow-hidden">
                <Image src="/images/courses-hero.png" alt="Tech Events" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Learn & Network</h3>
                  <p className="text-sm opacity-90">Join the Tech Community</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Login Warning for Non-Users */}
      {!user && (
        <section className="py-8 bg-purple-900/20 border-y border-purple-500/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4 text-center">
              <Lock className="w-6 h-6 text-purple-400" />
              <p className="text-purple-300 text-lg">
                <span className="font-semibold">Login Required:</span> Register for events and join our tech community.
                <Link href="/auth" className="text-purple-400 hover:underline ml-2">
                  Sign up now for free!
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Search and Filter Section */}
      <section className="py-8 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-gray-700 text-white placeholder-gray-400 focus:border-purple-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 capitalize ${
                    selectedType === type ? "bg-purple-400 text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {filteredEvents.length} Event{filteredEvents.length !== 1 ? "s" : ""} Available
            </h2>
            <p className="text-gray-300 text-lg">
              {selectedType !== "All" ? `Showing ${selectedType} events` : "All upcoming events"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="h-full"
              >
                <Card
                  className={`bg-gray-900 border-gray-800 hover:border-purple-400 transition-all duration-300 group overflow-hidden h-full flex flex-col ${!user ? "opacity-75" : ""}`}
                >
                  <Link href={`/events/${generateSlug(event.title, event.id)}`}>
                    <div className="relative h-48 overflow-hidden cursor-pointer">
                      <Image
                        src={event.image_url || "/images/courses-hero.png"}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className={`${getEventTypeColor(event.event_type)} text-white text-xs capitalize`}>
                          {event.event_type}
                        </Badge>
                        <Badge className="bg-green-500 text-white text-xs">{event.event_mode}</Badge>
                      </div>
                      <div className="absolute top-3 right-3 flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault()
                            handleBookmark(event.id)
                          }}
                          className={`bg-black/50 hover:bg-black/70 p-2 h-8 w-8 ${bookmarkedEvents.includes(event.id) ? "text-purple-400" : "text-white"}`}
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
                          className="bg-black/50 hover:bg-black/70 text-white p-2 h-8 w-8"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-black/70 text-white text-xs">
                          {event.current_participants}/{event.max_participants} spots
                        </Badge>
                      </div>
                      {!user && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <CardContent className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-purple-400 border-purple-400 text-xs capitalize">
                        {event.event_type}
                      </Badge>
                      <div className="flex items-center text-purple-400">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {event.current_participants}/{event.max_participants}
                        </span>
                      </div>
                    </div>

                    <Link href={`/events/${generateSlug(event.title, event.id)}`}>
                      <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-2 cursor-pointer">
                        {event.title}
                      </h3>
                    </Link>

                    <p className="text-gray-400 mb-4 text-sm line-clamp-3 flex-grow">{event.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(event.event_date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <User className="w-4 h-4 mr-2" />
                        <span>by {event.organizer}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {event.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {event.technologies.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{event.technologies.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          {event.registration_fee > 0 ? (
                            <span className="text-yellow-400 font-semibold">${event.registration_fee}</span>
                          ) : (
                            <span className="text-green-400 font-semibold">FREE</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      className={`w-full text-sm py-2 ${
                        !user
                          ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                          : registeredEvents.includes(event.id)
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : event.current_participants >= event.max_participants
                              ? "bg-red-600 text-white cursor-not-allowed"
                              : "bg-purple-400 hover:bg-purple-500 text-black"
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
                          Registered ✓
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
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No events found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Award className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Join <span className="text-purple-400">Tech Events</span>?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with fellow developers, learn new skills, and stay updated with the latest tech trends through our
              curated events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button className="bg-purple-400 hover:bg-purple-500 text-black font-semibold px-8 py-3">
                  Browse All Events
                  <Calendar className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Link href="/auth">
                  <Button className="bg-purple-400 hover:bg-purple-500 text-black font-semibold px-8 py-3">
                    Sign Up to Join Events
                    <Play className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
              <Link href="/contact">
                <Button className="border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black px-8 py-3">
                  Contact Support
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
