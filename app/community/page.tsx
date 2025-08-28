"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Users,
  MessageCircle,
  Globe,
  ArrowRight,
  ExternalLink,
  Calendar,
  Code,
  Zap,
  Heart,
  Trophy,
  Target,
  Rocket,
  BookOpen,
  Coffee,
  Handshake,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CommunityPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const communityStats = [
    {
      icon: Users,
      label: "Active Members",
      value: "20,000+",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: MessageCircle,
      label: "Daily Discussions",
      value: "1,200+",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Handshake,
      label: "Partnerships",
      value: "50+",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Globe,
      label: "Countries",
      value: "10+",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
  ]

  const platforms = [
    {
      name: "WhatsApp",
      description: "Join our WhatsApp community for instant updates and quick discussions",
      members: "6,000+",
      icon: "💬",
      color: "bg-green-500",
      link: "https://chat.whatsapp.com/your-whatsapp-link",
    },
    {
      name: "Telegram",
      description: "Connect with developers worldwide in our Telegram channel",
      members: "400+",
      icon: "✈️",
      color: "bg-blue-500",
      link: "https://t.me/your-telegram-channel",
    },
    {
      name: "Discord",
      description: "Real-time voice and text chat with fellow developers",
      members: "Join Now",
      icon: "🎮",
      color: "bg-indigo-500",
      link: "https://discord.gg/your-discord-server",
    },
  ]

  const benefits = [
    {
      icon: Code,
      title: "Learn Together",
      description: "Collaborate on projects, share code, and learn from experienced developers",
    },
    {
      icon: Trophy,
      title: "Competitions & Hackathons",
      description: "Participate in coding competitions and hackathons to showcase your skills",
    },
    {
      icon: BookOpen,
      title: "Resources & Tutorials",
      description: "Access exclusive learning materials, tutorials, and coding resources",
    },
    {
      icon: Coffee,
      title: "Networking",
      description: "Connect with like-minded developers and build lasting professional relationships",
    },
    {
      icon: Target,
      title: "Career Opportunities",
      description: "Get access to job postings, internships, and career guidance",
    },
    {
      icon: Rocket,
      title: "Project Collaboration",
      description: "Find team members for your projects and contribute to open source",
    },
  ]

  const events = [
    {
      title: "Weekly Code Review Sessions",
      description: "Join our weekly sessions where we review and improve code together",
      time: "Every Friday, 7 PM IST",
      type: "Regular",
    },
    {
      title: "Monthly Tech Talks",
      description: "Industry experts share insights on latest technologies and trends",
      time: "First Saturday of every month",
      type: "Monthly",
    },
    {
      title: "Coding Bootcamps",
      description: "Intensive learning sessions on specific technologies and frameworks",
      time: "Quarterly",
      type: "Special",
    },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-blue-500/10" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Join Our{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Community
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Connect with thousands of passionate developers, share knowledge, and grow together in the world's most
              supportive coding community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-4 text-lg">
                <Users className="w-5 h-5 mr-2" />
                Join Community
              </Button>
              <Button
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 text-lg bg-transparent"
              >
                <Calendar className="w-5 h-5 mr-2" />
                View Events
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {communityStats.map((stat, index) => (
              <Card key={index} className="bg-gray-900/30 border-gray-800 backdrop-blur-sm text-center">
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${stat.bgColor} mb-4`}
                  >
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Join Platforms */}
      <section className="py-16 bg-gray-900/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Choose Your Platform</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join us on your preferred platform and start connecting with fellow developers today.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300 group h-full">
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-4">{platform.icon}</div>
                    <CardTitle className="text-white text-2xl mb-2">{platform.name}</CardTitle>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${platform.color}`}
                    >
                      {platform.members} Members
                    </div>
                  </CardHeader>
                  <CardContent className="text-center flex-1 flex flex-col">
                    <p className="text-gray-300 mb-6 flex-1">{platform.description}</p>
                    <Button
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold group-hover:scale-105 transition-transform"
                      onClick={() => window.open(platform.link, "_blank")}
                    >
                      Join {platform.name}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Why Join Our Community?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover the amazing benefits of being part of our thriving developer community.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
              >
                <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-yellow-400/10 p-3 rounded-lg mr-4">
                        <benefit.icon className="w-6 h-6 text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">{benefit.title}</h3>
                    </div>
                    <p className="text-gray-300">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Events */}
      <section className="py-16 bg-gray-900/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Community Events</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Participate in regular events designed to help you learn, network, and grow as a developer.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
              >
                <Card className="bg-gray-900/30 border-gray-800 backdrop-blur-sm h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-yellow-400 text-black font-semibold">{event.type}</Badge>
                    </div>
                    <CardTitle className="text-white">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{event.description}</p>
                    <div className="flex items-center text-yellow-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">{event.time}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-400/10 to-orange-500/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Heart className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already part of our amazing community. Your coding journey starts
              here!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-4 text-lg">
                <Zap className="w-5 h-5 mr-2" />
                Join Now
              </Button>
              <Link href="/events">
                <Button
                  variant="outline"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 text-lg bg-transparent"
                >
                  Explore Events
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
