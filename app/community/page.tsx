"use client"

import { motion } from "framer-motion"
import { MessageCircle, Github, Send, Users, TrendingUp, Award, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const CommunityPage = () => {
  const communityPlatforms = [
    {
      name: "WhatsApp",
      members: "5,000+",
      description: "Get instant updates, announcements, and quick community interactions",
      icon: <MessageCircle className="w-8 h-8" />,
      link: "https://chat.whatsapp.com/HqVg4ctR6QKJnfvemsEQ8H?mode=ac_t",
      color: "bg-green-500",
      features: ["Instant Updates", "Quick Help", "Announcements", "Community Chat"],
    },
    {
      name: "Telegram",
      members: "500+",
      description: "Join our growing Telegram community for coding discussions and updates",
      icon: <Send className="w-8 h-8" />,
      link: "https://t.me/apnacodingtech",
      color: "bg-blue-500",
      features: ["Coding Discussions", "Tech Updates", "File Sharing", "Group Chat"],
    },
    {
      name: "Discord",
      members: "200+",
      description: "Join our main community hub for real-time discussions, coding help, and networking",
      icon: <MessageCircle className="w-8 h-8" />,
      link: "https://discord.gg/krffBfBF",
      color: "bg-indigo-500",
      features: ["Voice Channels", "Screen Sharing", "Study Groups", "Live Events"],
    },
    {
      name: "GitHub",
      members: "100+",
      description: "Collaborate on open-source projects, share code, and contribute to the community",
      icon: <Github className="w-8 h-8" />,
      link: "https://github.com/APNA-CODING-BY-APNA-COUNSELLOR",
      color: "bg-gray-800",
      features: ["Open Source", "Code Reviews", "Project Collaboration", "Portfolio Building"],
    },
  ]

  const communityStats = [
    {
      icon: <Users className="w-6 h-6" />,
      value: "5,800+",
      label: "Active Members",
      description: "Growing community of developers",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      value: "50+",
      label: "Daily Discussions",
      description: "Active conversations every day",
    },
    {
      icon: <Award className="w-6 h-6" />,
      value: "100+",
      label: "Success Stories",
      description: "Members who got placed",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      value: "25+",
      label: "Countries",
      description: "Global community reach",
    },
  ]

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Software Engineer at Google",
      content:
        "The Apna Coding community helped me land my dream job. The support and guidance I received was incredible!",
      avatar: "/placeholder-user.jpg",
    },
    {
      name: "Priya Patel",
      role: "Full Stack Developer",
      content:
        "Amazing community with helpful mentors. The coding challenges and discussions really improved my skills.",
      avatar: "/placeholder-user.jpg",
    },
    {
      name: "Arjun Kumar",
      role: "Data Scientist at Microsoft",
      content: "From beginner to professional - this community supported me throughout my journey. Highly recommended!",
      avatar: "/placeholder-user.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-4 bg-yellow-400/20 text-yellow-400 border-yellow-400/30">5,800+ Active Members</Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Join Our <span className="text-yellow-400">Coding Community</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Connect with like-minded developers, get coding help, participate in discussions, and grow your career
              with our supportive community across multiple platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500">
                <a
                  href="https://chat.whatsapp.com/HqVg4ctR6QKJnfvemsEQ8H?mode=ac_t"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join WhatsApp Community
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-black bg-transparent"
              >
                <a href="https://t.me/apnacodingtech" target="_blank" rel="noopener noreferrer">
                  Join Telegram
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
            {communityStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-3 text-yellow-400">{stat.icon}</div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-300 mb-1">{stat.label}</div>
                    <div className="text-xs text-gray-400">{stat.description}</div>
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
              Choose Your <span className="text-yellow-400">Platform</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Join us on your preferred platform and become part of our growing community of developers and tech
              enthusiasts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {communityPlatforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-3 rounded-lg ${platform.color} text-white`}>{platform.icon}</div>
                      <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                        {platform.members} Members
                      </Badge>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3">{platform.name}</h3>
                    <p className="text-gray-300 mb-6">{platform.description}</p>

                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {platform.features.map((feature) => (
                        <div key={feature} className="flex items-center text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <Button asChild className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
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
              What Our <span className="text-yellow-400">Community Says</span>
            </h2>
            <p className="text-gray-300 text-lg">Real stories from our community members who achieved their goals</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-white font-medium">{testimonial.name}</div>
                        <div className="text-gray-400 text-sm">{testimonial.role}</div>
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
            <Card className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border-yellow-400/30">
              <CardContent className="p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Join Our Community?</h2>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                  Start your journey with thousands of developers who are learning, growing, and succeeding together.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500">
                    <a
                      href="https://chat.whatsapp.com/HqVg4ctR6QKJnfvemsEQ8H?mode=ac_t"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join WhatsApp (5,000+ Members)
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-black bg-transparent"
                  >
                    <a href="https://t.me/apnacodingtech" target="_blank" rel="noopener noreferrer">
                      Join Telegram (500+ Members)
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
