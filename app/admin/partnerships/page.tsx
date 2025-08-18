"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Calendar,
  Building,
  GraduationCap,
  Briefcase,
  Heart,
  Users,
  Search,
  Filter,
  Upload,
  ExternalLink,
  Save,
  X,
  ImageIcon,
} from "lucide-react"
import { getCurrentUser, isAdmin } from "@/lib/supabase"
import { toast } from "sonner"

interface Partnership {
  id: string
  title: string
  description: string
  image_url?: string
  partner_logo?: string
  partner_name: string
  partner_website?: string
  partnership_type: "general" | "educational" | "corporate" | "startup" | "nonprofit"
  status: "active" | "inactive" | "draft"
  featured: boolean
  benefits: string[]
  contact_email?: string
  contact_person?: string
  start_date?: string
  end_date?: string
  partnership_date?: string
  partnership_photo?: string
  social_links: { [key: string]: string }
  tags: string[]
  priority: number
  created_by?: string
  created_at: string
  updated_at: string
}

const partnershipTypes = [
  { value: "general", label: "General", icon: Building },
  { value: "educational", label: "Educational", icon: GraduationCap },
  { value: "corporate", label: "Corporate", icon: Building },
  { value: "startup", label: "Startup", icon: Briefcase },
  { value: "nonprofit", label: "Non-Profit", icon: Heart },
]

const statusOptions = [
  { value: "active", label: "Active", color: "bg-green-500" },
  { value: "inactive", label: "Inactive", color: "bg-red-500" },
  { value: "draft", label: "Draft", color: "bg-yellow-500" },
]

