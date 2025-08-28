"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users, Search, Filter, DollarSign, ExternalLink, User, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getEvents, searchEvents, generateSlug, type Event } from "@/lib/supabase"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All")

  const eventTypes = ["All", "workshop", "webinar", "conference", "meetup", "bootcamp", "seminar"]

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    handleSearch()
  }, [searchQuery, selectedType, events])

  const fetchEvents = async () => {
    try {
      const { data, error } = await getEvents()
      if (error) {
        console.error("Error fetching events:", error)
      } else {
        setEvents(data || [])
        setFilteredEvents(data || [])
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery && selectedType === "All") {
      setFilteredEvents(events)
      return
    }

    try {
      const { data, error } = await searchEvents(searchQuery, selectedType)
      if (error) {
        console.error("Error searching events:", error)
      } else {
        setFilteredEvents(data || [])
      }
    } catch (error) {
      console.error("Error searching events:", error)
    }
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
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Tech <span className="text-yellow-400">Events</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join workshops, webinars, conferences, and meetups to enhance your coding skills and connect with the
              developer community.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search events, technologies, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 h-12"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {eventTypes.map((type) => (
                  <Button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    variant={selectedType === type ? "default" : "outline"}
                    className={`whitespace-nowrap ${
                      selectedType === type
                        ? "bg-yellow-400 text-black hover:bg-yellow-500"
                        : "border-gray-700 text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {type === "All" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
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
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-4">No Events Found</h3>
              <p className="text-gray-400 mb-8">
                {searchQuery || selectedType !== "All"
                  ? "Try adjusting your search criteria or filters."
                  : "No events are currently available. Check back soon!"}
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedType("All")
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <Card className="bg-gray-900/30 border-gray-800 hover:border-yellow-400/50 transition-all duration-300 group overflow-hidden">
                      <div className="relative h-48 overflow-hidden">
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
                      </div>

                      <CardHeader className="pb-3">
                        <CardTitle className="text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
                          {event.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-gray-300 text-sm line-clamp-3">{event.description}</p>

                        {/* Event Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4 text-yellow-400" />
                            <span>
                              {formatDate(event.event_date)} at {formatTime(event.event_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MapPin className="w-4 h-4 text-yellow-400" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <User className="w-4 h-4 text-yellow-400" />
                            <span className="truncate">{event.organizer}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Globe className="w-4 h-4 text-yellow-400" />
                            <span className="capitalize">{event.event_mode}</span>
                          </div>
                        </div>

                        {/* Technologies */}
                        {event.technologies && event.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
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
                        {event.registration_fee > 0 && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-yellow-400" />
                            <span className="font-semibold text-yellow-400">${event.registration_fee}</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Link href={`/events/${eventSlug}`} className="flex-1">
                            <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                              View Details
                            </Button>
                          </Link>
                          {event.registration_link && (
                            <a
                              href={event.registration_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </a>
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
      <section className="py-16 bg-gradient-to-r from-yellow-400/10 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl font-bold mb-4">Don't Miss Out!</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Stay updated with the latest tech events, workshops, and conferences. Join our community to get notified
              about new events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/community">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3">
                  Join Community
                </Button>
              </Link>
              <Link href="/hackathons">
                <Button
                  variant="outline"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3 bg-transparent"
                >
                  Explore Hackathons
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
