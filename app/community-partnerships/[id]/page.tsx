"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  Globe,
  Calendar,
  Star,
  CheckCircle,
  Share2,
  Building,
  GraduationCap,
  Briefcase,
  Heart,
  Handshake,
  Users,
  Award,
  Target,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

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

export default function PartnershipDetailPage() {
  const params = useParams()
  const [partnership, setPartnership] = useState<Partnership | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPartnership()
  }, [params.id])

  const loadPartnership = () => {
    // Load from localStorage for demo (in production, this would be from Supabase)
    const savedPartnerships = localStorage.getItem("communityPartnerships")
    if (savedPartnerships) {
      const allPartnerships = JSON.parse(savedPartnerships)
      const foundPartnership = allPartnerships.find((p: Partnership) => p.id === params.id)
      setPartnership(foundPartnership || null)
    }
    setLoading(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "educational":
        return GraduationCap
      case "corporate":
        return Building
      case "startup":
        return Briefcase
      case "nonprofit":
        return Heart
      default:
        return Handshake
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "educational":
        return "Educational"
      case "corporate":
        return "Corporate"
      case "startup":
        return "Startup"
      case "nonprofit":
        return "Non-Profit"
      default:
        return "General"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "educational":
        return "border-blue-400 text-blue-400 bg-blue-400/10"
      case "corporate":
        return "border-purple-400 text-purple-400 bg-purple-400/10"
      case "startup":
        return "border-green-400 text-green-400 bg-green-400/10"
      case "nonprofit":
        return "border-pink-400 text-pink-400 bg-pink-400/10"
      default:
        return "border-yellow-400 text-yellow-400 bg-yellow-400/10"
    }
  }

  const sharePartnership = () => {
    if (navigator.share && partnership) {
      navigator.share({
        title: partnership.title,
        text: partnership.description,
        url: window.location.href,
      })
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-64 mb-8"></div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 h-96"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!partnership) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Partnership Not Found</h1>
          <p className="text-gray-400 mb-8">The partnership you're looking for doesn't exist or has been removed.</p>
          <Link href="/community-partnerships">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Partnerships
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const TypeIcon = getTypeIcon(partnership.partnership_type)

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/community-partnerships">
            <Button variant="outline" className="border-gray-600 text-gray-400 hover:bg-gray-800 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Partnerships
            </Button>
          </Link>
        </div>

        {/* Partnership Header */}
        <Card className="bg-gray-900 border-gray-800 mb-8 overflow-hidden">
          {partnership.partnership_photo && (
            <div className="relative h-64 md:h-80">
              <img
                src={partnership.partnership_photo || "/placeholder.svg"}
                alt={partnership.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              {partnership.featured && (
                <div className="absolute top-6 right-6">
                  <Badge className="bg-yellow-400 text-black">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}
              {partnership.partner_logo && (
                <div className="absolute bottom-6 left-6">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                    <img
                      src={partnership.partner_logo || "/placeholder.svg"}
                      alt={`${partnership.partner_name} logo`}
                      className="max-w-14 max-h-14 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <TypeIcon className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl text-white mb-2">{partnership.title}</CardTitle>
                  <p className="text-gray-400 text-lg">{partnership.partner_name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={`${getTypeColor(partnership.partnership_type)}`}>
                      {getTypeLabel(partnership.partnership_type)}
                    </Badge>
                    {partnership.featured && (
                      <Badge className="bg-yellow-400 text-black">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={sharePartnership}
                  variant="outline"
                  className="border-gray-600 text-gray-400 hover:bg-gray-800 bg-transparent"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                {partnership.partner_website && (
                  <Button
                    onClick={() => window.open(partnership.partner_website, "_blank")}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-gray-300 text-lg leading-relaxed">{partnership.description}</p>

            {partnership.partnership_date && (
              <div className="flex items-center gap-2 mt-4 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Partnership established: {new Date(partnership.partnership_date).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Partnership Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partnership.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact & Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Contact Information */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-yellow-400" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {partnership.contact_person && (
                <div>
                  <p className="text-gray-400 text-sm">Contact Person</p>
                  <p className="text-white">{partnership.contact_person}</p>
                </div>
              )}
              {partnership.contact_email && (
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <Button
                    onClick={() => window.open(`mailto:${partnership.contact_email}`, "_blank")}
                    variant="outline"
                    className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white mt-2"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {partnership.contact_email}
                  </Button>
                </div>
              )}
              {partnership.partner_website && (
                <div>
                  <p className="text-gray-400 text-sm">Website</p>
                  <Button
                    onClick={() => window.open(partnership.partner_website, "_blank")}
                    variant="outline"
                    className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black mt-2"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Links & Tags */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-400" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(partnership.social_links).length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Social Links</p>
                  <div className="flex gap-2">
                    {Object.entries(partnership.social_links).map(([platform, url]) => (
                      <Button
                        key={platform}
                        onClick={() => window.open(url, "_blank")}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-400 hover:bg-gray-800 capitalize"
                      >
                        {platform}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {partnership.tags.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {partnership.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600 text-gray-400">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-400">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Interested in This Partnership?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Take advantage of this exclusive partnership opportunity and accelerate your coding journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {partnership.partner_website && (
                <Button
                  onClick={() => window.open(partnership.partner_website, "_blank")}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3"
                >
                  Get Started
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}
              {partnership.contact_email && (
                <Button
                  onClick={() => window.open(`mailto:${partnership.contact_email}`, "_blank")}
                  variant="outline"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-6 py-3"
                >
                  Contact Partner
                  <Mail className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related Partnerships */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Explore More Partnerships</h2>
          <Link href="/community-partnerships">
            <Button
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3 bg-transparent"
            >
              <Users className="w-4 h-4 mr-2" />
              View All Partnerships
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
