"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MessageCircle, Github, Send, Users, TrendingUp, Award, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CommunityPlatform {
  id: string
  name: string
  members: string
  description: string
  link: string
  color: string
  features: string[]
}

interface CommunityStat {
  id: string
  value: string
  label: string
  description: string
}

interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  avatar: string
}

const CommunityPage = () => {
  const [platforms, setPlatforms] = useState<CommunityPlatform[]>([
    {
      id: "1",
      name: "WhatsApp",
      members: "5,000+",
      description: "Get instant updates, announcements, and quick community interactions",
      link: "https://chat.whatsapp.com/HqVg4ctR6QKJnfvemsEQ8H?mode=ac_t",
      color: "bg-green-500",
      features: ["Instant Updates", "Quick Help", "Announcements", "Community Chat"],
    },
    {
      id: "2",
      name: "Telegram",
      members: "500+",
      description: "Join our growing Telegram community for coding discussions and updates",
      link: "https://t.me/apnacodingtech",
      color: "bg-blue-500",
      features: ["Coding Discussions", "Tech Updates", "File Sharing", "Group Chat"],
    },
    {
      id: "3",
      name: "Discord",
      members: "200+",
      description: "Join our main community hub for real-time discussions, coding help, and networking",
      link: "https://discord.gg/krffBfBF",
      color: "bg-indigo-500",
      features: ["Voice Channels", "Screen Sharing", "Study Groups", "Live Events"],
    },
    {
      id: "4",
      name: "GitHub",
      members: "100+",
      description: "Collaborate on open-source projects, share code, and contribute to the community",
      link: "https://github.com/APNA-CODING-BY-APNA-COUNSELLOR",
      color: "bg-gray-800",
      features: ["Open Source", "Code Reviews", "Project Collaboration", "Portfolio Building"],
    },
  ])

  const [stats, setStats] = useState<CommunityStat[]>([
    {
      id: "1",
      value: "5,800+",
      label: "Active Members",
      description: "Growing community of developers",
    },
    {
      id: "2",
      value: "50+",
      label: "Daily Discussions",
      description: "Active conversations every day",
    },
    {
      id: "3",
      value: "100+",
      label: "Success Stories",
      description: "Members who got placed",
    },
    {
      id: "4",
      value: "25+",
      label: "Countries",
      description: "Global community reach",
    },
  ])

  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: "1",
      name: "Rahul Sharma",
      role: "Software Engineer at Google",
      content:
        "The Apna Coding community helped me land my dream job. The support and guidance I received was incredible!",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: "2",
      name: "Priya Patel",
      role: "Full Stack Developer",
      content:
        "Amazing community with helpful mentors. The coding challenges and discussions really improved my skills.",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: "3",
      name: "Arjun Kumar",
      role: "Data Scientist at Microsoft",
      content: "From beginner to professional - this community supported me throughout my journey. Highly recommended!",
      avatar: "/placeholder-user.jpg",
    },
  ])

  useEffect(() => {
    // Load real-time data from localStorage (in a real app, this would be from an API)
    const savedData = localStorage.getItem("communityData")
    if (savedData) {
      const { platforms: savedPlatforms, stats: savedStats, testimonials: savedTestimonials } = JSON.parse(savedData)
      setPlatforms(savedPlatforms)
      setStats(savedStats)
      setTestimonials(savedTestimonials)
    }
  }, [])

  const getIcon = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case "whatsapp":
        return <MessageCircle key="whatsapp-icon" className="w-8 h-8" />
      case "telegram":
        return <Send key="telegram-icon" className="w-8 h-8" />
      case "discord":
        return <MessageCircle key="discord-icon" className="w-8 h-8" />
      case "github":
        return <Github key="github-icon" className="w-8 h-8" />
      default:
        return <MessageCircle key="default-icon" className="w-8 h-8" />
    }
  }

  const getStatIcon = (index: number) => {
    const icons = [
      <Users key="users-icon" className="w-6 h-6" />,
      <TrendingUp key="trending-up-icon" className="w-6 h-6" />,
      <Award key="award-icon" className="w-6 h-6" />,
      <Globe key="globe-icon" className="w-6 h-6" />,
    ]
    return icons[index] || <Users key="default-stat-icon" className="w-6 h-6" />
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              {stats[0]?.value || "5,800+"} Active Members
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Join Our <span className="text-white">Coding Community</span>
            </h1>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              Connect with like-minded developers, get coding help, participate in discussions, and grow your career
              with our supportive community across multiple platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
                <a
                  href={platforms[0]?.link || "https://chat.whatsapp.com/HqVg4ctR6QKJnfvemsEQ8H?mode=ac_t"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join {platforms[0]?.name || "WhatsApp"} Community
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-black bg-transparent"
              >
                <a href={platforms[1]?.link || "https://t.me/apnacodingtech"} target="_blank" rel="noopener noreferrer">
                  Join {platforms[1]?.name || "Telegram"}
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-3 text-white">{getStatIcon(index)}</div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm font-medium text-white mb-1">{stat.label}</div>
                    <div className="text-xs text-white/80">{stat.description}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Platforms */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your <span className="text-white">Platform</span>
            </h2>
            <p className="text-white text-lg max-w-2xl mx-auto">
              Join us on your preferred platform and become part of our growing community of developers and tech
              enthusiasts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-3 rounded-lg ${platform.color} text-white`}>{getIcon(platform.name)}</div>
                      <Badge className="bg-white/20 text-white border-white/30">{platform.members} Members</Badge>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3">{platform.name}</h3>
                    <p className="text-white mb-6">{platform.description}</p>

                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {platform.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-sm text-white">
                          <div className="w-1.5 h-1.5 bg-white rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <Button asChild className="w-full bg-white text-black hover:bg-gray-100">
                      <a href={platform.link} target="_blank" rel="noopener noreferrer">
                        Join {platform.name}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our <span className="text-white">Community Says</span>
            </h2>
            <p className="text-white text-lg">Real stories from our community members who achieved their goals</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <p className="text-white mb-4 italic">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-white font-medium">{testimonial.name}</div>
                        <div className="text-white/80 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="bg-white/20 backdrop-blur-sm border-white/30">
              <CardContent className="p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Join Our Community?</h2>
                <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
                  Start your journey with thousands of developers who are learning, growing, and succeeding together.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
                    <a
                      href={platforms[0]?.link || "https://chat.whatsapp.com/HqVg4ctR6QKJnfvemsEQ8H?mode=ac_t"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join {platforms[0]?.name || "WhatsApp"} ({platforms[0]?.members || "5,000+"} Members)
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-black bg-transparent"
                  >
                    <a
                      href={platforms[1]?.link || "https://t.me/apnacodingtech"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join {platforms[1]?.name || "Telegram"} ({platforms[1]?.members || "500+"} Members)
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default CommunityPage
