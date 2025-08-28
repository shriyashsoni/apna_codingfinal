"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, MessageCircle, Globe, Github, Star, ArrowRight, Heart, Zap, Target, Award } from "lucide-react"

interface CommunityData {
  stats: {
    activeMembers: number
    dailyDiscussions: number
    successStories: number
    countries: number
  }
  platforms: Array<{
    id: string
    name: string
    memberCount: number
    description: string
    link: string
    features: string[]
  }>
  testimonials: Array<{
    id: string
    name: string
    role: string
    content: string
    rating: number
  }>
}

export default function CommunityPage() {
  const [communityData, setCommunityData] = useState<CommunityData>({
    stats: {
      activeMembers: 50000,
      dailyDiscussions: 1200,
      successStories: 2500,
      countries: 85,
    },
    platforms: [
      {
        id: "1",
        name: "WhatsApp Community",
        memberCount: 25000,
        description: "Join our active WhatsApp community for daily coding discussions and instant help",
        link: "https://chat.whatsapp.com/HqVg4ctR6QKJnfvemsEQ8H?mode=ac_t",
        features: ["Instant Help", "Daily Challenges", "Job Updates", "Project Sharing"],
      },
      {
        id: "2",
        name: "Telegram Channel",
        memberCount: 15000,
        description: "Get latest updates, resources, and announcements on our Telegram channel",
        link: "https://t.me/apnacodingtech",
        features: ["Latest Updates", "Resources", "Announcements", "Tech News"],
      },
      {
        id: "3",
        name: "Discord Server",
        memberCount: 8000,
        description: "Voice chats, screen sharing, and collaborative coding sessions",
        link: "https://discord.gg/krffBfBF",
        features: ["Voice Chats", "Screen Sharing", "Code Reviews", "Study Groups"],
      },
      {
        id: "4",
        name: "GitHub Community",
        memberCount: 12000,
        description: "Contribute to open source projects and showcase your coding skills",
        link: "https://github.com/APNA-CODING-BY-APNA-COUNSELLOR",
        features: ["Open Source", "Code Collaboration", "Project Showcase", "Mentorship"],
      },
    ],
    testimonials: [
      {
        id: "1",
        name: "Rahul Sharma",
        role: "Software Engineer at Google",
        content:
          "Apna Coding community helped me land my dream job at Google. The support and resources are incredible!",
        rating: 5,
      },
      {
        id: "2",
        name: "Priya Patel",
        role: "Full Stack Developer",
        content: "The daily coding challenges and peer support made learning so much easier. Highly recommend!",
        rating: 5,
      },
      {
        id: "3",
        name: "Arjun Singh",
        role: "Startup Founder",
        content: "Found my co-founder and initial team members through this amazing community. Thank you!",
        rating: 5,
      },
    ],
  })

  useEffect(() => {
    loadCommunityData()
  }, [])

  const loadCommunityData = () => {
    const savedData = localStorage.getItem("communityData")
    if (savedData) {
      setCommunityData(JSON.parse(savedData))
    }
  }

  const getPlatformIcon = (name: string) => {
    if (name.toLowerCase().includes("whatsapp")) return MessageCircle
    if (name.toLowerCase().includes("telegram")) return MessageCircle
    if (name.toLowerCase().includes("discord")) return MessageCircle
    if (name.toLowerCase().includes("github")) return Github
    return Globe
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Join Our <span className="text-gradient">Community</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect with thousands of developers, share knowledge, get help, and grow together in our vibrant coding
            community.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-400" />
              <span>{communityData.stats.activeMembers.toLocaleString()}+ Active Members</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-yellow-400" />
              <span>{communityData.stats.dailyDiscussions.toLocaleString()}+ Daily Discussions</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span>{communityData.stats.successStories.toLocaleString()}+ Success Stories</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-yellow-400" />
              <span>{communityData.stats.countries}+ Countries</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Community Stats */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="card-glass hover:border-yellow-400/50 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-bold text-white mb-2">
                  {communityData.stats.activeMembers.toLocaleString()}+
                </h3>
                <p className="text-gray-300">Active Members</p>
              </CardContent>
            </Card>

            <Card className="card-glass hover:border-yellow-400/50 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-bold text-white mb-2">
                  {communityData.stats.dailyDiscussions.toLocaleString()}+
                </h3>
                <p className="text-gray-300">Daily Discussions</p>
              </CardContent>
            </Card>

            <Card className="card-glass hover:border-yellow-400/50 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-bold text-white mb-2">
                  {communityData.stats.successStories.toLocaleString()}+
                </h3>
                <p className="text-gray-300">Success Stories</p>
              </CardContent>
            </Card>

            <Card className="card-glass hover:border-yellow-400/50 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <Globe className="w-12 h-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-bold text-white mb-2">{communityData.stats.countries}+</h3>
                <p className="text-gray-300">Countries</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Community Platforms */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Join Our Platforms</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose your preferred platform and start connecting with fellow developers today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {communityData.platforms.map((platform) => {
              const IconComponent = getPlatformIcon(platform.name)
              return (
                <Card
                  key={platform.id}
                  className="card-glass hover:border-yellow-400/50 transition-all duration-300 group card-hover"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-yellow-400 rounded-lg">
                        <IconComponent className="w-8 h-8 text-black" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl group-hover:text-yellow-400 transition-colors">
                          {platform.name}
                        </CardTitle>
                        <p className="text-gray-300 text-sm">{platform.memberCount.toLocaleString()} members</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">{platform.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {platform.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      onClick={() => window.open(platform.link, "_blank")}
                      className="w-full btn-primary group-hover:scale-105 transition-transform"
                    >
                      Join {platform.name}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Community Benefits */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Why Join Our Community?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover the benefits of being part of our thriving developer community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-glass hover:border-yellow-400/50 transition-all duration-300 group card-hover">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Instant Help</h3>
                <p className="text-gray-300">
                  Get quick answers to your coding questions from experienced developers 24/7
                </p>
              </CardContent>
            </Card>

            <Card className="card-glass hover:border-yellow-400/50 transition-all duration-300 group card-hover">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Career Growth</h3>
                <p className="text-gray-300">
                  Access job opportunities, interview tips, and career guidance from industry experts
                </p>
              </CardContent>
            </Card>

            <Card className="card-glass hover:border-yellow-400/50 transition-all duration-300 group card-hover">
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Networking</h3>
                <p className="text-gray-300">
                  Connect with like-minded developers, find collaborators, and build lasting relationships
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Community Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">What Our Members Say</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Hear from developers who have transformed their careers through our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {communityData.testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="card-glass hover:border-yellow-400/50 transition-all duration-300 group card-hover"
              >
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-300">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="card-glass border-yellow-400/30">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Join?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Start your journey with thousands of developers who are already growing their careers with us
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.open(communityData.platforms[0]?.link, "_blank")}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  Join WhatsApp Community
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => window.open(communityData.platforms[1]?.link, "_blank")}
                  className="btn-secondary px-8 py-3 text-lg"
                >
                  Join Telegram Channel
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
