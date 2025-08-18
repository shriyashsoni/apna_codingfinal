"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Mail,
  User,
  Building,
  GraduationCap,
  Heart,
  Briefcase,
  Users,
  Star,
  CheckCircle,
  Share2,
  Twitter,
  Linkedin,
  Globe,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

export default function PartnershipDetailPage() {
  const params = useParams()
  const router = useRouter()
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
    } else {
      // Default partnerships
      const defaultPartnerships: Partnership[] = [
        {
          id: "1",
          title: "AWS Cloud Credits Program",
          description:
            "Get up to $10,000 in AWS credits for your startup or project. Perfect for students and developers looking to build scalable applications in the cloud. This comprehensive program provides not only credits but also technical support, training resources, and mentorship opportunities to help you succeed in your cloud journey.",
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
            "Access to AWS Events",
            "Priority Support Queue",
            "Free SSL Certificates",
          ],
          contact_email: "partnerships@aws.com",
          contact_person: "AWS Startup Team",
          partnership_date: "2024-01-15",
          partnership_photo: "/images/partnerships/aws-event.jpg",
          social_links: {
            twitter: "https://twitter.com/awscloud",
            linkedin: "https://linkedin.com/company/amazon-web-services",
            website: "https://aws.amazon.com",
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
            "Access to premium developer tools and services worth over $200k. Includes free GitHub Pro, domain names, cloud hosting, and much more. This pack is designed specifically for students to learn and build amazing projects without worrying about costs.",
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
            "Code Analysis Tools",
            "CI/CD Pipeline Access",
            "Learning Resources",
          ],
          contact_email: "education@github.com",
          contact_person: "GitHub Education Team",
          partnership_date: "2024-01-10",
          partnership_photo: "/images/partnerships/github-event.jpg",
          social_links: {
            twitter: "https://twitter.com/github",
            linkedin: "https://linkedin.com/company/github",
            website: "https://github.com",
          },
          tags: ["education", "student", "developer", "tools", "github"],
          priority: 9,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
      const foundPartnership = defaultPartnerships.find((p) => p.id === params.id)
      setPartnership(foundPartnership || null)
    }
    setLoading(false)
  }

  const getPartnershipTypeIcon = (type: string) => {
    switch (type) {
      case "corporate":
        return <Building className="w-5 h-5" />
      case "educational":
        return <GraduationCap className="w-5 h-5" />
      case "startup":
        return <Briefcase className="w-5 h-5" />
      case "nonprofit":
        return <Heart className="w-5 h-5" />
      default:
        return <Users className="w-5 h-5" />
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: partnership?.title,
        text: partnership?.description,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-64 mb-8"></div>
            <div className="h-64 bg-gray-800 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              <div className="h-4 bg-gray-800 rounded w-2/3"></div>
            </div>
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

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Partnerships
          </Button>
        </motion.div>

        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Card className="bg-gray-900 border-gray-800 overflow-hidden mb-8">
            <div className="relative h-64 md:h-80">
              <Image
                src={partnership.image_url || partnership.partnership_photo || "/placeholder.svg?height=320&width=800"}
                alt={partnership.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                      <Image
                        src={partnership.partner_logo || "/placeholder.svg"}
                        alt={partnership.partner_name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{partnership.title}</h1>
                      <p className="text-gray-200">{partnership.partner_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {partnership.featured && (
                      <Badge className="bg-yellow-400 text-black">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge className={`${getPartnershipTypeColor(partnership.partnership_type)} border`}>
                      {getPartnershipTypeIcon(partnership.partnership_type)}
                      <span className="ml-1 capitalize">{partnership.partnership_type}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl text-white">About This Partnership</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">{partnership.description}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Benefits & Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {partnership.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {partnership.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-gray-700 text-gray-400">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {partnership.partner_website && (
                    <Button
                      onClick={() => window.open(partnership.partner_website, "_blank")}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Partner Website
                    </Button>
                  )}
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Partnership
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Partnership Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Partnership Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Partnership Date</p>
                      <p className="text-white">
                        {new Date(partnership.partnership_date || partnership.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {partnership.contact_person && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Contact Person</p>
                        <p className="text-white">{partnership.contact_person}</p>
                      </div>
                    </div>
                  )}
                  {partnership.contact_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Contact Email</p>
                        <a
                          href={`mailto:${partnership.contact_email}`}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          {partnership.contact_email}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Social Links */}
            {Object.keys(partnership.social_links).length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Social Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {partnership.social_links.twitter && (
                      <Button
                        onClick={() => window.open(partnership.social_links.twitter, "_blank")}
                        variant="outline"
                        className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </Button>
                    )}
                    {partnership.social_links.linkedin && (
                      <Button
                        onClick={() => window.open(partnership.social_links.linkedin, "_blank")}
                        variant="outline"
                        className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </Button>
                    )}
                    {partnership.social_links.website && (
                      <Button
                        onClick={() => window.open(partnership.social_links.website, "_blank")}
                        variant="outline"
                        className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-400/30">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Interested in This Partnership?</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Take advantage of this exclusive opportunity and join thousands of developers who are already benefiting
                from our partnerships.
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
        </motion.div>
      </div>
    </div>
  )
}
