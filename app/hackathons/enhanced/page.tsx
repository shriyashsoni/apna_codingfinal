"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Search,
  ExternalLink,
  Globe,
  Building,
  Code,
  GitBranch,
  UserPlus,
} from "lucide-react"
import { getCurrentUser, type User } from "@/lib/supabase"
import { getEnhancedHackathons, type EnhancedHackathon } from "@/lib/hackathon-system"
import SEOHead from "@/components/seo/seo-head"

export default function EnhancedHackathonsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [hackathons, setHackathons] = useState<EnhancedHackathon[]>([])
  const [filteredHackathons, setFilteredHackathons] = useState<EnhancedHackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  useEffect(() => {
    checkUser()
    loadHackathons()
  }, [])

  useEffect(() => {
    filterHackathons()
  }, [searchQuery, selectedType, selectedStatus, hackathons])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error checking user:", error)
    }
  }

  const loadHackathons = async () => {
    try {
      const { data, error } = await getEnhancedHackathons()
      if (error) {
        console.error("Error loading hackathons:", error)
        return
      }
      setHackathons(data || [])
    } catch (error) {
      console.error("Error loading hackathons:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterHackathons = () => {
    let filtered = hackathons

    if (searchQuery) {
      filtered = filtered.filter(
        (hackathon) =>
          hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hackathon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hackathon.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hackathon.technologies.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((hackathon) => hackathon.hackathon_type === selectedType)
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((hackathon) => hackathon.status === selectedStatus)
    }

    setFilteredHackathons(filtered)
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

  const getTypeIcon = (type: string) => {
    return type === "external" ? <Globe className="w-4 h-4" /> : <Building className="w-4 h-4" />
  }

  const getTypeColor = (type: string) => {
    return type === "external" ? "border-blue-400 text-blue-400" : "border-purple-400 text-purple-400"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleHackathonClick = (hackathon: EnhancedHackathon) => {
    if (hackathon.hackathon_type === "external" && hackathon.platform_url) {
      window.open(hackathon.platform_url, "_blank")
    } else {
      router.push(`/hackathons/enhanced/${hackathon.id}`)
    }
  }

  const externalHackathons = filteredHackathons.filter((h) => h.hackathon_type === "external")
  const apnaCodingHackathons = filteredHackathons.filter((h) => h.hackathon_type === "apna_coding")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <>
      <SEOHead
        title="Enhanced Hackathons System | Apna Coding"
        description="Participate in external hackathons or join Apna Coding hosted hackathons. Create teams, submit projects, and compete with developers worldwide."
        keywords="hackathons, coding competitions, team hackathons, external hackathons, Apna Coding hackathons, programming contests"
        canonicalUrl="/hackathons/enhanced"
      />

      <div className="min-h-screen bg-black text-white pt-20">
        {/* Hero Section */}
        <div className="relative py-20 px-4 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent" />
          <div className="relative max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Enhanced <span className="text-yellow-400">Hackathon System</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join external hackathons or participate in Apna Coding hosted events. Create teams, collaborate, and
              showcase your skills in competitive programming challenges.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>External Hackathons</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <span>Apna Coding Hosted</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-yellow-400" />
                <span>Team Collaboration</span>
              </div>
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-green-400" />
                <span>Project Submissions</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-20">
          {/* Search and Filter Section */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search hackathons by name, location, or technology..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white pl-10 focus:border-yellow-400"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white rounded-md px-4 py-2 focus:border-yellow-400"
              >
                <option value="all">All Types</option>
                <option value="external">External Hackathons</option>
                <option value="apna_coding">Apna Coding Hosted</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white rounded-md px-4 py-2 focus:border-yellow-400"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Hackathons Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-800">
              <TabsTrigger value="all" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                All Hackathons ({filteredHackathons.length})
              </TabsTrigger>
              <TabsTrigger value="external" className="data-[state=active]:bg-blue-400 data-[state=active]:text-black">
                <Globe className="w-4 h-4 mr-2" />
                External ({externalHackathons.length})
              </TabsTrigger>
              <TabsTrigger
                value="apna_coding"
                className="data-[state=active]:bg-purple-400 data-[state=active]:text-black"
              >
                <Building className="w-4 h-4 mr-2" />
                Apna Coding ({apnaCodingHackathons.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-8">
              <HackathonGrid hackathons={filteredHackathons} onHackathonClick={handleHackathonClick} />
            </TabsContent>

            <TabsContent value="external" className="mt-8">
              <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Globe className="w-5 h-5" />
                  <span className="font-semibold">External Hackathons</span>
                </div>
                <p className="text-sm text-gray-300">
                  These hackathons are hosted on external platforms. Click to visit the official registration page.
                </p>
              </div>
              <HackathonGrid hackathons={externalHackathons} onHackathonClick={handleHackathonClick} />
            </TabsContent>

            <TabsContent value="apna_coding" className="mt-8">
              <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/50 rounded-lg">
                <div className="flex items-center gap-2 text-purple-400 mb-2">
                  <Building className="w-5 h-5" />
                  <span className="font-semibold">Apna Coding Hosted Hackathons</span>
                </div>
                <p className="text-sm text-gray-300">
                  Full-featured hackathons hosted on our platform. Create teams, submit projects, and compete directly
                  here.
                </p>
              </div>
              <HackathonGrid hackathons={apnaCodingHackathons} onHackathonClick={handleHackathonClick} />
            </TabsContent>
          </Tabs>

          {filteredHackathons.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No hackathons found</h3>
              <p className="text-gray-400">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function HackathonGrid({
  hackathons,
  onHackathonClick,
}: {
  hackathons: EnhancedHackathon[]
  onHackathonClick: (hackathon: EnhancedHackathon) => void
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
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

  const getTypeIcon = (type: string) => {
    return type === "external" ? <Globe className="w-4 h-4" /> : <Building className="w-4 h-4" />
  }

  const getTypeColor = (type: string) => {
    return type === "external" ? "border-blue-400 text-blue-400" : "border-purple-400 text-purple-400"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {hackathons.map((hackathon) => (
        <Card
          key={hackathon.id}
          className="bg-black border-gray-800 hover:border-yellow-400 transition-all duration-300 group cursor-pointer"
          onClick={() => onHackathonClick(hackathon)}
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-2">
                <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                <Badge variant="outline" className={getTypeColor(hackathon.hackathon_type)}>
                  {getTypeIcon(hackathon.hackathon_type)}
                  <span className="ml-1">{hackathon.hackathon_type === "external" ? "External" : "Apna Coding"}</span>
                </Badge>
              </div>
              {hackathon.hackathon_type === "external" && (
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
              )}
            </div>

            <CardTitle className="text-white text-lg mb-2 group-hover:text-yellow-400 transition-colors">
              {hackathon.title}
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm leading-relaxed line-clamp-3">
              {hackathon.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Calendar className="w-4 h-4 text-yellow-400" />
                <span>
                  {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <span>{hackathon.location}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-green-400 font-semibold">{hackathon.prize_pool}</span>
              </div>

              {hackathon.hackathon_type === "apna_coding" && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-yellow-400" />
                    <span>{hackathon.total_participants} participants</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <UserPlus className="w-4 h-4 text-yellow-400" />
                    <span>{hackathon.total_teams} teams</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Code className="w-4 h-4 text-yellow-400" />
                    <span>{hackathon.total_submissions} submissions</span>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Technologies</h4>
                <div className="flex flex-wrap gap-1">
                  {hackathon.technologies.slice(0, 4).map((tech, index) => (
                    <Badge key={index} variant="outline" className="border-yellow-400 text-yellow-400 text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {hackathon.technologies.length > 4 && (
                    <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                      +{hackathon.technologies.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-1">Organizer</h4>
                <p className="text-sm text-gray-400">{hackathon.organizer}</p>
              </div>

              {hackathon.hackathon_type === "apna_coding" && (
                <div className="pt-2 border-t border-gray-800">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      Team Size: {hackathon.min_team_members}-{hackathon.max_team_members}
                    </span>
                    {hackathon.allow_individual && <span>Individual allowed</span>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span>Submissions: {hackathon.submissions_open ? "Open" : "Closed"}</span>
                    <span>Results: {hackathon.results_published ? "Published" : "Pending"}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
