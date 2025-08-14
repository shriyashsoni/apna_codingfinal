"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Users, Globe, ArrowLeft } from "lucide-react"
import { getCommunityPartners } from "@/lib/supabase"

interface CommunityPartner {
  id: string
  name: string
  logo_url?: string
  website_url: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export default function CommunityPartnershipsPage() {
  const [partners, setPartners] = useState<CommunityPartner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPartners()
  }, [])

  const loadPartners = async () => {
    try {
      const { data, error } = await getCommunityPartners()
      if (error) {
        console.error("Error loading community partners:", error)
      } else {
        setPartners(data || [])
      }
    } catch (error) {
      console.error("Error loading community partners:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white mt-4">Loading Community Partners...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Community <span className="text-yellow-400">Partnerships</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Meet our amazing community partners who help us build a stronger coding ecosystem together
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {partners.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-4">No Community Partners Yet</h2>
            <p className="text-gray-500">We're working on building partnerships with amazing communities.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Our <span className="text-purple-400">Community Partners</span>
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                These incredible communities and organizations work with us to provide better opportunities for
                developers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="text-center">
                        {partner.logo_url && (
                          <div className="mb-4">
                            <Image
                              src={partner.logo_url || "/placeholder.svg"}
                              alt={partner.name}
                              width={80}
                              height={80}
                              className="mx-auto rounded-lg object-contain"
                            />
                          </div>
                        )}
                        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                          {partner.name}
                        </h3>
                        <Button
                          asChild
                          variant="outline"
                          className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-transparent"
                        >
                          <a
                            href={partner.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center"
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            Visit Website
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-8 border border-gray-800">
            <h3 className="text-2xl font-bold mb-4">Want to Partner With Us?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join our community partnership program and help us create better opportunities for developers worldwide.
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link href="/partnerships">Learn More About Partnerships</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
