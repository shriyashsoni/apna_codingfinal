"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Users,
  MapPin,
  User,
  Share2,
  Lock,
  ArrowLeft,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { getCurrentUser, registerForEvent, checkEventRegistration, type Event } from "@/lib/supabase"

interface Props {
  event: Event
}

export default function EventDetailClient({ event }: Props) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && event) {
      checkRegistration()
    }
  }, [user, event])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkRegistration = async () => {
    if (!user || !event) return

    try {
      const registered = await checkEventRegistration(event.id, user.id)
      setIsRegistered(registered)
    } catch (error) {
      console.error("Error checking registration:", error)
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
        // Update the event object to reflect new participant count
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

  const handleShare = async () => {
    if (!event) return

    const shareData = {
      title: event.title,
      text: `Check out ${event.title} - ${event.description.substring(0, 100)}...`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`)
      alert("Link copied to clipboard!")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
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

  const isEventFull = event.current_participants >= event.max_participants
  const isEventPast = new Date(event.event_date) < new Date()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => router.push("/events")}
          variant="outline"
          className="mb-6 border-gray-700 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
            <img
              src={event.image_url || "/images/courses-hero.png"}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className={`${getEventTypeColor(event.event_type)} text-white capitalize`}>
                {event.event_type}
              </Badge>
              <Badge className="bg-green-500 text-white">{event.event_mode}</Badge>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
              <p className="text-gray-200 text-lg">by {event.organizer}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{event.description}</p>
              </CardContent>
            </Card>

            {/* Agenda */}
            {event.agenda && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Agenda</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{event.agenda}</p>
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
                  <p className="text-gray-300 leading-relaxed">{event.speaker_info}</p>
                </CardContent>
              </Card>
            )}

            {/* Technologies */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Technologies Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.technologies.map((tech, index) => (
                    <Badge key={index} variant="outline" className="border-purple-400 text-purple-400">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {event.requirements.map((req, index) => (
                      <li key={index} className="text-gray-300 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="bg-gray-900 border-gray-800 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white">Event Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {event.registration_fee > 0 ? (
                      <span className="text-3xl font-bold text-yellow-400">${event.registration_fee}</span>
                    ) : (
                      <span className="text-3xl font-bold text-green-400">FREE</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">Registration Fee</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-700">
                  {isEventPast ? (
                    <div className="text-center p-3 bg-gray-800 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">This event has ended</p>
                    </div>
                  ) : (
                    <Button
                      onClick={handleRegistration}
                      disabled={!user || isRegistered || isEventFull || registering}
                      className={`w-full ${
                        !user
                          ? "bg-gray-600 hover:bg-gray-600 text-gray-300 cursor-not-allowed"
                          : isRegistered
                            ? "bg-green-600 hover:bg-green-600 text-white cursor-not-allowed"
                            : isEventFull
                              ? "bg-red-600 hover:bg-red-600 text-white cursor-not-allowed"
                              : "bg-purple-400 hover:bg-purple-500 text-black"
                      }`}
                    >
                      {!user ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Login Required
                        </>
                      ) : isRegistered ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Registered ✓
                        </>
                      ) : isEventFull ? (
                        <>
                          <Users className="w-4 h-4 mr-2" />
                          Event Full
                        </>
                      ) : registering ? (
                        "Registering..."
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          Register Now
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Event
                  </Button>
                </div>

                {!user && (
                  <div className="p-3 bg-purple-400/10 border border-purple-400/20 rounded-lg">
                    <p className="text-purple-400 text-sm text-center">Login to register for this event!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Date & Time</span>
                  </div>
                </div>
                <p className="text-white font-medium ml-6">{formatDate(event.event_date)}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Location</span>
                  </div>
                </div>
                <p className="text-white font-medium ml-6">{event.location}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Participants</span>
                  </div>
                  <span className="text-white font-medium">
                    {event.current_participants}/{event.max_participants}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Organizer</span>
                  </div>
                </div>
                <p className="text-white font-medium ml-6">{event.organizer}</p>

                {event.registration_fee > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400">Fee</span>
                      </div>
                      <span className="text-yellow-400 font-medium">${event.registration_fee}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300">
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
