"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Bookmark,
  ArrowLeft,
  ExternalLink,
  Tag,
  User,
  Globe,
  Monitor,
  Building,
  CheckCircle,
  AlertCircle,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Copy,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCurrentUser, registerForEvent, checkEventRegistration, type Event } from "@/lib/supabase"

interface EventDetailClientProps {
  event: Event
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [event.id])

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        const registered = await checkEventRegistration(event.id, currentUser.id)
        setIsRegistered(registered)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!user) {
      toast.error("Please login to register for this event")
      return
    }

    if (isRegistered) {
      toast.info("You are already registered for this event!")
      return
    }

    setIsRegistering(true)
    try {
      const result = await registerForEvent(event.id, user.id)

      if (result.success) {
        setIsRegistered(true)
        toast.success("🎉 Successfully registered for the event! Check your email for confirmation.")
      } else {
        toast.error(result.error || "Failed to register for event")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("An error occurred during registration")
    } finally {
      setIsRegistering(false)
    }
  }

  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = `Check out this event: ${event.title}`
    const text = `${event.title} - ${event.description.substring(0, 100)}...`

    try {
      switch (platform) {
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
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
          window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, "_blank")
          break
        case "copy":
          await navigator.clipboard.writeText(url)
          toast.success("Link copied to clipboard!")
          break
        case "native":
          if (navigator.share) {
            await navigator.share({ title, text, url })
          }
          break
      }
    } catch (error) {
      console.error("Share error:", error)
      toast.error("Failed to share")
    }
  }

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks")
  }

  const getEventStatus = () => {
    const now = new Date()
    const eventDate = new Date(event.event_date)
    const endDate = event.end_date ? new Date(event.end_date) : eventDate

    if (now < eventDate) return "upcoming"
    if (now >= eventDate && now <= endDate) return "ongoing"
    return "completed"
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

  const getEventModeIcon = (mode: string) => {
    switch (mode) {
      case "online":
        return <Monitor className="w-4 h-4" />
      case "offline":
        return <Building className="w-4 h-4" />
      case "hybrid":
        return <Globe className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const getDaysUntilEvent = () => {
    const now = new Date()
    const eventDate = new Date(event.event_date)
    const diffTime = eventDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getRegistrationProgress = () => {
    if (event.max_participants === 0) return 0
    return (event.current_participants / event.max_participants) * 100
  }

  const status = getEventStatus()
  const daysUntil = getDaysUntilEvent()
  const registrationProgress = getRegistrationProgress()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${event.image_url || "/placeholder.svg?height=400&width=800"})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="relative h-full flex flex-col justify-between p-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleBookmark} className="text-white hover:bg-white/20">
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleShare("twitter")}>
                    <Twitter className="w-4 h-4 mr-2" />
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("facebook")}>
                    <Facebook className="w-4 h-4 mr-2" />
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("linkedin")}>
                    <Linkedin className="w-4 h-4 mr-2" />
                    Share on LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Share on WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("copy")}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  {navigator.share && (
                    <DropdownMenuItem onClick={() => handleShare("native")}>
                      <MoreHorizontal className="w-4 h-4 mr-2" />
                      More Options
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${getStatusColor(status)} text-white`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <Badge variant="outline" className="text-white border-white">
                {event.event_type}
              </Badge>
              {event.registration_fee === 0 && <Badge className="bg-green-500 text-white">Free</Badge>}
              {daysUntil > 0 && (
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  {daysUntil} days to go
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight">{event.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(event.event_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{new Date(event.event_date).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                {getEventModeIcon(event.event_mode)}
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white">About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </CardContent>
            </Card>

            {/* Technologies */}
            {event.technologies && event.technologies.length > 0 && (
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Technologies & Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-yellow-400 border-yellow-400">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {event.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Agenda */}
            {event.agenda && (
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white">Agenda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-300 whitespace-pre-wrap">{event.agenda}</div>
                </CardContent>
              </Card>
            )}

            {/* Speaker Info */}
            {event.speaker_info && (
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Speaker Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-300 whitespace-pre-wrap">{event.speaker_info}</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="card-glass sticky top-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Registration</span>
                  {isRegistered && <CheckCircle className="w-5 h-5 text-green-400" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Registration Status */}
                {isRegistered ? (
                  <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">You're registered!</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Price */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {event.registration_fee === 0 ? "Free" : `₹${event.registration_fee}`}
                      </div>
                      {event.registration_fee === 0 && <div className="text-sm text-gray-400">No registration fee</div>}
                    </div>

                    {/* Capacity */}
                    {event.max_participants > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Registered</span>
                          <span className="text-white">
                            {event.current_participants}/{event.max_participants}
                          </span>
                        </div>
                        <Progress value={registrationProgress} className="h-2" />
                        {registrationProgress >= 90 && (
                          <div className="flex items-center gap-2 text-orange-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>Almost full!</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Registration Button */}
                    {event.registration_open ? (
                      event.registration_link ? (
                        <Button
                          onClick={() => window.open(event.registration_link, "_blank")}
                          className="w-full btn-primary"
                        >
                          Register Now
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleRegister}
                          disabled={isRegistering || loading}
                          className="w-full btn-primary"
                        >
                          {isRegistering ? "Registering..." : "Register Now"}
                        </Button>
                      )
                    ) : (
                      <Button disabled className="w-full">
                        Registration Closed
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-white font-medium">Date</div>
                    <div className="text-gray-400 text-sm">
                      {new Date(event.event_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-white font-medium">Time</div>
                    <div className="text-gray-400 text-sm">
                      {new Date(event.event_date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {event.end_date && (
                        <span>
                          {" - "}
                          {new Date(event.end_date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getEventModeIcon(event.event_mode)}
                  <div>
                    <div className="text-white font-medium">Location</div>
                    <div className="text-gray-400 text-sm">{event.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-white font-medium">Organizer</div>
                    <div className="text-gray-400 text-sm">{event.organizer}</div>
                  </div>
                </div>

                {event.max_participants > 0 && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-white font-medium">Capacity</div>
                      <div className="text-gray-400 text-sm">
                        {event.current_participants} / {event.max_participants} registered
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-gray-300 border-gray-600">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
