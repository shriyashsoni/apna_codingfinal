"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Handshake,
  Star,
  Globe,
  Mail,
  Calendar,
  Building,
  GraduationCap,
  Briefcase,
  Heart,
  Users,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  Award,
  Target,
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
  { value: "all", label: "All Types", icon: Handshake },
  { value: "educational", label: "Educational", icon: GraduationCap },
  { value: "corporate", label: "Corporate", icon: Building },
  { value: "startup", label: "Startup", icon: Briefcase },
  { value: "nonprofit", label: "Non-Profit", icon: Heart },
]

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [filteredPartnerships, setFilteredPartnerships] = useState<Partnership[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPartnerships()
  }, [])

  useEffect(() => {
    filterPartnerships()
  }, [partnerships, searchQuery, selectedType])

  const loadPartnerships = () => {
    // Load from localStorage for demo
    const savedPartnerships = localStorage.getItem("communityPartnerships")
    if (savedPartnerships) {
      const allPartnerships = JSON.parse(savedPartnerships)
      const activePartnerships = allPartnerships.filter((p: Partnership) => p.status === "active")
      setPartnerships(activePartnerships)
    } else {
      // Default partnerships
      const defaultPartnerships: Partnership[] = [
        {
          id: "1",
          title: "AWS Cloud Credits Program",
          description:
            "Get up to $10,000 in AWS credits for your startup or project. Perfect for students and developers looking to build scalable applications in the cloud.",
          partner_name: "Amazon Web Services",
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
          social_links: {
            twitter: "https://twitter.com/github",
            linkedin: "https://linkedin.com/company/github",
          },
          tags: ["education", "student", "developer", "tools", "github"],
          priority: 9,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Microsoft for Startups",
          description:
            "Join Microsoft for Startups and get up to $150,000 in Azure credits, plus access to technical support and go-to-market resources.",
          partner_name: "Microsoft",
          partner_website: "https://startups.microsoft.com",
          partnership_type: "startup",
          status: "active",
          featured: true,
          benefits: [
            "Up to $150,000 Azure Credits",
            "Technical Support",
            "Go-to-market Resources",
            "Mentorship Program",
            "Co-selling Opportunities",
          ],
          contact_email: "startups@microsoft.com",
          contact_person: "Microsoft Startups Team",
          social_links: {
            twitter: "https://twitter.com/microsoft",
            linkedin: "https://linkedin.com/company/microsoft",
          },
          tags: ["startup", "azure", "cloud", "mentorship", "microsoft"],
          priority: 8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
      setPartnerships(defaultPartnerships)
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

    // Sort by priority and featured status
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return b.priority - a.priority
    })

    setFilteredPartnerships(filtered)
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = partnershipTypes.find((t) => t.value === type)
    return typeConfig?.icon || Handshake
  }

  const getTypeLabel = (type: string) => {
    const typeConfig = partnershipTypes.find((t) => t.value === type)
    return typeConfig?.label || "General"
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "educational":
        return "border-blue-400 text-blue-400"
      case "corporate":
        return "border-purple-400 text-purple-400"
      case "startup":
        return "border-green-400 text-green-400"
      case "nonprofit":
        return "border-pink-400 text-pink-400"
      default:
        return "border-yellow-400 text-yellow-400"
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
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Community <span className="text-yellow-400">Partnerships</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover exclusive partnerships and opportunities designed to accelerate your coding journey and career
            growth.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span>Exclusive Benefits</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-400" />
              <span>Career Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-400" />
              <span>Community Access</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
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
                  {partnershipTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      {type.label}
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

        {/* Featured Partnerships */}
        {filteredPartnerships.some((p) => p.featured) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              Featured Partnerships
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartnerships
                .filter((partnership) => partnership.featured)
                .map((partnership) => {
                  const TypeIcon = getTypeIcon(partnership.partnership_type)
                  return (
                    <Card
                      key={partnership.id}
                      className="bg-gray-900 border-yellow-400 hover:border-yellow-300 transition-all duration-300 group"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-400 rounded-lg">
                              <TypeIcon className="w-6 h-6 text-black" />
                            </div>
                            <div>
                              <CardTitle className="text-white text-lg group-hover:text-yellow-400 transition-colors">
                                {partnership.title}
                              </CardTitle>
                              <p className="text-gray-400 text-sm">{partnership.partner_name}</p>
                              <Badge
                                variant="outline"
                                className={`mt-1 text-xs ${getTypeColor(partnership.partnership_type)}`}
                              >
                                {getTypeLabel(partnership.partnership_type)}
                              </Badge>
                            </div>
                          </div>
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{partnership.description}</p>

                        <div>
                          <p className="text-sm font-medium text-gray-400 mb-2">Key Benefits:</p>
                          <div className="space-y-1">
                            {partnership.benefits.slice(0, 4).map((benefit, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                                <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                                {benefit}
                              </div>
                            ))}
                            {partnership.benefits.length > 4 && (
                              <p className="text-xs text-gray-400 mt-1">
                                +{partnership.benefits.length - 4} more benefits
                              </p>
                            )}
                          </div>
                        </div>

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
                          <div className="flex items-center gap-4">
                            {partnership.contact_email && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Mail className="w-3 h-3" />
                                Contact Available
                              </div>
                            )}
                            {Object.keys(partnership.social_links).length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Globe className="w-3 h-3" />
                                Social Links
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() =>
                              partnership.partner_website && window.open(partnership.partner_website, "_blank")
                            }
                            className="bg-yellow-400 hover:bg-yellow-500 text-black text-sm"
                            disabled={!partnership.partner_website}
                          >
                            Learn More
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </div>
        )}

        {/* All Partnerships */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Handshake className="w-6 h-6 text-yellow-400" />
            All Partnerships
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartnerships.map((partnership) => {
              const TypeIcon = getTypeIcon(partnership.partnership_type)
              return (
                <Card
                  key={partnership.id}
                  className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all duration-300 group"
                >
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
                          <Badge
                            variant="outline"
                            className={`mt-1 text-xs ${getTypeColor(partnership.partnership_type)}`}
                          >
                            {getTypeLabel(partnership.partnership_type)}
                          </Badge>
                        </div>
                      </div>
                      {partnership.featured && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{partnership.description}</p>

                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-2">Benefits:</p>
                      <div className="space-y-1">
                        {partnership.benefits.slice(0, 3).map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                            <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                            {benefit}
                          </div>
                        ))}
                        {partnership.benefits.length > 3 && (
                          <p className="text-xs text-gray-400 mt-1">+{partnership.benefits.length - 3} more benefits</p>
                        )}
                      </div>
                    </div>

                    {partnership.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {partnership.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {partnership.tags.length > 3 && (
                          <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                            +{partnership.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(partnership.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        {partnership.contact_email && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`mailto:${partnership.contact_email}`, "_blank")}
                            className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                          >
                            <Mail className="w-3 h-3" />
                          </Button>
                        )}
                        {partnership.partner_website && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(partnership.partner_website, "_blank")}
                            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* No Results */}
        {filteredPartnerships.length === 0 && (
          <div className="text-center py-12">
            <Handshake className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No partnerships found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedType !== "all"
                ? "Try adjusting your search or filters to find more partnerships."
                : "Check back soon for new partnership opportunities."}
            </p>
            {(searchQuery || selectedType !== "all") && (
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedType("all")
                }}
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-gray-900 border-yellow-400">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join our community and unlock access to exclusive partnerships that can accelerate your coding journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.open("/community", "_self")}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 text-lg"
                >
                  Join Community
                  <Users className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => window.open("/contact", "_self")}
                  variant="outline"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3 text-lg"
                >
                  Partner With Us
                  <Handshake className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
