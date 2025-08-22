import { generateMetadata } from "@/components/seo/seo-head"
import MentorshipPageClient from "./MentorshipPageClient"

export const metadata = generateMetadata({
  title: "Tech Mentorship Programs | Learn from Industry Experts | Apna Coding",
  description:
    "Get personalized mentorship from top tech industry leaders. Join Apna Coding's mentorship programs to advance your skills, land your dream job, and grow your career.",
  keywords:
    "coding mentorship, tech mentors, career coaching, software engineering mentorship, programming guidance, tech career advice, Apna Coding mentors",
  canonical: "https://apnacoding.tech/mentorship",
})

export default function MentorshipPage() {
  return <MentorshipPageClient />
}
