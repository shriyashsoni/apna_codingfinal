"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Users, Building, Code, GraduationCap, Rocket, Heart, Globe, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCommunityPartners, type CommunityPartner } from "@/lib/supabase"

const categories = [
  { id: "all", name: "All Partners", icon: Globe },
  { id: "tech-communities", name: "Tech Communities", icon: Code },
  { id: "student-organizations", name: "Student Organizations", icon: GraduationCap },
  { id: "developer-groups", name: "Developer Groups", icon: Users },
  { id: "startup-communities", name: "Startup Communities", icon: Rocket },
  { id: "educational-institutions", name: "Educational Institutions", icon: Building },
  { id: "open-source-projects", name: "Open Source Projects", icon: Heart },
]

export default function CommunityPartnerships() {
  const [partners, setPartners] = useState<CommunityPartner[]>([])
  const [filteredPartners, setFilteredPartners] = useState<CommunityPartner[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPartners()
  }, [])

  useEffect(() => {
    filterPartners()
  }, [partners, selectedCategory, searchQuery])

  const loadPartners = async () => {
    try {
      const { data } = await getCommunityPartners()
      setPartners(data || [])
    } catch (error) {
      console.error("Error loading partners:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPartners = () => {
    let filtered = partners.filter((partner) => partner.status === "active")

    if (selectedCategory !== "all") {
      filtered = filtered.filter((partner) => partner.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (partner) =>
          partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          partner.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredPartners(filtered)
  }

  const featuredPartners = partners.filter((partner) => partner.is_featured && partner.status === "active")

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading community partners...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Community <span className="text-yellow-400">Partnerships</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Connecting with 350+ communities worldwide to empower developers, students, and tech enthusiasts
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <div className="text-3xl font-bold text-yellow-400">350+</div>
                <div className="text-gray-300">Community Partners</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <div className="text-3xl font-bold text-yellow-400">50K+</div>
                <div className="text-gray-300">Active Members</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <div className="text-3xl font-bold text-yellow-400">25+</div>
                <div className="text-gray-300">Countries</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Partners */}
      {featuredPartners.length > 0 && (
        <section className="py-16 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Featured Partners</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {featuredPartners.map((partner) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <Image
                    src={partner.logo_url || "/placeholder.svg"}
                    alt={partner.name}
                    width={120}
                    height={80}
                    className="w-full h-20 object-contain"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filter */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`${
                      selectedCategory === category.id
                        ? "bg-yellow-400 text-black hover:bg-yellow-500"
                        : "border-gray-600 text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {selectedCategory === "all" ? "All Partners" : categories.find((c) => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-gray-400">
              {filteredPartners.length} {filteredPartners.length === 1 ? "partner" : "partners"} found
            </p>
          </div>

          {filteredPartners.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No partners found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPartners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-colors h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center">
                          <Image
                            src={partner.logo_url || "/placeholder.svg"}
                            alt={partner.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        {partner.is_featured && <Badge className="bg-yellow-400 text-black">Featured</Badge>}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{partner.name}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{partner.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {categories.find((c) => c.id === partner.category)?.name || partner.category}
                        </Badge>
                        {partner.website_url && (
                          <Link
                            href={partner.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                          >
                            Visit →
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Partnership CTA */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-black mb-6">Join Our Community Network</h2>
          <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
            Partner with us to reach thousands of developers and tech enthusiasts. Let's build the future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/partnerships">
              <Button size="lg" className="bg-black text-white hover:bg-gray-800">
                Become a Partner
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
