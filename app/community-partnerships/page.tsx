"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  ExternalLink,
  Calendar,
  Users,
  Star,
  Eye,
  Building,
  GraduationCap,
  Heart,
  Briefcase,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

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

export default function CommunityPartnershipsPage() {
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
    // Load from localStorage for demo (in production, this would be from Supabase)
    const savedPartnerships = localStorage.getItem("communityPartnerships")
    if (savedPartnerships) {
      const allPartnerships = JSON.parse(savedPartnerships)
      const activePartnerships = allPartnerships.filter((p: Partnership) => p.status === "active")
      setPartnerships(activePartnerships)
    } else {
      // Default partnerships with photos
      const defaultPartnerships: Partnership[] = [
        {
          id: "1",
          title: "AWS Cloud Credits Program",
          description:
            "Get up to $10,000 in AWS credits for your startup or project. Perfect for students and developers looking to build scalable applications in the cloud.",
          image_url: "/images/partners/aws-partnership.jpg",
          partner_logo: "/images/partners/aws-new.webp",
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
          partnership_date: "2024-01-15",
          partnership_photo: "/images/partnerships/aws-event.jpg",
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
          image_url: "/images/partners/github-partnership.jpg",
          partner_logo: "/images/partners/github.png",
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
          partnership_date: "2024-01-10",
          partnership_photo: "/images/partnerships/github-event.jpg",
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
          image_url: "/images/partners/microsoft-partnership.jpg",
          partner_logo: "/images/partners/microsoft-new.webp",
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
          partnership_date: "2024-01-20",
          partnership_photo: "/images/partnerships/microsoft-event.jpg",
          social_links: {
            twitter: "https://twitter.com/microsoft",
            linkedin: "https://linkedin.com/company/microsoft",
          },
          tags: ["startup", "azure", "cloud", "mentorship", "microsoft"],
          priority: 8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "4",
          title: "NVIDIA Developer Program",
          description:
            "Access to cutting-edge AI and GPU development tools, training resources, and exclusive developer events.",
          image_url: "/images/partners/nvidia-partnership.jpg",
          partner_logo: "/images/partners/nvidia-new.png",
          partner_name: "NVIDIA",
          partner_website: "https://developer.nvidia.com",
          partnership_type: "corporate",
          status: "active",
          featured: false,
          benefits: [
            "Free GPU Cloud Credits",
            "AI Training Resources",
            "Developer Tools Access",
            "Exclusive Events",
            "Technical Support",
          ],
          contact_email: "developer@nvidia.com",
          contact_person: "NVIDIA Developer Relations",
          partnership_date: "2024-02-01",
          partnership_photo: "/images/partnerships/nvidia-event.jpg",
          social_links: {
            twitter: "https://twitter.com/nvidia",
            linkedin: "https://linkedin.com/company/nvidia",
          },
          tags: ["ai", "gpu", "machine learning", "nvidia", "developer"],
          priority: 7,
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

  const getPartnershipTypeColor = (type: string) => {
    switch (type) {
      case "corporate":
        return "bg-blue-500/10 text-blue-400 border-blue-400/20"
      case "educational":
        return "bg-green-500/10 text-green-400 border-green-400/20"
      case "startup":
        return "bg-purple-500/10 text-purple-400 border-purple-400/20"
      case "nonprofit":
        return "bg-pink-500/10 text-pink-400 border-pink-400/20"
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
      {/* Hero Section */}
      <div className="relative py-16 px-4 text-center bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Community <span className="text-yellow-400">Partnerships</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover exclusive partnerships and opportunities available to our community members
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Search and Filter */}
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
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-white"
              >
                <option value="all">All Types</option>
                <option value="corporate">Corporate</option>
                <option value="educational">Educational</option>
                <option value="startup">Startup</option>
                <option value="nonprofit">Non-profit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Featured Partnerships */}
        {filteredPartnerships.some((p) => p.featured) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              Featured Partnerships
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPartnerships
                .filter((partnership) => partnership.featured)
                .slice(0, 2)
                .map((partnership, index) => (
                  <motion.div
                    key={partnership.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-900 border-yellow-400/30 hover:border-yellow-400 transition-all group overflow-hidden">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={
                            partnership.image_url ||
                            partnership.partnership_photo ||
                            "/placeholder.svg?height=200&width=400"
                          }
                          alt={partnership.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-yellow-400 text-black">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                            <Image
                              src={partnership.partner_logo || "/placeholder.svg"}
                              alt={partnership.partner_name}
                              width={32}
                              height={32}
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-white group-hover:text-yellow-400 transition-colors">
                              {partnership.title}
                            </CardTitle>
                            <p className="text-gray-400 mt-1">{partnership.partner_name}</p>
                          </div>
                          <Badge className={`${getPartnershipTypeColor(partnership.partnership_type)} border`}>
                            {getPartnershipTypeIcon(partnership.partnership_type)}
                            <span className="ml-1 capitalize">{partnership.partnership_type}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-300 text-sm line-clamp-2">{partnership.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {partnership.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs border-gray-700 text-gray-400">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(partnership.partnership_date || partnership.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Link href={`/community-partnerships/${partnership.id}`}>
                            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* All Partnerships */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Partnerships ({filteredPartnerships.length})</h2>
          {filteredPartnerships.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No partnerships found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </CardContent>
            </Card>
          ) : (
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
                          partnership.image_url ||
                          partnership.partnership_photo ||
                          "/placeholder.svg?height=160&width=300"
                        }
                        alt={partnership.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {partnership.featured && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-yellow-400 text-black text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}
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
                      <Badge className={`${getPartnershipTypeColor(partnership.partnership_type)} border w-fit`}>
                        {getPartnershipTypeIcon(partnership.partnership_type)}
                        <span className="ml-1 capitalize text-xs">{partnership.partnership_type}</span>
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1 flex flex-col">
                      <p className="text-gray-300 text-sm line-clamp-2 flex-1">{partnership.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {partnership.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-gray-700 text-gray-400">
                            {tag}
                          </Badge>
                        ))}
                        {partnership.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                            +{partnership.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(partnership.partnership_date || partnership.created_at).toLocaleDateString()}
                        </div>
                        <Link href={`/community-partnerships/${partnership.id}`}>
                          <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-black">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-400/30">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Want to Partner with Us?</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Join our growing network of partners and help us empower the next generation of developers.
              </p>
              <Link href="/partnerships">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3">
                  Become a Partner
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
