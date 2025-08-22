"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Clock, User, Calendar, ArrowRight, Star } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string
  author_name: string
  author_avatar: string
  published_at: string
  reading_time: number
  tags: string[]
  category: string
  featured: boolean
  views: number
}

interface BlogClientPageProps {
  posts: BlogPost[]
  featuredPosts: BlogPost[]
  categories: string[]
}

export default function BlogClientPage({ posts, featuredPosts, categories }: BlogClientPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredPosts, setFilteredPosts] = useState(posts)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterPosts(term, selectedCategory)
  }

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category)
    filterPosts(searchTerm, category)
  }

  const filterPosts = (term: string, category: string | null) => {
    let filtered = posts

    if (term) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(term.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(term.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(term.toLowerCase())),
      )
    }

    if (category) {
      filtered = filtered.filter((post) => post.category === category)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Apna Coding <span className="text-blue-600">Blog</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Stay updated with the latest tech trends, coding tutorials, career advice, and insights from industry
            experts.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-full border-2 border-gray-200 focus:border-blue-500"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.featured_image || "/placeholder.jpg"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-yellow-500 text-white">Featured</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.published_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.reading_time} min
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700">
                        Read More <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => handleCategoryFilter(null)}
              className="rounded-full"
            >
              All Articles
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => handleCategoryFilter(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        {/* All Posts */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {selectedCategory ? `${selectedCategory} Articles` : "All Articles"}
          </h2>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.featured_image || "/placeholder.jpg"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {post.category && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-blue-600 text-white">{post.category}</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.published_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.reading_time} min
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700">
                        Read More <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
