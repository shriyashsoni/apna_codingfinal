"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Code, Users, Trophy, Zap, Play, ChevronRight, Calendar, ExternalLink, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AnimatedCounter from "@/components/animated-counter"
import FloatingElements from "@/components/floating-elements"
import CodeAnimation from "@/components/code-animation"
import AIChatbot from "@/components/ai-chatbot"
import { getCurrentUser, getHackathons, type Hackathon } from "@/lib/supabase"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [featuredHackathons, setFeaturedHackathons] = useState<Hackathon[]>([])
  const [hackathonsLoading, setHackathonsLoading] = useState(true)

  useEffect(() => {
    setIsVisible(true)
    checkUser()
    loadFeaturedHackathons()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadFeaturedHackathons = async () => {
    try {
      const { data, error } = await getHackathons()
      if (error) {
        console.error("Error loading hackathons:", error)
        return
      }
      // Filter only featured hackathons and limit to 6
      const featured = (data || []).filter((hackathon) => hackathon.featured).slice(0, 6)
      setFeaturedHackathons(featured)
    } catch (error) {
      console.error("Error loading featured hackathons:", error)
    } finally {
      setHackathonsLoading(false)
    }
  }

  const handleStartLearning = () => {
    if (user) {
      // User is logged in, redirect to dashboard
      window.location.href = "/dashboard"
    } else {
      // User is not logged in, show auth modal or redirect to login
      const authModal = document.querySelector("[data-auth-modal]") as any
      if (authModal) {
        authModal.click()
      } else {
        // Fallback: redirect to a login page or show auth modal
        window.location.href = "/?auth=signup"
      }
    }
  }

  const createSlug = (hackathon: Hackathon) => {
    return (
      hackathon.slug || `${hackathon.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${hackathon.id.substring(0, 8)}`
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500 text-white"
      case "ongoing":
        return "bg-green-500 text-white"
      case "completed":
        return "bg-gray-500 text-white"
      case "cancelled":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const features = [
    {
      icon: Code,
      title: "AI-Powered Learning",
      description: "Learn coding with personalized AI mentorship and real-time feedback",
      color: "text-yellow-400",
    },
    {
      icon: Users,
      title: "Global Community",
      description: "Connect with developers worldwide and collaborate on projects",
      color: "text-yellow-400",
    },
    {
      icon: Trophy,
      title: "Epic Hackathons",
      description: "Participate in global hackathons with real rewards and recognition",
      color: "text-yellow-400",
    },
    {
      icon: Zap,
      title: "Career Opportunities",
      description: "Get hired by top companies through our verified job platform",
      color: "text-yellow-400",
    },
  ]

  const stats = [
    { number: 20000, label: "Active Developers", suffix: "+" },
    { number: 30, label: "Courses Available", suffix: "+" },
    { number: 50, label: "Hackathons Hosted", suffix: "+" },
    { number: 50, label: "Startup Partnerships", suffix: "+" },
  ]

  const partners = [
    { name: "GitHub", logo: "/images/partners/github.png" },
    { name: "NVIDIA", logo: "/images/partners/nvidia-new.png" },
    { name: "Microsoft", logo: "/images/partners/microsoft-new.webp" },
    { name: "IIT Bombay E-Cell", logo: "/images/partners/iit-bombay-ecell.png" },
    { name: "IIT Kharagpur E-Cell", logo: "/images/partners/iit-kharagpur-ecell.png" },
    { name: "IIT Hyderabad E-Cell", logo: "/images/partners/iit-hyderabad-ecell.png" },
    { name: "Dell", logo: "/images/partners/dell-small-business.png" },
    { name: "AWS", logo: "/images/partners/aws-new.webp" },
    { name: "MIT Orbit", logo: "/images/partners/mit-orbit.png" },
  ]

  return (
    <div className="min-h-screen relative">
      <FloatingElements />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className={`transition-all duration-1000 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}>
              <div className="inline-flex items-center bg-gray-900/30 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-gray-700/50">
                <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold mr-2">NEW</span>
                <span className="text-gray-300">Global Level Coding Community</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
                Build the Future of <span className="text-yellow-400">Coding</span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join the world's most advanced coding community. Learn with AI mentorship, compete in global hackathons,
                and get hired by top tech companies.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button
                  onClick={handleStartLearning}
                  disabled={loading}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg px-8 py-4 rounded-xl"
                >
                  {loading ? "Loading..." : user ? "Go to Dashboard" : "Start Learning Free"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-lg px-8 py-4 rounded-xl backdrop-blur-sm">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* AI Search Box */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}>
              <div className="bg-gray-900/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 max-w-2xl mx-auto">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Ask AI: 'How do I learn React in 30 days?'"
                      className="w-full bg-transparent text-white placeholder-gray-400 text-lg outline-none"
                      onClick={() => {
                        // Trigger AI chatbot
                        const chatbotTrigger = document.querySelector("[data-chatbot-trigger]") as HTMLElement
                        if (chatbotTrigger) {
                          chatbotTrigger.click()
                        }
                      }}
                    />
                  </div>
                  <Button
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                    onClick={() => {
                      // Trigger AI chatbot
                      const chatbotTrigger = document.querySelector("[data-chatbot-trigger]") as HTMLElement
                      if (chatbotTrigger) {
                        chatbotTrigger.click()
                      }
                    }}
                  >
                    Ask AI
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Animation */}
        <div className="mt-16">
          <CodeAnimation />
        </div>
      </section>

      {/* Featured Hackathons Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-yellow-400/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-yellow-400/30">
              <Trophy className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-semibold">FEATURED EVENTS</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Featured <span className="text-yellow-400">Hackathons</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join the most exciting coding competitions and win amazing prizes while building innovative solutions
            </p>
          </div>

          {/* Loading State */}
          {hackathonsLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400"></div>
            </div>
          )}

          {/* Hackathons Grid */}
          {!hackathonsLoading && featuredHackathons.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {featuredHackathons.map((hackathon, index) => (
                <Link key={hackathon.id} href={`/hackathons/${createSlug(hackathon)}`}>
                  <Card
                    className={`group bg-gray-900/30 backdrop-blur-sm border-gray-700/50 overflow-hidden hover:border-yellow-400/50 transition-all duration-500 hover:scale-105 cursor-pointer ${
                      isVisible ? "animate-fadeInUp" : "opacity-0"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-0">
                      {/* Hackathon Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={hackathon.image_url || "/images/hackathon-hero.png"}
                          alt={hackathon.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        {/* Featured Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-yellow-400 text-black font-semibold">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                        </div>

                        {/* Participants Count */}
                        <div className="absolute bottom-4 right-4">
                          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-white" />
                              <span className="text-white text-sm">
                                {hackathon.participants_count.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hackathon Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                          {hackathon.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{hackathon.description}</p>

                        {/* Date Info */}
                        <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(hackathon.start_date)}</span>
                          </div>
                          <span>-</span>
                          <div className="flex items-center gap-2">
                            <span>{formatDate(hackathon.end_date)}</span>
                          </div>
                        </div>

                        {/* Prize Pool */}
                        <div className="flex items-center gap-2 mb-4">
                          <Trophy className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-semibold">{hackathon.prize_pool}</span>
                        </div>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {hackathon.technologies.slice(0, 3).map((tech, techIndex) => (
                            <Badge
                              key={techIndex}
                              variant="outline"
                              className="border-yellow-400 text-yellow-400 text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                          {hackathon.technologies.length > 3 && (
                            <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                              +{hackathon.technologies.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* View Details Link */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">
                            <span className="font-semibold">View Details</span>
                            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                          <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center group-hover:bg-yellow-400/30 transition-colors duration-300">
                            <ArrowRight className="w-4 h-4 text-yellow-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* No Featured Hackathons */}
          {!hackathonsLoading && featuredHackathons.length === 0 && (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Featured Hackathons</h3>
              <p className="text-gray-400 mb-6">Check back soon for exciting upcoming events!</p>
              <Link href="/hackathons">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                  View All Hackathons
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          )}

          {/* View All Hackathons Button */}
          {!hackathonsLoading && featuredHackathons.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/hackathons">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg px-8 py-4 rounded-xl">
                  View All Hackathons
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center transition-all duration-1000 delay-${index * 100} ${
                  isVisible ? "animate-fadeInUp" : "opacity-0"
                }`}
              >
                <div className="text-4xl lg:text-5xl font-bold text-yellow-400 mb-2">
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <p className="text-gray-300 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Why Choose <span className="text-yellow-400">Apna Coding</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of coding education with AI-powered learning, global community, and real-world
              opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className={`bg-gray-900/30 backdrop-blur-sm border-gray-700/50 p-6 transition-all duration-1000 delay-${index * 100} hover:border-yellow-400/50 ${
                  isVisible ? "animate-fadeInUp" : "opacity-0"
                }`}
              >
                <CardContent className="p-0">
                  <div className="w-12 h-12 rounded-lg bg-yellow-400 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Trusted by <span className="text-yellow-400">Industry Leaders</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We partner with top companies and institutions to provide the best opportunities for our community
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
            {partners.map((partner, index) => (
              <div
                key={partner.name}
                className="flex items-center justify-center p-4 bg-white rounded-lg border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-300 backdrop-blur-sm"
              >
                <img
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  className="max-h-12 max-w-full object-contain"
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/partnerships">
              <Button className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black backdrop-blur-sm">
                View All Partners
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="bg-gray-900/30 backdrop-blur-sm p-12 rounded-3xl border border-gray-700/50 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to <span className="text-yellow-400">Transform</span> Your Career?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already building the future. Start your journey today with our
              AI-powered learning platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleStartLearning}
                disabled={loading}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg px-8 py-4 rounded-xl"
              >
                {loading ? "Loading..." : user ? "Go to Dashboard" : "Start Free Trial"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Link href="/courses">
                <Button className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-lg px-8 py-4 rounded-xl backdrop-blur-sm">
                  Browse Courses
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  )
}
