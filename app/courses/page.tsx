"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Head from "next/head"
import { motion } from "framer-motion"
import {
  Search,
  Clock,
  Users,
  Star,
  Play,
  BookOpen,
  Award,
  ChevronRight,
  Share2,
  Bookmark,
  ExternalLink,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, getCourses, searchCourses, type Course } from "@/lib/supabase"

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])

  const categories = [
    "All",
    "Design & Video",
    "Business & Finance",
    "Programming & Tech",
    "Marketing & SEO",
    "Data Science & AI",
    "Web Development",
    "Mobile Development",
    "Certification Prep",
    "Personal Development",
  ]

  useEffect(() => {
    checkUser()
    loadCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [searchTerm, selectedCategory, courses])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error checking user:", error)
    }
  }

  const loadCourses = async () => {
    try {
      const { data, error } = await getCourses()
      if (error) {
        console.error("Error loading courses:", error)
        return
      }
      setCourses(data || [])
    } catch (error) {
      console.error("Error loading courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = async () => {
    try {
      const { data, error } = await searchCourses(searchTerm, selectedCategory)
      if (error) {
        console.error("Error searching courses:", error)
        return
      }
      setFilteredCourses(data || [])
    } catch (error) {
      console.error("Error filtering courses:", error)
      setFilteredCourses(courses)
    }
  }

  const handleBookmark = (courseId: string) => {
    setBookmarkedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    )
  }

  const handleCourseAccess = (course: Course) => {
    if (!user) {
      alert("Please login to access premium courses!")
      return
    }

    if (course.redirect_url) {
      window.open(course.redirect_url, "_blank")
    } else {
      alert("Course link not available")
    }
  }

  const handleShare = (course: Course) => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(`${course.title} - ${window.location.href}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>100+ Free Premium Udemy Courses | Apna Coding</title>
        <meta
          name="description"
          content="Access 100+ premium Udemy courses for free! Learn programming, design, business, AI, and more. Exclusive collection for Apna Coding members."
        />
        <meta
          name="keywords"
          content="free udemy courses, premium courses free, programming courses, design courses, business courses, AI courses, certification prep, web development"
        />
        <link rel="canonical" href="https://apnacoding.tech/courses" />
        <meta property="og:title" content="100+ Free Premium Udemy Courses | Apna Coding" />
        <meta
          property="og:description"
          content="Access 100+ premium Udemy courses for free! Learn programming, design, business, AI, and more."
        />
        <meta property="og:url" content="https://apnacoding.tech/courses" />
        <meta property="og:image" content="https://apnacoding.tech/images/courses-hero.png" />
      </Head>

      <div className="min-h-screen pt-20 bg-black">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-red-500 text-white px-3 py-1">🔥 PREMIUM</Badge>
                  <Badge className="bg-green-500 text-white px-3 py-1">100% FREE</Badge>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                  <span className="text-yellow-400">{courses.length}+</span> Premium Udemy Courses
                </h1>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  Access exclusive collection of premium Udemy courses worth $10,000+ absolutely FREE!
                  {!user && <span className="text-yellow-400 font-semibold"> Login required to access courses.</span>}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {user ? (
                    <>
                      <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3">
                        Start Learning Free
                        <Play className="ml-2 w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => window.open("/hackathons", "_blank")}
                        className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-6 py-3"
                      >
                        Watch Demo
                        <ExternalLink className="ml-2 w-5 h-5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3"
                        onClick={() => alert("Please login to access courses!")}
                      >
                        Login to Access
                        <Lock className="ml-2 w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => window.open("/hackathons", "_blank")}
                        className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-6 py-3"
                      >
                        Watch Demo
                        <ExternalLink className="ml-2 w-5 h-5" />
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative w-full h-80 rounded-2xl overflow-hidden">
                  <Image src="/images/courses-hero.png" alt="Premium Udemy Courses" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">Worth $10,000+</h3>
                    <p className="text-sm opacity-90">Now Available for FREE</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Login Warning for Non-Users */}
        {!user && (
          <section className="py-8 bg-red-900/20 border-y border-red-500/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-4 text-center">
                <Lock className="w-6 h-6 text-red-400" />
                <p className="text-red-300 text-lg">
                  <span className="font-semibold">Login Required:</span> These premium courses are exclusive to our
                  registered members.
                  <Link href="/auth" className="text-yellow-400 hover:underline ml-2">
                    Sign up now for free access!
                  </Link>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Search and Filter Section */}
        <section className="py-8 bg-gray-900/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search premium courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                {filteredCourses.length} Premium Course{filteredCourses.length !== 1 ? "s" : ""} Available
              </h2>
              <p className="text-gray-300 text-lg">
                {selectedCategory !== "All" ? `Showing ${selectedCategory} courses` : "All premium Udemy courses"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card
                    className={`bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all duration-300 group overflow-hidden h-full flex flex-col ${!user ? "opacity-75" : ""}`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={course.image_url || "/images/courses-hero.png"}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="bg-red-500 text-white text-xs">PREMIUM</Badge>
                        <Badge className="bg-green-500 text-white text-xs">FREE</Badge>
                      </div>
                      <div className="absolute top-3 right-3 flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleBookmark(course.id)}
                          className={`bg-black/50 hover:bg-black/70 p-2 h-8 w-8 ${bookmarkedCourses.includes(course.id) ? "text-yellow-400" : "text-white"}`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShare(course)}
                          className="bg-black/50 hover:bg-black/70 text-white p-2 h-8 w-8"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-black/70 text-white text-xs">{course.level}</Badge>
                      </div>
                      {!user && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs">
                          {course.category}
                        </Badge>
                        <div className="flex items-center text-yellow-400">
                          <Star className="w-4 h-4 fill-current mr-1" />
                          <span className="text-sm">{course.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-gray-400 mb-4 text-sm line-clamp-3 flex-grow">{course.description}</p>

                      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{course.students_count.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {course.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm">
                          <span className="text-gray-400">by {course.instructor}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-green-400 font-semibold">FREE</span>
                            <span className="text-gray-500 line-through text-xs">{course.original_price}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        className={`w-full ${user ? "bg-yellow-400 hover:bg-yellow-500 text-black" : "bg-gray-600 text-gray-300 cursor-not-allowed"} text-sm py-2`}
                        onClick={() => handleCourseAccess(course)}
                        disabled={!user}
                      >
                        {user ? (
                          <>
                            Access Course
                            <ExternalLink className="ml-2 w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Login Required
                            <Lock className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-2">No courses found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Award className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to Access <span className="text-yellow-400">Premium Courses</span>?
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of learners who are advancing their careers with our exclusive collection of premium
                Udemy courses. All courses are handpicked and verified for quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3">
                    Browse All Courses
                    <BookOpen className="ml-2 w-5 h-5" />
                  </Button>
                ) : (
                  <Link href="/auth">
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3">
                      Sign Up for Free Access
                      <Play className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                )}
                <Link href="/contact">
                  <Button className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3">
                    Contact Support
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
