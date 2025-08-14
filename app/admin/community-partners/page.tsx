"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowLeft, Shield, Plus, Edit, Trash2, ExternalLink, Save, X } from "lucide-react"
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
  logo_url?: string
  website_url: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export default function AdminCommunityPartnersPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adminAccess, setAdminAccess] = useState(false)
  const [partners, setPartners] = useState<CommunityPartner[]>([])
  const [editingPartner, setEditingPartner] = useState<CommunityPartner | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    website_url: "",
  })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
    loadPartners()
  }, [])

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
      if (error) {
        console.error("Error loading partners:", error)
      } else {
        setPartners(data || [])
      }
    } catch (error) {
      console.error("Error loading partners:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.website_url) {
      alert("Please fill in required fields")
      return
    }

    setSaving(true)
    try {
      if (editingPartner) {
        const { error } = await updateCommunityPartner(editingPartner.id, formData)
        if (error) {
          console.error("Error updating partner:", error)
          alert("Error updating partner")
        } else {
          alert("Partner updated successfully!")
          setEditingPartner(null)
        }
      } else {
        const { error } = await createCommunityPartner(formData)
        if (error) {
          console.error("Error creating partner:", error)
          alert("Error creating partner")
        } else {
          alert("Partner created successfully!")
          setShowAddForm(false)
        }
      }

      setFormData({ name: "", logo_url: "", website_url: "" })
      loadPartners()
    } catch (error) {
      console.error("Error saving partner:", error)
      alert("Error saving partner")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (partner: CommunityPartner) => {
    setEditingPartner(partner)
    setFormData({
      name: partner.name,
      logo_url: partner.logo_url || "",
      website_url: partner.website_url,
    })
    setShowAddForm(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this community partner?")) {
      try {
        const { error } = await deleteCommunityPartner(id)
        if (error) {
          console.error("Error deleting partner:", error)
          alert("Error deleting partner")
        } else {
          alert("Partner deleted successfully!")
          loadPartners()
        }
      } catch (error) {
        console.error("Error deleting partner:", error)
        alert("Error deleting partner")
      }
    }
  }

  const cancelEdit = () => {
    setEditingPartner(null)
    setShowAddForm(false)
    setFormData({ name: "", logo_url: "", website_url: "" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Users className="w-8 h-8 text-purple-400" />
                Community Partners Management
              </h1>
              <p className="text-gray-400 mt-1">Manage community partnerships</p>
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
        {/* Add/Edit Form */}
        {(showAddForm || editingPartner) && (
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white">
                {editingPartner ? "Edit Community Partner" : "Add New Community Partner"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {editingPartner ? "Update partner information" : "Add a new community partner"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white">
                      Partner Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-black border-gray-700 text-white focus:border-purple-400"
                      placeholder="Community name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="website" className="text-white">
                      Website URL *
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      className="bg-black border-gray-700 text-white focus:border-purple-400"
                      placeholder="https://..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="logo" className="text-white">
                    Logo URL
                  </Label>
                  <Input
                    id="logo"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="https://..."
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Upload your image to a service like Imgur or use a direct image URL
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : editingPartner ? "Update Partner" : "Add Partner"}
                  </Button>
                  <Button
                    type="button"
                    onClick={cancelEdit}
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Add Button */}
        {!showAddForm && !editingPartner && (
          <div className="mb-8">
            <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add New Community Partner
            </Button>
          </div>
        )}

        {/* Partners List */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Current Community Partners</CardTitle>
            <CardDescription className="text-gray-400">Manage existing community partnerships</CardDescription>
          </CardHeader>
          <CardContent>
            {partners.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No community partners yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partners.map((partner) => (
                  <div key={partner.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {partner.logo_url && (
                          <Image
                            src={partner.logo_url || "/placeholder.svg"}
                            alt={partner.name}
                            width={40}
                            height={40}
                            className="rounded object-contain"
                          />
                        )}
                        <div>
                          <h3 className="text-white font-medium">{partner.name}</h3>
                          <Badge className={partner.status === "active" ? "bg-green-500" : "bg-gray-500"}>
                            {partner.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(partner.website_url, "_blank")}
                          className="text-gray-400 hover:text-white hover:bg-gray-700 p-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(partner)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-gray-700 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(partner.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-gray-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Created: {new Date(partner.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
