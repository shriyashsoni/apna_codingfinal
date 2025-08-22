"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Calendar, Clock, User, Tag, Share2, ArrowLeft, Eye, Heart, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  author_name: string
  featured_image: string
  category: string
  tags: string[]
  published_at: string
  reading_time: number
  view_count: number
}

interface BlogPostClientProps {
  post: BlogPost
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(42) // Mock data

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handleLike = () => {
    setLiked(!liked)
    setLikes((prev) => (liked ? prev - 1 : prev + 1))
  }

  return (
    <div className="min-h-screen pt-20 bg-black">
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="outline" className="mb-6 border-gray-700 text-white hover:bg-gray-800 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Badge variant="outline" className="text-yellow-400 border-yellow-400 mb-4">
            {post.category}
          </Badge>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">{post.title}</h1>

          <p className="text-xl text-gray-300 mb-6 leading-relaxed">{post.excerpt}</p>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.published_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.reading_time} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{post.view_count.toLocaleString()} views</span>
            </div>
          </div>

          {/* Social Actions */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={handleLike}
              variant="outline"
              className={`border-gray-600 ${liked ? "text-red-400 border-red-400" : "text-gray-300"} hover:bg-gray-700`}
            >
              <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-current" : ""}`} />
              {likes}
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
              <MessageCircle className="w-4 h-4 mr-2" />
              Comment
            </Button>
          </div>
        </motion.header>

        {/* Featured Image */}
        {post.featured_image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8"
          >
            <Image src={post.featured_image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
          </motion.div>
        )}

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="prose prose-lg prose-invert max-w-none mb-8"
        >
          <div className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-yellow-400" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Author Bio */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-2">{post.author_name}</h3>
                  <p className="text-gray-300 mb-4">
                    Founder of Apna Coding and passionate developer with 8+ years of experience in full-stack
                    development. Loves sharing knowledge and helping developers grow their careers.
                  </p>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
                    >
                      Follow
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </article>

      {/* Related Articles CTA */}
      <section className="py-16 bg-gray-900/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Explore More <span className="text-yellow-400">Articles</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover more coding tips, career advice, and tech insights on our blog.
            </p>
            <Link href="/blog">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3">
                View All Articles
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
