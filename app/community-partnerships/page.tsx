"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import FuturisticBackground from "@/components/futuristic-background"
import FloatingElements from "@/components/floating-elements"
import { getCommunityPartners, type CommunityPartner } from "@/lib/supabase"

export default function CommunityPartnershipsPage() {
  const [partners, setPartners] = useState<CommunityPartner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await getCommunityPartners()
        if (error) {
          console.error("Error fetching community partners:", error)
        } else {
          setPartners(data || [])
        }
      } catch (error) {
        console.error("Error fetching community partners:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPartners()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <FuturisticBackground />
      <FloatingElements />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Community
                </span>{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Partnerships
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Building stronger connections with amazing organizations that share our vision of empowering developers
              </p>
            </motion.div>
          </div>
        </section>

        {/* Partners Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            {loading ? (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <p className="mt-4 text-gray-400">Loading community partners...</p>
              </div>
            ) : partners.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-gray-400 mb-4">No Community Partners Yet</h3>
                <p className="text-gray-500">We're working on building amazing partnerships. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {partners.map((partner, index) => (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          {partner.logo_url && (
                            <div className="w-20 h-20 rounded-full bg-white p-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <img
                                src={partner.logo_url || "/placeholder.svg"}
                                alt={partner.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                            {partner.name}
                          </h3>
                          <a
                            href={partner.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            Visit Website
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-2xl p-12 border border-purple-500/20"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Want to Partner With Us?
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join our community of amazing partners and help us empower the next generation of developers
              </p>
              <Link href="/partnerships">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                  Become a Partner
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
