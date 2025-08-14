"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { getCommunityPartners, type CommunityPartner } from "@/lib/supabase"

export default function Footer() {
  const [featuredPartners, setFeaturedPartners] = useState<CommunityPartner[]>([])

  useEffect(() => {
    loadFeaturedPartners()
  }, [])

  const loadFeaturedPartners = async () => {
    try {
      const { data } = await getCommunityPartners()
      const featured = data?.filter((partner) => partner.is_featured && partner.status === "active").slice(0, 6) || []
      setFeaturedPartners(featured)
    } catch (error) {
      console.error("Error loading featured partners:", error)
    }
  }

  const footerSections = [
    {
      title: "Learn",
      links: [
        { name: "Courses", href: "/courses" },
        { name: "Hackathons", href: "/hackathons" },
        { name: "AI Tools", href: "/ai-tools" },
        { name: "Community", href: "/community" },
      ],
    },
    {
      title: "Career",
      links: [
        { name: "Job Board", href: "/jobs" },
        { name: "Interview Prep", href: "/interview-prep" },
        { name: "Resume Builder", href: "/resume-builder" },
        { name: "Career Guidance", href: "/career-guidance" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Blog", href: "/blog" },
        { name: "Careers", href: "/careers" },
      ],
    },
    {
      title: "Partnerships",
      links: [
        { name: "Become a Partner", href: "/partnerships" },
        { name: "Community Partners", href: "/community-partnerships" },
        { name: "Corporate Training", href: "/corporate-training" },
        { name: "University Program", href: "/university-program" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
      ],
    },
  ]

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/apnacoding" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/apnacoding" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/apnacoding" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/apnacoding" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/apnacoding" },
  ]

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      {/* Featured Partners Section */}
      {featuredPartners.length > 0 && (
        <div className="border-b border-gray-800 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Trusted by Leading Communities</h3>
              <p className="text-gray-400 text-sm">Join 350+ community partners worldwide</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
              {featuredPartners.map((partner) => (
                <div key={partner.id} className="flex items-center justify-center">
                  <Image
                    src={partner.logo_url || "/placeholder.svg"}
                    alt={partner.name}
                    width={80}
                    height={40}
                    className="h-8 w-auto object-contain filter grayscale hover:grayscale-0 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image src="/logo.png" alt="Apna Coding" width={40} height={40} className="rounded-lg" />
              <span className="text-xl font-bold text-white">Apna Coding</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Empowering developers worldwide with cutting-edge courses, hackathons, and career opportunities. Join our
              community of 50,000+ learners.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">hello@apnacoding.com</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">Mumbai, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-white font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-400 text-sm">Get the latest courses, hackathons, and job opportunities.</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:border-yellow-400 flex-1 md:w-64"
              />
              <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-r-lg font-semibold transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2024 Apna Coding. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
