"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  Building,
  Share2,
  ArrowLeft,
  Briefcase,
  Calendar,
  Target,
  Lock,
} from "lucide-react"
import { getCurrentUser, type Job } from "@/lib/supabase"
import AuthModal from "@/components/auth/auth-modal"

interface Props {
  job: Job
}

export default function JobDetailClient({ job }: Props) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      // If no user is logged in, show auth modal
      if (!currentUser) {
        setShowAuthModal(true)
      }
    } catch (error) {
      console.error("Error checking user:", error)
      setShowAuthModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (!user) {
      setAuthMode("login")
      setShowAuthModal(true)
      return
    }

    if (job?.apply_link) {
      window.open(job.apply_link, "_blank")
    } else {
      alert("Application link not available for this job.")
    }
  }

  const handleShare = async () => {
    if (!user) {
      setAuthMode("login")
      setShowAuthModal(true)
      return
    }

    if (!job) return

    const shareData = {
      title: `${job.title} at ${job.company}`,
      text: `Check out this job opportunity: ${job.title} at ${job.company}`,
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

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    checkUser() // Refresh user data
  }

  const handleAuthClose = () => {
    setShowAuthModal(false)
    router.push("/jobs") // Redirect to jobs page if user closes auth modal
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Full-time":
        return "bg-green-500/20 text-green-400"
      case "Part-time":
        return "bg-blue-500/20 text-blue-400"
      case "Contract":
        return "bg-purple-500/20 text-purple-400"
      case "Internship":
        return "bg-orange-500/20 text-orange-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <Lock className="w-24 h-24 text-yellow-400 mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-white mb-6">Authentication Required</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Please sign in to view job details and apply for positions. Join our community to access exclusive job
              opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  setAuthMode("login")
                  setShowAuthModal(true)
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3"
              >
                Sign In
              </Button>
              <Button
                onClick={() => {
                  setAuthMode("signup")
                  setShowAuthModal(true)
                }}
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3"
              >
                Create Account
              </Button>
              <Button
                onClick={() => router.push("/jobs")}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 px-8 py-3"
              >
                Back to Jobs
              </Button>
            </div>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={handleAuthClose} onSuccess={handleAuthSuccess} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => router.push("/jobs")}
          variant="outline"
          className="mb-6 border-gray-700 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {job.company_logo && (
                <img
                  src={job.company_logo || "/placeholder.svg"}
                  alt={job.company}
                  className="w-16 h-16 rounded-lg object-contain bg-white p-2"
                />
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{job.title}</h1>
                <p className="text-xl text-gray-300">{job.company}</p>
              </div>
            </div>
            <Badge className={getTypeColor(job.type)}>{job.type}</Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>{job.salary}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Posted {new Date(job.posted_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>{job.experience}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{job.description}</p>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Technologies */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Required Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.technologies.map((tech, index) => (
                    <Badge key={index} variant="outline" className="border-yellow-400 text-yellow-400">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="bg-gray-900 border-gray-800 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white">Apply for This Job</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Salary</span>
                    <span className="text-green-400 font-bold">{job.salary}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Experience</span>
                    <span className="text-white font-medium">{job.experience}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Type</span>
                    <Badge className={getTypeColor(job.type)}>{job.type}</Badge>
                  </div>
                  {job.application_deadline && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Deadline</span>
                      <span className="text-white font-medium">
                        {new Date(job.application_deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-700">
                  {job.apply_link ? (
                    <Button onClick={handleApply} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  ) : (
                    <Button disabled className="w-full bg-gray-600 text-gray-300 cursor-not-allowed">
                      Application Link Not Available
                    </Button>
                  )}

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Job
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">{job.company}</p>
                    <p className="text-gray-400 text-sm">Company</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">{job.location}</p>
                    <p className="text-gray-400 text-sm">Location</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Stats */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">Type</span>
                  </div>
                  <Badge className={getTypeColor(job.type)}>{job.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">Experience</span>
                  </div>
                  <span className="text-white font-medium">{job.experience}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">Posted</span>
                  </div>
                  <span className="text-white font-medium">{new Date(job.posted_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">Salary</span>
                  </div>
                  <span className="text-green-400 font-medium">{job.salary}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={handleAuthClose} onSuccess={handleAuthSuccess} />
    </div>
  )
}
