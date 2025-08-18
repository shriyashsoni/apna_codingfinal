"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Handshake,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Star,
  Calendar,
  Building,
  GraduationCap,
  Briefcase,
  Heart,
  ExternalLink,
  Tag,
} from "lucide-react"

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
  social_links: { [key: string]: string }
  tags: string[]
  priority: number
  created_at: string
  updated_at: string
}

const partnershipTypes = [
  { value: "general", label: "General", icon: Handshake },
  { value: "educational", label: "Educational", icon: GraduationCap },
  { value: "corporate", label: "Corporate", icon: Building },
  { value: "startup", label: "Startup", icon: Briefcase },
  { value: "nonprofit", label: "Non-Profit", icon: Heart },
]

export default function AdminPartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [loading, setLoading] = useState(false)
  const [editingPartnership, setEditingPartnership] = useState<Partnership | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPartnership, setNewPartnership] = useState<Partial<Partnership>>({
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
    social_links: {},
    tags: [],
    priority: 0,
  })
  const [newBenefit, setNewBenefit] = useState("")
  const [newTag, setNewTag] = useState("")
  const [newSocialPlatform, setNewSocialPlatform] = useState("")
  const [newSocialUrl, setNewSocialUrl] = useState("")

  useEffect(() => {
    loadPartnerships()
  }, [])

  const loadPartnerships = () => {
    // Load from localStorage for demo
    const savedPartnerships = localStorage.getItem("communityPartnerships")
    if (savedPartnerships) {
      setPartnerships(JSON.parse(savedPartnerships))
    } else {
      // Default partnerships
      const defaultPartnerships: Partnership[] = [
        {
          id: "1",
          title: "AWS Cloud Credits Program",
          description:
            "Get up to $10,000 in AWS credits for your startup or project. Perfect for students and developers looking to build scalable applications.",
          partner_name: "Amazon Web Services",
          partner_website: "https://aws.amazon.com",
          partnership_type: "corporate",
          status: "active",
          featured: true,
          benefits: ["Free AWS Credits", "Technical Support", "Training Resources", "Startup Mentorship"],
          contact_email: "partnerships@aws.com",
          contact_person: "AWS Startup Team",
          social_links: {
            twitter: "https://twitter.com/awscloud",
            linkedin: "https://linkedin.com/company/amazon-web-services",
          },
          tags: ["cloud", "startup", "credits", "aws"],
          priority: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "GitHub Student Developer Pack",
          description:
            "Access to premium developer tools and services worth over $200k. Includes free GitHub Pro, domain names, and cloud hosting.",
          partner_name: "GitHub",
          partner_website: "https://education.github.com/pack",
          partnership_type: "educational",
          status: "active",
          featured: true,
          benefits: ["Free GitHub Pro", "Developer Tools", "Cloud Hosting", "Domain Names"],
          contact_email: "education@github.com",
          contact_person: "GitHub Education Team",
          social_links: {
            twitter: "https://twitter.com/github",
            linkedin: "https://linkedin.com/company/github",
          },
          tags: ["education", "student", "developer", "tools"],
          priority: 9,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
      setPartnerships(defaultPartnerships)
      localStorage.setItem("communityPartnerships", JSON.stringify(defaultPartnerships))
    }
  }

  const savePartnerships = (updatedPartnerships: Partnership[]) => {
    localStorage.setItem("communityPartnerships", JSON.stringify(updatedPartnerships))
    setPartnerships(updatedPartnerships)
  }

  const addPartnership = () => {
    if (!newPartnership.title || !newPartnership.partner_name) return

    const partnership: Partnership = {
      id: Date.now().toString(),
      title: newPartnership.title!,
      description: newPartnership.description!,
      image_url: newPartnership.image_url,
      partner_logo: newPartnership.partner_logo,
      partner_name: newPartnership.partner_name!,
      partner_website: newPartnership.partner_website,
      partnership_type: newPartnership.partnership_type!,
      status: newPartnership.status!,
      featured: newPartnership.featured!,
      benefits: newPartnership.benefits!,
      contact_email: newPartnership.contact_email,
      contact_person: newPartnership.contact_person,
      start_date: newPartnership.start_date,
      end_date: newPartnership.end_date,
      social_links: newPartnership.social_links!,
      tags: newPartnership.tags!,
      priority: newPartnership.priority!,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedPartnerships = [...partnerships, partnership]
    savePartnerships(updatedPartnerships)
    resetForm()
    setIsDialogOpen(false)
  }

  const updatePartnership = () => {
    if (!editingPartnership) return

    const updatedPartnerships = partnerships.map((p) =>
      p.id === editingPartnership.id ? { ...editingPartnership, updated_at: new Date().toISOString() } : p,
    )
    savePartnerships(updatedPartnerships)
    setEditingPartnership(null)
  }

  const deletePartnership = (id: string) => {
    if (confirm("Are you sure you want to delete this partnership?")) {
      const updatedPartnerships = partnerships.filter((p) => p.id !== id)
      savePartnerships(updatedPartnerships)
    }
  }

  const resetForm = () => {
    setNewPartnership({
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
      social_links: {},
      tags: [],
      priority: 0,
    })
    setNewBenefit("")
    setNewTag("")
    setNewSocialPlatform("")
    setNewSocialUrl("")
  }

  const addBenefit = (isEditing = false) => {
    const benefit = newBenefit.trim()
    if (!benefit) return

    if (isEditing && editingPartnership) {
      if (!editingPartnership.benefits.includes(benefit)) {
        setEditingPartnership({
          ...editingPartnership,
          benefits: [...editingPartnership.benefits, benefit],
        })
      }
    } else {
      if (!newPartnership.benefits?.includes(benefit)) {
        setNewPartnership((prev) => ({
          ...prev,
          benefits: [...(prev.benefits || []), benefit],
        }))
      }
    }
    setNewBenefit("")
  }

  const removeBenefit = (benefit: string, isEditing = false) => {
    if (isEditing && editingPartnership) {
      setEditingPartnership({
        ...editingPartnership,
        benefits: editingPartnership.benefits.filter((b) => b !== benefit),
      })
    } else {
      setNewPartnership((prev) => ({
        ...prev,
        benefits: prev.benefits?.filter((b) => b !== benefit) || [],
      }))
    }
  }

  const addTag = (isEditing = false) => {
    const tag = newTag.trim()
    if (!tag) return

    if (isEditing && editingPartnership) {
      if (!editingPartnership.tags.includes(tag)) {
        setEditingPartnership({
          ...editingPartnership,
          tags: [...editingPartnership.tags, tag],
        })
      }
    } else {
      if (!newPartnership.tags?.includes(tag)) {
        setNewPartnership((prev) => ({
          ...prev,
          tags: [...(prev.tags || []), tag],
        }))
      }
    }
    setNewTag("")
  }

  const removeTag = (tag: string, isEditing = false) => {
    if (isEditing && editingPartnership) {
      setEditingPartnership({
        ...editingPartnership,
        tags: editingPartnership.tags.filter((t) => t !== tag),
      })
    } else {
      setNewPartnership((prev) => ({
        ...prev,
        tags: prev.tags?.filter((t) => t !== tag) || [],
      }))
    }
  }

  const addSocialLink = (isEditing = false) => {
    const platform = newSocialPlatform.trim()
    const url = newSocialUrl.trim()
    if (!platform || !url) return

    if (isEditing && editingPartnership) {
      setEditingPartnership({
        ...editingPartnership,
        social_links: {
          ...editingPartnership.social_links,
          [platform]: url,
        },
      })
    } else {
      setNewPartnership((prev) => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [platform]: url,
        },
      }))
    }
    setNewSocialPlatform("")
    setNewSocialUrl("")
  }

  const removeSocialLink = (platform: string, isEditing = false) => {
    if (isEditing && editingPartnership) {
      const { [platform]: removed, ...rest } = editingPartnership.social_links
      setEditingPartnership({
        ...editingPartnership,
        social_links: rest,
      })
    } else {
      const { [platform]: removed, ...rest } = newPartnership.social_links || {}
      setNewPartnership((prev) => ({
        ...prev,
        social_links: rest,
      }))
    }
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = partnershipTypes.find((t) => t.value === type)
    return typeConfig?.icon || Handshake
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-red-500"
      case "draft":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Handshake className="w-8 h-8 text-yellow-400" />
              Community Partnerships
            </h1>
            <p className="text-gray-400 mt-2">Manage community partnerships and collaborations</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Add Partnership
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Partnership</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Partnership Title *</Label>
                    <Input
                      value={newPartnership.title}
                      onChange={(e) => setNewPartnership((prev) => ({ ...prev, title: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="e.g., AWS Cloud Credits Program"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Partner Name *</Label>
                    <Input
                      value={newPartnership.partner_name}
                      onChange={(e) => setNewPartnership((prev) => ({ ...prev, partner_name: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="e.g., Amazon Web Services"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Description *</Label>
                  <Textarea
                    value={newPartnership.description}
                    onChange={(e) => setNewPartnership((prev) => ({ ...prev, description: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Describe the partnership and its benefits..."
                    rows={3}
                  />
                </div>

                {/* Partnership Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-300">Partnership Type</Label>
                    <Select
                      value={newPartnership.partnership_type}
                      onValueChange={(value) =>
                        setNewPartnership((prev) => ({ ...prev, partnership_type: value as any }))
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
                    <Label className="text-gray-300">Status</Label>
                    <Select
                      value={newPartnership.status}
                      onValueChange={(value) => setNewPartnership((prev) => ({ ...prev, status: value as any }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="active" className="text-white">
                          Active
                        </SelectItem>
                        <SelectItem value="inactive" className="text-white">
                          Inactive
                        </SelectItem>
                        <SelectItem value="draft" className="text-white">
                          Draft
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Priority (0-10)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={newPartnership.priority}
                      onChange={(e) =>
                        setNewPartnership((prev) => ({ ...prev, priority: Number.parseInt(e.target.value) || 0 }))
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Partner Website</Label>
                    <Input
                      value={newPartnership.partner_website}
                      onChange={(e) => setNewPartnership((prev) => ({ ...prev, partner_website: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="https://partner-website.com"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Contact Email</Label>
                    <Input
                      value={newPartnership.contact_email}
                      onChange={(e) => setNewPartnership((prev) => ({ ...prev, contact_email: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="contact@partner.com"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Contact Person</Label>
                  <Input
                    value={newPartnership.contact_person}
                    onChange={(e) => setNewPartnership((prev) => ({ ...prev, contact_person: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="John Doe, Partnership Manager"
                  />
                </div>

                {/* Benefits */}
                <div>
                  <Label className="text-gray-300">Benefits</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Add benefit"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                    />
                    <Button
                      type="button"
                      onClick={() => addBenefit()}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newPartnership.benefits?.map((benefit, index) => (
                      <Badge key={index} variant="outline" className="border-yellow-400 text-yellow-400">
                        {benefit}
                        <button
                          type="button"
                          onClick={() => removeBenefit(benefit)}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-gray-300">Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Add tag"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button
                      type="button"
                      onClick={() => addTag()}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black"
                    >
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newPartnership.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <Label className="text-gray-300">Social Links</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newSocialPlatform}
                      onChange={(e) => setNewSocialPlatform(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Platform (e.g., twitter)"
                    />
                    <Input
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="URL"
                    />
                    <Button
                      type="button"
                      onClick={() => addSocialLink()}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(newPartnership.social_links || {}).map(([platform, url]) => (
                      <div key={platform} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                        <span className="text-yellow-400 capitalize">{platform}:</span>
                        <span className="text-gray-300 flex-1">{url}</span>
                        <button
                          type="button"
                          onClick={() => removeSocialLink(platform)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={newPartnership.featured}
                    onChange={(e) => setNewPartnership((prev) => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="featured" className="text-gray-300">
                    Featured Partnership
                  </Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={addPartnership} className="bg-green-500 hover:bg-green-600 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Partnership
                  </Button>
                  <Button
                    onClick={() => {
                      resetForm()
                      setIsDialogOpen(false)
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Partnerships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partnerships
            .sort((a, b) => b.priority - a.priority)
            .map((partnership) => {
              const TypeIcon = getTypeIcon(partnership.partnership_type)
              return (
                <Card
                  key={partnership.id}
                  className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-400 rounded-lg">
                          <TypeIcon className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{partnership.title}</CardTitle>
                          <p className="text-gray-400 text-sm">{partnership.partner_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {partnership.featured && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(partnership.status)}`} />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-sm line-clamp-3">{partnership.description}</p>

                    {partnership.benefits.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-2">Benefits:</p>
                        <div className="flex flex-wrap gap-1">
                          {partnership.benefits.slice(0, 3).map((benefit, index) => (
                            <Badge key={index} variant="outline" className="border-green-400 text-green-400 text-xs">
                              {benefit}
                            </Badge>
                          ))}
                          {partnership.benefits.length > 3 && (
                            <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                              +{partnership.benefits.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {partnership.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {partnership.tags.slice(0, 4).map((tag, index) => (
                          <Badge key={index} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(partnership.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        {partnership.partner_website && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(partnership.partner_website, "_blank")}
                            className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPartnership(partnership)}
                          className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deletePartnership(partnership.id)}
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

        {partnerships.length === 0 && (
          <div className="text-center py-12">
            <Handshake className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No partnerships yet</h3>
            <p className="text-gray-500">Add your first community partnership to get started.</p>
          </div>
        )}

        {/* Edit Partnership Dialog */}
        {editingPartnership && (
          <Dialog open={!!editingPartnership} onOpenChange={() => setEditingPartnership(null)}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Partnership</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Similar form structure as add partnership, but with editingPartnership values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Partnership Title *</Label>
                    <Input
                      value={editingPartnership.title}
                      onChange={(e) =>
                        setEditingPartnership((prev) => (prev ? { ...prev, title: e.target.value } : null))
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Partner Name *</Label>
                    <Input
                      value={editingPartnership.partner_name}
                      onChange={(e) =>
                        setEditingPartnership((prev) => (prev ? { ...prev, partner_name: e.target.value } : null))
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Description *</Label>
                  <Textarea
                    value={editingPartnership.description}
                    onChange={(e) =>
                      setEditingPartnership((prev) => (prev ? { ...prev, description: e.target.value } : null))
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-300">Partnership Type</Label>
                    <Select
                      value={editingPartnership.partnership_type}
                      onValueChange={(value) =>
                        setEditingPartnership((prev) => (prev ? { ...prev, partnership_type: value as any } : null))
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
                    <Label className="text-gray-300">Status</Label>
                    <Select
                      value={editingPartnership.status}
                      onValueChange={(value) =>
                        setEditingPartnership((prev) => (prev ? { ...prev, status: value as any } : null))
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="active" className="text-white">
                          Active
                        </SelectItem>
                        <SelectItem value="inactive" className="text-white">
                          Inactive
                        </SelectItem>
                        <SelectItem value="draft" className="text-white">
                          Draft
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Priority (0-10)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={editingPartnership.priority}
                      onChange={(e) =>
                        setEditingPartnership((prev) =>
                          prev ? { ...prev, priority: Number.parseInt(e.target.value) || 0 } : null,
                        )
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Partner Website</Label>
                    <Input
                      value={editingPartnership.partner_website || ""}
                      onChange={(e) =>
                        setEditingPartnership((prev) => (prev ? { ...prev, partner_website: e.target.value } : null))
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Contact Email</Label>
                    <Input
                      value={editingPartnership.contact_email || ""}
                      onChange={(e) =>
                        setEditingPartnership((prev) => (prev ? { ...prev, contact_email: e.target.value } : null))
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Contact Person</Label>
                  <Input
                    value={editingPartnership.contact_person || ""}
                    onChange={(e) =>
                      setEditingPartnership((prev) => (prev ? { ...prev, contact_person: e.target.value } : null))
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Benefits for editing */}
                <div>
                  <Label className="text-gray-300">Benefits</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Add benefit"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit(true))}
                    />
                    <Button
                      type="button"
                      onClick={() => addBenefit(true)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingPartnership.benefits.map((benefit, index) => (
                      <Badge key={index} variant="outline" className="border-yellow-400 text-yellow-400">
                        {benefit}
                        <button
                          type="button"
                          onClick={() => removeBenefit(benefit, true)}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tags for editing */}
                <div>
                  <Label className="text-gray-300">Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Add tag"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag(true))}
                    />
                    <Button
                      type="button"
                      onClick={() => addTag(true)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black"
                    >
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingPartnership.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag, true)}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Social Links for editing */}
                <div>
                  <Label className="text-gray-300">Social Links</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newSocialPlatform}
                      onChange={(e) => setNewSocialPlatform(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Platform"
                    />
                    <Input
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="URL"
                    />
                    <Button
                      type="button"
                      onClick={() => addSocialLink(true)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(editingPartnership.social_links).map(([platform, url]) => (
                      <div key={platform} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                        <span className="text-yellow-400 capitalize">{platform}:</span>
                        <span className="text-gray-300 flex-1">{url}</span>
                        <button
                          type="button"
                          onClick={() => removeSocialLink(platform, true)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured Toggle for editing */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-featured"
                    checked={editingPartnership.featured}
                    onChange={(e) =>
                      setEditingPartnership((prev) => (prev ? { ...prev, featured: e.target.checked } : null))
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="edit-featured" className="text-gray-300">
                    Featured Partnership
                  </Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={updatePartnership} className="bg-green-500 hover:bg-green-600 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Update Partnership
                  </Button>
                  <Button
                    onClick={() => setEditingPartnership(null)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