export default function AdminPartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [filteredPartnerships, setFilteredPartnerships] = useState<Partnership[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPartnership, setEditingPartnership] = useState<Partnership | null>(null)
  const [formData, setFormData] = useState<Partial<Partnership>>({
    title: "",
    description: "",
    partner_name: "",
    partner_website: "",
    partnership_type: "general",
    status: "active",
    featured: false,
    benefits: [],
    contact_email: "",
    contact_person: "",
    partnership_date: new Date().toISOString().split("T")[0],
    tags: [],
    priority: 0,
    social_links: {},
  })
  const [newBenefit, setNewBenefit] = useState("")
  const [newTag, setNewTag] = useState("")
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (isAuthorized) {
      loadPartnerships()
    }
  }, [isAuthorized])

  useEffect(() => {
    filterPartnerships()
  }, [partnerships, searchQuery, selectedType, selectedStatus])

  const checkAdminAccess = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        toast.error("Please log in to access this page")
        return
      }

      const adminStatus = await isAdmin(user.email)
      if (!adminStatus) {
        toast.error("You don't have permission to access this page")
        return
      }

      setIsAuthorized(true)
    } catch (error) {
      console.error("Error checking admin access:", error)
      toast.error("Error checking permissions")
    }
  }

  const loadPartnerships = () => {
    // Load from localStorage for demo (in production, this would be from Supabase)
    const savedPartnerships = localStorage.getItem("communityPartnerships")
    if (savedPartnerships) {
      setPartnerships(JSON.parse(savedPartnerships))
    } else {
      // Default partnerships with brand photos
      const defaultPartnerships: Partnership[] = [
        {
          id: "1",
          title: "AWS Cloud Credits Program",
          description:
            "Get up to $10,000 in AWS credits for your startup or project. Perfect for students and developers looking to build scalable applications in the cloud.",
          partner_name: "Amazon Web Services",
          partner_logo: "/images/partners/aws-new.webp",
          partner_website: "https://aws.amazon.com/activate",
          partnership_type: "corporate",
          status: "active",
          featured: true,
          benefits: [
            "Up to $10,000 AWS Credits",
            "24/7 Technical Support",
            "Training Resources",
            "Startup Mentorship",
            "Architecture Reviews",
          ],
          contact_email: "partnerships@aws.com",
          contact_person: "AWS Startup Team",
          partnership_date: "2024-01-15",
          partnership_photo: "/images/partners/aws-new.webp",
          social_links: {
            twitter: "https://twitter.com/awscloud",
            linkedin: "https://linkedin.com/company/amazon-web-services",
          },
          tags: ["cloud", "startup", "credits", "aws", "infrastructure"],
          priority: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "GitHub Student Developer Pack",
          description:
            "Access to premium developer tools and services worth over $200k. Includes free GitHub Pro, domain names, cloud hosting, and much more.",
          partner_name: "GitHub",
          partner_logo: "/images/partners/github.png",
          partner_website: "https://education.github.com/pack",
          partnership_type: "educational",
          status: "active",
          featured: true,
          benefits: [
            "Free GitHub Pro",
            "Premium Developer Tools",
            "Cloud Hosting Credits",
            "Free Domain Names",
            "Design Software",
          ],
          contact_email: "education@github.com",
          contact_person: "GitHub Education Team",
          partnership_date: "2024-01-10",
          partnership_photo: "/images/partners/github.png",
          social_links: {
            twitter: "https://twitter.com/github",
            linkedin: "https://linkedin.com/company/github",
          },
          tags: ["education", "student", "developer", "tools", "github"],
          priority: 9,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
      setPartnerships(defaultPartnerships)
      localStorage.setItem("communityPartnerships", JSON.stringify(defaultPartnerships))
    }
    setLoading(false)
  }

  const filterPartnerships = () => {
    let filtered = partnerships

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (partnership) =>
          partnership.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          partnership.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          partnership.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          partnership.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((partnership) => partnership.partnership_type === selectedType)
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((partnership) => partnership.status === selectedStatus)
    }

    // Sort by priority and featured status
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return b.priority - a.priority
    })

    setFilteredPartnerships(filtered)
  }

  const handleFileUpload = (file: File, type: "logo" | "photo") => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (type === "logo") {
        setLogoPreview(result)
        setFormData({ ...formData, partner_logo: result })
      } else {
        setPhotoPreview(result)
        setFormData({ ...formData, partnership_photo: result })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSavePartnership = () => {
    try {
      if (!formData.title || !formData.partner_name) {
        toast.error("Please fill in required fields")
        return
      }

      const now = new Date().toISOString()
      let updatedPartnerships

      if (editingPartnership) {
        // Update existing partnership
        updatedPartnerships = partnerships.map((p) =>
          p.id === editingPartnership.id
            ? {
                ...p,
                ...formData,
                updated_at: now,
              }
            : p,
        )
        toast.success("Partnership updated successfully!")
      } else {
        // Add new partnership
        const newPartnership: Partnership = {
          id: Date.now().toString(),
          ...formData,
          created_at: now,
          updated_at: now,
        } as Partnership

        updatedPartnerships = [newPartnership, ...partnerships]
        toast.success("Partnership created successfully!")
      }

      setPartnerships(updatedPartnerships)
      localStorage.setItem("communityPartnerships", JSON.stringify(updatedPartnerships))
      resetForm()
    } catch (error) {
      console.error("Error saving partnership:", error)
      toast.error("Error saving partnership")
    }
  }

  const handleDeletePartnership = (id: string) => {
    try {
      const updatedPartnerships = partnerships.filter((p) => p.id !== id)
      setPartnerships(updatedPartnerships)
      localStorage.setItem("communityPartnerships", JSON.stringify(updatedPartnerships))
      toast.success("Partnership deleted successfully!")
    } catch (error) {
      console.error("Error deleting partnership:", error)
      toast.error("Error deleting partnership")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      partner_name: "",
      partner_website: "",
      partnership_type: "general",
      status: "active",
      featured: false,
      benefits: [],
      contact_email: "",
      contact_person: "",
      partnership_date: new Date().toISOString().split("T")[0],
      tags: [],
      priority: 0,
      social_links: {},
    })
    setEditingPartnership(null)
    setShowAddDialog(false)
    setNewBenefit("")
    setNewTag("")
    setLogoPreview(null)
    setPhotoPreview(null)
  }

  const handleEditPartnership = (partnership: Partnership) => {
    setFormData(partnership)
    setEditingPartnership(partnership)
    setLogoPreview(partnership.partner_logo || null)
    setPhotoPreview(partnership.partnership_photo || null)
    setShowAddDialog(true)
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({
        ...formData,
        benefits: [...(formData.benefits || []), newBenefit.trim()],
      })
      setNewBenefit("")
    }
  }

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits?.filter((_, i) => i !== index) || [],
    })
  }

  const addTag = () => {
    if (newTag.trim()) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()],
      })
      setNewTag("")
    }
  }

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((_, i) => i !== index) || [],
    })
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = partnershipTypes.find((t) => t.value === type)
    return typeConfig?.icon || Building
  }

  const getStatusColor = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status)
    return statusConfig?.color || "bg-gray-500"
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-6 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Community Partnerships</h1>
            <p className="text-gray-400">Manage community partnerships and collaborations</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Add Partnership
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingPartnership ? "Edit Partnership" : "Add New Partnership"}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Partnership title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="partner_name">Partner Name *</Label>
                    <Input
                      id="partner_name"
                      value={formData.partner_name || ""}
                      onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Partner organization name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Partnership description"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="partnership_type">Type</Label>
                      <Select
                        value={formData.partnership_type || "general"}
                        onValueChange={(value) =>
                          setFormData({ ...formData, partnership_type: value as Partnership["partnership_type"] })
                        }
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {partnershipTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="text-white">
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status || "active"}
                        onValueChange={(value) => setFormData({ ...formData, status: value as Partnership["status"] })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value} className="text-white">
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="partnership_date">Partnership Date</Label>
                      <Input
                        id="partnership_date"
                        type="date"
                        value={formData.partnership_date || ""}
                        onChange={(e) => setFormData({ ...formData, partnership_date: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority (0-10)</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="0"
                        max="10"
                        value={formData.priority || 0}
                        onChange={(e) => setFormData({ ...formData, priority: Number.parseInt(e.target.value) || 0 })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="featured">Featured Partnership</Label>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="partner_website">Website</Label>
                    <Input
                      id="partner_website"
                      type="url"
                      value={formData.partner_website || ""}
                      onChange={(e) => setFormData({ ...formData, partner_website: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="https://partner-website.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email || ""}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="contact@partner.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact_person">Contact Person</Label>
                      <Input
                        id="contact_person"
                        value={formData.contact_person || ""}
                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Partner Logo Upload */}
                  <div>
                    <Label>Partner Logo</Label>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                      {logoPreview ? (
                        <div className="relative">
                          <img
                            src={logoPreview || "/placeholder.svg"}
                            alt="Logo preview"
                            className="max-w-32 max-h-32 mx-auto object-contain"
                          />
                          <Button
                            onClick={() => {
                              setLogoPreview(null)
                              setFormData({ ...formData, partner_logo: undefined })
                            }}
                            size="sm"
                            variant="outline"
                            className="mt-2"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-400">Upload partner logo</p>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="logo-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload(file, "logo")
                            }}
                          />
                          <Button
                            onClick={() => document.getElementById("logo-upload")?.click()}
                            size="sm"
                            variant="outline"
                            className="mt-2"
                          >
                            Choose File
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Partnership Photo Upload */}
                  <div>
                    <Label>Partnership Photo</Label>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                      {photoPreview ? (
                        <div className="relative">
                          <img
                            src={photoPreview || "/placeholder.svg"}
                            alt="Photo preview"
                            className="max-w-full max-h-32 mx-auto object-contain"
                          />
                          <Button
                            onClick={() => {
                              setPhotoPreview(null)
                              setFormData({ ...formData, partnership_photo: undefined })
                            }}
                            size="sm"
                            variant="outline"
                            className="mt-2"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-400">Upload partnership photo</p>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="photo-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload(file, "photo")
                            }}
                          />
                          <Button
                            onClick={() => document.getElementById("photo-upload")?.click()}
                            size="sm"
                            variant="outline"
                            className="mt-2"
                          >
                            Choose File
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <Label>Benefits</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Add a benefit"
                        onKeyPress={(e) => e.key === "Enter" && addBenefit()}
                      />
                      <Button onClick={addBenefit} size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-black">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.benefits?.map((benefit, index) => (
                        <Badge key={index} variant="outline" className="border-yellow-400 text-yellow-400">
                          {benefit}
                          <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeBenefit(index)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                      />
                      <Button onClick={addTag} size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-black">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags?.map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-gray-600 text-gray-400">
                          #{tag}
                          <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeTag(index)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button onClick={resetForm} variant="outline" className="border-gray-600 text-gray-400 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleSavePartnership} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                  <Save className="w-4 h-4 mr-2" />
                  {editingPartnership ? "Update" : "Create"} Partnership
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search partnerships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-white">
                    All Types
                  </SelectItem>
                  {partnershipTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-white">
                    All Status
                  </SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value} className="text-white">
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-400">
              {filteredPartnerships.length} partnership{filteredPartnerships.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>

        {/* Partnerships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartnerships.map((partnership) => {
            const TypeIcon = getTypeIcon(partnership.partnership_type)
            return (
              <Card
                key={partnership.id}
                className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all duration-300 group overflow-hidden"
              >
                {/* Partnership Photo */}
                {partnership.partnership_photo && (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={partnership.partnership_photo || "/placeholder.svg"}
                      alt={partnership.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {partnership.featured && (
                      <div className="absolute top-4 right-4">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </div>
                    )}
                    {partnership.partner_logo && (
                      <div className="absolute bottom-4 left-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <img
                            src={partnership.partner_logo || "/placeholder.svg"}
                            alt={`${partnership.partner_name} logo`}
                            className="max-w-8 max-h-8 object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-yellow-400 transition-colors">
                        <TypeIcon className="w-5 h-5 text-yellow-400 group-hover:text-black transition-colors" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg group-hover:text-yellow-400 transition-colors">
                          {partnership.title}
                        </CardTitle>
                        <p className="text-gray-400 text-sm">{partnership.partner_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(partnership.status)}`}></div>
                          <span className="text-xs text-gray-500 capitalize">{partnership.status}</span>
                          {partnership.featured && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{partnership.description}</p>

                  {partnership.benefits && partnership.benefits.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-2">Benefits:</p>
                      <div className="space-y-1">
                        {partnership.benefits.slice(0, 3).map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                            <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                            {benefit}
                          </div>
                        ))}
                        {partnership.benefits.length > 3 && (
                          <p className="text-xs text-gray-400 mt-1">+{partnership.benefits.length - 3} more benefits</p>
                        )}
                      </div>
                    </div>
                  )}

                  {partnership.tags && partnership.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {partnership.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {partnership.tags.length > 4 && (
                        <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                          +{partnership.tags.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {partnership.partnership_date
                        ? new Date(partnership.partnership_date).toLocaleDateString()
                        : new Date(partnership.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPartnership(partnership)}
                        className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {partnership.partner_website && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(partnership.partner_website, "_blank")}
                          className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePartnership(partnership.id)}
                        className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* No Results */}
        {filteredPartnerships.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No partnerships found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedType !== "all" || selectedStatus !== "all"
                ? "Try adjusting your search or filters to find more partnerships."
                : "Create your first partnership to get started."}
            </p>
            {(searchQuery || selectedType !== "all" || selectedStatus !== "all") && (
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedType("all")
                  setSelectedStatus("all")
                }}
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
