"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Search,
  Clock,
  Users,
  Star,
  DollarSign,
  Calendar,
  Award,
  ChevronRight,
  Target,
  TrendingUp,
  BookOpen,
  MessageCircle,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

interface MentorshipProgram {
  id: string
  title: string
  slug: string
  description: string
  mentor_name: string
  mentor_bio: string
  mentor_image: string
  mentor_company: string
  mentor_position: string
  duration: string
  format: string
  price: number
  max_participants: number
  current_participants: number
  skills_covered: string[]
  prerequisites: string[]
  target_audience: string[]
  features: string[]
  what_you_learn: string[]
  career_outcomes: string[]
  start_date: string
  end_date: string
  application_deadline: string
  status: string
  featured: boolean
  application_link: string
  contact_email: string
}

export default function MentorshipPageClient() {
  const [programs, setPrograms] = useState<MentorshipProgram[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<MentorshipProgram[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("All")
  const [loading, setLoading] = useState(true)

  const formats = ["All", "1-on-1", "group", "hybrid"]

  useEffect(() => {
    loadPrograms()
  }, [])

  useEffect(() => {
    filterPrograms()
  }, [searchTerm, selectedFormat, programs])

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("mentorship_programs")
        .select("*")
        .eq("status", "active")
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
          program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          program.mentor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          program.skills_covered.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedFormat !== "All") {
      filtered = filtered.filter((program) => program.format === selectedFormat)
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

  const getAvailableSpots = (program: MentorshipProgram) => {
    return program.max_participants - program.current_participants
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  const featuredPrograms = programs.filter((program) => program.featured)
  const regularPrograms = filteredPrograms.filter((program) => !program.featured)

  return (
    <div className="min-h-screen pt-20 bg-black">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Tech <span className="text-yellow-400">Mentorship</span> Programs
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Get personalized mentorship from top tech industry leaders. Advance your skills, land your dream job, and
              accelerate your career growth with expert guidance.
            </p>

            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search mentorship programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-700 text-white focus:border-yellow-400"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formats.map((format) => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedFormat === format
                          ? "bg-yellow-400 text-black"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-yellow-400 mb-2">50+</div>
              <p className="text-gray-300">Expert Mentors</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-yellow-400 mb-2">1000+</div>
              <p className="text-gray-300">Students Mentored</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-yellow-400 mb-2">85%</div>
              <p className="text-gray-300">Job Success Rate</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-yellow-400 mb-2">40%</div>
              <p className="text-gray-300">Average Salary Increase</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Programs */}
      {featuredPrograms.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Star className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Featured Programs</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredPrograms.map((program, index) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-gray-900 border-yellow-400 hover:border-yellow-300 transition-all duration-300 group overflow-hidden h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden">
                          <Image
                            src={program.mentor_image || "/placeholder-user.jpg"}
                            alt={program.mentor_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-yellow-400 text-black font-semibold">Featured</Badge>
                            <Badge variant="outline" className="border-yellow-400 text-yellow-400 capitalize">
                              {program.format}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                            {program.title}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            with <span className="text-yellow-400 font-medium">{program.mentor_name}</span>
                          </p>
                          <p className="text-gray-500 text-xs">
                            {program.mentor_position} at {program.mentor_company}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-6 leading-relaxed">{program.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4 text-yellow-400" />
                          <span>{program.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4 text-yellow-400" />
                          <span>{getAvailableSpots(program)} spots left</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <DollarSign className="w-4 h-4 text-yellow-400" />
                          <span className="text-green-400 font-semibold">
                            {program.price === 0 ? "Free" : `$${program.price}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4 text-yellow-400" />
                          <span>{formatDate(program.start_date)}</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-white font-medium mb-3">Skills You'll Master:</h4>
                        <div className="flex flex-wrap gap-2">
                          {program.skills_covered.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {program.skills_covered.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{program.skills_covered.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                          onClick={() => window.open(program.application_link, "_blank")}
                        >
                          Apply Now
                          <ExternalLink className="ml-2 w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
                        >
                          Learn More
                          <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Programs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">All Programs ({filteredPrograms.length})</h2>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {regularPrograms.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all duration-300 group overflow-hidden h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={program.mentor_image || "/placeholder-user.jpg"}
                          alt={program.mentor_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className="border-yellow-400 text-yellow-400 capitalize mb-2">
                          {program.format}
                        </Badge>
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">
                          {program.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          with <span className="text-yellow-400 font-medium">{program.mentor_name}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4 text-sm leading-relaxed line-clamp-3">{program.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3 text-yellow-400" />
                        <span>{program.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Users className="w-3 h-3 text-yellow-400" />
                        <span>{getAvailableSpots(program)} spots</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <DollarSign className="w-3 h-3 text-yellow-400" />
                        <span className="text-green-400 font-semibold">
                          {program.price === 0 ? "Free" : `$${program.price}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-3 h-3 text-yellow-400" />
                        <span>{formatDate(program.start_date)}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {program.skills_covered.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {program.skills_covered.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{program.skills_covered.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                        onClick={() => window.open(program.application_link, "_blank")}
                      >
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                      >
                        Details
                      </Button>
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
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Our Mentorship */}
      <section className="py-16 bg-gray-900/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Why Choose <span className="text-yellow-400">Our Mentorship</span>?
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Our mentorship programs are designed by industry experts to provide you with practical skills and
              real-world experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                title: "Personalized Learning",
                description: "Tailored curriculum based on your goals and current skill level",
              },
              {
                icon: TrendingUp,
                title: "Career Growth",
                description: "85% of our mentees land better jobs within 6 months",
              },
              {
                icon: Users,
                title: "Industry Experts",
                description: "Learn from professionals at top tech companies",
              },
              {
                icon: Award,
                title: "Proven Results",
                description: "Average 40% salary increase for program graduates",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center bg-gray-900/50 rounded-2xl p-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Accelerate <span className="text-yellow-400">Your Career</span>?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who have transformed their careers with our mentorship programs. Get
              personalized guidance from industry experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3">
                Browse Programs
                <BookOpen className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3 bg-transparent"
              >
                Contact Us
                <MessageCircle className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
