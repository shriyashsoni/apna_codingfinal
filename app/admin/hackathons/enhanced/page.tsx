"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, isAdmin, getUserOrganizerStatus, type User } from "@/lib/supabase"
import {
  getEnhancedHackathons,
  createEnhancedHackathon,
  getHackathonStatistics,
  type EnhancedHackathon,
} from "@/lib/hackathon-system"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Edit,
  Plus,
  Search,
  Shield,
  Globe,
  Building,
  Code,
  UserPlus,
  Eye,
  BarChart3,
} from "lucide-react"

export default function AdminEnhancedHackathons() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminAccess, setAdminAccess] = useState(false)
  const [organizerStatus, setOrganizerStatus] = useState({ is_organizer: false, organizer_types: [] })
  const [hackathons, setHackathons] = useState<EnhancedHackathon[]>([])
  const [filteredHackathons, setFilteredHackathons] = useState<EnhancedHackathon[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [statistics, setStatistics] = useState<any>({})
  const router = useRouter()

  // Form state for creating hackathons
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    hackathon_type: "apna_coding" as "external" | "apna_coding",
    platform_url: "",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    location: "",
    prize_pool: "",
    status: "upcoming" as "upcoming" | "ongoing" | "completed" | "cancelled",
    max_team_members: 5,
    min_team_members: 1,
    allow_individual: true,
    submissions_open: false,
    organizer: "",
    technologies: [] as string[],
  })

  useEffect(() => {
    checkAccess()
  }, [])

  useEffect(() => {
    if (searchTerm || selectedType !== "all") {
      filterHackathons()
    } else {
      setFilteredHackathons(hackathons)
    }
  }, [searchTerm, selectedType, hackathons])

  const checkAccess = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }

      const hasAdminAccess = await isAdmin(currentUser.email)
      const orgStatus = await getUserOrganizerStatus(currentUser.id)

      // Check if user has admin access or hackathon organizer permission
      if (!hasAdminAccess && !orgStatus.organizer_types.includes("hackathon_organizer")) {
        router.push("/")
        return
      }

      setUser(currentUser)
      setAdminAccess(hasAdminAccess)
      setOrganizerStatus(orgStatus)
      await loadHackathons()
    } catch (error) {
      console.error("Error checking access:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const loadHackathons = async () => {
    try {
      const { data, error } = await getEnhancedHackathons()
      if (error) {
        console.error("Error loading hackathons:", error)
        return
      }

      const hackathonsData = data || []
      setHackathons(hackathonsData)

      // Load statistics for each hackathon
      const stats: any = {}
      for (const hackathon of hackathonsData) {
        const hackathonStats = await getHackathonStatistics(hackathon.id)
        stats[hackathon.id] = hackathonStats
      }
      setStatistics(stats)
    } catch (error) {
      console.error("Error loading hackathons:", error)
    }
  }

  const filterHackathons = () => {
    let filtered = hackathons

    if (searchTerm) {
      filtered = filtered.filter(
        (hackathon) =>
          hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hackathon.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hackathon.organizer.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((hackathon) => hackathon.hackathon_type === selectedType)
    }

    setFilteredHackathons(filtered)
  }

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data, error } = await createEnhancedHackathon({
        ...formData,
        featured: false,
        results_published: false,
      })

      if (error) {
        alert("Error creating hackathon: " + error.message)
        return
      }

      alert("Hackathon created successfully!")
      setShowCreateForm(false)
      setFormData({
        title: "",
        description: "",
        hackathon_type: "apna_coding",
        platform_url: "",
        start_date: "",
        end_date: "",
        registration_deadline: "",
        location: "",
        prize_pool: "",
        status: "upcoming",
        max_team_members: 5,
        min_team_members: 1,
        allow_individual: true,
        submissions_open: false,
        organizer: "",
        technologies: [],
      })
      loadHackathons()
    } catch (error) {
      console.error("Error creating hackathon:", error)
      alert("Error creating hackathon")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500"
      case "ongoing":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "external" ? <Globe className="w-4 h-4" /> : <Building className="w-4 h-4" />
  }

  const getTypeColor = (type: string) => {
    return type === "external" ? "border-blue-400 text-blue-400" : "border-purple-400 text-purple-400"
  }

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

  if (!adminAccess && !organizerStatus.organizer_types.includes("hackathon_organizer")) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-8 h-8 text-purple-400" />
                Enhanced Hackathon System
              </h1>
              <p className="text-gray-400 mt-1">Manage external and Apna Coding hosted hackathons</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-purple-400 hover:bg-purple-500 text-black font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Hackathon
              </Button>
              <Button
                onClick={() => router.push("/admin")}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search hackathons by title, location, or organizer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2"
              >
                <option value="all">All Types</option>
                <option value="external">External Hackathons</option>
                <option value="apna_coding">Apna Coding Hosted</option>
              </select>
              <Badge variant="outline" className="border-purple-400 text-purple-400">
                {filteredHackathons.length} hackathons
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Hackathons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => (
            <Card key={hackathon.id} className="bg-gray-900 border-gray-800 hover:border-purple-400 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <Badge className={`${getStatusColor(hackathon.status)} text-white`}>
                        {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={getTypeColor(hackathon.hackathon_type)}>
                        {getTypeIcon(hackathon.hackathon_type)}
                        <span className="ml-1">
                          {hackathon.hackathon_type === "external" ? "External" : "Apna Coding"}
                        </span>
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg mb-2">{hackathon.title}</CardTitle>
                    <CardDescription className="text-gray-400 line-clamp-2">{hackathon.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300 text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                    {new Date(hackathon.start_date).toLocaleDateString()} -{" "}
                    {new Date(hackathon.end_date).toLocaleDateString()}
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
                    <>
                      <div className="flex items-center text-gray-300 text-sm">
                        <Users className="w-4 h-4 mr-2 text-purple-400" />
                        {hackathon.total_participants} participants
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <UserPlus className="w-4 h-4 mr-2 text-purple-400" />
                        {hackathon.total_teams} teams
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <Code className="w-4 h-4 mr-2 text-purple-400" />
                        {hackathon.total_submissions} submissions
                      </div>
                    </>
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

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                      onClick={() => router.push(`/admin/hackathons/enhanced/edit/${hackathon.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black bg-transparent"
                      onClick={() => {
                        if (hackathon.hackathon_type === "external" && hackathon.platform_url) {
                          window.open(hackathon.platform_url, "_blank")
                        } else {
                          window.open(`/hackathons/enhanced/${hackathon.id}`, "_blank")
                        }
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black bg-transparent"
                      onClick={() => router.push(`/admin/hackathons/enhanced/stats/${hackathon.id}`)}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHackathons.length === 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Hackathons Found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm
                  ? "No hackathons match your search criteria."
                  : "Get started by creating your first enhanced hackathon."}
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-purple-400 hover:bg-purple-500 text-black font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Hackathon
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Hackathon Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-gray-900 border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-white">Create New Hackathon</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateHackathon} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" className="text-gray-300">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organizer" className="text-gray-300">
                        Organizer
                      </Label>
                      <Input
                        id="organizer"
                        value={formData.organizer}
                        onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                        required
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-gray-300">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={3}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hackathon_type" className="text-gray-300">
                        Type
                      </Label>
                      <select
                        id="hackathon_type"
                        value={formData.hackathon_type}
                        onChange={(e) =>
                          setFormData({ ...formData, hackathon_type: e.target.value as "external" | "apna_coding" })
                        }
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                      >
                        <option value="apna_coding">Apna Coding Hosted</option>
                        <option value="external">External Platform</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="status" className="text-gray-300">
                        Status
                      </Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {formData.hackathon_type === "external" && (
                    <div>
                      <Label htmlFor="platform_url" className="text-gray-300">
                        Platform URL
                      </Label>
                      <Input
                        id="platform_url"
                        type="url"
                        value={formData.platform_url}
                        onChange={(e) => setFormData({ ...formData, platform_url: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date" className="text-gray-300">
                        Start Date
                      </Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date" className="text-gray-300">
                        End Date
                      </Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        required
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location" className="text-gray-300">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prize_pool" className="text-gray-300">
                        Prize Pool
                      </Label>
                      <Input
                        id="prize_pool"
                        value={formData.prize_pool}
                        onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                        required
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="e.g., $10,000"
                      />
                    </div>
                  </div>

                  {formData.hackathon_type === "apna_coding" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="min_team_members" className="text-gray-300">
                          Min Team Size
                        </Label>
                        <Input
                          id="min_team_members"
                          type="number"
                          min="1"
                          value={formData.min_team_members}
                          onChange={(e) =>
                            setFormData({ ...formData, min_team_members: Number.parseInt(e.target.value) })
                          }
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_team_members" className="text-gray-300">
                          Max Team Size
                        </Label>
                        <Input
                          id="max_team_members"
                          type="number"
                          min="1"
                          value={formData.max_team_members}
                          onChange={(e) =>
                            setFormData({ ...formData, max_team_members: Number.parseInt(e.target.value) })
                          }
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id="allow_individual"
                          checked={formData.allow_individual}
                          onChange={(e) => setFormData({ ...formData, allow_individual: e.target.checked })}
                          className="w-4 h-4 text-purple-400 bg-gray-800 border-gray-700 rounded"
                        />
                        <Label htmlFor="allow_individual" className="text-gray-300">
                          Allow Individual
                        </Label>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="border-gray-700 text-white hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-purple-400 hover:bg-purple-500 text-black">
                      Create Hackathon
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
