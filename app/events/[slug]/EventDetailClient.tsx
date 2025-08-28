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
  Globe,
  DollarSign,
  Share2,
  ExternalLink,
  User,
  Tag,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { getCurrentUser, registerForEvent, checkEventRegistration, type Event } from "@/lib/supabase"

interface EventDetailClientProps {
  event: Event
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const [user, setUser] = useState<any>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserAndRegistration()
  }, [event.id])

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

  const handleRegister = async () => {
    if (!user) {
      toast.error("Please sign in to register for this event.")
      return
    }

    if (isRegistered) {
      toast.info("You are already registered for this event!")
      return
    }

    if (event.current_participants >= event.max_participants) {
      toast.error("This event has reached maximum capacity.")
      return
    }

    setIsRegistering(true)
    try {
      const result = await registerForEvent(event.id, user.id)
      if (result.success) {
        setIsRegistered(true)
        toast.success("🎉 Successfully registered for the event! Check your email for confirmation.")
      } else {
        toast.error(result.error || "Failed to register for the event.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsRegistering(false)
    }
  }

  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = event.title
    const description = event.description.substring(0, 100) + "..."

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            title,
          )}&url=${encodeURIComponent(url)}&hashtags=ApnaCoding,TechEvent`,
          "_blank",
        )
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
        break
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
        break
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`, "_blank")
        break
      case "copy":
        try {
          await navigator.clipboard.writeText(url)
          toast.success("Link copied to clipboard!")
        } catch (error) {
          toast.error("Failed to copy link to clipboard.")
        }
        break
      case "native":
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text: description,
              url,
            })
          } catch (error) {
            console.log("Share cancelled")
          }
        }
        break
    }
  }

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks")
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
  const registrationProgress = (event.current_participants / event.max_participants) * 100

  return (
    <div className="min-h-screen pt-20 bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <Link href="/events">
            <Button variant="outline" className="bg-black/50 border-gray-700 text-white hover:bg-black/70">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>

        {/* Share & Bookmark Buttons */}
        <div className="absolute top-6 right-6 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleBookmark}
            className="bg-black/50 border-gray-700 text-white hover:bg-black/70"
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-black/50 border-gray-700 text-white hover:bg-black/70">
                <Share2 className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700">
              <DropdownMenuItem onClick={() => handleShare("twitter")} className="text-white hover:bg-gray-800">
                <Twitter className="w-4 h-4 mr-2" />
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("facebook")} className="text-white hover:bg-gray-800">
                <Facebook className="w-4 h-4 mr-2" />
                Share on Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("linkedin")} className="text-white hover:bg-gray-800">
                <Linkedin className="w-4 h-4 mr-2" />
                Share on LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("whatsapp")} className="text-white hover:bg-gray-800">
                <MessageCircle className="w-4 h-4 mr-2" />
                Share on WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("copy")} className="text-white hover:bg-gray-800">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              {navigator.share && (
                <DropdownMenuItem onClick={() => handleShare("native")} className="text-white hover:bg-gray-800">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share...
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Event Badges */}
        <div className="absolute bottom-6 left-6 flex gap-2">
          <Badge className={`${getEventTypeColor(event.event_type)} text-white font-bold`}>
            {event.event_type.toUpperCase()}
          </Badge>
          <Badge className={`${getStatusColor(event.status)} text-white font-bold`}>{event.status.toUpperCase()}</Badge>
          {event.registration_fee === 0 && <Badge className="bg-green-500 text-white font-bold">FREE</Badge>}
        </div>

        {/* Days Until Event */}
        {event.status === "upcoming" && (
          <div className="absolute bottom-6 right-6">
            <Badge className="bg-yellow-400 text-black font-bold text-lg px-4 py-2">
              {daysUntilEvent > 0 ? `${daysUntilEvent} DAYS LEFT` : daysUntilEvent === 0 ? "TODAY" : "PAST"}
            </Badge>
          </div>
        )}
      </section>

      {/* Event Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Title & Description */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {event.title}
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">{event.description}</p>
              </motion.div>

              {/* Event Details */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-yellow-400" />
                      Event Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-gray-300">
                        <Calendar className="w-5 h-5 text-yellow-400" />
                        <div>
                          <div className="font-semibold">{formatDate(event.event_date)}</div>
                          <div className="text-sm text-gray-400">{formatTime(event.event_date)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-300">
                        <MapPin className="w-5 h-5 text-yellow-400" />
                        <div>
                          <div className="font-semibold">{event.location}</div>
                          <div className="text-sm text-gray-400 capitalize">{event.event_mode} Event</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-300">
                        <User className="w-5 h-5 text-yellow-400" />
                        <div>
                          <div className="font-semibold">{event.organizer}</div>
                          <div className="text-sm text-gray-400">Event Organizer</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-300">
                        <Globe className="w-5 h-5 text-yellow-400" />
                        <div>
                          <div className="font-semibold capitalize">{event.event_mode}</div>
                          <div className="text-sm text-gray-400">Event Mode</div>
                        </div>
                      </div>

                      {event.registration_fee > 0 && (
                        <div className="flex items-center gap-3 text-gray-300">
                          <DollarSign className="w-5 h-5 text-yellow-400" />
                          <div>
                            <div className="font-semibold text-yellow-400">${event.registration_fee}</div>
                            <div className="text-sm text-gray-400">Registration Fee</div>
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
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Tag className="w-5 h-5 text-yellow-400" />
                        Technologies & Topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {event.technologies.map((tech, index) => (
                          <Badge key={index} className="bg-gray-700 text-gray-300 hover:bg-gray-600">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Additional Info */}
              {(event.requirements || event.agenda || event.speaker_info) && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {event.requirements && (
                        <div>
                          <h4 className="font-semibold text-yellow-400 mb-2">Requirements</h4>
                          <ul className="text-gray-300 space-y-1">
                            {event.requirements.map((req, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {event.agenda && (
                        <div>
                          <h4 className="font-semibold text-yellow-400 mb-2">Agenda</h4>
                          <p className="text-gray-300 whitespace-pre-line">{event.agenda}</p>
                        </div>
                      )}

                      {event.speaker_info && (
                        <div>
                          <h4 className="font-semibold text-yellow-400 mb-2">Speaker Information</h4>
                          <p className="text-gray-300 whitespace-pre-line">{event.speaker_info}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-yellow-400" />
                      Registration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Participant Count */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {event.current_participants}/{event.max_participants}
                      </div>
                      <div className="text-sm text-gray-400">Participants Registered</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(registrationProgress, 100)}%` }}
                      />
                    </div>

                    {/* Registration Status */}
                    {loading ? (
                      <div className="text-center text-gray-400">Loading...</div>
                    ) : isRegistered ? (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">You're Registered!</span>
                        </div>
                        <p className="text-sm text-gray-400">Check your email for event details</p>
                      </div>
                    ) : isEventFull ? (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-semibold">Event Full</span>
                        </div>
                        <p className="text-sm text-gray-400">This event has reached maximum capacity</p>
                      </div>
                    ) : event.status === "completed" ? (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                          <Clock className="w-5 h-5" />
                          <span className="font-semibold">Event Completed</span>
                        </div>
                      </div>
                    ) : event.status === "cancelled" ? (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-semibold">Event Cancelled</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {event.registration_fee > 0 && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">${event.registration_fee}</div>
                            <div className="text-sm text-gray-400">Registration Fee</div>
                          </div>
                        )}

                        <Button
                          onClick={handleRegister}
                          disabled={isRegistering || !event.registration_open}
                          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3"
                        >
                          {isRegistering ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                              Registering...
                            </>
                          ) : event.registration_fee === 0 ? (
                            "Register for Free"
                          ) : (
                            `Register for $${event.registration_fee}`
                          )}
                        </Button>

                        {event.registration_link && (
                          <Button
                            variant="outline"
                            className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                            onClick={() => window.open(event.registration_link, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            External Registration
                          </Button>
                        )}

                        {!event.registration_open && (
                          <p className="text-sm text-red-400 text-center">Registration is currently closed</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Event Tags */}
              {event.tags && event.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Tag className="w-5 h-5 text-yellow-400" />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Events CTA */}
      <section className="py-16 bg-gradient-to-r from-yellow-400/10 to-orange-500/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl font-bold mb-4">Discover More Events</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Explore other exciting tech events, workshops, and conferences from Apna Coding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  View All Events
                </Button>
              </Link>
              <Link href="/community">
                <Button
                  variant="outline"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3 bg-transparent"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Join Community
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
