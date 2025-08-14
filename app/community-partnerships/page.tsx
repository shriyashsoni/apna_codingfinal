"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Users, MapPin, ExternalLink, Filter } from "lucide-react"
import { getCommunityPartners, type CommunityPartner } from "@/lib/supabase"

export default function CommunityPartnershipsPage() {
  const [partners, setPartners] = useState<CommunityPartner[]>([])
  const [filteredPartners, setFilteredPartners] = useState<CommunityPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    loadPartners()
  }, [])

  useEffect(() => {
    filterPartners()
  }, [partners, searchQuery, selectedCategory])

  const loadPartners = async () => {
    try {
      const { data, error } = await getCommunityPartners()
      if (error) {
        console.error("Error loading partners:", error)
        return
      }

      // Filter only active partners
      const activePartners = data?.filter((partner) => partner.status === "active") || []
      setPartners(activePartners)
    } catch (error) {
      console.error("Error loading partners:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPartners = () => {
    let filtered = partners

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (partner) =>
          partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          partner.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          partner.location?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((partner) => partner.category === selectedCategory)
    }

    setFilteredPartners(filtered)
  }

  const categories = ["All", ...Array.from(new Set(partners.map((p) => p.category)))]
  const totalMembers = partners.reduce((sum, partner) => sum + (partner.member_count || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading community partnerships...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-black"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Community <span className="text-yellow-500">Partnerships</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              We're proud to collaborate with {partners.length}+ amazing communities worldwide. Together, we're building
              a stronger, more connected developer ecosystem.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                <div className="text-3xl font-bold text-yellow-500">{partners.length}+</div>
                <div className="text-gray-400">Partner Communities</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                <div className="text-3xl font-bold text-yellow-500">{totalMembers.toLocaleString()}+</div>
                <div className="text-gray-400">Total Members</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                <div className="text-3xl font-bold text-yellow-500">{categories.length - 1}</div>
                <div className="text-gray-400">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 border-b border-yellow-500/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-yellow-500/20 text-white placeholder-gray-400 focus:border-yellow-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-900 border border-yellow-500/20 text-white rounded-md px-3 py-2 focus:border-yellow-500 focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredPartners.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No communities found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPartners.map((partner) => (
                <Card
                  key={partner.id}
                  className="bg-gray-900 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center overflow-hidden">
                          {partner.logo_url ? (
                            <Image
                              src={partner.logo_url || "/placeholder.svg"}
                              alt={partner.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-yellow-500 rounded text-black font-bold flex items-center justify-center">
                              {partner.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">
                            {partner.name}
                          </h3>
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            {partner.category}
                          </Badge>
                        </div>
                      </div>
                      {partner.is_featured && <Badge className="bg-yellow-500 text-black">Featured</Badge>}
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">{partner.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      {partner.member_count && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{partner.member_count.toLocaleString()}</span>
                        </div>
                      )}
                      {partner.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{partner.location}</span>
                        </div>
                      )}
                    </div>

                    {partner.website_url && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/40 bg-transparent"
                      >
                        <Link href={partner.website_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit Community
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-500/10 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Partner With Us?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our growing network of community partners and help us build the future of developer education together.
          </p>
          <Button asChild size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
