"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Filter,
  Clock,
  DollarSign,
  ChevronDown,
  Lock,
  LogIn,
  Eye,
  ArrowRight,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { Event } from "@/lib/supabase"
import AuthModal from "@/components/auth/auth-modal"
import FloatingElements from "@/components/floating-elements"

interface EventsPageProps {
  initialEvents: Event[]
  error?: any
}

export default function EventsPageClient({ initialEvents, error }: EventsPageProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [user, setUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [isVisible, setIsVisible] = useState(false)

  const eventTypes = ["All", "workshop", "webinar", "conference", "meetup", "bootcamp", "seminar"]

  useEffect(() => {
    setIsVisible(true)
    checkUser()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchQuery, selectedType])

  const checkUser = async () => {
    try {
      const currentUser = await window.supabase_client.auth.user()
      setUser(currentUser)
    } catch (error) {
      console.error("Error checking user:", error)
    }
  }

  const filterEvents = async () => {
    try {
      if (searchQuery || selectedType !== "All") {
        const filtered = events.filter((event) => {
          const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesType = selectedType === "All" || event.event_type === selectedType
          return matchesSearch && matchesType
        })
        setFilteredEvents(filtered)
      } else {
        setFilteredEvents(events)
      }
    } catch (error) {
      console.error("Error filtering events:", error)
      setFilteredEvents(events)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    checkUser()
    toast.success("Welcome! You can now access full event details.")
  }

  const handleEventClick = (event: Event) => {
    if (!user) {
      setAuthMode("login")
      setShowAuthModal(true)
      toast.info("Please sign in to view full event details and register")
      return
    }
    // If user is logged in, navigate to event page
    const slug = generateSlug(event.title, event.id)
    window.location.href = `/events/${slug}`
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
        return "bg-blue-500 text-white"
      case "ongoing":
        return "bg-green-500 text-white"
      case "completed":
        return "bg-gray-500 text-white"
      case "cancelled":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <FloatingElements />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <FloatingElements />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        mode={authMode}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className={`transition-all duration-1000 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}>
              <div className="inline-flex items-center bg-gray-900/30 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-gray-700/50">
                <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold mr-2">EVENTS</span>
                <span className="text-gray-300">Tech Workshops & Conferences</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
                Exclusive Tech <span className="text-yellow-400">Events</span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join our exclusive tech events, workshops, and conferences. Learn from industry experts, network with
                developers, and advance your career.
              </p>

              {/* Authentication Notice - Only show if not logged in */}
              {!user && (
                <div className="bg-gray-900/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 max-w-2xl mx-auto mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Lock className="w-5 h-5 text-black" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sign In to Access Full Details</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Browse events freely, but sign in to view full details, register, and access exclusive content.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => {
                        setAuthMode("login")
                        setShowAuthModal(true)
                      }}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                    <Button
                      onClick={() => {
                        setAuthMode("signup")
                        setShowAuthModal(true)
                      }}
                      className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black backdrop-blur-sm"
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              )}

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-gray-900/50 border border-gray-700 text-white hover:bg-gray-800 hover:border-yellow-400">
                      <Filter className="w-4 h-4 mr-2" />
                      {selectedType}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-700">
                    {eventTypes.map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className="text-white hover:bg-gray-800 capitalize"
                      >
                        {type}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid - Always visible */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">No Events Found</h3>
              <p className="text-gray-400">Try adjusting your search criteria or check back later for new events.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`transition-all duration-1000 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="group bg-gray-900/30 backdrop-blur-sm border-gray-700/50 overflow-hidden hover:border-yellow-400/50 transition-all duration-500 hover:scale-105 cursor-pointer relative">
                    <div className="p-0">
                      {/* Event Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image_url || "/images/hackathon-hero.png"}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        {/* Event Type Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className={`${getEventTypeColor(event.event_type)} text-white font-semibold`}>
                            {event.event_type.toUpperCase()}
                          </Badge>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                        </div>

                        {/* Days Until Event */}
                        {event.status === "upcoming" && (
                          <div className="absolute bottom-4 right-4">
                            <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-white" />
                                <span className="text-white text-sm">
                                  {getDaysUntilEvent(event.event_date) > 0
                                    ? `${getDaysUntilEvent(event.event_date)}d`
                                    : "Today"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Free Badge */}
                        {event.registration_fee === 0 && (
                          <div className="absolute bottom-4 left-4">
                            <Badge className="bg-green-500 text-white font-bold">FREE</Badge>
                          </div>
                        )}
                      </div>

                      {/* Event Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2">
                          {event.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{event.description}</p>

                        {/* Event Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-4 text-gray-400 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(event.event_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(event.event_date)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{event.location}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Users className="w-4 h-4" />
                            <span>
                              {event.current_participants}/{event.max_participants} registered
                            </span>
                          </div>

                          {event.registration_fee > 0 && (
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-semibold">${event.registration_fee}</span>
                            </div>
                          )}
                        </div>

                        {/* Technologies */}
                        {event.technologies && event.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {event.technologies.slice(0, 3).map((tech, techIndex) => (
                              <Badge
                                key={techIndex}
                                variant="outline"
                                className="border-yellow-400 text-yellow-400 text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                            {event.technologies.length > 3 && (
                              <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                                +{event.technologies.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Action Button */}
                        <Button
                          onClick={() => handleEventClick(event)}
                          className={`w-full ${
                            user
                              ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                              : "bg-gray-700 hover:bg-gray-600 text-white border border-yellow-400/50"
                          } font-semibold transition-all duration-300`}
                        >
                          {user ? (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details & Register
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Sign in to View Details
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="bg-gray-900/30 backdrop-blur-sm p-12 rounded-3xl border border-gray-700/50 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to <span className="text-yellow-400">Level Up</span> Your Skills?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our community of developers and get access to exclusive events, workshops, and networking
              opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Button
                    onClick={() => {
                      setAuthMode("signup")
                      setShowAuthModal(true)
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg px-8 py-4 rounded-xl"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Join Apna Coding
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    onClick={() => {
                      setAuthMode("login")
                      setShowAuthModal(true)
                    }}
                    className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-lg px-8 py-4 rounded-xl backdrop-blur-sm"
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/community">
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg px-8 py-4 rounded-xl">
                      <Users className="w-5 h-5 mr-2" />
                      Join Community
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/hackathons">
                    <Button className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-lg px-8 py-4 rounded-xl backdrop-blur-sm">
                      <Trophy className="w-5 h-5 mr-2" />
                      View Hackathons
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function generateSlug(title: string, id: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + id
}
