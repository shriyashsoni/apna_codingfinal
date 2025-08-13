"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, isAdmin } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Settings, ArrowLeft, Save, Globe, Mail, Shield, Database, Users, Plus, Trash2 } from "lucide-react"

interface SiteSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  supportEmail: string
  socialLinks: {
    twitter: string
    linkedin: string
    github: string
    discord: string
  }
  seoSettings: {
    metaTitle: string
    metaDescription: string
    keywords: string
  }
  emailSettings: {
    smtpHost: string
    smtpPort: string
    smtpUser: string
    enableNotifications: boolean
  }
}

interface Partner {
  id: string
  name: string
  logo: string
  website: string
  description: string
  tier: "platinum" | "gold" | "silver" | "bronze"
  active: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adminAccess, setAdminAccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "Apna Coding",
    siteDescription: "Your gateway to coding excellence and tech opportunities",
    contactEmail: "contact@apnacoding.com",
    supportEmail: "support@apnacoding.com",
    socialLinks: {
      twitter: "https://twitter.com/apnacoding",
      linkedin: "https://linkedin.com/company/apnacoding",
      github: "https://github.com/apnacoding",
      discord: "https://discord.gg/apnacoding",
    },
    seoSettings: {
      metaTitle: "Apna Coding - Learn, Build, Grow",
      metaDescription:
        "Join thousands of developers learning cutting-edge technologies through hands-on courses, hackathons, and real-world projects.",
      keywords: "coding, programming, hackathons, courses, jobs, tech careers, web development, AI, machine learning",
    },
    emailSettings: {
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      smtpUser: "noreply@apnacoding.com",
      enableNotifications: true,
    },
  })

  const [partners, setPartners] = useState<Partner[]>([
    {
      id: "1",
      name: "Microsoft",
      logo: "/images/partners/microsoft-new.webp",
      website: "https://microsoft.com",
      description: "Cloud computing and enterprise solutions",
      tier: "platinum",
      active: true,
    },
    {
      id: "2",
      name: "AWS",
      logo: "/images/partners/aws-new.webp",
      website: "https://aws.amazon.com",
      description: "Amazon Web Services cloud platform",
      tier: "platinum",
      active: true,
    },
    {
      id: "3",
      name: "NVIDIA",
      logo: "/images/partners/nvidia-new.png",
      website: "https://nvidia.com",
      description: "AI and GPU computing solutions",
      tier: "gold",
      active: true,
    },
    {
      id: "4",
      name: "GitHub",
      logo: "/images/partners/github.png",
      website: "https://github.com",
      description: "Version control and collaboration platform",
      tier: "gold",
      active: true,
    },
    {
      id: "5",
      name: "Dell Technologies",
      logo: "/images/partners/dell.png",
      website: "https://dell.com",
      description: "Enterprise technology solutions",
      tier: "silver",
      active: true,
    },
  ])

  const [newPartner, setNewPartner] = useState<Partial<Partner>>({
    name: "",
    logo: "",
    website: "",
    description: "",
    tier: "bronze",
    active: true,
  })

  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.email !== "sonishriyash@gmail.com") {
        router.push("/admin")
        return
      }

      const hasAdminAccess = await isAdmin(currentUser.email)
      if (!hasAdminAccess) {
        router.push("/admin")
        return
      }

      setUser(currentUser)
      setAdminAccess(true)
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/admin")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      // In a real app, you would save to database
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Error saving settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleAddPartner = () => {
    if (!newPartner.name || !newPartner.website) {
      alert("Please fill in required fields (Name and Website)")
      return
    }

    const partner: Partner = {
      id: Date.now().toString(),
      name: newPartner.name!,
      logo: newPartner.logo || "/placeholder-logo.png",
      website: newPartner.website!,
      description: newPartner.description || "",
      tier: newPartner.tier as "platinum" | "gold" | "silver" | "bronze",
      active: true,
    }

    setPartners([...partners, partner])
    setNewPartner({
      name: "",
      logo: "",
      website: "",
      description: "",
      tier: "bronze",
      active: true,
    })
  }

  const handleDeletePartner = (id: string) => {
    if (confirm("Are you sure you want to delete this partner?")) {
      setPartners(partners.filter((p) => p.id !== id))
    }
  }

  const handleTogglePartner = (id: string) => {
    setPartners(partners.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))
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

  if (!adminAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <Button onClick={() => router.push("/admin")} className="bg-purple-400 hover:bg-purple-500 text-black">
            Return to Admin Dashboard
          </Button>
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
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/admin")}
                variant="outline"
                size="sm"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-8 h-8 text-purple-400" />
                  Site Settings
                </h1>
                <p className="text-gray-400 mt-1">Configure site settings and preferences</p>
              </div>
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-purple-400 hover:bg-purple-500 text-black font-semibold"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
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
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-purple-400 text-black" : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Site Information</CardTitle>
                <CardDescription className="text-gray-400">Basic information about your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName" className="text-white">
                    Site Name
                  </Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription" className="text-white">
                    Site Description
                  </Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail" className="text-white">
                      Contact Email
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportEmail" className="text-white">
                      Support Email
                    </Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Social Links</CardTitle>
                <CardDescription className="text-gray-400">Social media and platform links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="twitter" className="text-white">
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      value={settings.socialLinks.twitter}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                        })
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin" className="text-white">
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={settings.socialLinks.linkedin}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: { ...settings.socialLinks, linkedin: e.target.value },
                        })
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github" className="text-white">
                      GitHub
                    </Label>
                    <Input
                      id="github"
                      value={settings.socialLinks.github}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: { ...settings.socialLinks, github: e.target.value },
                        })
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discord" className="text-white">
                      Discord
                    </Label>
                    <Input
                      id="discord"
                      value={settings.socialLinks.discord}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: { ...settings.socialLinks, discord: e.target.value },
                        })
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Partners Management */}
        {activeTab === "partners" && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Add New Partner</CardTitle>
                <CardDescription className="text-gray-400">Add a new partner to the platform</CardDescription>
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
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="e.g., Google"
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
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="https://google.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="partnerLogo" className="text-white">
                      Logo URL
                    </Label>
                    <Input
                      id="partnerLogo"
                      value={newPartner.logo}
                      onChange={(e) => setNewPartner({ ...newPartner, logo: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="/images/partners/google.png"
                    />
                  </div>
                  <div>
                    <Label htmlFor="partnerTier" className="text-white">
                      Partnership Tier
                    </Label>
                    <select
                      id="partnerTier"
                      value={newPartner.tier}
                      onChange={(e) => setNewPartner({ ...newPartner, tier: e.target.value as any })}
                      className="w-full h-10 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    >
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
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
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Brief description of the partner"
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleAddPartner}
                  className="bg-purple-400 hover:bg-purple-500 text-black font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Partner
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Current Partners</CardTitle>
                <CardDescription className="text-gray-400">Manage existing partners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partners.map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <img
                          src={partner.logo || "/placeholder.svg"}
                          alt={partner.name}
                          className="w-12 h-12 object-contain bg-white rounded p-1"
                        />
                        <div>
                          <h3 className="text-white font-semibold">{partner.name}</h3>
                          <p className="text-gray-400 text-sm">{partner.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                partner.tier === "platinum"
                                  ? "bg-purple-400 text-black"
                                  : partner.tier === "gold"
                                    ? "bg-yellow-400 text-black"
                                    : partner.tier === "silver"
                                      ? "bg-gray-400 text-black"
                                      : "bg-orange-400 text-black"
                              }`}
                            >
                              {partner.tier.toUpperCase()}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                partner.active ? "bg-green-400 text-black" : "bg-red-400 text-white"
                              }`}
                            >
                              {partner.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleTogglePartner(partner.id)}
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-white hover:bg-gray-700"
                        >
                          {partner.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          onClick={() => handleDeletePartner(partner.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-700 text-red-400 hover:bg-red-700 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
              <CardDescription className="text-gray-400">Configure email settings for notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost" className="text-white">
                    SMTP Host
                  </Label>
                  <Input
                    id="smtpHost"
                    value={settings.emailSettings.smtpHost}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailSettings: { ...settings.emailSettings, smtpHost: e.target.value },
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort" className="text-white">
                    SMTP Port
                  </Label>
                  <Input
                    id="smtpPort"
                    value={settings.emailSettings.smtpPort}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailSettings: { ...settings.emailSettings, smtpPort: e.target.value },
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="smtpUser" className="text-white">
                  SMTP Username
                </Label>
                <Input
                  id="smtpUser"
                  value={settings.emailSettings.smtpUser}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emailSettings: { ...settings.emailSettings, smtpUser: e.target.value },
                    })
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableNotifications"
                  checked={settings.emailSettings.enableNotifications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emailSettings: { ...settings.emailSettings, enableNotifications: e.target.checked },
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="enableNotifications" className="text-white">
                  Enable Email Notifications
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Security Settings</CardTitle>
              <CardDescription className="text-gray-400">Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-yellow-400 font-semibold">Admin Access</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  Admin access is currently restricted to: <strong>sonishriyash@gmail.com</strong>
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  This is a security measure to ensure only authorized personnel can access admin functions.
                </p>
              </div>

              <div className="p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  <h3 className="text-blue-400 font-semibold">Database Security</h3>
                </div>
                <p className="text-gray-300 text-sm">Row Level Security (RLS) is enabled on all database tables.</p>
                <p className="text-gray-400 text-xs mt-2">
                  Users can only access and modify their own data unless they have admin privileges.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
