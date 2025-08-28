"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  User,
  Share2,
  Bookmark,
  ArrowLeft,
  ExternalLink,
  Play,
  Lock,
  CheckCircle,
  Mail,
  Award,
  Target,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, registerForEvent, checkEventRegistration, type Event } from "@/lib/supabase"

interface EventDetailClientProps {
  event: Event
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const [user, setUser] = useState<any>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUserAndRegistration()
  }, [])

  const checkUserAndRegistration = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        const registered = await checkEventRegistration(event.id, currentUser.id)
        setIsRegistered(registered)
      }
    } catch (error) {
      console.error("Error checking user and registration:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegistration = async () => {
    if (!user) {
      alert("Please login to register for this event!")
      router.push("/auth")
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
        alert("Successfully registered for the event! Check your email for confirmation.")
        setIsRegistered(true)
        // Refresh the page to update participant count
        window.location.reload()
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
    // In a real app, you'd save this to the user's bookmarks
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

  const daysUntilEvent = Math.ceil(
    (new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )
  const isEventSoon = daysUntilEvent <= 7 && daysUntilEvent > 0
  const isEventToday = daysUntilEvent === 0
  const isEventPast = daysUntilEvent < 0

  return (
    <div className="min-h-screen pt-20 bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-purple-600/5" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            onClick={() => router.back()}
            className="bg-gray-900/50 hover:bg-gray-800/50 text-white border border-gray-700 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Card className="bg-gray-900/30 backdrop-blur-sm border-2 border-gray-800 overflow-hidden">
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={
                      event.image_url ||
                      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EVENT%20COSTOM%20TEMPLATE-kZL4AvoUZPDjOKW6HBkYlCocOyCR7I.png"
                    }
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-6 left-6 flex gap-3">
                    <Badge
                      className={`${getEventTypeColor(event.event_type)} text-white font-bold px-4 py-2 capitalize`}
                    >
                      {event.event_type}
                    </Badge>
                    <Badge className="bg-green-500 text-white font-bold px-4 py-2">{event.event_mode}</Badge>
                    {isEventSoon && (
                      <Badge className="bg-red-500 text-white font-bold px-4 py-2 animate-pulse">Starting Soon!</Badge>
                    )}
                    {isEventToday && (
                      <Badge className="bg-yellow-400 text-black font-bold px-4 py-2 animate-pulse">Today!</Badge>
                    )}
                  </div>

                  <div className="absolute top-6 right-6 flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleBookmark}
                      className={`bg-black/50 hover:bg-black/70 p-3 backdrop-blur-sm rounded-full ${bookmarked ? "text-yellow-400" : "text-white"}`}
                    >
                      <Bookmark className="w-5 h-5" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleShare}
                      className="bg-black/50 hover:bg-black/70 text-white p-3 backdrop-blur-sm rounded-full"
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{event.title}</h1>
                    <div className="flex items-center gap-4 text-white">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-yellow-400" />
                        <span className="font-medium">by {event.organizer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-yellow-400" />
                        <span className="font-medium">
                          {event.current_participants}/{event.max_participants} registered
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-gray-900/30 backdrop-blur-sm border-2 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-400/20 p-3 rounded-full">
                        <Calendar className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Date & Time</p>
                        <p className="text-white font-medium">{formatDate(event.event_date)}</p>
                        {event.end_date && <p className="text-gray-400 text-sm">Ends: {formatDate(event.end_date)}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-400/20 p-3 rounded-full">
                        <MapPin className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Location</p>
                        <p className="text-white font-medium">{event.location}</p>
                        <p className="text-gray-400 text-sm capitalize">{event.event_mode} event</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-400/20 p-3 rounded-full">
                        <DollarSign className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Registration Fee</p>
                        <p className="text-white font-medium text-xl">
                          {event.registration_fee > 0 ? `$${event.registration_fee}` : "FREE"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-400/20 p-3 rounded-full">
                        <Users className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Participants</p>
                        <p className="text-white font-medium">
                          {event.current_participants} / {event.max_participants}
                        </p>
                        <div className="w-32 bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(event.current_participants / event.max_participants) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {daysUntilEvent > 0 && (
                    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-yellow-400" />
                        <div>
                          <p className="text-yellow-400 font-bold">
                            {daysUntilEvent === 1 ? "Tomorrow!" : `${daysUntilEvent} days to go!`}
                          </p>
                          <p className="text-gray-300 text-sm">Don't miss out on this amazing event</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card className="bg-gray-900/30 backdrop-blur-sm border-2 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">{event.description}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Agenda */}
            {event.agenda && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="bg-gray-900/30 backdrop-blur-sm border-2 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-yellow-400" />
                      Event Agenda
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">{event.agenda}</div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Speaker Info */}
            {event.speaker_info && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Card className="bg-gray-900/30 backdrop-blur-sm border-2 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl flex items-center gap-2">
                      <Award className="w-6 h-6 text-yellow-400" />
                      Speaker Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                      {event.speaker_info}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Card className="bg-gray-900/30 backdrop-blur-sm border-2 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl flex items-center gap-2">
                      <Target className="w-6 h-6 text-yellow-400" />
                      Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {event.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Technologies */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Card className="bg-gray-900/30 backdrop-blur-sm border-2 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Technologies Covered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {event.technologies.map((tech) => (
                      <Badge
                        key={tech}
                        className="bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-4 py-2 text-sm font-medium"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Card className="bg-gray-900/30 backdrop-blur-sm border-2 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-gray-600 text-gray-300 px-3 py-1 text-sm">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <Card className="bg-gray-900/30 backdrop-blur-sm border-2 border-gray-800 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Registration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {event.registration_fee > 0 ? `$${event.registration_fee}` : "FREE"}
                    </div>
                    <p className="text-gray-400">Registration Fee</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Available Spots</span>
                      <span className="text-white font-medium">
                        {event.max_participants - event.current_participants}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Event Type</span>
                      <Badge className={`${getEventTypeColor(event.event_type)} text-white capitalize`}>
                        {event.event_type}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Mode</span>
                      <Badge className="bg-green-500 text-white capitalize">{event.event_mode}</Badge>
                    </div>
                  </div>

                  {!isEventPast && (
                    <Button
                      onClick={handleRegistration}
                      disabled={
                        !user ||
                        isRegistered ||
                        event.current_participants >= event.max_participants ||
                        registering ||
                        !event.registration_open
                      }
                      className={`w-full py-4 text-lg font-bold rounded-full transition-all duration-300 ${
                        !user
                          ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                          : isRegistered
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : event.current_participants >= event.max_participants
                              ? "bg-red-600 text-white cursor-not-allowed"
                              : !event.registration_open
                                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                                : "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-lg hover:shadow-xl"
                      }`}
                    >
                      {!user ? (
                        <>
                          Login Required
                          <Lock className="ml-2 w-5 h-5" />
                        </>
                      ) : isRegistered ? (
                        <>
                          ✓ Registered
                          <CheckCircle className="ml-2 w-5 h-5" />
                        </>
                      ) : event.current_participants >= event.max_participants ? (
                        <>
                          Event Full
                          <Users className="ml-2 w-5 h-5" />
                        </>
                      ) : !event.registration_open ? (
                        <>
                          Registration Closed
                          <Lock className="ml-2 w-5 h-5" />
                        </>
                      ) : registering ? (
                        <>
                          Registering...
                          <div className="ml-2 w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        </>
                      ) : (
                        <>
                          Register Now
                          <Play className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  )}

                  {isEventPast && (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-lg">This event has ended</p>
                    </div>
                  )}

                  {!user && (
                    <div className="text-center">
                      <Link href="/auth">
                        <Button className="text-yellow-400 hover:text-yellow-300 underline bg-transparent p-0">
                          Login to register for this event
                        </Button>
                      </Link>
                    </div>
                  )}

                  {event.registration_link && (
                    <div className="pt-4 border-t border-gray-700">
                      <Button
                        onClick={() => window.open(event.registration_link, "_blank")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full"
                      >
                        External Registration
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Organizer Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-gray-900/30 backdrop-blur-sm border-2 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-yellow-400/20 p-3 rounded-full">
                      <User className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{event.organizer}</h3>
                      <p className="text-gray-400">Event Organizer</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() =>
                        window.open(`mailto:info@apnacoding.tech?subject=Question about ${event.title}`, "_blank")
                      }
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Organizer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card className="bg-gray-900/30 backdrop-blur-sm border-2 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleShare}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-full"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Event
                  </Button>

                  <Link href="/events">
                    <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Browse More Events
                    </Button>
                  </Link>

                  <Link href="/hackathons">
                    <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-full">
                      <Award className="w-4 h-4 mr-2" />
                      View Hackathons
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
