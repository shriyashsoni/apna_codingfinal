"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Search,
  Globe,
  Building,
  Code,
  UserPlus,
  Eye,
  ExternalLink,
  Filter,
  Clock,
  Target,
  ImageIcon,
} from "lucide-react"
import { getCurrentUser, type User } from "@/lib/supabase"
import { getEnhancedHackathons, type EnhancedHackathon } from "@/lib/hackathon-system"
import SEOHead from "@/components/seo/seo-head"

export default function EnhancedHackathonsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [hackathons, setHackathons] = useState<EnhancedHackathon[]>([])
  const [filteredHackathons, setFilteredHackathons] = useState<EnhancedHackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()

  useEffect(() => {
    checkUser()
    loadHackathons()
  }, [])

  useEffect(() => {
    filterHackathons()
  }, [searchTerm, selectedStatus, activeTab, hackathons])

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

    // Filter by tab (hackathon type)
    if (activeTab === "external") {
      filtered = filtered.filter((h) => h.hackathon_type === "external")
    } else if (activeTab === "apna_coding") {
      filtered = filtered.filter((h) => h.hackathon_type === "apna_coding")
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (hackathon) =>
          hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hackathon.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hackathon.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hackathon.technologies.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((hackathon) => hackathon.status === selectedStatus)
    }

    setFilteredHackathons(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
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

  const handleHackathonClick = (hackathon: EnhancedHackathon) => {
    if (hackathon.hackathon_type === "external" && hackathon.platform_url) {
      window.open(hackathon.platform_url, "_blank")
    } else {
      router.push(`/hackathons/enhanced/${hackathon.id}`)
    }
  }

  const getTabCounts = () => {
    const external = hackathons.filter((h) => h.hackathon_type === "external").length
    const apnaCoding = hackathons.filter((h) => h.hackathon_type === "apna_coding").length
    return { all: hackathons.length, external, apnaCoding }
  }

  const tabCounts = getTabCounts()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white mt-4">Loading Enhanced Hackathons...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEOHead
        title="Enhanced Hackathons | Apna Coding"
        description="Discover and participate in coding hackathons. Join external competitions or compete in Apna Coding hosted events with team formation and project submissions."
        keywords="hackathons, coding competitions, programming contests, team hackathons, external hackathons, Apna Coding events"
        canonicalUrl="/hackathons/enhanced"
      />

      <div className="min-h-screen bg-black text-white pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Enhanced <span className="text-purple-400">Hackathons</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Participate in coding competitions worldwide or join our hosted hackathons with full team management,
                project submissions, and real-time collaboration.
              </p>
              <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span>External Platforms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-400" />
                  <span>Apna Coding Hosted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span>Team Formation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-yellow-400" />
                  <span>Project Submissions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search and Filters */}
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search & Filter Hackathons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by title, location, organizer, or technology..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2"
                  >
                    <option value="all">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <Badge variant="outline" className="border-purple-400 text-purple-400">
                  {filteredHackathons.length} hackathons
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Hackathon Types */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-gray-800 mb-8">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-400 data-[state=active]:text-black">
                All Hackathons ({tabCounts.all})
              </TabsTrigger>
              <TabsTrigger value="external" className="data-[state=active]:bg-blue-400 data-[state=active]:text-black">
                <Globe className="w-4 h-4 mr-2" />
                External ({tabCounts.external})
              </TabsTrigger>
              <TabsTrigger
                value="apna_coding"
                className="data-[state=active]:bg-purple-400 data-[state=active]:text-black"
              >
                <Building className="w-4 h-4 mr-2" />
                Apna Coding ({tabCounts.apnaCoding})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <HackathonGrid hackathons={filteredHackathons} onHackathonClick={handleHackathonClick} />
            </TabsContent>

            <TabsContent value="external">
              <div className="mb-6">
                <Card className="bg-blue-900/20 border-blue-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Globe className="w-6 h-6 text-blue-400" />
                      <div>
                        <h3 className="text-white font-medium">External Hackathons</h3>
                        <p className="text-blue-300 text-sm">
                          Competitions hosted on external platforms like DevPost, HackerEarth, and more.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <HackathonGrid hackathons={filteredHackathons} onHackathonClick={handleHackathonClick} />
            </TabsContent>

            <TabsContent value="apna_coding">
              <div className="mb-6">
                <Card className="bg-purple-900/20 border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Building className="w-6 h-6 text-purple-400" />
                      <div>
                        <h3 className="text-white font-medium">Apna Coding Hosted Hackathons</h3>
                        <p className="text-purple-300 text-sm">
                          Full-featured hackathons with team formation, problem statements, and project submissions.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <HackathonGrid hackathons={filteredHackathons} onHackathonClick={handleHackathonClick} />
            </TabsContent>
          </Tabs>

          {/* Empty State */}
          {filteredHackathons.length === 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="text-center py-16">
                <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Hackathons Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm
                    ? "No hackathons match your search criteria. Try adjusting your filters."
                    : "No hackathons are currently available. Check back soon for new competitions!"}
                </p>
                {searchTerm && (
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedStatus("all")
                      setActiveTab("all")
                    }}
                    className="bg-purple-400 hover:bg-purple-500 text-black"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

