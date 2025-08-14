"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  ExternalLink,
  Users,
  Building,
  Code,
  GraduationCap,
  Rocket,
  Heart,
  Globe,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  getCommunityPartners,
  createCommunityPartner,
  updateCommunityPartner,
  deleteCommunityPartner,
  type CommunityPartner,
} from "@/lib/supabase"

const categories = [
  { id: "all", name: "All Categories", icon: Globe },
  { id: "tech-communities", name: "Tech Communities", icon: Code },
  { id: "student-organizations", name: "Student Organizations", icon: GraduationCap },
  { id: "developer-groups", name: "Developer Groups", icon: Users },
  { id: "startup-communities", name: "Startup Communities", icon: Rocket },
  { id: "educational-institutions", name: "Educational Institutions", icon: Building },
  { id: "open-source-projects", name: "Open Source Projects", icon: Heart },
]

const categoryOptions = categories.filter((c) => c.id !== "all")

export default function AdminCommunityPartners() {
  const [partners, setPartners] = useState<CommunityPartner[]>([])
  const [filteredPartners, setFilteredPartners] = useState<CommunityPartner[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPartner, setEditingPartner] = useState<CommunityPartner | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
    website_url: "",
    category: "tech-communities",
    is_featured: false,
    status: "active" as "active" | "inactive",
  })

  useEffect(() => {
    loadPartners()
  }, [])

  useEffect(() => {
    filterPartners()
  }, [partners, selectedCategory, searchQuery])

  const loadPartners = async () => {
    try {
      const { data } = await getCommunityPartners()
      setPartners(data || [])
    } catch (error) {
      console.error("Error loading partners:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPartners = () => {
    let filtered = [...partners]

    if (selectedCategory !== "all") {
      filtered = filtered.filter((partner) => partner.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (partner) =>
          partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          partner.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredPartners(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPartner) {
        await updateCommunityPartner(editingPartner.id, formData)
      } else {
        await createCommunityPartner(formData)
      }
      await loadPartners()
      resetForm()
    } catch (error) {
      console.error("Error saving partner:", error)
    }
  }

  const handleEdit = (partner: CommunityPartner) => {
    setEditingPartner(partner)
    setFormData({
      name: partner.name,
      description: partner.description,
      logo_url: partner.logo_url || "",
      website_url: partner.website_url || "",
      category: partner.category,
      is_featured: partner.is_featured,
      status: partner.status,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this partner?")) {
      try {
        await deleteCommunityPartner(id)
        await loadPartners()
      } catch (error) {
        console.error("Error deleting partner:", error)
      }
    }
  }

  const toggleFeatured = async (partner: CommunityPartner) => {
    try {
      await updateCommunityPartner(partner.id, { is_featured: !partner.is_featured })
      await loadPartners()
    } catch (error) {
      console.error("Error updating featured status:", error)
    }
  }

  const toggleStatus = async (partner: CommunityPartner) => {
    try {
      const newStatus = partner.status === "active" ? "inactive" : "active"
      await updateCommunityPartner(partner.id, { status: newStatus })
      await loadPartners()
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      logo_url: "",
      website_url: "",
      category: "tech-communities",
      is_featured: false,
      status: "active",
    })
    setEditingPartner(null)
    setShowForm(false)
  }

  const stats = {
    total: partners.length,
    active: partners.filter((p) => p.status === "active").length,
    featured: partners.filter((p) => p.is_featured).length,
    inactive: partners.filter((p) => p.status === "inactive").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading community partners...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Community Partners Management</h1>
            <p className="text-gray-400">Manage your community partnerships and collaborations</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold mt-4 lg:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-gray-400 text-sm">Total Partners</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              <div className="text-gray-400 text-sm">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">{stats.featured}</div>
              <div className="text-gray-400 text-sm">Featured</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-400">{stats.inactive}</div>
              <div className="text-gray-400 text-sm">Inactive</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${
                    selectedCategory === category.id
                      ? "bg-yellow-400 text-black hover:bg-yellow-500"
                      : "border-gray-600 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredPartners.map((partner) => (
            <Card key={partner.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white rounded-lg p-2 flex items-center justify-center">
                    <Image
                      src={partner.logo_url || "/placeholder.svg"}
                      alt={partner.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleFeatured(partner)}
                      className={`p-1 rounded ${
                        partner.is_featured ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"
                      }`}
                    >
                      {partner.is_featured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => toggleStatus(partner)}
                      className={`p-1 rounded ${
                        partner.status === "active" ? "text-green-400" : "text-gray-400 hover:text-green-400"
                      }`}
                    >
                      {partner.status === "active" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-2 truncate">{partner.name}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{partner.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      partner.status === "active" ? "border-green-400 text-green-400" : "border-red-400 text-red-400"
                    }`}
                  >
                    {partner.status}
                  </Badge>
                  {partner.is_featured && <Badge className="bg-yellow-400 text-black text-xs">Featured</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(partner)}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  {partner.website_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(partner.website_url, "_blank")}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(partner.id)}
                    className="border-red-600 text-red-400 hover:bg-red-900"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-gray-900 border-gray-800 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-white">{editingPartner ? "Edit Partner" : "Add New Partner"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-white">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo_url" className="text-white">
                      Logo URL
                    </Label>
                    <Input
                      id="logo_url"
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website_url" className="text-white">
                      Website URL
                    </Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-white">
                      Category
                    </Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md"
                      required
                    >
                      {categoryOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-white">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="rounded"
                      />
                      <span>Featured Partner</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <input
                        type="checkbox"
                        checked={formData.status === "active"}
                        onChange={(e) => setFormData({ ...formData, status: e.target.checked ? "active" : "inactive" })}
                        className="rounded"
                      />
                      <span>Active</span>
                    </label>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black">
                      {editingPartner ? "Update" : "Create"} Partner
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                    >
                      Cancel
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
