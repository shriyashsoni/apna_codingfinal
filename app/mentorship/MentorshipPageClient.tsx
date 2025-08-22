"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Search, Clock, Users, Star, Calendar, Award, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@supabase/supabase-js"
import StructuredData from "@/components/seo/structured-data"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface MentorshipProgram {
  id: string
  title: string
  slug: string
  description: string
  mentor_name: string
  mentor_bio: string
  mentor_image: string
  mentor_company: string
  mentor_role: string
  program_type: string
  duration: string
  price: number
  max_participants: number
  current_participants: number
  technologies: string[]
  level: string
  status: string
  featured: boolean
  start_date: string
  end_date: string
  meeting_schedule: string
  prerequisites: string[]
  what_you_learn: string[]
  application_link: string
}

export default function MentorshipPageClient() {
  const [programs, setPrograms] = useState<MentorshipProgram[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<MentorshipProgram[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("All")
  const [selectedType, setSelectedType] = useState("All")
  const [loading, setLoading] = useState(true)

  const levels = ["All", "beginner", "intermediate", "advanced"]
  const types = ["All", "one-on-one", "group", "workshop", "bootcamp"]

  useEffect(() => {
    loadMentorshipPrograms()
  }, [])

  useEffect(() => {
    filterPrograms()
  }, [searchTerm, selectedLevel, selectedType, programs])

  const loadMentorshipPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("mentorship_programs")
        .select("*")
        .in("status", ["active", "upcoming"])
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading mentorship programs:", error)
        return
      }

      setPrograms(data || [])
    } catch (error) {
      console.error("Error loading mentorship programs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPrograms = () => {
    let filtered = programs

    if (searchTerm) {
      filtered = filtered.filter(
        (program) =>
          program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          program.mentor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          program.mentor_company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          program.technologies.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedLevel !== "All") {
      filtered = filtered.filter((program) => program.level === selectedLevel)
    }

    if (selectedType !== "All") {
      filtered = filtered.filter((program) => program.program_type === selectedType)
    }

    setFilteredPrograms(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "one-on-one":
        return "bg-blue-500/20 text-blue-400"
      case "group":
        return "bg-green-500/20 text-green-400"
      case "workshop":
        return "bg-purple-500/20 text-purple-400"
      case "bootcamp":
        return "bg-orange-500/20 text-orange-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500/20 text-green-400"
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400"
      case "advanced":
        return "bg-red-500/20 text-red-400"
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

  return (
    <>
      <StructuredData type="Organization" data={{}} />

      <div className="min-h-screen pt-20 bg-black">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Tech <span className="text-yellow-400">Mentorship</span> Programs
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Get personalized guidance from industry experts. Accelerate your career with one-on-one mentorship,
                group programs, and specialized workshops.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span>Industry Experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-yellow-400" />
                  <span>1000+ Mentees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="py-8 px-4 bg-gray-900/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search mentorship programs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="bg-black border border-gray-700 text-white rounded-md px-3 py-2 focus:border-yellow-400"
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level === "All" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-black border border-gray-700 text-white rounded-md px-3 py-2 focus:border-yellow-400"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type === "All"
                        ? "All Types"
                        : type
                            .split("-")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                {filteredPrograms.length} Mentorship Program{filteredPrograms.length !== 1 ? "s" : ""} Available
              </h2>
              <p className="text-gray-300 text-lg">
                Learn from the best in the industry and take your career to the next level
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredPrograms.map((program, index) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card
                    className={`bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all duration-300 group h-full flex flex-col ${program.featured ? "ring-2 ring-yellow-400/50 border-yellow-400" : ""}`}
                  >
                    {/* Program Header */}
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-2">
                          <Badge className={getTypeColor(program.program_type)}>
                            {program.program_type
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </Badge>
                          <Badge className={getLevelColor(program.level)}>
                            {program.level.charAt(0).toUpperCase() + program.level.slice(1)}
                          </Badge>
                          {program.featured && (
                            <Badge className="bg-yellow-400 text-black font-semibold">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardTitle className="text-white text-xl mb-3 group-hover:text-yellow-400 transition-colors">
                        {program.title}
                      </CardTitle>

                      <p className="text-gray-300 text-sm line-clamp-3 mb-4">{program.description}</p>
                    </CardHeader>

                    <CardContent className="flex-grow flex flex-col">
                      {/* Mentor Info */}
                      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-800 rounded-lg">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={program.mentor_image || "/placeholder-user.jpg"}
                            alt={program.mentor_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{program.mentor_name}</h4>
                          <p className="text-gray-400 text-sm">{program.mentor_role}</p>
                          <p className="text-yellow-400 text-sm font-medium">{program.mentor_company}</p>
                        </div>
                      </div>

                      {/* Program Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>Duration</span>
                          </div>
                          <span className="text-white font-medium">{program.duration}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>Participants</span>
                          </div>
                          <span className="text-white font-medium">
                            {program.current_participants}/{program.max_participants}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>Starts</span>
                          </div>
                          <span className="text-white font-medium">{formatDate(program.start_date)}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Price</span>
                          <span className="text-green-400 font-bold text-lg">
                            {program.price === 0 ? "FREE" : `$${program.price}`}
                          </span>
                        </div>
                      </div>

                      {/* Technologies */}
                      <div className="mb-4">
                        <h5 className="text-white font-medium mb-2 text-sm">Technologies</h5>
                        <div className="flex flex-wrap gap-1">
                          {program.technologies.slice(0, 4).map((tech) => (
                            <Badge key={tech} variant="outline" className="border-yellow-400 text-yellow-400 text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {program.technologies.length > 4 && (
                            <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                              +{program.technologies.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* What You'll Learn */}
                      <div className="mb-6">
                        <h5 className="text-white font-medium mb-2 text-sm">What You'll Learn</h5>
                        <ul className="space-y-1">
                          {program.what_you_learn.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-gray-300 text-xs flex items-start gap-2">
                              <span className="text-yellow-400 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                          {program.what_you_learn.length > 3 && (
                            <li className="text-gray-400 text-xs">+{program.what_you_learn.length - 3} more topics</li>
                          )}
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-auto space-y-3">
                        <Link href={`/mentorship/${program.slug}`}>
                          <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                            View Details
                          </Button>
                        </Link>

                        {program.application_link && (
                          <Button
                            onClick={() => window.open(program.application_link, "_blank")}
                            variant="outline"
                            className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredPrograms.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-2">No programs found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search criteria or check back later for new programs
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedLevel("All")
                    setSelectedType("All")
                  }}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  Show All Programs
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gray-900/50">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Award className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to Accelerate Your <span className="text-yellow-400">Tech Career</span>?
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of developers who have transformed their careers through our mentorship programs. Get
                personalized guidance from industry experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3">
                  Browse All Programs
                  <Users className="ml-2 w-5 h-5" />
                </Button>
                <Link href="/contact">
                  <Button className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3">
                    Become a Mentor
                    <ExternalLink className="ml-2 w-5 h-5" />
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
