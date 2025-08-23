"use client"
import { extractIdFromSlug } from "@/lib/supabase"
import CourseDetailClient from "./CourseDetailClient"

interface Props {
  params: { slug: string }
}

export default function CourseDetailClientPage({ params }: Props) {
  const courseId = extractIdFromSlug(params.slug)

  return <CourseDetailClient courseId={courseId} />
}
