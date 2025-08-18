"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Handshake,
  Building,
  GraduationCap,
  Users,
  Star,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ArrowRight,
  Globe,
  Award,
  Target,
  Zap,
} from "lucide-react"
import PartnershipSlider from "@/components/partnership-slider"

export default function PartnershipsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    partnershipType: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Partnership application submitted:", formData)
    // In production, this would send data to your backend
  }

  const partnershipTypes = [
    {
      title: "Corporate Partnership",
      description: "Partner with us to provide internships, jobs, and mentorship opportunities",
      icon: Building,
      benefits: ["Brand visibility", "Access to talent pool", "CSR opportunities", "Networking events"],
      color: "border-blue-400 text-blue-400",
    },
    {
      title: "Educational Partnership",
      description: "Collaborate with educational institutions to enhance learning experiences",
      icon: GraduationCap,
      benefits: ["Curriculum development", "Guest lectures", "Student projects", "Research collaboration"],
      color: "border-green-400 text-green-400",
    },
    {
      title: "Community Partnership",
      description: "Join our community initiatives and help grow the coding ecosystem",
      icon: Users,
      benefits: ["Community events", "Workshops", "Hackathons", "Knowledge sharing"],
      color: "border-purple-400 text-purple-400",
    },
  ]

  const currentPartners = [
    {
      name: "Amazon Web Services",
      logo: "/images/partners/aws-new.webp",
      description: "Cloud computing platform providing scalable infrastructure solutions",
      website: "https://aws.amazon.com",
      partnership: "Corporate Partner",
    },
    {
      name: "Microsoft",
      logo: "/images/partners/microsoft-new.webp",
      description: "Technology corporation offering cloud services and developer tools",
      website: "https://microsoft.com",
      partnership: "Corporate Partner",
    },
    {
      name: "GitHub",
      logo: "/images/partners/github.png",
      description: "Development platform for version control and collaboration",
      website: "https://github.com",
      partnership: "Educational Partner",
    },
    {
      name: "NVIDIA",
      logo: "/images/partners/nvidia-new.png",
      description: "Computing platform company specializing in AI and graphics processing",
      website: "https://nvidia.com",
      partnership: "Technology Partner",
    },
    {
      name: "Dell Technologies",
      logo: "/images/partners/dell.png",
      description: "Technology company providing infrastructure solutions",
      website: "https://dell.com",
      partnership: "Hardware Partner",
    },
    {
      name: "IIT Bombay E-Cell",
      logo: "/images/partners/iit-bombay-ecell.png",
      description: "Entrepreneurship cell fostering innovation and startups",
      website: "https://ecell.in",
      partnership: "Educational Partner",
    },
  ]

  const clubBenefits = [
    "Access to exclusive workshops and masterclasses",
    "Direct mentorship from industry experts",
    "Priority access to job opportunities",
    "Networking events with top companies",
    "Free access to premium coding resources",
    "Certificate of completion for all programs",
    "24/7 community support and guidance",
    "Regular hackathons and coding competitions",
  ]

  const clubRequirements = [
    "Basic programming knowledge in any language",
    "Commitment to attend at least 80% of sessions",
    "Active participation in community discussions",
    "Willingness to help and mentor junior members",
    "Complete at least one project during the program",
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Partner with <span className="text-yellow-400">Apna Coding</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our mission to empower the next generation of developers. Together, we can create opportunities and
            build the future of technology.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span>Industry Recognition</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-400" />
              <span>Targeted Reach</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Innovation Focus</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Partnership Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Partnership Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {partnershipTypes.map((type, index) => {
              const Icon = type.icon
              return (
                <Card key={index} className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all group">
                  <CardHeader className="text-center">
                    <div className="mx-auto p-4 bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-yellow-400 transition-colors">
                      <Icon className="w-8 h-8 text-yellow-400 group-hover:text-black transition-colors" />
                    </div>
                    <CardTitle className="text-xl text-white group-hover:text-yellow-400 transition-colors">
                      {type.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-gray-300">{type.description}</p>
                    <div className="space-y-2">
                      {type.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Partnership Application Form */}
        <div className="mb-16">
          <Card className="bg-gray-900 border-gray-800 max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Apply for Partnership</CardTitle>
              <p className="text-gray-400">Tell us about your organization and partnership goals</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="organization">Organization Name</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="partnershipType">Partnership Type</Label>
                  <select
                    id="partnershipType"
                    value={formData.partnershipType}
                    onChange={(e) => setFormData({ ...formData, partnershipType: e.target.value })}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    required
                  >
                    <option value="">Select Partnership Type</option>
                    <option value="corporate">Corporate Partnership</option>
                    <option value="educational">Educational Partnership</option>
                    <option value="community">Community Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={4}
                    placeholder="Tell us about your partnership goals and how we can work together..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                  Submit Partnership Application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Apna Coding Club Section */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-yellow-400">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 bg-yellow-400 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-black" />
              </div>
              <CardTitle className="text-3xl text-white mb-2">Join Apna Coding Club</CardTitle>
              <p className="text-gray-300 text-lg">
                Exclusive membership program for serious developers and coding enthusiasts
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-4">Club Benefits</h3>
                  <div className="space-y-3">
                    {clubBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-4">Requirements</h3>
                  <div className="space-y-3">
                    {clubRequirements.map((requirement, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Button
                  onClick={() => window.open("https://forms.gle/your-club-form-link", "_blank")}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 text-lg"
                >
                  Apply for Club Membership
                  <ExternalLink className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Partners */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Current Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPartners.map((partner, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all group">
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-white rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <img
                      src={partner.logo || "/placeholder.svg"}
                      alt={`${partner.name} logo`}
                      className="max-w-16 max-h-16 object-contain"
                    />
                  </div>
                  <CardTitle className="text-lg text-white group-hover:text-yellow-400 transition-colors">
                    {partner.name}
                  </CardTitle>
                  <Badge variant="outline" className="border-yellow-400 text-yellow-400 w-fit mx-auto">
                    {partner.partnership}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-gray-300 text-sm">{partner.description}</p>
                  <Button
                    onClick={() => window.open(partner.website, "_blank")}
                    variant="outline"
                    className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  >
                    Visit Website
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Partnership Slider */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Partnership Showcase</h2>
          <PartnershipSlider />
        </div>

        {/* Contact Information */}
        <div className="mb-16">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Get in Touch</CardTitle>
              <p className="text-gray-400">Ready to partner with us? Let's discuss opportunities</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="space-y-4">
                  <div className="mx-auto p-4 bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Email Us</h3>
                    <p className="text-gray-300">partnerships@apnacoding.com</p>
                    <Button
                      onClick={() => window.open("mailto:partnerships@apnacoding.com", "_blank")}
                      variant="outline"
                      className="mt-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    >
                      Send Email
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="mx-auto p-4 bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center">
                    <Phone className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Call Us</h3>
                    <p className="text-gray-300">+91 98765 43210</p>
                    <Button
                      onClick={() => window.open("tel:+919876543210", "_blank")}
                      variant="outline"
                      className="mt-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    >
                      Call Now
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="mx-auto p-4 bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Visit Us</h3>
                    <p className="text-gray-300">Mumbai, Maharashtra, India</p>
                    <Button
                      onClick={() => window.open("https://maps.google.com/?q=Mumbai,Maharashtra,India", "_blank")}
                      variant="outline"
                      className="mt-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    >
                      Get Directions
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-400">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Make an Impact?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join our growing network of partners and help shape the future of coding education in India.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.open("/community-partnerships", "_self")}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 text-lg"
                >
                  View Current Partners
                  <Globe className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => window.open("https://forms.gle/partnership-application", "_blank")}
                  variant="outline"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3 text-lg"
                >
                  Apply Now
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
