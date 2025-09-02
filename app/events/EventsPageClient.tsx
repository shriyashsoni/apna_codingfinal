"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Search, Filter, Clock, DollarSign, ExternalLink } from "lucide-react"
import { type Event, searchEvents, generateSlug } from "@/lib/supabase"
import FloatingElements from "@/components/floating-elements"

interface EventsPageClientProps {
  initialEvents: Event[]
  error: any
}

export default function EventsPageClient({ initialEvents, error }: EventsPageClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(initialEvents)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("All")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const eventTypes = ["All", "workshop", "webinar", "conference", "meetup", "bootcamp", "seminar"]

  useEffect(() => {
    handleSearch()
  }, [searchQuery, selectedType, events])

  const handleSearch = async () => {
    if (!searchQuery && selectedType === "All") {
      setFilteredEvents(events)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await searchEvents(searchQuery, selectedType === "All" ? undefined : selectedType)

      if (!error && data) {
        setFilteredEvents(data)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventClick = (event: Event) => {
    const slug = generateSlug(event.title, event.id)
    router.push(`/events/${slug}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEventStatus = (event: Event) => {
    const now = new Date()
    const eventDate = new Date(event.event_date)
    const endDate = event.end_date ? new Date(event.end_date) : null

    if (eventDate > now) return "upcoming"
    if (eventDate <= now && (!endDate || endDate >= now)) return "ongoing"
    return "completed"
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Events</h1>
          <p className="text-gray-400 mb-4">Unable to load events at this time.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <FloatingElements />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            Tech <span className="text-yellow-400">Events</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join our upcoming coding events, workshops, webinars, and tech meetups. Learn from industry experts and
            connect with fellow developers.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48 bg-gray-900 border-gray-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-white">
                    {type === "All" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Searching events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">No Events Found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedType !== "All"
                ? "Try adjusting your search criteria"
                : "No upcoming events at the moment. Check back soon!"}
            </p>
            {(searchQuery || selectedType !== "All") && (
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedType("All")
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event)
              const participationPercentage =
                event.max_participants > 0 ? (event.current_participants / event.max_participants) * 100 : 0

              return (
                <Card
                  key={event.id}
                  className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="relative">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <Image
                        src={event.image_url || "/placeholder.svg?height=200&width=400"}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant={status === "upcoming" ? "default" : status === "ongoing" ? "secondary" : "outline"}
                          className={
                            status === "upcoming"
                              ? "bg-yellow-400 text-black"
                              : status === "ongoing"
                                ? "bg-green-600 text-white"
                                : "bg-gray-600 text-white"
                          }
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-black/50 text-white border-gray-600">
                          {event.event_type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
                      {event.title}
                    </CardTitle>
                    <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      <span>{formatDate(event.event_date)}</span>
                      <Clock className="w-4 h-4 text-yellow-400 ml-2" />
                      <span>{formatTime(event.event_date)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="w-4 h-4 text-yellow-400" />
                      <span className="truncate">{event.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Users className="w-4 h-4 text-yellow-400" />
                      <span>
                        {event.current_participants} / {event.max_participants}
                      </span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2 ml-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(participationPercentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium">
                          {event.registration_fee === 0 ? "Free" : `₹${event.registration_fee}`}
                        </span>
                      </div>

                      {event.registration_link && (
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                      )}
                    </div>

                    {event.technologies && event.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {event.technologies.slice(0, 3).map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {event.technologies.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{event.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Call to Action */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold mb-4">Want to organize an event?</h3>
            <p className="text-gray-400 mb-6">
              Join our community of organizers and share your knowledge with fellow developers.
            </p>
            <Button
              onClick={() => router.push("/contact")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
            >
              Contact Us
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
