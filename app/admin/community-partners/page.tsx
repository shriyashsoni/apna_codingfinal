"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  ArrowLeft,
  Shield,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Upload,
  Search,
} from "lucide-react"
import {
  getCurrentUser,
  isAdmin,
  getCommunityPartners,
  createCommunityPartner,
  updateCommunityPartner,
  deleteCommunityPartner,
} from "@/lib/supabase"

interface CommunityPartner {
  id: string
  name: string
  logo: string
  website?: string
  description: string
  category: string
  member_count?: number
  location?: string
  status: "active" | "inactive"
  featured: boolean
  created_at: string
}

export default function CommunityPartnersAdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adminAccess, setAdminAccess] = useState(false)
  const [partners, setPartners] = useState<CommunityPartner[]>([])
  const [filteredPartners, setFilteredPartners] = useState<CommunityPartner[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPartner, setEditingPartner] = useState<CommunityPartner | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    website: "",
    description: "",
    category: "Tech Communities",
    member_count: "",
    location: "",
    featured: false,
  })
  const router = useRouter()

  const categories = [
    "All",
    "Tech Communities",
    "Student Organizations",
    "Developer Groups",
    "Startup Communities",
    "Educational Institutions",
    "Open Source Projects",
    "Coding Bootcamps",
    "Professional Networks",
  ]

  useEffect(() => {
    checkAdminAccess()
    loadPartners()
  }, [])

  useEffect(() => {
    filterPartners()
  }, [partners, searchQuery, selectedCategory])

  const checkAdminAccess = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.email !== "sonishriyash@gmail.com") {
        router.push("/")
        return
      }

      const hasAdminAccess = await isAdmin(currentUser.email)
      if (!hasAdminAccess) {
        router.push("/")
        return
      }

      setUser(currentUser)
      setAdminAccess(true)
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const loadPartners = async () => {
    try {
      const { data, error } = await getCommunityPartners()
      if (data) {
        setPartners(data)
      }
    } catch (error) {
      console.error("Error loading partners:", error)
    }
  }

  const filterPartners = () => {
    let filtered = partners

    if (searchQuery) {
      filtered = filtered.filter(
        (partner) =>
          partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          partner.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          partner.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((partner) => partner.category === selectedCategory)
    }

    setFilteredPartners(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const partnerData = {
        ...formData,
        member_count: formData.member_count ? Number.parseInt(formData.member_count) : null,
        status: "active" as const,
      }

      if (editingPartner) {
        const { error } = await updateCommunityPartner(editingPartner.id, partnerData)
        if (error) throw error
        alert("Partner updated successfully!")
      } else {
        const { error } = await createCommunityPartner(partnerData)
        if (error) throw error
        alert("Partner added successfully!")
      }

      resetForm()
      loadPartners()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      logo: "",
      website: "",
      description: "",
      category: "Tech Communities",
      member_count: "",
      location: "",
      featured: false,
    })
    setShowAddForm(false)
    setEditingPartner(null)
  }

  const handleEdit = (partner: CommunityPartner) => {
    setFormData({
      name: partner.name,
      logo: partner.logo,
      website: partner.website || "",
      description: partner.description,
      category: partner.category,
      member_count: partner.member_count?.toString() || "",
      location: partner.location || "",
      featured: partner.featured,
    })
    setEditingPartner(partner)
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this partner?")) {
      try {
        const { error } = await deleteCommunityPartner(id)
        if (error) throw error
        alert("Partner deleted successfully!")
        loadPartners()
      } catch (error: any) {
        alert(`Error: ${error.message}`)
      }
    }
  }

  const toggleFeatured = async (partner: CommunityPartner) => {
    try {
      const { error } = await updateCommunityPartner(partner.id, {
        featured: !partner.featured,
      })
      if (error) throw error
      loadPartners()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const toggleStatus = async (partner: CommunityPartner) => {
    try {
      const { error } = await updateCommunityPartner(partner.id, {
        status: partner.status === "active" ? "inactive" : "active",
      })
      if (error) throw error
      loadPartners()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-white mt-4">Loading Community Partners...</p>
        </div>
      </div>
    )
  }

  if (!adminAccess || user?.email !== "sonishriyash@gmail.com") {
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
                <Users className="w-8 h-8 text-yellow-400" />
                Community Partners Management
              </h1>
              <p className="text-gray-400 mt-1">Manage community partnerships and collaborations</p>
            </div>
            <Button
              onClick={() => router.push("/admin")}
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Partners</p>
                  <p className="text-2xl font-bold text-white">{partners.length}</p>
                </div>
                <Users className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Partners</p>
                  <p className="text-2xl font-bold text-green-400">
                    {partners.filter((p) => p.status === "active").length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Featured Partners</p>
                  <p className="text-2xl font-bold text-yellow-400">{partners.filter((p) => p.featured).length}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Categories</p>
                  <p className="text-2xl font-bold text-blue-400">{categories.length - 1}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white pl-10 focus:border-yellow-400"
              />
            </div>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2 focus:border-yellow-400"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white">{editingPartner ? "Edit Partner" : "Add New Partner"}</CardTitle>
              <CardDescription className="text-gray-400">
                {editingPartner ? "Update partner information" : "Add a new community partner"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-white">
                      Partner Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-black border-gray-700 text-white focus:border-yellow-400"
                      placeholder="Community name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-white">
                      Category *
                    </Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-black border border-gray-700 text-white rounded-md px-3 py-2 focus:border-yellow-400"
                      required
                    >
                      {categories.slice(1).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="logo" className="text-white">
                      Logo URL
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="logo"
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        className="bg-black border-gray-700 text-white focus:border-yellow-400"
                        placeholder="https://example.com/logo.png"
                      />
                      <Button type="button" variant="outline" className="border-gray-700 text-white bg-transparent">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-white">
                      Website URL
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="bg-black border-gray-700 text-white focus:border-yellow-400"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-black border-gray-700 text-white focus:border-yellow-400"
                    rows={3}
                    placeholder="Brief description of the community partner"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="member_count" className="text-white">
                      Member Count
                    </Label>
                    <Input
                      id="member_count"
                      type="number"
                      value={formData.member_count}
                      onChange={(e) => setFormData({ ...formData, member_count: e.target.value })}
                      className="bg-black border-gray-700 text-white focus:border-yellow-400"
                      placeholder="5000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-white">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="bg-black border-gray-700 text-white focus:border-yellow-400"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-gray-700 bg-black text-yellow-400 focus:ring-yellow-400"
                  />
                  <Label htmlFor="featured" className="text-white">
                    Featured Partner
                  </Label>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                    {editingPartner ? "Update Partner" : "Add Partner"}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Partners List */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Community Partners ({filteredPartners.length})</CardTitle>
            <CardDescription className="text-gray-400">Manage all community partnerships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner) => (
                <div key={partner.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {partner.logo && (
                        <img
                          src={partner.logo || "/placeholder.svg"}
                          alt={partner.name}
                          className="w-12 h-12 rounded object-contain bg-white p-1"
                        />
                      )}
                      <div>
                        <h3 className="text-white font-medium">{partner.name}</h3>
                        <Badge className="bg-blue-500 text-white text-xs">{partner.category}</Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleFeatured(partner)}
                        className={`p-1 ${partner.featured ? "text-yellow-400" : "text-gray-400"} hover:bg-gray-700`}
                      >
                        {partner.featured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleStatus(partner)}
                        className={`p-1 ${
                          partner.status === "active" ? "text-green-400" : "text-gray-400"
                        } hover:bg-gray-700`}
                      >
                        {partner.status === "active" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{partner.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    {partner.member_count && (
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {partner.member_count.toLocaleString()}
                      </span>
                    )}
                    {partner.location && <span>{partner.location}</span>}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(partner)}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    {partner.website && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(partner.website, "_blank")}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleDelete(partner.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPartners.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No partners found</p>
                <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
