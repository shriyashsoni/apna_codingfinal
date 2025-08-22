"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Clock,
  Users,
  Calendar,
  DollarSign,
  Star,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  CheckCircle,
} from "lucide-react"

interface MentorshipProgram {
  id: string
  title: string
  slug: string
  description: string
  mentor_name: string
  mentor_avatar: string
  mentor_bio: string
  mentor_experience: string
  skills: string[]
  duration: string
  price: number
  currency: string
  max_participants: number
  current_participants: number
  start_date: string
  end_date: string
  schedule: string
  level: string
  featured: boolean
}

interface MentorshipPageClientProps {
  programs: MentorshipProgram[]
  featuredPrograms: MentorshipProgram[]
  skills: string[]
}

export default function MentorshipPageClient({ programs, featuredPrograms, skills }: MentorshipPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [filteredPrograms, setFilteredPrograms] = useState(programs)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterPrograms(term, selectedSkill, selectedLevel)
  }

  const handleSkillFilter = (skill: string | null) => {
    setSelectedSkill(skill)
    filterPrograms(searchTerm, skill, selectedLevel)
  }

  const handleLevelFilter = (level: string | null) => {
    setSelectedLevel(level)
    filterPrograms(searchTerm, selectedSkill, level)
  }

  const filterPrograms = (term: string, skill: string | null, level: string | null) => {
    let filtered = programs

    if (term) {
      filtered = filtered.filter(
        (program) =>
          program.title.toLowerCase().includes(term.toLowerCase()) ||
          program.description.toLowerCase().includes(term.toLowerCase()) ||
          program.mentor_name.toLowerCase().includes(term.toLowerCase()) ||
          program.skills.some((s) => s.toLowerCase().includes(term.toLowerCase())),
      )
    }

    if (skill) {
      filtered = filtered.filter((program) => program.skills.includes(skill))
    }

    if (level) {
      filtered = filtered.filter((program) => program.level === level)
    }

    setFilteredPrograms(filtered)
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Award className="h-8 w-8 text-purple-600" />
            <h1 className="text-5xl font-bold text-gray-900">
              Tech <span className="text-purple-600">Mentorship</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get personalized guidance from industry experts. Accelerate your career with 1-on-1 mentorship, hands-on
            projects, and real-world experience from top tech professionals.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search mentorship programs..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-full border-2 border-gray-200 focus:border-purple-500"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-900">500+</h3>
              <p className="text-gray-600">Students Mentored</p>
            </Card>
            <Card className="text-center p-6">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-900">95%</h3>
              <p className="text-gray-600">Success Rate</p>
            </Card>
            <Card className="text-center p-6">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-900">3x</h3>
              <p className="text-gray-600">Average Salary Increase</p>
            </Card>
            <Card className="text-center p-6">
              <BookOpen className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-900">50+</h3>
              <p className="text-gray-600">Expert Mentors</p>
            </Card>
          </div>
        </section>

        {/* Featured Programs */}
        {featuredPrograms.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-900">Featured Programs</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPrograms.map((program) => (
                <Card key={program.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Image
                        src={program.mentor_avatar || "/placeholder-user.jpg"}
                        alt={program.mentor_name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{program.mentor_name}</h4>
                        <Badge className="bg-yellow-500 text-white text-xs">Featured</Badge>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {program.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">{program.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {program.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {program.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{program.skills.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {program.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {program.current_participants}/{program.max_participants} enrolled
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        Starts {formatDate(program.start_date)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(program.price, program.currency)}
                        </span>
                      </div>
                      <Badge className={getLevelColor(program.level)}>{program.level}</Badge>
                    </div>

                    <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">Enroll Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mr-4">Filter by Skills:</h3>
            <Button
              variant={selectedSkill === null ? "default" : "outline"}
              onClick={() => handleSkillFilter(null)}
              className="rounded-full"
            >
              All Skills
            </Button>
            {skills.slice(0, 8).map((skill) => (
              <Button
                key={skill}
                variant={selectedSkill === skill ? "default" : "outline"}
                onClick={() => handleSkillFilter(skill)}
                className="rounded-full"
              >
                {skill}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <h3 className="text-lg font-semibold text-gray-900 mr-4">Filter by Level:</h3>
            <Button
              variant={selectedLevel === null ? "default" : "outline"}
              onClick={() => handleLevelFilter(null)}
              className="rounded-full"
            >
              All Levels
            </Button>
            {["beginner", "intermediate", "advanced"].map((level) => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                onClick={() => handleLevelFilter(level)}
                className="rounded-full capitalize"
              >
                {level}
              </Button>
            ))}
          </div>
        </section>

        {/* All Programs */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {selectedSkill || selectedLevel ? "Filtered Programs" : "All Mentorship Programs"}
          </h2>

          {filteredPrograms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No programs found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Image
                        src={program.mentor_avatar || "/placeholder-user.jpg"}
                        alt={program.mentor_name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{program.mentor_name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-1">{program.mentor_experience}</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {program.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">{program.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {program.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {program.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{program.skills.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {program.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {program.current_participants}/{program.max_participants} enrolled
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        Starts {formatDate(program.start_date)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(program.price, program.currency)}
                        </span>
                      </div>
                      <Badge className={getLevelColor(program.level)}>{program.level}</Badge>
                    </div>

                    <Button className="w-full bg-purple-600 hover:bg-purple-700">Learn More</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Why Choose Our Mentorship */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Mentorship?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our mentorship programs are designed by industry experts to provide you with practical skills and
              real-world experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">1-on-1 Sessions</h3>
              <p className="text-gray-600">
                Get personalized attention with dedicated one-on-one sessions tailored to your learning goals.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real Projects</h3>
              <p className="text-gray-600">
                Work on actual industry projects that you can showcase in your portfolio and to potential employers.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Career Growth</h3>
              <p className="text-gray-600">
                Get guidance on career transitions, interview preparation, and salary negotiations from industry
                veterans.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
