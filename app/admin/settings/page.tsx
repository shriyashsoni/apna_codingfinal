"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  ArrowLeft,
  Shield,
  Save,
  Plus,
  Trash2,
  Globe,
  Mail,
  Users,
  Database,
  ExternalLink,
} from "lucide-react"
import { getCurrentUser, isAdmin } from "@/lib/supabase"

interface Partner {
  id: string
  name: string
  logo: string
  website: string
  description: string
  tier: "Platinum" | "Gold" | "Silver" | "Bronze"
  status: "active" | "inactive"
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adminAccess, setAdminAccess] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [partners, setPartners] = useState<Partner[]>([])
  const [newPartner, setNewPartner] = useState({
    name: "",
    logo: "",
    website: "",
    description: "",
    tier: "Bronze" as "Platinum" | "Gold" | "Silver" | "Bronze",
  })
  const [siteSettings, setSiteSettings] = useState({
    siteName: "Apna Coding",
    siteDescription: "Learn, Build, and Grow with the best coding community",
    contactEmail: "contact@apnacoding.tech",
    supportEmail: "support@apnacoding.tech",
    twitter: "https://twitter.com/apnacoding",
    linkedin: "https://linkedin.com/company/apnacoding",
    github: "https://github.com/apnacoding",
    discord: "https://discord.gg/apnacoding",
  })
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

  const loadPartners = () => {
    // Mock data - replace with actual database call
    const mockPartners: Partner[] = [
      {
        id: "1",
        name: "Microsoft",
        logo: "/images/partners/microsoft-new.webp",
        website: "https://microsoft.com",
        description: "Cloud computing and AI solutions",
        tier: "Platinum",
        status: "active",
      },
      {
        id: "2",
        name: "AWS",
        logo: "/images/partners/aws-new.webp",
        website: "https://aws.amazon.com",
        description: "Cloud infrastructure and services",
        tier: "Platinum",
        status: "active",
      },
      {
        id: "3",
        name: "GitHub",
        logo: "/images/partners/github.png",
        website: "https://github.com",
        description: "Code hosting and collaboration",
        tier: "Gold",
        status: "active",
      },
      {
        id: "4",
        name: "NVIDIA",
        logo: "/images/partners/nvidia-new.png",
        website: "https://nvidia.com",
        description: "AI and GPU computing",
        tier: "Gold",
        status: "active",
      },
    ]
    setPartners(mockPartners)
  }

  const addPartner = () => {
    if (!newPartner.name || !newPartner.website) {
      alert("Please fill in required fields")
      return
    }

    const partner: Partner = {
      id: Date.now().toString(),
      ...newPartner,
      status: "active",
    }

    setPartners([...partners, partner])
    setNewPartner({
      name: "",
      logo: "",
      website: "",
      description: "",
      tier: "Bronze",
    })
    alert("Partner added successfully!")
  }

  const deletePartner = (id: string) => {
    if (confirm("Are you sure you want to delete this partner?")) {
      setPartners(partners.filter((p) => p.id !== id))
      alert("Partner deleted successfully!")
    }
  }

  const togglePartnerStatus = (id: string) => {
    setPartners(
      partners.map((p) => (p.id === id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p)),
    )
  }

  const saveSiteSettings = () => {
    // Save to database
    alert("Site settings saved successfully!")
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-gray-300 text-gray-800"
      case "Gold":
        return "bg-yellow-400 text-yellow-900"
      case "Silver":
        return "bg-gray-400 text-gray-900"
      case "Bronze":
        return "bg-orange-400 text-orange-900"
      default:
        return "bg-gray-500 text-white"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white mt-4">Loading Settings...</p>
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
                <Settings className="w-8 h-8 text-purple-400" />
                Site Settings
              </h1>
              <p className="text-gray-400 mt-1">Configure site settings and preferences</p>
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
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-900 p-1 rounded-lg">
          {[
            { id: "general", label: "General", icon: Globe },
            { id: "partners", label: "Partners", icon: Users },
            { id: "email", label: "Email", icon: Mail },
            { id: "security", label: "Security", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === "general" && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
              <CardDescription className="text-gray-400">Basic site configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="siteName" className="text-white">
                    Site Name
                  </Label>
                  <Input
                    id="siteName"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail" className="text-white">
                    Contact Email
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={siteSettings.contactEmail}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="siteDescription" className="text-white">
                  Site Description
                </Label>
                <Textarea
                  id="siteDescription"
                  value={siteSettings.siteDescription}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
                  className="bg-black border-gray-700 text-white focus:border-purple-400"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="twitter" className="text-white">
                    Twitter URL
                  </Label>
                  <Input
                    id="twitter"
                    value={siteSettings.twitter}
                    onChange={(e) => setSiteSettings({ ...siteSettings, twitter: e.target.value })}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin" className="text-white">
                    LinkedIn URL
                  </Label>
                  <Input
                    id="linkedin"
                    value={siteSettings.linkedin}
                    onChange={(e) => setSiteSettings({ ...siteSettings, linkedin: e.target.value })}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                  />
                </div>
              </div>

              <Button onClick={saveSiteSettings} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Partners Management */}
        {activeTab === "partners" && (
          <div className="space-y-6">
            {/* Add New Partner */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Add New Partner</CardTitle>
                <CardDescription className="text-gray-400">Add a new partnership to the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partnerName" className="text-white">
                      Partner Name *
                    </Label>
                    <Input
                      id="partnerName"
                      value={newPartner.name}
                      onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                      className="bg-black border-gray-700 text-white focus:border-purple-400"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="partnerWebsite" className="text-white">
                      Website *
                    </Label>
                    <Input
                      id="partnerWebsite"
                      value={newPartner.website}
                      onChange={(e) => setNewPartner({ ...newPartner, website: e.target.value })}
                      className="bg-black border-gray-700 text-white focus:border-purple-400"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partnerLogo" className="text-white">
                      Logo URL
                    </Label>
                    <Input
                      id="partnerLogo"
                      value={newPartner.logo}
                      onChange={(e) => setNewPartner({ ...newPartner, logo: e.target.value })}
                      className="bg-black border-gray-700 text-white focus:border-purple-400"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="partnerTier" className="text-white">
                      Partnership Tier
                    </Label>
                    <select
                      id="partnerTier"
                      value={newPartner.tier}
                      onChange={(e) =>
                        setNewPartner({
                          ...newPartner,
                          tier: e.target.value as "Platinum" | "Gold" | "Silver" | "Bronze",
                        })
                      }
                      className="w-full bg-black border border-gray-700 text-white rounded-md px-3 py-2 focus:border-purple-400"
                    >
                      <option value="Bronze">Bronze</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="partnerDescription" className="text-white">
                    Description
                  </Label>
                  <Textarea
                    id="partnerDescription"
                    value={newPartner.description}
                    onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    rows={2}
                    placeholder="Brief description of the partnership"
                  />
                </div>

                <Button onClick={addPartner} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Partner
                </Button>
              </CardContent>
            </Card>

            {/* Existing Partners */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Current Partners</CardTitle>
                <CardDescription className="text-gray-400">Manage existing partnerships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partners.map((partner) => (
                    <div key={partner.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {partner.logo && (
                            <img
                              src={partner.logo || "/placeholder.svg"}
                              alt={partner.name}
                              className="w-10 h-10 rounded object-contain"
                            />
                          )}
                          <div>
                            <h3 className="text-white font-medium">{partner.name}</h3>
                            <Badge className={getTierColor(partner.tier)}>{partner.tier}</Badge>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => togglePartnerStatus(partner.id)}
                            className={`p-1 ${
                              partner.status === "active" ? "text-green-400" : "text-gray-400"
                            } hover:bg-gray-700`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                partner.status === "active" ? "bg-green-400" : "bg-gray-400"
                              }`}
                            />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(partner.website, "_blank")}
                            className="text-gray-400 hover:text-white hover:bg-gray-700 p-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePartner(partner.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-gray-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">{partner.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === "email" && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Email Configuration</CardTitle>
              <CardDescription className="text-gray-400">Configure email settings and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="smtpHost" className="text-white">
                    SMTP Host
                  </Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort" className="text-white">
                    SMTP Port
                  </Label>
                  <Input
                    id="smtpPort"
                    placeholder="587"
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="smtpUser" className="text-white">
                    SMTP Username
                  </Label>
                  <Input
                    id="smtpUser"
                    placeholder="your-email@gmail.com"
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPass" className="text-white">
                    SMTP Password
                  </Label>
                  <Input
                    id="smtpPass"
                    type="password"
                    placeholder="••••••••"
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                  />
                </div>
              </div>

              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Security Settings</CardTitle>
              <CardDescription className="text-gray-400">Manage security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Admin Access Control</h3>
                    <p className="text-gray-400 text-sm">Only sonishriyash@gmail.com has admin access</p>
                  </div>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Database Security</h3>
                    <p className="text-gray-400 text-sm">Row Level Security (RLS) enabled</p>
                  </div>
                  <Badge className="bg-green-500 text-white">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">API Rate Limiting</h3>
                    <p className="text-gray-400 text-sm">Protect against abuse and spam</p>
                  </div>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
              </div>

              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Database className="w-4 h-4 mr-2" />
                Run Security Audit
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
