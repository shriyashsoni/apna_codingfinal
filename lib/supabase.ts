import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: string
  level: "Beginner" | "Intermediate" | "Advanced"
  price: number
  rating: number
  image_url?: string
  video_url?: string
  syllabus?: string[]
  prerequisites?: string[]
  learning_outcomes?: string[]
  status: "draft" | "published" | "archived"
  created_at: string
  updated_at: string
}

export interface Hackathon {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  registration_deadline: string
  location: string
  mode: "online" | "offline" | "hybrid"
  prize_pool: string
  max_participants?: number
  current_participants: number
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  image_url?: string
  registration_link?: string
  rules?: string[]
  themes?: string[]
  sponsors?: string[]
  slug: string
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  title: string
  company: string
  description: string
  requirements: string[]
  location: string
  type: "full-time" | "part-time" | "contract" | "internship"
  salary: string
  experience_level: "entry" | "mid" | "senior"
  skills: string[]
  application_link: string
  status: "active" | "closed" | "draft"
  posted_date: string
  application_deadline?: string
  slug: string
  created_at: string
  updated_at: string
}

export interface HackathonRegistration {
  id: string
  hackathon_id: string
  user_id: string
  team_name?: string
  team_members?: string[]
  registration_date: string
  status: "registered" | "cancelled"
}

export interface CommunityPartner {
  id: string
  name: string
  logo_url?: string
  website_url?: string
  description?: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface PublicProfile {
  id: string
  user_id: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
  website_url?: string
  github_url?: string
  linkedin_url?: string
  twitter_url?: string
  skills?: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface HackathonComment {
  id: string
  hackathon_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: {
    full_name?: string
    avatar_url?: string
  }
}

export interface Partner {
  id: string
  name: string
  logo_url?: string
  website_url?: string
  category: "community" | "hackathon"
  display_order: number
  created_at: string
  updated_at: string
}

// Auth functions
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return null
    }

    if (!session?.user) {
      return null
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (userError) {
      console.error("User fetch error:", userError)
      return null
    }

    return userData
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error signing up:", error)
    return { data: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error signing in:", error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Clear any cached data
    window.location.href = "/"
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Error resetting password:", error)
    return { error }
  }
}

// Course functions
export const getCourses = async () => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching courses:", error)
    return { data: null, error }
  }
}

export const getCourseBySlug = async (slug: string) => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching course:", error)
    return { data: null, error }
  }
}

export const createCourse = async (course: Omit<Course, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("courses").insert([course]).select().single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error creating course:", error)
    return { data: null, error }
  }
}

export const updateCourse = async (id: string, updates: Partial<Course>) => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error updating course:", error)
    return { data: null, error }
  }
}

export const deleteCourse = async (id: string) => {
  try {
    const { error } = await supabase.from("courses").delete().eq("id", id)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Error deleting course:", error)
    return { error }
  }
}

// Hackathon functions
export const getHackathons = async () => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").order("start_date", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching hackathons:", error)
    return { data: null, error }
  }
}

export const getHackathonBySlug = async (slug: string) => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").eq("slug", slug).single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching hackathon:", error)
    return { data: null, error }
  }
}

export const createHackathon = async (hackathon: Omit<Hackathon, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("hackathons").insert([hackathon]).select().single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error creating hackathon:", error)
    return { data: null, error }
  }
}

export const updateHackathon = async (id: string, updates: Partial<Hackathon>) => {
  try {
    const { data, error } = await supabase
      .from("hackathons")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error updating hackathon:", error)
    return { data: null, error }
  }
}

export const deleteHackathon = async (id: string) => {
  try {
    const { error } = await supabase.from("hackathons").delete().eq("id", id)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Error deleting hackathon:", error)
    return { error }
  }
}

// Job functions
export const getJobs = async () => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "active")
      .order("posted_date", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return { data: null, error }
  }
}

export const getJobBySlug = async (slug: string) => {
  try {
    const { data, error } = await supabase.from("jobs").select("*").eq("slug", slug).eq("status", "active").single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching job:", error)
    return { data: null, error }
  }
}

export const createJob = async (job: Omit<Job, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("jobs").insert([job]).select().single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error creating job:", error)
    return { data: null, error }
  }
}

export const updateJob = async (id: string, updates: Partial<Job>) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error updating job:", error)
    return { data: null, error }
  }
}

export const deleteJob = async (id: string) => {
  try {
    const { error } = await supabase.from("jobs").delete().eq("id", id)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Error deleting job:", error)
    return { error }
  }
}

// User management functions
export const getUsers = async () => {
  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { data: null, error }
  }
}

export const updateUserRole = async (userId: string, role: "user" | "admin") => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { data: null, error }
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { data: null, error }
  }
}

// Analytics functions
export const getBasicAnalytics = async () => {
  try {
    const [usersResult, coursesResult, hackathonsResult, jobsResult] = await Promise.all([
      supabase.from("users").select("id", { count: "exact" }),
      supabase.from("courses").select("id", { count: "exact" }).eq("status", "published"),
      supabase.from("hackathons").select("id", { count: "exact" }).in("status", ["upcoming", "ongoing"]),
      supabase.from("jobs").select("id", { count: "exact" }).eq("status", "active"),
    ])

    return {
      totalUsers: usersResult.count || 0,
      courses: coursesResult.count || 0,
      activeHackathons: hackathonsResult.count || 0,
      jobListings: jobsResult.count || 0,
    }
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return {
      totalUsers: 0,
      courses: 0,
      activeHackathons: 0,
      jobListings: 0,
    }
  }
}

