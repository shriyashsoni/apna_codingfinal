"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  ExternalLink,
  Share2,
  Bookmark,
  ArrowLeft,
  User,
  Globe,
  CheckCircle,
  AlertCircle,
  Play,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, registerForEvent, checkEventRegistration, type Event } from "@/lib/supabase"

interface EventDetailClientProps {
  event: Event
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        const registered = await checkEventRegistration(event.id, currentUser.id)
        setIsRegistered(registered)
      }
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegistration = async () => {
    if (!user) {
      alert("Please login to register for events!")
      return
    }

    if (isRegistered) {
      alert("You are already registered for this event!")
      return
    }

    if (event.current_participants >= event.max_participants) {
      alert("This event is full!")
      return
    }

    setRegistering(true)
    try {
      const result = await registerForEvent(event.id, user.id)
      if (result.success) {
        alert("Successfully registered for the event!")
        setIsRegistered(true)
        // Update participant count locally
        event.current_participants += 1
      } else {
        alert("Failed to register: " + result.error)
      }
    } catch (error) {
      console.error("Error registering for event:", error)
      alert("An error occurred while registering")
    } finally {
      setRegistering(false)
    }
  }

  const handleShare = () => {
    const eventUrl = window.location.href

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

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
    // In a real app, you'd save this to the database
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "text-blue-400"
      case "ongoing":
        return "text-green-400"
      case "completed":
        return "text-gray-400"
      case "cancelled":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const isEventFull = event.current_participants >= event.max_participants
  const isEventPast = new Date(event.event_date) < new Date()

  return (
    <div className="min-h-screen pt-20 bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button onClick={() => router.back()} variant="ghost" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-6">
                <Image
                  src={
                    event.image_url ||
                    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EVENT%20COSTOM%20TEMPLATE-kZL4AvoUZPDjOKW6HBkYlCocOyCR7I.png"
                  }
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Event Type Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className={`${getEventTypeColor(event.event_type)} text-white capitalize`}>
                    {event.event_type}
                  </Badge>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-black/50 text-white backdrop-blur-sm">{event.status}</Badge>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleBookmark}
                    className={`bg-black/50 hover:bg-black/70 backdrop-blur-sm ${
                      bookmarked ? "text-yellow-400" : "text-white"
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleShare}
                    className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
                  <p className="text-yellow-400 text-lg font-medium">by {event.organizer}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white mb-1">
                    {event.registration_fee > 0 ? `$${event.registration_fee}` : "FREE"}
                  </div>
                  <div className={`text-sm ${getStatusColor(event.status)}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* Event Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-4 text-center backdrop-blur-sm">
                  <Users className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">
                    {event.current_participants}/{event.max_participants}
                  </div>
                  <div className="text-gray-400 text-sm">Participants</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 text-center backdrop-blur-sm">
                  <Calendar className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">{new Date(event.event_date).toLocaleDateString()}</div>
                  <div className="text-gray-400 text-sm">Date</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 text-center backdrop-blur-sm">
                  <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">
                    {new Date(event.event_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="text-gray-400 text-sm">Time</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 text-center backdrop-blur-sm">
                  <Globe className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-semibold capitalize">{event.event_mode}</div>
                  <div className="text-gray-400 text-sm">Mode</div>
                </div>
              </div>

              {/* Registration Status */}
              {!user && (
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <Lock className="w-5 h-5" />
                    <span className="font-semibold">Login Required</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Please sign in to register for this event and access all features.
                  </p>
                </div>
              )}

              {user && isRegistered && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">You're Registered!</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    You have successfully registered for this event. Check your email for confirmation details.
                  </p>
                </div>
              )}

              {user && isEventFull && !isRegistered && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Event Full</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    This event has reached its maximum capacity. Join our waitlist to be notified if spots become
                    available.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Event Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Agenda */}
            {event.agenda && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Event Agenda</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.agenda}</div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Speaker Info */}
            {event.speaker_info && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
              >
                <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Speaker Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.speaker_info}</div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Technologies */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Technologies Covered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.technologies.map((tech, index) => (
                      <Badge key={index} className="bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-8"
              >
                <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {event.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-24"
            >
              <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="font-medium text-white">Date & Time</div>
                      <div className="text-sm">{formatDate(event.event_date)}</div>
                      {event.end_date && (
                        <div className="text-sm text-gray-400">Ends: {formatDate(event.end_date)}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="font-medium text-white">Location</div>
                      <div className="text-sm">{event.location}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-300">
                    <User className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="font-medium text-white">Organizer</div>
                      <div className="text-sm">{event.organizer}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-300">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="font-medium text-white">Price</div>
                      <div className="text-sm">
                        {event.registration_fee > 0 ? `$${event.registration_fee}` : "Free"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-300">
                    <Users className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="font-medium text-white">Capacity</div>
                      <div className="text-sm">
                        {event.current_participants} / {event.max_participants} registered
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${Math.min((event.current_participants / event.max_participants) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Registration Button */}
                  <div className="pt-4 border-t border-gray-700">
                    {!user ? (
                      <Button className="w-full bg-gray-600 text-gray-300 cursor-not-allowed" disabled>
                        <Lock className="w-4 h-4 mr-2" />
                        Login Required
                      </Button>
                    ) : isRegistered ? (
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Registered ✓
                      </Button>
                    ) : isEventFull ? (
                      <Button className="w-full bg-red-600 text-white cursor-not-allowed" disabled>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Event Full
                      </Button>
                    ) : isEventPast ? (
                      <Button className="w-full bg-gray-600 text-gray-300 cursor-not-allowed" disabled>
                        <Clock className="w-4 h-4 mr-2" />
                        Event Ended
                      </Button>
                    ) : (
                      <Button
                        onClick={handleRegistration}
                        disabled={registering}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                      >
                        {registering ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                            Registering...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Register Now
                          </>
                        )}
                      </Button>
                    )}

                    {event.registration_link && (
                      <Button
                        onClick={() => window.open(event.registration_link, "_blank")}
                        variant="outline"
                        className="w-full mt-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        External Registration
                      </Button>
                    )}
                  </div>

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="pt-4 border-t border-gray-700">
                      <div className="font-medium text-white mb-2">Tags</div>
                      <div className="flex flex-wrap gap-1">
                        {event.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
