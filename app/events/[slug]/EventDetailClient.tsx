"use client"

import { useState, useEffect } from "react"
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
  CheckCircle,
  AlertCircle,
  Play,
  Lock,
  Globe,
  Tag,
  Info,
  Star,
  Trophy,
  Zap,
  Heart,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
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
  const [showShareMenu, setShowShareMenu] = useState(false)

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
      alert("Please login to register for this event!")
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

  const handleExternalRegistration = () => {
    if (event.registration_link) {
      window.open(event.registration_link, "_blank", "noopener,noreferrer")
    }
  }

  const handleShare = (platform?: string) => {
    const eventUrl = window.location.href
    const shareText = `Check out this amazing event: ${event.title}`

    if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`,
        "_blank",
        "noopener,noreferrer",
      )
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
        "_blank",
        "noopener,noreferrer",
      )
    } else if (platform === "linkedin") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`,
        "_blank",
        "noopener,noreferrer",
      )
    } else if (platform === "copy") {
      navigator.clipboard.writeText(eventUrl)
      alert("Link copied to clipboard!")
      setShowShareMenu(false)
    } else {
      // Native share or fallback
      if (navigator.share) {
        navigator.share({
          title: event.title,
          text: event.description,
          url: eventUrl,
        })
      } else {
        setShowShareMenu(!showShareMenu)
      }
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
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getDaysUntilEvent = () => {
    const eventDate = new Date(event.event_date)
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
        return "bg-blue-500"
      case "ongoing":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const daysUntilEvent = getDaysUntilEvent()
  const isEventFull = event.current_participants >= event.max_participants
  const isEventPast = daysUntilEvent < 0

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Cover Image */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={
              event.image_url ||
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EVENT%20COSTOM%20TEMPLATE-kZL4AvoUZPDjOKW6HBkYlCocOyCR7I.png" ||
              "/placeholder.svg"
            }
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        </div>

        {/* Back Button */}
        <div className="absolute top-24 left-4 z-20">
          <Link href="/events">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-black/20 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>

        {/* Event Badges */}
        <div className="absolute top-24 right-4 z-20 flex gap-2">
          <Badge className={`${getEventTypeColor(event.event_type)} text-white font-bold px-4 py-2`}>
            {event.event_type.toUpperCase()}
          </Badge>
          <Badge className={`${getStatusColor(event.status)} text-white font-bold px-4 py-2`}>
            {event.status.toUpperCase()}
          </Badge>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
            >
              {/* Event Type & Mode */}
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-yellow-400 text-black px-4 py-2 font-bold text-lg">
                  {daysUntilEvent > 0 ? `${daysUntilEvent} DAYS LEFT` : daysUntilEvent === 0 ? "TODAY" : "PAST EVENT"}
                </Badge>
                <Badge className="bg-green-500 text-white px-4 py-2 font-bold">
                  <Globe className="w-4 h-4 mr-2" />
                  {event.event_mode.toUpperCase()}
                </Badge>
                {event.registration_fee === 0 && (
                  <Badge className="bg-blue-500 text-white px-4 py-2 font-bold">FREE EVENT</Badge>
                )}
              </div>

              {/* Event Title */}
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">{event.title}</h1>

              {/* Event Tagline/Description */}
              <p className="text-xl md:text-2xl text-gray-200 mb-6 leading-relaxed max-w-3xl">{event.description}</p>

              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3 text-white">
                  <Calendar className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-300">Date</p>
                    <p className="font-semibold">{formatDate(event.event_date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white">
                  <Clock className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-300">Time</p>
                    <p className="font-semibold">{formatTime(event.event_date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white">
                  <MapPin className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-300">Location</p>
                    <p className="font-semibold">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Primary Registration Button */}
                {!user ? (
                  <Link href="/auth">
                    <Button
                      size="lg"
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 text-lg"
                    >
                      <Lock className="mr-2 w-5 h-5" />
                      Login to Register
                    </Button>
                  </Link>
                ) : isRegistered ? (
                  <Button
                    size="lg"
                    disabled
                    className="bg-green-600 text-white font-bold px-8 py-4 text-lg cursor-not-allowed"
                  >
                    <CheckCircle className="mr-2 w-5 h-5" />
                    Registered ✓
                  </Button>
                ) : isEventFull ? (
                  <Button
                    size="lg"
                    disabled
                    className="bg-red-600 text-white font-bold px-8 py-4 text-lg cursor-not-allowed"
                  >
                    <AlertCircle className="mr-2 w-5 h-5" />
                    Event Full
                  </Button>
                ) : isEventPast ? (
                  <Button
                    size="lg"
                    disabled
                    className="bg-gray-600 text-gray-300 font-bold px-8 py-4 text-lg cursor-not-allowed"
                  >
                    <Clock className="mr-2 w-5 h-5" />
                    Event Ended
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleRegistration}
                    disabled={registering}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 text-lg"
                  >
                    {registering ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                        Registering...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 w-5 h-5" />
                        Register Now
                      </>
                    )}
                  </Button>
                )}

                {/* External Registration Button */}
                {event.registration_link && (
                  <Button
                    size="lg"
                    onClick={handleExternalRegistration}
                    className="bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold px-8 py-4 text-lg"
                  >
                    <ExternalLink className="mr-2 w-5 h-5" />
                    External Registration
                  </Button>
                )}

                {/* Share & Bookmark */}
                <div className="flex gap-2">
                  <div className="relative">
                    <Button
                      size="lg"
                      onClick={() => handleShare()}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 bg-black/20 backdrop-blur-sm px-4"
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>

                    {/* Share Menu */}
                    {showShareMenu && (
                      <div className="absolute top-full mt-2 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-2 z-30 min-w-[200px]">
                        <Button
                          onClick={() => handleShare("copy")}
                          variant="ghost"
                          className="w-full justify-start text-white hover:bg-gray-800"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>
                        <Button
                          onClick={() => handleShare("twitter")}
                          variant="ghost"
                          className="w-full justify-start text-white hover:bg-gray-800"
                        >
                          <Twitter className="w-4 h-4 mr-2" />
                          Share on Twitter
                        </Button>
                        <Button
                          onClick={() => handleShare("facebook")}
                          variant="ghost"
                          className="w-full justify-start text-white hover:bg-gray-800"
                        >
                          <Facebook className="w-4 h-4 mr-2" />
                          Share on Facebook
                        </Button>
                        <Button
                          onClick={() => handleShare("linkedin")}
                          variant="ghost"
                          className="w-full justify-start text-white hover:bg-gray-800"
                        >
                          <Linkedin className="w-4 h-4 mr-2" />
                          Share on LinkedIn
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button
                    size="lg"
                    onClick={handleBookmark}
                    variant="outline"
                    className={`border-white/20 hover:bg-white/10 bg-black/20 backdrop-blur-sm px-4 ${
                      bookmarked ? "text-yellow-400" : "text-white"
                    }`}
                  >
                    <Bookmark className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Event Details Section */}
      <section className="py-16 bg-gray-900/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Overview */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Info className="w-5 h-5 text-yellow-400" />
                      Event Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-yellow-400" />
                        <div>
                          <p className="text-sm text-gray-400">Organizer</p>
                          <p className="font-semibold text-white">{event.organizer}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-yellow-400" />
                        <div>
                          <p className="text-sm text-gray-400">Participants</p>
                          <p className="font-semibold text-white">
                            {event.current_participants}/{event.max_participants}
                          </p>
                        </div>
                      </div>

                      {event.registration_fee > 0 && (
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-6 h-6 text-yellow-400" />
                          <div>
                            <p className="text-sm text-gray-400">Registration Fee</p>
                            <p className="font-semibold text-yellow-400">${event.registration_fee}</p>
                          </div>
                        </div>
                      )}

                      {event.end_date && (
                        <div className="flex items-center gap-3">
                          <Clock className="w-6 h-6 text-yellow-400" />
                          <div>
                            <p className="text-sm text-gray-400">Duration</p>
                            <p className="font-semibold text-white">
                              {formatDateShort(event.event_date)} - {formatDateShort(event.end_date)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Technologies */}
              {event.technologies && event.technologies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Tag className="w-5 h-5 text-yellow-400" />
                        Technologies & Topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {event.technologies.map((tech, index) => (
                          <Badge key={index} className="bg-yellow-400/20 text-yellow-400 px-4 py-2 font-medium text-sm">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Agenda */}
              {event.agenda && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        Event Agenda
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">{event.agenda}</p>
                      </div>
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
                >
                  <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        Speaker Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">{event.speaker_info}</p>
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
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-yellow-400" />
                        Requirements & Prerequisites
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {event.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-3 text-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Progress */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Registration Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Registered</span>
                      <span className="font-semibold text-white">{event.current_participants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Available</span>
                      <span className="font-semibold text-white">
                        {event.max_participants - event.current_participants}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((event.current_participants / event.max_participants) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 text-center">
                      {Math.round((event.current_participants / event.max_participants) * 100)}% filled
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Event Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Event Type</p>
                      <Badge className={`${getEventTypeColor(event.event_type)} text-white capitalize`}>
                        {event.event_type}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Mode</p>
                      <Badge className="bg-green-500 text-white capitalize flex items-center gap-1 w-fit">
                        <Globe className="w-3 h-3" />
                        {event.event_mode}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Status</p>
                      <Badge className={`${getStatusColor(event.status)} text-white capitalize`}>{event.status}</Badge>
                    </div>
                    {event.registration_fee > 0 ? (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Price</p>
                        <p className="text-2xl font-bold text-yellow-400">${event.registration_fee}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Price</p>
                        <p className="text-2xl font-bold text-green-400">FREE</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, index) => (
                          <Badge key={index} className="bg-gray-700 text-gray-300 px-2 py-1 text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-400/30 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Don't Miss Out!</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Join the Apna Coding community and stay updated with the latest tech events.
                    </p>
                    <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                      <Heart className="w-4 h-4 mr-2" />
                      Join Community
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Events Section */}
      <section className="py-16 bg-gray-900/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4">More Events You Might Like</h2>
            <p className="text-gray-400 mb-8">Discover other exciting events and workshops from Apna Coding</p>
            <Link href="/events">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3">
                Browse All Events
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Click outside to close share menu */}
      {showShareMenu && <div className="fixed inset-0 z-20" onClick={() => setShowShareMenu(false)} />}
    </div>
  )
}