// Hackathon Grid Component
function HackathonGrid({
  hackathons,
  onHackathonClick,
}: {
  hackathons: EnhancedHackathon[]
  onHackathonClick: (hackathon: EnhancedHackathon) => void
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hackathons.map((hackathon) => (
        <Card
          key={hackathon.id}
          className="bg-gray-900 border-gray-800 hover:border-purple-400 transition-all duration-300 cursor-pointer group overflow-hidden"
          onClick={() => onHackathonClick(hackathon)}
        >
          {/* Hackathon Image */}
          <div className="relative h-48 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
            {hackathon.image_url ? (
              <img
                src={hackathon.image_url || "/placeholder.svg"}
                alt={hackathon.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-gray-600" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className={getStatusColor(hackathon.status)}>
                {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
              </Badge>
              <Badge variant="outline" className={getTypeColor(hackathon.hackathon_type)}>
                {getTypeIcon(hackathon.hackathon_type)}
                <span className="ml-1">{hackathon.hackathon_type === "external" ? "External" : "Apna Coding"}</span>
              </Badge>
            </div>
            {hackathon.hackathon_type === "external" && (
              <div className="absolute top-4 right-4">
                <ExternalLink className="w-4 h-4 text-white group-hover:text-blue-400 transition-colors" />
              </div>
            )}
          </div>

          <CardHeader>
            <CardTitle className="text-white text-lg mb-2 group-hover:text-purple-400 transition-colors">
              {hackathon.title}
            </CardTitle>
            <CardDescription className="text-gray-400 line-clamp-2">{hackathon.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300 text-sm">
                <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-purple-400" />
                {hackathon.location}
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Trophy className="w-4 h-4 mr-2 text-purple-400" />
                {hackathon.prize_pool}
              </div>

              {hackathon.hackathon_type === "apna_coding" && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center text-gray-400">
                    <Users className="w-3 h-3 mr-1" />
                    {hackathon.total_participants}
                  </div>
                  <div className="flex items-center text-gray-400">
                    <UserPlus className="w-3 h-3 mr-1" />
                    {hackathon.total_teams}
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Code className="w-3 h-3 mr-1" />
                    {hackathon.total_submissions}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1 mt-3">
                {hackathon.technologies.slice(0, 3).map((tech, index) => (
                  <Badge key={index} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                    {tech}
                  </Badge>
                ))}
                {hackathon.technologies.length > 3 && (
                  <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                    +{hackathon.technologies.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                <span className="text-gray-400 text-sm">By {hackathon.organizer}</span>
                <div className="flex items-center gap-2">
                  {hackathon.hackathon_type === "apna_coding" && hackathon.submissions_open && (
                    <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Submissions Open
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    className={
                      hackathon.hackathon_type === "external"
                        ? "bg-blue-400 hover:bg-blue-500 text-black"
                        : "bg-purple-400 hover:bg-purple-500 text-black"
                    }
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {hackathon.hackathon_type === "external" ? "Visit" : "Join"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
