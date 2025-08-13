"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Share2,
  ExternalLink,
  MessageCircle,
  Star,
  Lock,
  ArrowLeft,
  Clock,
  Target,
  Award,
} from "lucide-react"
import { getCurrentUser, getHackathonById, type Hackathon } from "@/lib/supabase"

export default function HackathonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    loadHackathon()
  }, [params.slug])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error checking user:", error)
    }
  }

  const loadHackathon = async () => {
    try {
      // Extract ID from slug (assuming format: hackathon-name-id)
      const slug = params.slug as string
      const hackathonId = slug.split("-").pop()

      if (!hackathonId) {
        router.push("/hackathons")
        return
      }

      const { data, error } = await getHackathonById(hackathonId)
      if (error || !data) {
        console.error("Error loading hackathon:", error)
        router.push("/hackathons")
        return
      }

      setHackathon(data)
    } catch (error) {
      console.error("Error loading hackathon:", error)
      router.push("/hackathons")
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!hackathon) return

    const shareData = {
      title: hackathon.title,
      text: `Check out ${hackathon.title} - ${hackathon.description.substring(0, 100)}...`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`)
      alert("Link copied to clipboard!")
    }
  }

  const handleRegistration = () => {
    if (!user) {
      alert("Please login to register for hackathons!")
      return
    }

    if (hackathon?.registration_link) {
      window.open(hackathon.registration_link, "_blank")
    } else {
      alert("Registration link not available for this hackathon.")
    }
  }

  const handleWhatsAppJoin = () => {
    if (!user) {
      alert("Please login to join WhatsApp groups!")
      return
    }

    if (hackathon?.whatsapp_link) {
      window.open(hackathon.whatsapp_link, "_blank")
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Hackathon Not Found</h1>
          <p className="text-gray-400 mb-6">The hackathon you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/hackathons")} className="bg-purple-400 hover:bg-purple-500 text-black">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hackathons
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => router.push("/hackathons")}
          variant="outline"
          className="mb-6 border-gray-700 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Hackathons
        </Button>

        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
            <img
              src={hackathon.image_url || "/images/hackathon-hero.png"}
              alt={hackathon.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                {hackathon.featured && (
                  <Badge className="bg-yellow-400 text-black font-semibold">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{hackathon.title}</h1>
              <p className="text-gray-200 text-lg">{hackathon.organizer}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">About This Hackathon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{hackathon.description}</p>
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Technologies & Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {hackathon.technologies.map((tech, index) => (
                    <Badge key={index} variant="outline" className="border-purple-400 text-purple-400">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Start Date</p>
                      <p className="text-white font-medium">{formatDate(hackathon.start_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">End Date</p>
                      <p className="text-white font-medium">{formatDate(hackathon.end_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Location</p>
                      <p className="text-white font-medium">{hackathon.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Mode</p>
                      <p className="text-white font-medium capitalize">{hackathon.mode}</p>
                    </div>
                  </div>
                </div>

                {hackathon.registration_deadline && (
                  <div className="flex items-center gap-3 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-yellow-400 font-medium">Registration Deadline</p>
                      <p className="text-white">{formatDate(hackathon.registration_deadline)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Partnerships */}
            {hackathon.partnerships && hackathon.partnerships.length > 0 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Partners & Sponsors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {hackathon.partnerships.map((partner, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                        {partner}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="bg-gray-900 border-gray-800 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white">Join This Hackathon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Prize Pool</span>
                    <span className="text-green-400 font-bold text-lg">{hackathon.prize_pool}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Participants</span>
                    <span className="text-white font-medium">{hackathon.participants_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Difficulty</span>
                    <Badge variant="outline" className="border-purple-400 text-purple-400 capitalize">
                      {hackathon.difficulty}
                    </Badge>
                  </div>
                  {hackathon.max_team_size && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Max Team Size</span>
                      <span className="text-white font-medium">{hackathon.max_team_size} members</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <Button
                    onClick={handleRegistration}
                    disabled={!user}
                    className={`w-full ${
                      !user
                        ? "bg-gray-600 hover:bg-gray-600 text-gray-300 cursor-not-allowed"
                        : "bg-purple-400 hover:bg-purple-500 text-black"
                    }`}
                  >
                    {!user ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Login Required
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Register Now
                      </>
                    )}
                  </Button>

                  {hackathon.whatsapp_link && (
                    <Button
                      onClick={handleWhatsAppJoin}
                      disabled={!user}
                      variant="outline"
                      className={`w-full ${
                        !user
                          ? "border-gray-600 text-gray-400 cursor-not-allowed"
                          : "border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Join WhatsApp
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
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Event Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Registered</span>
                  </div>
                  <span className="text-white font-medium">{hackathon.participants_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Prize Pool</span>
                  </div>
                  <span className="text-green-400 font-medium">{hackathon.prize_pool}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Status</span>
                  </div>
                  <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
