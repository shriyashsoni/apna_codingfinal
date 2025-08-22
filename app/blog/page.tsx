import { generateMetadata } from "@/components/seo/seo-head"
import BlogClientPage from "./BlogClientPage"

export const metadata = generateMetadata({
  title: "Coding Tips, Tech News & Career Advice | Apna Coding Blog",
  description:
    "Stay updated with the latest tech news, coding tutorials, career advice, and hackathon tips on the Apna Coding Blog. Expert insights for developers.",
  keywords:
    "coding blog, tech news, programming tutorials, career advice, hackathon tips, software development, Apna Coding blog",
  canonical: "https://apnacoding.tech/blog",
})

export default function BlogPage() {
  return <BlogClientPage />
}
