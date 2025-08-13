"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, MapPin, Clock, DollarSign, ExternalLink, Building, Users, Share2, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { getCurrentUser, getJobs, searchJobs, type Job } from "@/lib/supabase"

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [selectedLevel, setSelectedLevel] = useState("All")
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])

  const jobTypes = ["All", "Full-time", "Part-time", "Contract", "Internship"]
  const experienceLevels = ["All", "Entry Level", "Mid Level", "Senior Level"]

  useEffect(() => {
    checkUser()
    loadJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [searchTerm, selectedType, selectedLevel, jobs])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error checking user:", error)
    }
  }

  const loadJobs = async () => {
    try {
      const { data, error } = await getJobs()
      if (error) {
        console.error("Error loading jobs:", error)
        return
      }
      setJobs(data || [])
    } catch (error) {
      console.error("Error loading jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterJobs = async () => {
    try {
      const { data, error } = await searchJobs(searchTerm, selectedType, selectedLevel)
      if (error) {
        console.error("Error searching jobs:", error)
        return
      }
      setFilteredJobs(data || [])
    } catch (error) {
      console.error("Error filtering jobs:", error)
      setFilteredJobs(jobs)
    }
  }

  const handleBookmark = (jobId: string) => {
    setBookmarkedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
  }

  const handleShare = (job: Job) => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `${job.title} at ${job.company}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(`${job.title} at ${job.company} - ${window.location.href}`)
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
    <div className="min-h-screen pt-20 bg-black">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-6">
            Find Your Dream <span className="text-yellow-400">Job</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Discover amazing career opportunities from top companies. Your next role is just a click away.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="bg-gray-900/50 rounded-2xl p-6 mb-12">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-gray-700 text-white focus:border-yellow-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-black border border-gray-700 text-white rounded-md px-3 py-2 focus:border-yellow-400"
              >
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-black border border-gray-700 text-white rounded-md px-3 py-2 focus:border-yellow-400"
              >
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-300">
            Showing <span className="text-yellow-400 font-semibold">{filteredJobs.length}</span> job
            {filteredJobs.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <h3 className="text-xl font-bold text-white mr-3">{job.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              job.type === "Full-time"
                                ? "bg-green-500/20 text-green-400"
                                : job.type === "Part-time"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : job.type === "Contract"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "bg-orange-500/20 text-orange-400"
                            }`}
                          >
                            {job.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleBookmark(job.id)}
                            className={`p-2 ${bookmarkedJobs.includes(job.id) ? "text-yellow-400" : "text-gray-400"} hover:text-yellow-400`}
                          >
                            <Bookmark className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleShare(job)}
                            className="text-gray-400 hover:text-yellow-400 p-2"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-4">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {job.company}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {job.salary}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(job.posted_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                      <span className="text-yellow-400 text-sm font-medium">{job.experience}</span>
                      {job.apply_link && (
                        <a href={job.apply_link} target="_blank" rel="noopener noreferrer">
                          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                            Apply Now
                            <ExternalLink className="ml-2 w-4 h-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 leading-relaxed">{job.description}</p>

                  <div>
                    <h4 className="text-white font-medium mb-3">Requirements:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements?.map((req, idx) => (
                        <span key={idx} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-3">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.technologies.map((tech, idx) => (
                        <span key={idx} className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-2xl font-bold text-white mb-2">No jobs found</h3>
            <p className="text-gray-400">
              Try adjusting your search criteria or check back later for new opportunities
            </p>
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-20 bg-gray-900/50 rounded-2xl p-12"
        >
          <Users className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Take the <span className="text-yellow-400">Next Step</span>?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our community to get exclusive job opportunities, career guidance, and networking with top
            professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3">
              Join Community
              <Users className="ml-2 w-5 h-5" />
            </Button>
            <Button className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3">
              Post a Job
              <ExternalLink className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
