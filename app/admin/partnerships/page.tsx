"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  X,
  Building,
  GraduationCap,
  Heart,
  Briefcase,
  Users,
  Star,
  Calendar,
  ImageIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"

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
  created_at: string
  updated_at: string
}

export default function AdminPartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [filteredPartnerships, setFilteredPartnerships] = useState<Partnership[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPartnership, setEditingPartnership] = useState<Partnership | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    partner_name: "",
    partner_website: "",
    partnership_type: "general" as Partnership["partnership_type"],
    status: "draft" as Partnership["status"],
    featured: false,
    benefits: [""],
    contact_email: "",
    contact_person: "",
    partnership_date: "",
    social_links: { twitter: "", linkedin: "", website: "" },
    tags: [""],
    priority: 5,
  })

  const [imageFiles, setImageFiles] = useState({
    partner_logo: null as File | null,
    partnership_photo: null as File | null,
  })

  const [imagePreviews, setImagePreviews] = useState({
    partner_logo: "",
    partnership_photo: "",
  })

  useEffect(() => {
    loadPartnerships()
  }, [])

  useEffect(() => {
    filterPartnerships()
  }, [partnerships, searchQuery, selectedType, selectedStatus])

  const loadPartnerships = () => {
    const savedPartnerships = localStorage.getItem("communityPartnerships")
    if (savedPartnerships) {
      setPartnerships(JSON.parse(savedPartnerships))
    }
    setLoading(false)
  }

  const savePartnerships = (updatedPartnerships: Partnership[]) => {
    localStorage.setItem("communityPartnerships", JSON.stringify(updatedPartnerships))
    setPartnerships(updatedPartnerships)
  }

  const filterPartnerships = () => {
    let filtered = partnerships

    if (searchQuery) {
      filtered = filtered.filter(
        (partnership) =>
          partnership.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          partnership.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          partnership.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((partnership) => partnership.partnership_type === selectedType)
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((partnership) => partnership.status === selectedStatus)
    }

    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return b.priority - a.priority
    })

    setFilteredPartnerships(filtered)
  }

  const handleImageUpload = (type: "partner_logo" | "partnership_photo", file: File) => {
    setImageFiles((prev) => ({ ...prev, [type]: file }))

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreviews((prev) => ({ ...prev, [type]: e.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (type: "partner_logo" | "partnership_photo") => {
    setImageFiles((prev) => ({ ...prev, [type]: null }))
    setImagePreviews((prev) => ({ ...prev, [type]: "" }))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      partner_name: "",
      partner_website: "",
      partnership_type: "general",
      status: "draft",
      featured: false,
      benefits: [""],
      contact_email: "",
      contact_person: "",
      partnership_date: "",
      social_links: { twitter: "", linkedin: "", website: "" },
      tags: [""],
      priority: 5,
    })
    setImageFiles({ partner_logo: null, partnership_photo: null })
    setImagePreviews({ partner_logo: "", partnership_photo: "" })
    setEditingPartnership(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const partnershipData: Partnership = {
      id: editingPartnership?.id || Date.now().toString(),
      ...formData,
      benefits: formData.benefits.filter((b) => b.trim() !== ""),
      tags: formData.tags.filter((t) => t.trim() !== ""),
      image_url: imagePreviews.partnership_photo || editingPartnership?.image_url,
      partner_logo: imagePreviews.partner_logo || editingPartnership?.partner_logo,
      partnership_photo: imagePreviews.partnership_photo || editingPartnership?.partnership_photo,
      created_at: editingPartnership?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    let updatedPartnerships
    if (editingPartnership) {
      updatedPartnerships = partnerships.map((p) => (p.id === editingPartnership.id ? partnershipData : p))
    } else {
      updatedPartnerships = [...partnerships, partnershipData]
    }

    savePartnerships(updatedPartnerships)
    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (partnership: Partnership) => {
    setEditingPartnership(partnership)
    setFormData({
      title: partnership.title,
      description: partnership.description,
      partner_name: partnership.partner_name,
      partner_website: partnership.partner_website || "",
      partnership_type: partnership.partnership_type,
      status: partnership.status,
      featured: partnership.featured,
      benefits: partnership.benefits.length > 0 ? partnership.benefits : [""],
      contact_email: partnership.contact_email || "",
      contact_person: partnership.contact_person || "",
      partnership_date: partnership.partnership_date || "",
      social_links: partnership.social_links,
      tags: partnership.tags.length > 0 ? partnership.tags : [""],
      priority: partnership.priority,
    })
    setImagePreviews({
      partner_logo: partnership.partner_logo || "",
      partnership_photo: partnership.partnership_photo || partnership.image_url || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this partnership?")) {
      const updatedPartnerships = partnerships.filter((p) => p.id !== id)
      savePartnerships(updatedPartnerships)
    }
  }

  const addBenefit = () => {
    setFormData((prev) => ({ ...prev, benefits: [...prev.benefits, ""] }))
  }

  const updateBenefit = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.map((b, i) => (i === index ? value : b)),
    }))
  }

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }))
  }

  const addTag = () => {
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, ""] }))
  }

  const updateTag = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.map((t, i) => (i === index ? value : t)),
    }))
  }

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  const getPartnershipTypeIcon = (type: string) => {
    switch (type) {
      case "corporate":
        return <Building className="w-4 h-4" />
      case "educational":
        return <GraduationCap className="w-4 h-4" />
      case "startup":
        return <Briefcase className="w-4 h-4" />
      case "nonprofit":
        return <Heart className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-400/20"
      case "inactive":
        return "bg-red-500/10 text-red-400 border-red-400/20"
      case "draft":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-400/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-400/20"
    }
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Community Partnerships</h1>
            <p className="text-gray-400 mt-2">Manage partnership opportunities for the community</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{partnerships.filter((p) => p.status === "active").length} Active</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>{partnerships.filter((p) => p.featured).length} Featured</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>{partnerships.filter((p) => p.status === "draft").length} Drafts</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Quick Add Featured Partnership */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => {
                    resetForm()
                    setFormData((prev) => ({ ...prev, featured: true, status: "active" }))
                  }}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Add Featured Partner
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    {editingPartnership ? "Edit Partnership" : "Add New Partnership"}
                  </DialogTitle>
                </DialogHeader>
                {/* Form content remains the same */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Partnership Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="partner_name">Partner Name</Label>
                        <Input
                          id="partner_name"
                          value={formData.partner_name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, partner_name: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="partner_website">Partner Website</Label>
                        <Input
                          id="partner_website"
                          type="url"
                          value={formData.partner_website}
                          onChange={(e) => setFormData((prev) => ({ ...prev, partner_website: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="partnership_type">Partnership Type</Label>
                        <Select
                          value={formData.partnership_type}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              partnership_type: value as Partnership["partnership_type"],
                            }))
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="corporate">Corporate</SelectItem>
                            <SelectItem value="educational">Educational</SelectItem>
                            <SelectItem value="startup">Startup</SelectItem>
                            <SelectItem value="nonprofit">Non-profit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                      <div>
                        <Label>Partner Logo</Label>
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                          {imagePreviews.partner_logo ? (
                            <div className="relative">
                              <Image
                                src={imagePreviews.partner_logo || "/placeholder.svg"}
                                alt="Partner logo preview"
                                width={100}
                                height={100}
                                className="mx-auto object-contain"
                              />
                              <Button
                                type="button"
                                onClick={() => removeImage("partner_logo")}
                                className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                                size="sm"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-400 text-sm mb-2">Upload partner logo</p>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleImageUpload("partner_logo", file)
                                }}
                                className="bg-gray-800 border-gray-700 text-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Partnership Photo</Label>
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                          {imagePreviews.partnership_photo ? (
                            <div className="relative">
                              <Image
                                src={imagePreviews.partnership_photo || "/placeholder.svg"}
                                alt="Partnership photo preview"
                                width={200}
                                height={120}
                                className="mx-auto object-cover rounded"
                              />
                              <Button
                                type="button"
                                onClick={() => removeImage("partnership_photo")}
                                className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                                size="sm"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-400 text-sm mb-2">Upload partnership photo</p>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleImageUpload("partnership_photo", file)
                                }}
                                className="bg-gray-800 border-gray-700 text-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Benefits */}
                  <div>
                    <Label>Benefits</Label>
                    <div className="space-y-2">
                      {formData.benefits.map((benefit, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={benefit}
                            onChange={(e) => updateBenefit(index, e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="Enter benefit"
                          />
                          <Button
                            type="button"
                            onClick={() => removeBenefit(index)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={addBenefit}
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Benefit
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label>Tags</Label>
                    <div className="space-y-2">
                      {formData.tags.map((tag, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={tag}
                            onChange={(e) => updateTag(index, e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="Enter tag"
                          />
                          <Button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={addTag}
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Tag
                      </Button>
                    </div>
                  </div>

                  {/* Additional Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_person">Contact Person</Label>
                      <Input
                        id="contact_person"
                        value={formData.contact_person}
                        onChange={(e) => setFormData((prev) => ({ ...prev, contact_person: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, contact_email: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="partnership_date">Partnership Date</Label>
                      <Input
                        id="partnership_date"
                        type="date"
                        value={formData.partnership_date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, partnership_date: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority (1-10)</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, priority: Number.parseInt(e.target.value) }))
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <Label>Social Links</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          value={formData.social_links.twitter}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              social_links: { ...prev.social_links, twitter: e.target.value },
                            }))
                          }
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={formData.social_links.linkedin}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              social_links: { ...prev.social_links, linkedin: e.target.value },
                            }))
                          }
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="https://linkedin.com/company/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={formData.social_links.website}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              social_links: { ...prev.social_links, website: e.target.value },
                            }))
                          }
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status and Featured */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, status: value as Partnership["status"] }))
                        }
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                        className="rounded border-gray-700 bg-gray-800"
                      />
                      <Label htmlFor="featured">Featured Partnership</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black">
                      {editingPartnership ? "Update Partnership" : "Create Partnership"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Regular Add Partnership */}
            <Button
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-300 bg-transparent"
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Regular Partner
            </Button>

            {/* Quick Draft Button */}
            <Button
              variant="outline"
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-all duration-300 bg-transparent"
              onClick={() => {
                resetForm()
                setFormData((prev) => ({ ...prev, status: "draft" }))
                setIsDialogOpen(true)
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search partnerships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-800 text-white"
              />
            </div>
            <div className="flex items-center gap-4">
              <Filter className="text-gray-400 w-4 h-4" />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-gray-900 border-gray-800 text-white w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="nonprofit">Non-profit</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-gray-900 border-gray-800 text-white w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Quick Actions</h3>
              <p className="text-gray-400 text-sm">Quickly add different types of partnerships</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {
                  resetForm()
                  setFormData((prev) => ({
                    ...prev,
                    partnership_type: "corporate",
                    status: "active",
                    featured: true,
                    priority: 10,
                  }))
                  setIsDialogOpen(true)
                }}
              >
                <Building className="w-3 h-3 mr-1" />
                Corporate
              </Button>
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => {
                  resetForm()
                  setFormData((prev) => ({
                    ...prev,
                    partnership_type: "educational",
                    status: "active",
                    featured: false,
                    priority: 8,
                  }))
                  setIsDialogOpen(true)
                }}
              >
                <GraduationCap className="w-3 h-3 mr-1" />
                Educational
              </Button>
              <Button
                size="sm"
                className="bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => {
                  resetForm()
                  setFormData((prev) => ({
                    ...prev,
                    partnership_type: "startup",
                    status: "active",
                    featured: false,
                    priority: 7,
                  }))
                  setIsDialogOpen(true)
                }}
              >
                <Briefcase className="w-3 h-3 mr-1" />
                Startup
              </Button>
              <Button
                size="sm"
                className="bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => {
                  resetForm()
                  setFormData((prev) => ({
                    ...prev,
                    partnership_type: "nonprofit",
                    status: "active",
                    featured: false,
                    priority: 6,
                  }))
                  setIsDialogOpen(true)
                }}
              >
                <Heart className="w-3 h-3 mr-1" />
                Non-Profit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
                onClick={() => {
                  resetForm()
                  setFormData((prev) => ({
                    ...prev,
                    status: "draft",
                    featured: false,
                    priority: 5,
                  }))
                  setIsDialogOpen(true)
                }}
              >
                <Edit className="w-3 h-3 mr-1" />
                Draft
              </Button>
            </div>
          </div>
        </div>

        {/* Partnerships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartnerships.map((partnership, index) => (
            <motion.div
              key={partnership.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all group h-full overflow-hidden">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={
                      partnership.image_url || partnership.partnership_photo || "/placeholder.svg?height=160&width=300"
                    }
                    alt={partnership.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {partnership.featured && (
                      <Badge className="bg-yellow-400 text-black text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge className={`${getStatusColor(partnership.status)} border text-xs`}>
                      {partnership.status}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Image
                        src={partnership.partner_logo || "/placeholder.svg"}
                        alt={partnership.partner_name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white group-hover:text-yellow-400 transition-colors line-clamp-1">
                        {partnership.title}
                      </CardTitle>
                      <p className="text-gray-400 text-sm mt-1">{partnership.partner_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-800 text-gray-300 border-gray-700 text-xs">
                      {getPartnershipTypeIcon(partnership.partnership_type)}
                      <span className="ml-1 capitalize">{partnership.partnership_type}</span>
                    </Badge>
                    <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                      Priority: {partnership.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <p className="text-gray-300 text-sm line-clamp-2 flex-1">{partnership.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(partnership.partnership_date || partnership.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {partnership.benefits.length} benefits
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Link href={`/community-partnerships/${partnership.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </Link>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(partnership)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(partnership.id)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Action Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className="bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 border-yellow-400/30 hover:border-yellow-400 transition-all cursor-pointer group"
            onClick={() => {
              resetForm()
              setFormData((prev) => ({ ...prev, featured: true, status: "active", partnership_type: "corporate" }))
              setIsDialogOpen(true)
            }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Building className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Add Corporate Partner</h3>
              <p className="text-gray-400 text-sm">Add a new corporate partnership with featured status</p>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-green-400/10 to-green-600/10 border-green-400/30 hover:border-green-400 transition-all cursor-pointer group"
            onClick={() => {
              resetForm()
              setFormData((prev) => ({ ...prev, featured: false, status: "active", partnership_type: "educational" }))
              setIsDialogOpen(true)
            }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Add Educational Partner</h3>
              <p className="text-gray-400 text-sm">Add a new educational institution partnership</p>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-purple-400/10 to-purple-600/10 border-purple-400/30 hover:border-purple-400 transition-all cursor-pointer group"
            onClick={() => {
              resetForm()
              setFormData((prev) => ({ ...prev, featured: false, status: "active", partnership_type: "startup" }))
              setIsDialogOpen(true)
            }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Add Startup Partner</h3>
              <p className="text-gray-400 text-sm">Add a new startup or tech company partnership</p>
            </CardContent>
          </Card>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <div className="relative group">
            <Button
              className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              <Plus className="w-6 h-6" />
            </Button>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Quick Add Partnership
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </div>

        {filteredPartnerships.length === 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No partnerships found</h3>
              <p className="text-gray-500 mb-6">Create your first partnership to get started</p>
              <Button
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
                onClick={() => {
                  resetForm()
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Partnership
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">{partnerships.length}</div>
              <div className="text-gray-400">Total Partnerships</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {partnerships.filter((p) => p.status === "active").length}
              </div>
              <div className="text-gray-400">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                {partnerships.filter((p) => p.featured).length}
              </div>
              <div className="text-gray-400">Featured</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {partnerships.filter((p) => p.status === "draft").length}
              </div>
              <div className="text-gray-400">Drafts</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