export const getDetailedAnalytics = async () => {
  try {
    const basicAnalytics = await getBasicAnalytics()

    // Get user roles distribution
    const { data: usersByRole } = await supabase.from("users").select("role")

    const roleDistribution =
      usersByRole?.reduce((acc: any, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {}) || {}

    const usersByRoleArray = Object.entries(roleDistribution).map(([role, count]) => ({
      role,
      count,
    }))

    return {
      totals: basicAnalytics,
      usersByRole: usersByRoleArray,
      growth: {
        userGrowth: 12, // Mock data - implement actual growth calculation
        courseGrowth: 8,
        hackathonGrowth: 15,
        jobGrowth: 5,
      },
    }
  } catch (error) {
    console.error("Error fetching detailed analytics:", error)
    return null
  }
}

// Hackathon registration functions
export const registerForHackathon = async (hackathonId: string, teamName?: string, teamMembers?: string[]) => {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("hackathon_registrations")
      .insert([
        {
          hackathon_id: hackathonId,
          user_id: user.id,
          team_name: teamName,
          team_members: teamMembers,
          registration_date: new Date().toISOString(),
          status: "registered",
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Update participant count
    const { error: updateError } = await supabase.rpc("increment_hackathon_participants", {
      hackathon_id: hackathonId,
    })

    if (updateError) console.error("Error updating participant count:", updateError)

    return { data, error: null }
  } catch (error) {
    console.error("Error registering for hackathon:", error)
    return { data: null, error }
  }
}

export const getHackathonRegistration = async (hackathonId: string) => {
  try {
    const user = await getCurrentUser()
    if (!user) return { data: null, error: null }

    const { data, error } = await supabase
      .from("hackathon_registrations")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", user.id)
      .eq("status", "registered")
      .single()

    if (error && error.code !== "PGRST116") throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching hackathon registration:", error)
    return { data: null, error }
  }
}

// Community Partners functions
export const getCommunityPartners = async () => {
  try {
    const { data, error } = await supabase
      .from("community_partners")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching community partners:", error)
    return { data: null, error }
  }
}

export const createCommunityPartner = async (partner: Omit<CommunityPartner, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("community_partners").insert([partner]).select().single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error creating community partner:", error)
    return { data: null, error }
  }
}

export const updateCommunityPartner = async (id: string, updates: Partial<CommunityPartner>) => {
  try {
    const { data, error } = await supabase
      .from("community_partners")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error updating community partner:", error)
    return { data: null, error }
  }
}

export const deleteCommunityPartner = async (id: string) => {
  try {
    const { error } = await supabase.from("community_partners").delete().eq("id", id)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Error deleting community partner:", error)
    return { error }
  }
}

// Public Profile functions
export const getPublicProfile = async (username: string) => {
  try {
    const { data, error } = await supabase
      .from("public_profiles")
      .select(`
        *,
        user:users(full_name, email)
      `)
      .eq("username", username)
      .eq("is_public", true)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching public profile:", error)
    return { data: null, error }
  }
}

export const createPublicProfile = async (profile: Omit<PublicProfile, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("public_profiles").insert([profile]).select().single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error creating public profile:", error)
    return { data: null, error }
  }
}

export const updatePublicProfile = async (userId: string, updates: Partial<PublicProfile>) => {
  try {
    const { data, error } = await supabase
      .from("public_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error updating public profile:", error)
    return { data: null, error }
  }
}

export const getCurrentUserPublicProfile = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return { data: null, error: null }

    const { data, error } = await supabase.from("public_profiles").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching current user public profile:", error)
    return { data: null, error }
  }
}

// Hackathon Comments functions
export const getHackathonComments = async (hackathonId: string) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_comments")
      .select(`
        *,
        user:users(full_name, avatar_url)
      `)
      .eq("hackathon_id", hackathonId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching hackathon comments:", error)
    return { data: null, error }
  }
}

export const createHackathonComment = async (hackathonId: string, content: string) => {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("hackathon_comments")
      .insert([
        {
          hackathon_id: hackathonId,
          user_id: user.id,
          content,
        },
      ])
      .select(`
        *,
        user:users(full_name, avatar_url)
      `)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error creating hackathon comment:", error)
    return { data: null, error }
  }
}

// Partners functions (new unified system)
export const getPartners = async (category?: "community" | "hackathon") => {
  try {
    let query = supabase.from("partners").select("*").order("display_order", { ascending: true })

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching partners:", error)
    return { data: null, error }
  }
}

export const createPartner = async (partner: Omit<Partner, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("partners").insert([partner]).select().single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error creating partner:", error)
    return { data: null, error }
  }
}

export const updatePartner = async (id: string, updates: Partial<Partner>) => {
  try {
    const { data, error } = await supabase
      .from("partners")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error updating partner:", error)
    return { data: null, error }
  }
}

export const deletePartner = async (id: string) => {
  try {
    const { error } = await supabase.from("partners").delete().eq("id", id)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Error deleting partner:", error)
    return { error }
  }
}

export const updatePartnerOrder = async (id: string, newOrder: number) => {
  try {
    const { data, error } = await supabase
      .from("partners")
      .update({ display_order: newOrder, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error("Error updating partner order:", error)
    return { data: null, error }
  }
}
