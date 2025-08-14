"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, ExternalLink, Save, X, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getAllPartners,
  createPartner,
  updatePartner,
  deletePartner,
  getCurrentUser,
  isAdmin,
  type Partner,
} from "@/lib/supabase"

interface PartnerFormData {
  name: string
  logo_url: string
  website_url: string
  category: "community" | "hackathon"
  display_order: number
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [formData, setFormData] = useState<PartnerFormData>({
    name: "",
    logo_url: "",
    website_url: "",
    category: "community",
    display_order: 0,
  })
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("community")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          const adminStatus = await isAdmin(user.email)
          setIsAuthorized(adminStatus)
        }
      } catch (error) {
        console.error("Error checking authorization:", error)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthorized) {
      fetchPartners()
    }
  }, [isAuthorized])

  const fetchPartners = async () => {
    try {
      const { data, error } = await getAllPartners()
      if (error) {
        console.error("Error fetching partners:", error)
      } else {
        setPartners(data || [])
      }
    } catch (error) {
      console.error("Error fetching partners:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert("Please fill in the partner name")
      return
    }

    setSubmitting(true)
    try {
      if (editingPartner) {
        const { error } = await updatePartner(editingPartner.id, formData)
        if (error) {
          console.error("Error updating partner:", error)
          alert("Error updating partner")
        } else {
          alert("Partner updated successfully!")
          fetchPartners()
          resetForm()
        }
      } else {
        const { error } = await createPartner(formData)
        if (error) {
          console.error("Error creating partner:", error)
          alert("Error creating partner")
        } else {
          alert("Partner created successfully!")
          fetchPartners()
          resetForm()
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner)
    setFormData({
      name: partner.name,
      logo_url: partner.logo_url || "",
      website_url: partner.website_url || "",
      category: partner.category,
      display_order: partner.display_order,
    })
    setShowForm(true)
  }

  const handleDelete = async (partner: Partner) => {
    if (!confirm(`Are you sure you want to delete ${partner.name}?`)) {
      return
    }

    try {
      const { error } = await deletePartner(partner.id)
      if (error) {
        console.error("Error deleting partner:", error)
        alert("Error deleting partner")
      } else {
        alert("Partner deleted successfully!")
        fetchPartners()
      }
    } catch (error) {
      console.error("Error deleting partner:", error)
      alert("An error occurred")
    }
  }

  const handleDisplayOrderChange = async (partner: Partner, direction: "up" | "down") => {
    const categoryPartners = partners.filter((p) => p.category === partner.category)
    const currentIndex = categoryPartners.findIndex((p) => p.id === partner.id)

    if (direction === "up" && currentIndex > 0) {
      const newOrder = categoryPartners[currentIndex - 1].display_order
      await updatePartner(partner.id, { display_order: newOrder })
      await updatePartner(categoryPartners[currentIndex - 1].id, { display_order: partner.display_order })
    } else if (direction === "down" && currentIndex < categoryPartners.length - 1) {
      const newOrder = categoryPartners[currentIndex + 1].display_order
      await updatePartner(partner.id, { display_order: newOrder })
      await updatePartner(categoryPartners[currentIndex + 1].id, { display_order: partner.display_order })
    }

    fetchPartners()
  }

  const resetForm = () => {
    setFormData({ name: "", logo_url: "", website_url: "", category: "community", display_order: 0 })
    setEditingPartner(null)
    setShowForm(false)
  }

  const communityPartners = partners.filter((p) => p.category === "community")
  const hackathonPartners = partners.filter((p) => p.category === "hackathon")

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Partners Management</h1>
          <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add New Partner
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingPartner ? "Edit Partner" : "Add New Partner"}</h2>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Partner Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter partner name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: "community" | "hackathon") => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="community">Community Partner</SelectItem>
                      <SelectItem value="hackathon">Hackathon Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    type="url"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your image to a service like Imgur or use a direct URL
                  </p>
                </div>

                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>

                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {submitting ? "Saving..." : editingPartner ? "Update" : "Create"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Partners Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="community">Community Partners ({communityPartners.length})</TabsTrigger>
            <TabsTrigger value="hackathon">Hackathon Partners ({hackathonPartners.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="mt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <p className="mt-4 text-gray-600">Loading partners...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityPartners.map((partner) => (
                  <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisplayOrderChange(partner, "up")}
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisplayOrderChange(partner, "down")}
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(partner)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(partner)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {partner.logo_url && (
                          <div className="flex justify-center">
                            <img
                              src={partner.logo_url || "/placeholder.svg"}
                              alt={partner.name}
                              className="w-16 h-16 object-contain rounded"
                            />
                          </div>
                        )}
                        {partner.website_url && (
                          <div>
                            <a
                              href={partner.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm"
                            >
                              Visit Website
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Status: <span className="capitalize">{partner.status}</span>
                        </div>
                        <div className="text-xs text-gray-500">Order: {partner.display_order}</div>
                        <div className="text-xs text-gray-500">
                          Created: {new Date(partner.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && communityPartners.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Community Partners Yet</h3>
                <p className="text-gray-500 mb-4">Start by adding your first community partner.</p>
                <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Community Partner
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hackathon" className="mt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <p className="mt-4 text-gray-600">Loading partners...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hackathonPartners.map((partner) => (
                  <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisplayOrderChange(partner, "up")}
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisplayOrderChange(partner, "down")}
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(partner)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(partner)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {partner.logo_url && (
                          <div className="flex justify-center">
                            <img
                              src={partner.logo_url || "/placeholder.svg"}
                              alt={partner.name}
                              className="w-16 h-16 object-contain rounded"
                            />
                          </div>
                        )}
                        {partner.website_url && (
                          <div>
                            <a
                              href={partner.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm"
                            >
                              Visit Website
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Status: <span className="capitalize">{partner.status}</span>
                        </div>
                        <div className="text-xs text-gray-500">Order: {partner.display_order}</div>
                        <div className="text-xs text-gray-500">
                          Created: {new Date(partner.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && hackathonPartners.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Hackathon Partners Yet</h3>
                <p className="text-gray-500 mb-4">Start by adding your first hackathon partner.</p>
                <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Hackathon Partner
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
