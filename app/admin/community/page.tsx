"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Users, Settings, Save, Plus, X, Edit, Trash2, Globe, Heart, Star } from "lucide-react"

interface CommunityData {
  stats: {
    activeMembers: number
    dailyDiscussions: number
    successStories: number
    countries: number
  }
  platforms: Array<{
    id: string
    name: string
    memberCount: number
    description: string
    link: string
    features: string[]
  }>
  testimonials: Array<{
    id: string
    name: string
    role: string
    content: string
    rating: number
  }>
}

export default function AdminCommunityPage() {
  const [loading, setLoading] = useState(false)
  const [communityData, setCommunityData] = useState<CommunityData>({
    stats: {
      activeMembers: 50000,
      dailyDiscussions: 1200,
      successStories: 2500,
      countries: 85,
    },
    platforms: [
      {
        id: "1",
        name: "WhatsApp Community",
        memberCount: 25000,
        description: "Join our active WhatsApp community for daily coding discussions and instant help",
        link: "https://chat.whatsapp.com/apnacoding",
        features: ["Instant Help", "Daily Challenges", "Job Updates", "Project Sharing"],
      },
      {
        id: "2",
        name: "Telegram Channel",
        memberCount: 15000,
        description: "Get latest updates, resources, and announcements on our Telegram channel",
        link: "https://t.me/apnacoding",
        features: ["Latest Updates", "Resources", "Announcements", "Tech News"],
      },
      {
        id: "3",
        name: "Discord Server",
        memberCount: 8000,
        description: "Voice chats, screen sharing, and collaborative coding sessions",
        link: "https://discord.gg/apnacoding",
        features: ["Voice Chats", "Screen Sharing", "Code Reviews", "Study Groups"],
      },
      {
        id: "4",
        name: "GitHub Community",
        memberCount: 12000,
        description: "Contribute to open source projects and showcase your coding skills",
        link: "https://github.com/apnacoding",
        features: ["Open Source", "Code Collaboration", "Project Showcase", "Mentorship"],
      },
    ],
    testimonials: [
      {
        id: "1",
        name: "Rahul Sharma",
        role: "Software Engineer at Google",
        content:
          "Apna Coding community helped me land my dream job at Google. The support and resources are incredible!",
        rating: 5,
      },
      {
        id: "2",
        name: "Priya Patel",
        role: "Full Stack Developer",
        content: "The daily coding challenges and peer support made learning so much easier. Highly recommend!",
        rating: 5,
      },
      {
        id: "3",
        name: "Arjun Singh",
        role: "Startup Founder",
        content: "Found my co-founder and initial team members through this amazing community. Thank you!",
        rating: 5,
      },
    ],
  })

  const [editingPlatform, setEditingPlatform] = useState<string | null>(null)
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(null)
  const [newPlatform, setNewPlatform] = useState({
    name: "",
    memberCount: "",
    description: "",
    link: "",
    features: [] as string[],
  })
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    role: "",
    content: "",
    rating: 5,
  })
  const [newFeature, setNewFeature] = useState("")

  useEffect(() => {
    loadCommunityData()
  }, [])

  const loadCommunityData = () => {
    const savedData = localStorage.getItem("communityData")
    if (savedData) {
      setCommunityData(JSON.parse(savedData))
    }
  }

  const saveCommunityData = () => {
    setLoading(true)
    try {
      localStorage.setItem("communityData", JSON.stringify(communityData))
      alert("Community data saved successfully!")
    } catch (error) {
      alert("Error saving data: " + error)
    } finally {
      setLoading(false)
    }
  }

  const updateStats = (field: keyof CommunityData["stats"], value: number) => {
    setCommunityData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [field]: value,
      },
    }))
  }

  const addPlatform = () => {
    if (!newPlatform.name || !newPlatform.description) return

    const platform = {
      id: Date.now().toString(),
      ...newPlatform,
      memberCount: Number.parseInt(newPlatform.memberCount) || 0,
    }

    setCommunityData((prev) => ({
      ...prev,
      platforms: [...prev.platforms, platform],
    }))

    setNewPlatform({
      name: "",
      memberCount: "",
      description: "",
      link: "",
      features: [],
    })
  }

  const updatePlatform = (id: string, updatedPlatform: any) => {
    setCommunityData((prev) => ({
      ...prev,
      platforms: prev.platforms.map((p) => (p.id === id ? { ...p, ...updatedPlatform } : p)),
    }))
    setEditingPlatform(null)
  }

  const deletePlatform = (id: string) => {
    if (confirm("Are you sure you want to delete this platform?")) {
      setCommunityData((prev) => ({
        ...prev,
        platforms: prev.platforms.filter((p) => p.id !== id),
      }))
    }
  }

  const addTestimonial = () => {
    if (!newTestimonial.name || !newTestimonial.content) return

    const testimonial = {
      id: Date.now().toString(),
      ...newTestimonial,
    }

    setCommunityData((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, testimonial],
    }))

    setNewTestimonial({
      name: "",
      role: "",
      content: "",
      rating: 5,
    })
  }

  const updateTestimonial = (id: string, updatedTestimonial: any) => {
    setCommunityData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((t) => (t.id === id ? { ...t, ...updatedTestimonial } : t)),
    }))
    setEditingTestimonial(null)
  }

  const deleteTestimonial = (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      setCommunityData((prev) => ({
        ...prev,
        testimonials: prev.testimonials.filter((t) => t.id !== id),
      }))
    }
  }

  const addFeatureToNewPlatform = () => {
    if (newFeature.trim() && !newPlatform.features.includes(newFeature.trim())) {
      setNewPlatform((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  const removeFeatureFromNewPlatform = (feature: string) => {
    setNewPlatform((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }))
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Users className="w-8 h-8 text-yellow-400" />
              Community Management
            </h1>
            <p className="text-gray-400 mt-2">Manage community statistics, platforms, and testimonials</p>
          </div>
          <Button
            onClick={saveCommunityData}
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Community Statistics */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-400" />
              Community Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-300">Active Members</Label>
                <Input
                  type="number"
                  value={communityData.stats.activeMembers}
                  onChange={(e) => updateStats("activeMembers", Number.parseInt(e.target.value) || 0)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Daily Discussions</Label>
                <Input
                  type="number"
                  value={communityData.stats.dailyDiscussions}
                  onChange={(e) => updateStats("dailyDiscussions", Number.parseInt(e.target.value) || 0)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Success Stories</Label>
                <Input
                  type="number"
                  value={communityData.stats.successStories}
                  onChange={(e) => updateStats("successStories", Number.parseInt(e.target.value) || 0)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Countries</Label>
                <Input
                  type="number"
                  value={communityData.stats.countries}
                  onChange={(e) => updateStats("countries", Number.parseInt(e.target.value) || 0)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Platforms */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-yellow-400" />
              Community Platforms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Platform */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Platform</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-gray-300">Platform Name</Label>
                  <Input
                    value={newPlatform.name}
                    onChange={(e) => setNewPlatform((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., WhatsApp Community"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Member Count</Label>
                  <Input
                    type="number"
                    value={newPlatform.memberCount}
                    onChange={(e) => setNewPlatform((prev) => ({ ...prev, memberCount: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., 25000"
                  />
                </div>
              </div>
              <div className="mb-4">
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  value={newPlatform.description}
                  onChange={(e) => setNewPlatform((prev) => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Platform description"
                />
              </div>
              <div className="mb-4">
                <Label className="text-gray-300">Link</Label>
                <Input
                  value={newPlatform.link}
                  onChange={(e) => setNewPlatform((prev) => ({ ...prev, link: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="https://..."
                />
              </div>
              <div className="mb-4">
                <Label className="text-gray-300">Features</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Add feature"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeatureToNewPlatform())}
                  />
                  <Button
                    type="button"
                    onClick={addFeatureToNewPlatform}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newPlatform.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="border-yellow-400 text-yellow-400">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeatureFromNewPlatform(feature)}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={addPlatform} className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Platform
              </Button>
            </div>

            {/* Existing Platforms */}
            <div className="space-y-4">
              {communityData.platforms.map((platform) => (
                <div key={platform.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPlatform(platform.id)}
                        className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePlatform(platform.id)}
                        className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-2">{platform.description}</p>
                  <p className="text-sm text-gray-400 mb-2">Members: {platform.memberCount.toLocaleString()}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {platform.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <a
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 hover:text-yellow-300 text-sm"
                  >
                    {platform.link}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Community Testimonials */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-yellow-400" />
              Community Testimonials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Testimonial */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Testimonial</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-gray-300">Name</Label>
                  <Input
                    value={newTestimonial.name}
                    onChange={(e) => setNewTestimonial((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Role</Label>
                  <Input
                    value={newTestimonial.role}
                    onChange={(e) => setNewTestimonial((prev) => ({ ...prev, role: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Job title or role"
                  />
                </div>
              </div>
              <div className="mb-4">
                <Label className="text-gray-300">Testimonial Content</Label>
                <Textarea
                  value={newTestimonial.content}
                  onChange={(e) => setNewTestimonial((prev) => ({ ...prev, content: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Testimonial content"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <Label className="text-gray-300">Rating</Label>
                <select
                  value={newTestimonial.rating}
                  onChange={(e) => setNewTestimonial((prev) => ({ ...prev, rating: Number.parseInt(e.target.value) }))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
              <Button onClick={addTestimonial} className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Testimonial
              </Button>
            </div>

            {/* Existing Testimonials */}
            <div className="space-y-4">
              {communityData.testimonials.map((testimonial) => (
                <div key={testimonial.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{testimonial.name}</h3>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTestimonial(testimonial.id)}
                        className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTestimonial(testimonial.id)}
                        className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-300">{testimonial.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
