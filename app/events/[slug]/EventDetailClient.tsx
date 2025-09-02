"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  ExternalLink,
  Share2,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react"
import { type Event, getCurrentUser, registerForEvent, checkEventRegistration } from "@/lib/supabase"
import AuthModal from "@/components/auth/auth-modal"

interface EventDetailClientProps {
  event: Event
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const [user, setUser] = useState<any>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)

    if (currentUser) {
      const registered = await checkEventRegistration(event.id, currentUser.id)
      setIsRegistered(registered)
    }
  }

  const handleRegister = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (event.registration_link) {
      window.open(event.registration_link, "_blank")
      return
    }

    setIsRegistering(true)
    setRegistrationStatus(null)

    try {
      const result = await registerForEvent(event.id, user.id)

      if (result.success) {
        setIsRegistered(true)
        setRegistrationStatus("Successfully registered for the event!")
      } else {
        setRegistrationStatus(result.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setRegistrationStatus("An unexpected error occurred")
    } finally {
      setIsRegistering(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      alert("Event URL copied to clipboard!")
    }
  }

  const eventDate = new Date(event.event_date)
  const endDate = event.end_date ? new Date(event.end_date) : null
  const isUpcoming = eventDate > new Date()
  const isOngoing = eventDate <= new Date() && (!endDate || endDate >= new Date())
  const participationPercentage =
    event.max_participants > 0 ? (event.current_participants / event.max_participants) * 100 : 0

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-gray-400 hover:text-white">
            ← Back to Events
          </Button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Event Image */}
            <div className="lg:w-1/2">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={event.image_url || "/placeholder.svg?height=400&width=600"}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge
                    variant={
                      event.status === "upcoming" ? "default" : event.status === "ongoing" ? "secondary" : "outline"
                    }
                    className="bg-yellow-400 text-black"
                  >
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Button variant="secondary" size="sm" onClick={handleShare} className="bg-black/50 hover:bg-black/70">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="lg:w-1/2">
              <div className="mb-4">
                <Badge variant="outline" className="mb-2">
                  {event.event_type}
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">{event.title}</h1>
                <p className="text-gray-300 text-lg leading-relaxed">{event.description}</p>
              </div>

              {/* Event Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="font-medium">{formatDate(eventDate)}</p>
                    <p className="text-sm text-gray-400">{formatTime(eventDate)}</p>
                  </div>
                </div>

                {endDate && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="font-medium">Ends: {formatDate(endDate)}</p>
                      <p className="text-sm text-gray-400">{formatTime(endDate)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-sm text-gray-400 capitalize">{event.event_mode}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="font-medium">{event.organizer}</p>
                    <p className="text-sm text-gray-400">Organizer</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="font-medium">
                      {event.current_participants} / {event.max_participants} participants
                    </p>
                    <Progress value={participationPercentage} className="w-24 mt-1" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="font-medium">
                      {event.registration_fee === 0 ? "Free" : `₹${event.registration_fee}`}
                    </p>
                    <p className="text-sm text-gray-400">Registration Fee</p>
                  </div>
                </div>
              </div>

              {/* Registration Status */}
              {registrationStatus && (
                <div
                  className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
                    registrationStatus.includes("Success")
                      ? "bg-green-900/20 border border-green-800 text-green-400"
                      : "bg-red-900/20 border border-red-800 text-red-400"
                  }`}
                >
                  {registrationStatus.includes("Success") ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{registrationStatus}</span>
                </div>
              )}

              {/* Registration Button */}
              <div className="mb-6">
                {isRegistered ? (
                  <Button disabled className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Registered
                  </Button>
                ) : event.registration_open && isUpcoming ? (
                  <Button
                    onClick={handleRegister}
                    disabled={isRegistering || event.current_participants >= event.max_participants}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                  >
                    {isRegistering ? (
                      "Registering..."
                    ) : event.current_participants >= event.max_participants ? (
                      "Event Full"
                    ) : event.registration_link ? (
                      <>
                        Register Now <ExternalLink className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      "Register Now"
                    )}
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    {!event.registration_open ? "Registration Closed" : "Event Started"}
                  </Button>
                )}
              </div>

              {/* Technologies */}
              {event.technologies && event.technologies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.technologies.map((tech, index) => (
                      <Badge key={index} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agenda */}
          {event.agenda && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Agenda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-300 whitespace-pre-line">{event.agenda}</div>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {event.requirements && event.requirements.length > 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  {event.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Speaker Info */}
          {event.speaker_info && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Speaker Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-300 whitespace-pre-line">{event.speaker_info}</div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false)
          checkAuth()
        }}
        mode="login"
      />
    </div>
  )
}
