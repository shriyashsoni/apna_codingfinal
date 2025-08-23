"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star, BookOpen, Award, Share2, ExternalLink, Lock, ArrowLeft, User } from "lucide-react"
import { getCurrentUser, type Course } from "@/lib/supabase"

interface Props {
  course: Course
}

export default function CourseDetailClient({ course }: Props) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

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

  const handleCourseAccess = () => {
    if (!user) {
      alert("Please login to access premium courses!")
      return
    }

    if (course?.redirect_url) {
      window.open(course.redirect_url, "_blank")
    } else {
      alert("Course link not available")
    }
  }

  const handleShare = async () => {
    if (!course) return

    const shareData = {
      title: course.title,
      text: `Check out ${course.title} - ${course.description.substring(0, 100)}...`,
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
          onClick={() => router.push("/courses")}
          variant="outline"
          className="mb-6 border-gray-700 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
            <img
              src={course.image_url || "/images/courses-hero.png"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-red-500 text-white">PREMIUM</Badge>
              <Badge className="bg-green-500 text-white">FREE</Badge>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <Badge variant="outline" className="border-purple-400 text-purple-400 mb-4">
                {course.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-gray-200 text-lg">by {course.instructor}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{course.description}</p>
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Technologies You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.technologies.map((tech, index) => (
                    <Badge key={index} variant="outline" className="border-purple-400 text-purple-400">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Details */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Duration</p>
                      <p className="text-white font-medium">{course.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Level</p>
                      <p className="text-white font-medium">{course.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Students</p>
                      <p className="text-white font-medium">{course.students_count.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Rating</p>
                      <p className="text-white font-medium">{course.rating}/5</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Course Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Access Card */}
            <Card className="bg-gray-900 border-gray-800 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white">Access This Course</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-bold text-green-400">FREE</span>
                    {course.original_price && (
                      <span className="text-gray-500 line-through text-lg">{course.original_price}</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">Premium Apna Coding Course</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <Button
                    onClick={handleCourseAccess}
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
                        Access Course
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Course
                  </Button>
                </div>

                {!user && (
                  <div className="p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                    <p className="text-yellow-400 text-sm text-center">
                      Login to access this premium Apna Coding course for free!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructor Info */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Instructor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">{course.instructor}</p>
                    <p className="text-gray-400 text-sm">Apna Coding Instructor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Course Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Students</span>
                  </div>
                  <span className="text-white font-medium">{course.students_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Rating</span>
                  </div>
                  <span className="text-yellow-400 font-medium">{course.rating}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Duration</span>
                  </div>
                  <span className="text-white font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Level</span>
                  </div>
                  <Badge variant="outline" className="border-purple-400 text-purple-400">
                    {course.level}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
