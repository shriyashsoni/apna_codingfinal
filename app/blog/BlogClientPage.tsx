"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Search, Calendar, User, Clock, Tag, ArrowRight, TrendingUp, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  author_name: string
  featured_image: string
  category: string
  tags: string[]
  published_at: string
  reading_time: number
  view_count: number
  featured: boolean
}

export default function BlogClientPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [loading, setLoading] = useState(true)

  const categories = ["All", "Programming", "Career", "Tutorials", "News", "Tips"]

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [searchTerm, selectedCategory, posts])

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })

      if (error) {
        console.error("Error loading blog posts:", error)
        return
      }

      setPosts(data || [])
    } catch (error) {
      console.error("Error loading blog posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = posts

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((post) => post.category === selectedCategory)
    }

    setFilteredPosts(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  const featuredPosts = posts.filter((post) => post.featured).slice(0, 3)
  const regularPosts = filteredPosts.filter((post) => !post.featured)

  return (
    <div className="min-h-screen pt-20 bg-black">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Apna Coding <span className="text-yellow-400">Blog</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Stay updated with the latest tech news, coding tutorials, career advice, and hackathon tips. Explore new
              topics every week from industry experts.
            </p>

            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-700 text-white focus:border-yellow-400"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedCategory === category
                          ? "bg-yellow-400 text-black"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-gray-900/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Featured Articles</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="bg-gray-900 border-yellow-400 hover:border-yellow-300 transition-all duration-300 group overflow-hidden h-full">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.featured_image || "/images/blog-default.jpg"}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-yellow-400 text-black font-semibold">Featured</Badge>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.published_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.reading_time} min read</span>
                          </div>
                        </div>

                        <Badge variant="outline" className="text-yellow-400 border-yellow-400 mb-3">
                          {post.category}
                        </Badge>

                        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">{post.author_name}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">All Articles ({filteredPosts.length})</h2>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <Card className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all duration-300 group overflow-hidden h-full">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.featured_image || "/images/blog-default.jpg"}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.published_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.reading_time} min read</span>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-yellow-400 border-yellow-400 mb-3">
                        {post.category}
                      </Badge>

                      <h3 className="text-lg font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">{post.author_name}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-2">No articles found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gray-900/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center bg-gray-900/50 rounded-2xl p-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Stay Updated with <span className="text-yellow-400">Latest Articles</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Get the latest coding tips, career advice, and tech news delivered to your inbox every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-black border-gray-700 text-white focus:border-yellow-400"
              />
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8">Subscribe</Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
