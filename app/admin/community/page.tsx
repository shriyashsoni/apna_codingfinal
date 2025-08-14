"use client"

import { useState, useEffect } from "react"
import { Save, Plus, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface CommunityPlatform {
  id: string
  name: string
  members: string
  description: string
  link: string
  color: string
  features: string[]
}

interface CommunityStat {
  id: string
  value: string
  label: string
  description: string
}

interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  avatar: string
}

const AdminCommunityPage = () => {
  const [platforms, setPlatforms] = useState<CommunityPlatform[]>([
    {
      id: "1",
      name: "WhatsApp",
      members: "5,000+",
      description: "Get instant updates, announcements, and quick community interactions",
      link: "https://chat.whatsapp.com/HqVg4ctR6QKJnfvemsEQ8H?mode=ac_t",
      color: "bg-green-500",
      features: ["Instant Updates", "Quick Help", "Announcements", "Community Chat"],
    },
    {
      id: "2",
      name: "Telegram",
      members: "500+",
      description: "Join our growing Telegram community for coding discussions and updates",
      link: "https://t.me/apnacodingtech",
      color: "bg-blue-500",
      features: ["Coding Discussions", "Tech Updates", "File Sharing", "Group Chat"],
    },
    {
      id: "3",
      name: "Discord",
      members: "200+",
      description: "Join our main community hub for real-time discussions, coding help, and networking",
      link: "https://discord.gg/krffBfBF",
      color: "bg-indigo-500",
      features: ["Voice Channels", "Screen Sharing", "Study Groups", "Live Events"],
    },
    {
      id: "4",
      name: "GitHub",
      members: "100+",
      description: "Collaborate on open-source projects, share code, and contribute to the community",
      link: "https://github.com/APNA-CODING-BY-APNA-COUNSELLOR",
      color: "bg-gray-800",
      features: ["Open Source", "Code Reviews", "Project Collaboration", "Portfolio Building"],
    },
  ])

  const [stats, setStats] = useState<CommunityStat[]>([
    {
      id: "1",
      value: "5,800+",
      label: "Active Members",
      description: "Growing community of developers",
    },
    {
      id: "2",
      value: "50+",
      label: "Daily Discussions",
      description: "Active conversations every day",
    },
    {
      id: "3",
      value: "100+",
      label: "Success Stories",
      description: "Members who got placed",
    },
    {
      id: "4",
      value: "25+",
      label: "Countries",
      description: "Global community reach",
    },
  ])

  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: "1",
      name: "Rahul Sharma",
      role: "Software Engineer at Google",
      content:
        "The Apna Coding community helped me land my dream job. The support and guidance I received was incredible!",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: "2",
      name: "Priya Patel",
      role: "Full Stack Developer",
      content:
        "Amazing community with helpful mentors. The coding challenges and discussions really improved my skills.",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: "3",
      name: "Arjun Kumar",
      role: "Data Scientist at Microsoft",
      content: "From beginner to professional - this community supported me throughout my journey. Highly recommended!",
      avatar: "/placeholder-user.jpg",
    },
  ])

  const [editingPlatform, setEditingPlatform] = useState<CommunityPlatform | null>(null)
  const [editingStat, setEditingStat] = useState<CommunityStat | null>(null)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const savePlatform = (platform: CommunityPlatform) => {
    if (platform.id === "new") {
      const newPlatform = { ...platform, id: Date.now().toString() }
      setPlatforms([...platforms, newPlatform])
    } else {
      setPlatforms(platforms.map((p) => (p.id === platform.id ? platform : p)))
    }
    setEditingPlatform(null)
  }

  const deletePlatform = (id: string) => {
    setPlatforms(platforms.filter((p) => p.id !== id))
  }

  const saveStat = (stat: CommunityStat) => {
    setStats(stats.map((s) => (s.id === stat.id ? stat : s)))
    setEditingStat(null)
  }

  const saveTestimonial = (testimonial: Testimonial) => {
    if (testimonial.id === "new") {
      const newTestimonial = { ...testimonial, id: Date.now().toString() }
      setTestimonials([...testimonials, newTestimonial])
    } else {
      setTestimonials(testimonials.map((t) => (t.id === testimonial.id ? testimonial : t)))
    }
    setEditingTestimonial(null)
  }

  const deleteTestimonial = (id: string) => {
    setTestimonials(testimonials.filter((t) => t.id !== id))
  }

  const saveAllChanges = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, you would save to your database here
    localStorage.setItem(
      "communityData",
      JSON.stringify({
        platforms,
        stats,
        testimonials,
      }),
    )

    setIsLoading(false)
    alert("Community data saved successfully!")
  }

  useEffect(() => {
    // Load saved data on component mount
    const savedData = localStorage.getItem("communityData")
    if (savedData) {
      const { platforms: savedPlatforms, stats: savedStats, testimonials: savedTestimonials } = JSON.parse(savedData)
      setPlatforms(savedPlatforms)
      setStats(savedStats)
      setTestimonials(savedTestimonials)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Management</h1>
            <p className="text-gray-600 mt-2">Manage community platforms, statistics, and testimonials</p>
          </div>
          <Button onClick={saveAllChanges} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save All Changes"}
          </Button>
        </div>

        {/* Community Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Community Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <Button variant="ghost" size="sm" onClick={() => setEditingStat(stat)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="font-medium">{stat.label}</div>
                  <div className="text-sm text-gray-600">{stat.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Community Platforms */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Community Platforms</CardTitle>
              <Button
                onClick={() =>
                  setEditingPlatform({
                    id: "new",
                    name: "",
                    members: "",
                    description: "",
                    link: "",
                    color: "bg-blue-500",
                    features: [],
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Platform
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.map((platform) => (
                <div key={platform.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{platform.name}</h3>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingPlatform(platform)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deletePlatform(platform.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge className="mb-2">{platform.members} Members</Badge>
                  <p className="text-sm text-gray-600 mb-2">{platform.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {platform.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Community Testimonials</CardTitle>
              <Button
                onClick={() =>
                  setEditingTestimonial({
                    id: "new",
                    name: "",
                    role: "",
                    content: "",
                    avatar: "/placeholder-user.jpg",
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Testimonial
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div>
                        <div className="font-medium">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingTestimonial(testimonial)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteTestimonial(testimonial.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm italic">"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Platform Modal */}
        {editingPlatform && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{editingPlatform.id === "new" ? "Add Platform" : "Edit Platform"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Platform Name</Label>
                  <Input
                    id="name"
                    value={editingPlatform.name}
                    onChange={(e) => setEditingPlatform({ ...editingPlatform, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="members">Member Count</Label>
                  <Input
                    id="members"
                    value={editingPlatform.members}
                    onChange={(e) => setEditingPlatform({ ...editingPlatform, members: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingPlatform.description}
                    onChange={(e) => setEditingPlatform({ ...editingPlatform, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="link">Platform Link</Label>
                  <Input
                    id="link"
                    value={editingPlatform.link}
                    onChange={(e) => setEditingPlatform({ ...editingPlatform, link: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="features">Features (comma separated)</Label>
                  <Input
                    id="features"
                    value={editingPlatform.features.join(", ")}
                    onChange={(e) => setEditingPlatform({ ...editingPlatform, features: e.target.value.split(", ") })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => savePlatform(editingPlatform)}>Save</Button>
                  <Button variant="outline" onClick={() => setEditingPlatform(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Stat Modal */}
        {editingStat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Edit Statistic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    value={editingStat.value}
                    onChange={(e) => setEditingStat({ ...editingStat, value: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={editingStat.label}
                    onChange={(e) => setEditingStat({ ...editingStat, label: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editingStat.description}
                    onChange={(e) => setEditingStat({ ...editingStat, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => saveStat(editingStat)}>Save</Button>
                  <Button variant="outline" onClick={() => setEditingStat(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Testimonial Modal */}
        {editingTestimonial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{editingTestimonial.id === "new" ? "Add Testimonial" : "Edit Testimonial"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingTestimonial.name}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={editingTestimonial.role}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Testimonial Content</Label>
                  <Textarea
                    id="content"
                    value={editingTestimonial.content}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => saveTestimonial(editingTestimonial)}>Save</Button>
                  <Button variant="outline" onClick={() => setEditingTestimonial(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCommunityPage
