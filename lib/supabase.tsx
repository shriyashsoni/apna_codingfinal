import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for admin operations
export const createServerClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Database Types
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: "user" | "admin"
  github_url?: string
  linkedin_url?: string
  bio?: string
  skills?: string[]
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  image_url?: string
  price: number
  duration: string
  level: "Beginner" | "Intermediate" | "Advanced"
  technologies: string[]
  instructor: string
  students_count: number
  rating: number
  status: "active" | "inactive" | "draft"
  redirect_url?: string
  category: string
  original_price?: string
  tags?: string[]
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Hackathon {
  id: string
  title: string
  description: string
  image_url?: string
  start_date: string
  end_date: string
  registration_deadline?: string
  location: string
  prize_pool: string
  participants_count: number
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  registration_open: boolean
  technologies: string[]
  registration_link?: string
  whatsapp_link?: string
  organizer?: string
  partnerships?: string[]
  featured: boolean
  mode: "online" | "offline" | "hybrid"
  difficulty: "beginner" | "intermediate" | "advanced"
  max_team_size?: number
  created_by?: string
  created_at: string
  updated_at: string
  slug?: string
}

export interface Job {
  id: string
  title: string
  company: string
  description: string
  location: string
  type: "Full-time" | "Part-time" | "Contract" | "Internship"
  salary: string
  experience: string
  technologies: string[]
  company_logo?: string
  status: "active" | "inactive" | "filled"
  posted_date: string
  application_deadline?: string
  apply_link?: string
  requirements?: string[]
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Community {
  id: string
  name: string
  description: string
  member_count: number
  type: "discord" | "telegram" | "whatsapp"
  invite_link: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface HackathonRegistration {
  id: string
  hackathon_id: string
  user_id: string
  registered_at: string
  status: "registered" | "cancelled" | "attended"
  team_name?: string
  team_members?: any[]
  additional_info?: any
  created_at: string
  updated_at: string
}

export interface Partnership {
  id: string
  title: string
  description: string
  image_url?: string
  partner_logo?: string
  partner_name: string
  partner_website?: string
  partnership_type: "general" | "educational" | "corporate" | "startup" | "nonprofit"
  status: "active" | "inactive" | "draft"
  featured: boolean
  benefits: string[]
  contact_email?: string
  contact_person?: string
  start_date?: string
  end_date?: string
  partnership_date?: string
  partnership_photo?: string
  social_links: { [key: string]: string }
  tags: string[]
  priority: number
  created_by?: string
  created_at: string
  updated_at: string
}

// Auth functions with Google OAuth and Email Integration
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  // Create user profile in database
  if (data.user && !error) {
    await createUserProfile(data.user.id, {
      email: data.user.email!,
      full_name: fullName,
      role: data.user.email === "sonishriyash@gmail.com" ? "admin" : "user",
    })

    // Send welcome email
    try {
      await fetch("/api/emails/welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.user.email,
          name: fullName,
          userId: data.user.id,
        }),
      })
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError)
      // Don't fail the signup if email fails
    }
  }

  return { data, error }
}

// Primary signIn function - EXPORTED
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Auth error:", error)
      return null
    }

    if (!user) {
      return null
    }

    // Get user profile from users table
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Profile fetch error:", profileError)
      return null
    }

    // If no profile exists, create one
    if (!profile) {
      const newProfile = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
        role: user.email === "sonishriyash@gmail.com" ? "admin" : "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: createdProfile, error: createError } = await supabase
        .from("users")
        .insert([newProfile])
        .select()
        .single()

      if (createError) {
        console.error("Profile creation error:", createError)
        return null
      }

      // Send welcome email for new Google users
      try {
        await fetch("/api/emails/welcome", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: newProfile.full_name,
            userId: user.id,
          }),
        })
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError)
      }

      return createdProfile
    }

    return profile
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

// Create user profile in database
export const createUserProfile = async (
  userId: string,
  userData: {
    email: string
    full_name: string
    role?: "user" | "admin"
    avatar_url?: string
  },
) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          id: userId,
          ...userData,
          role: userData.email === "sonishriyash@gmail.com" ? "admin" : userData.role || "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )
      .select()

    return { data, error }
  } catch (error) {
    console.error("Error in createUserProfile:", error)
    return { data: null, error }
  }
}

// Get user profile from database
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error && error.code === "PGRST116") {
      // Profile doesn't exist, return null without error
      return { data: null, error: null }
    }

    return { data, error }
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    return { data: null, error }
  }
}

// Update user profile with better error handling
export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    // First, check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (fetchError && fetchError.code === "PGRST116") {
      // User doesn't exist, create new profile
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) {
        throw new Error("User not authenticated to create profile.")
      }

      const { data, error } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: authData.user.email,
          full_name: updates.full_name || "",
          bio: updates.bio || null,
          github_url: updates.github_url || null,
          linkedin_url: updates.linkedin_url || null,
          skills: updates.skills || null,
          role: authData.user.email === "sonishriyash@gmail.com" ? "admin" : "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      return { data, error }
    } else if (fetchError) {
      return { data: null, error: fetchError }
    }

    // User exists, update profile
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()

    return { data, error }
  } catch (error) {
    console.error("Error in updateUserProfile:", error)
    return { data: null, error }
  }
}

// Admin check function with enhanced logic for sonishriyash@gmail.com
export const isAdmin = async (email?: string) => {
  if (!email) {
    const user = await getCurrentUser()
    if (!user?.email) return false
    email = user.email
  }

  // Check if the email is the main admin
  if (email === "sonishriyash@gmail.com") {
    return true
  }

  // Check database for additional admins
  try {
    const { data, error } = await supabase.from("users").select("role").eq("email", email).single()

    if (error) return false
    return data?.role === "admin"
  } catch {
    return false
  }
}

export async function checkUserAuth() {
  try {
    const user = await getCurrentUser()
    return user
  } catch (error) {
    console.error("Error checking user auth:", error)
    return null
  }
}

// Get user organizer status
export const getUserOrganizerStatus = async (userId: string) => {
  try {
    const { data: roles, error } = await supabase
      .from("organizer_roles")
      .select("role_name")
      .eq("user_id", userId)
      .eq("is_active", true)

    if (error) {
      console.error("Error fetching organizer status:", error)
      return { is_organizer: false, organizer_types: [] }
    }

    const organizer_types = roles?.map((role) => role.role_name) || []

    return {
      is_organizer: organizer_types.length > 0,
      organizer_types,
    }
  } catch (error) {
    console.error("Error in getUserOrganizerStatus:", error)
    return { is_organizer: false, organizer_types: [] }
  }
}

// Database functions for Courses
export const getCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
  return { data, error }
}

export const getAllCourses = async () => {
  const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false })
  return { data, error }
}

export const createCourse = async (course: Omit<Course, "id" | "created_at" | "updated_at">) => {
  const currentUser = await getCurrentUser()
  const { data, error } = await supabase
    .from("courses")
    .insert([
      {
        ...course,
        created_by: currentUser?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
  return { data, error }
}

export const updateCourse = async (id: string, updates: Partial<Course>) => {
  const { data, error } = await supabase
    .from("courses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
  return { data, error }
}

export const deleteCourse = async (id: string) => {
  const { data, error } = await supabase.from("courses").delete().eq("id", id)
  return { data, error }
}

export const getCourseById = async (id: string) => {
  const { data, error } = await supabase.from("courses").select("*").eq("id", id).single()
  return { data, error }
}

// Database functions for Hackathons
export const getHackathons = async () => {
  const { data, error } = await supabase.from("hackathons").select("*").order("start_date", { ascending: true })
  return { data, error }
}

export const getAllHackathons = async () => {
  const { data, error } = await supabase.from("hackathons").select("*").order("created_at", { ascending: false })
  return { data, error }
}

export const createHackathon = async (hackathon: Omit<Hackathon, "id" | "created_at" | "updated_at">) => {
  const currentUser = await getCurrentUser()
  const { data, error } = await supabase
    .from("hackathons")
    .insert([
      {
        ...hackathon,
        created_by: currentUser?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
  return { data, error }
}

export const updateHackathon = async (id: string, updates: Partial<Hackathon>) => {
  const { data, error } = await supabase
    .from("hackathons")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
  return { data, error }
}

export const deleteHackathon = async (id: string) => {
  const { data, error } = await supabase.from("hackathons").delete().eq("id", id)
  return { data, error }
}

export const getHackathonById = async (id: string) => {
  const { data, error } = await supabase.from("hackathons").select("*").eq("id", id).single()
  return { data, error }
}

// Get hackathon by slug
export const getHackathonBySlug = async (slug: string) => {
  const { data, error } = await supabase.from("hackathons").select("*").eq("slug", slug).single()
  return { data, error }
}

// Database functions for Jobs
export const getJobs = async () => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "active")
    .order("posted_date", { ascending: false })
  return { data, error }
}

export const getAllJobs = async () => {
  const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })
  return { data, error }
}

export const createJob = async (job: Omit<Job, "id" | "created_at" | "updated_at">) => {
  const currentUser = await getCurrentUser()
  const { data, error } = await supabase
    .from("jobs")
    .insert([
      {
        ...job,
        created_by: currentUser?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
  return { data, error }
}

export const updateJob = async (id: string, updates: Partial<Job>) => {
  const { data, error } = await supabase
    .from("jobs")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
  return { data, error }
}

export const deleteJob = async (id: string) => {
  const { data, error } = await supabase.from("jobs").delete().eq("id", id)
  return { data, error }
}

export const getJobById = async (id: string) => {
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single()
  return { data, error }
}

// Database functions for Partnerships
export const getPartnerships = async () => {
  const { data, error } = await supabase
    .from("community_partnerships")
    .select("*")
    .eq("status", "active")
    .order("priority", { ascending: false })
  return { data, error }
}

export const getAllPartnerships = async () => {
  const { data, error } = await supabase
    .from("community_partnerships")
    .select("*")
    .order("created_at", { ascending: false })
  return { data, error }
}

export const createPartnership = async (partnership: Omit<Partnership, "id" | "created_at" | "updated_at">) => {
  const currentUser = await getCurrentUser()
  const { data, error } = await supabase
    .from("community_partnerships")
    .insert([
      {
        ...partnership,
        created_by: currentUser?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
  return { data, error }
}

export const updatePartnership = async (id: string, updates: Partial<Partnership>) => {
  const { data, error } = await supabase
    .from("community_partnerships")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
  return { data, error }
}

export const deletePartnership = async (id: string) => {
  const { data, error } = await supabase.from("community_partnerships").delete().eq("id", id)
  return { data, error }
}

export const getPartnershipById = async (id: string) => {
  const { data, error } = await supabase.from("community_partnerships").select("*").eq("id", id).single()
  return { data, error }
}

// User Management Functions
export const getAllUsers = async () => {
  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })
  return { data, error }
}

export const updateUserRole = async (userId: string, role: "user" | "admin") => {
  const { data, error } = await supabase
    .from("users")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
  return { data, error }
}

export const deleteUser = async (userId: string) => {
  const { data, error } = await supabase.from("users").delete().eq("id", userId)
  return { data, error }
}

// Communities
export const getCommunities = async () => {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("status", "active")
    .order("member_count", { ascending: false })
  return { data, error }
}

// Hackathon registration functions with email integration
export const registerForHackathon = async (hackathonId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_registrations")
      .insert([
        {
          hackathon_id: hackathonId,
          user_id: userId,
          registered_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error registering for hackathon:", error)
      return { success: false, error: error.message }
    }

    // Update participant count
    const { error: updateError } = await supabase.rpc("increment_hackathon_participants", {
      hackathon_id: hackathonId,
    })

    if (updateError) {
      console.error("Error updating participant count:", updateError)
    }

    // Send registration confirmation email
    try {
      const [userResult, hackathonResult] = await Promise.all([
        supabase.from("users").select("email, full_name").eq("id", userId).single(),
        supabase.from("hackathons").select("title, start_date").eq("id", hackathonId).single(),
      ])

      if (userResult.data && hackathonResult.data) {
        await fetch("/api/emails/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: userResult.data.email,
            subject: `🏆 Registration Confirmed: ${hackathonResult.data.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; border-radius: 10px; overflow: hidden;">
                <div style="padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0 0 20px 0; font-size: 28px;">🎉 Registration Confirmed!</h1>
                  <p style="font-size: 18px; margin: 0 0 20px 0;">Hi ${userResult.data.full_name},</p>
                  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Congratulations! You've successfully registered for <strong>${hackathonResult.data.title}</strong>.
                  </p>
                  <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <h3 style="margin: 0 0 15px 0;">📅 Event Details</h3>
                    <p style="margin: 0 0 10px 0;"><strong>Event:</strong> ${hackathonResult.data.title}</p>
                    <p style="margin: 0;"><strong>Date:</strong> ${new Date(hackathonResult.data.start_date).toLocaleDateString()}</p>
                  </div>
                  <a href="https://apnacoding.tech/hackathons" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
                    View Hackathon Details 🏆
                  </a>
                  <p style="font-size: 14px; margin: 30px 0 0 0; opacity: 0.8;">
                    Good luck and happy coding!<br>
                    Team Apna Coding
                  </p>
                </div>
              </div>
            `,
            type: "hackathon_registration",
            userId: userId,
          }),
        })
      }
    } catch (emailError) {
      console.error("Error sending registration email:", emailError)
      // Don't fail the registration if email fails
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in registerForHackathon:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export const checkHackathonRegistration = async (hackathonId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_registrations")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking registration:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error in checkHackathonRegistration:", error)
    return false
  }
}

// Analytics functions for admin dashboard
export const getAnalytics = async () => {
  try {
    const [usersResult, hackathonsResult, jobsResult, coursesResult, registrationsResult] = await Promise.all([
      supabase.from("users").select("id, created_at, role, email"),
      supabase.from("hackathons").select("id, status, participants_count, created_at, technologies"),
      supabase.from("jobs").select("id, status, posted_date, created_at, technologies"),
      supabase.from("courses").select("id, status, students_count, created_at, technologies"),
      supabase.from("hackathon_registrations").select("id, created_at, hackathon_id, user_id"),
    ])

    return {
      users: usersResult.data || [],
      hackathons: hackathonsResult.data || [],
      jobs: jobsResult.data || [],
      courses: coursesResult.data || [],
      registrations: registrationsResult.data || [],
    }
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return {
      users: [],
      hackathons: [],
      jobs: [],
      courses: [],
      registrations: [],
    }
  }
}

// Get detailed analytics with growth calculations
export const getDetailedAnalytics = async () => {
  try {
    const data = await getAnalytics()

    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    // Calculate totals
    const totalUsers = data.users.length
    const activeHackathons = data.hackathons.filter((h) => h.status === "upcoming" || h.status === "ongoing").length
    const jobListings = data.jobs.filter((j) => j.status === "active").length
    const courses = data.courses.filter((c) => c.status === "active").length

    // Calculate growth
    const recentUsers = data.users.filter((u) => new Date(u.created_at) > lastMonth).length
    const userGrowth = totalUsers > 0 ? (recentUsers / totalUsers) * 100 : 0

    const recentHackathons = data.hackathons.filter((h) => new Date(h.created_at) > lastMonth).length
    const hackathonGrowth = activeHackathons > 0 ? (recentHackathons / activeHackathons) * 100 : 0

    const recentJobs = data.jobs.filter((j) => new Date(j.created_at) > lastMonth).length
    const jobGrowth = jobListings > 0 ? (recentJobs / jobListings) * 100 : 0

    const recentCourses = data.courses.filter((c) => new Date(c.created_at) > lastMonth).length
    const courseGrowth = courses > 0 ? (recentCourses / courses) * 100 : 0

    // Technology analysis
    const techCount: { [key: string]: number } = {}

    data.courses.forEach((course) => {
      if (course.technologies) {
        course.technologies.forEach((tech: string) => {
          techCount[tech] = (techCount[tech] || 0) + 1
        })
      }
    })

    data.hackathons.forEach((hackathon) => {
      if (hackathon.technologies) {
        hackathon.technologies.forEach((tech: string) => {
          techCount[tech] = (techCount[tech] || 0) + 1
        })
      }
    })

    data.jobs.forEach((job) => {
      if (job.technologies) {
        job.technologies.forEach((tech: string) => {
          techCount[tech] = (techCount[tech] || 0) + 1
        })
      }
    })

    const topTechnologies = Object.entries(techCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Users by role
    const roleCount: { [key: string]: number } = {}
    data.users.forEach((user) => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1
    })
    const usersByRole = Object.entries(roleCount).map(([role, count]) => ({ role, count }))

    return {
      totals: {
        totalUsers,
        activeHackathons,
        jobListings,
        courses,
      },
      growth: {
        userGrowth: Math.round(userGrowth * 10) / 10,
        hackathonGrowth: Math.round(hackathonGrowth * 10) / 10,
        jobGrowth: Math.round(jobGrowth * 10) / 10,
        courseGrowth: Math.round(courseGrowth * 10) / 10,
      },
      topTechnologies,
      usersByRole,
      rawData: data,
    }
  } catch (error) {
    console.error("Error fetching detailed analytics:", error)
    return {
      totals: { totalUsers: 0, activeHackathons: 0, jobListings: 0, courses: 0 },
      growth: { userGrowth: 0, hackathonGrowth: 0, jobGrowth: 0, courseGrowth: 0 },
      topTechnologies: [],
      usersByRole: [],
      rawData: { users: [], hackathons: [], jobs: [], courses: [], registrations: [] },
    }
  }
}

// Search functions
export const searchCourses = async (query: string, category?: string) => {
  let queryBuilder = supabase.from("courses").select("*").eq("status", "active")

  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,technologies.cs.{${query}}`)
  }

  if (category && category !== "All") {
    queryBuilder = queryBuilder.eq("category", category)
  }

  const { data, error } = await queryBuilder.order("created_at", { ascending: false })
  return { data, error }
}

export const searchHackathons = async (query: string, status?: string) => {
  let queryBuilder = supabase.from("hackathons").select("*")

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%,technologies.cs.{${query}}`,
    )
  }

  if (status && status !== "all") {
    queryBuilder = queryBuilder.eq("status", status)
  }

  const { data, error } = await queryBuilder.order("start_date", { ascending: true })
  return { data, error }
}

export const searchJobs = async (query: string, type?: string, experience?: string) => {
  let queryBuilder = supabase.from("jobs").select("*").eq("status", "active")

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,company.ilike.%${query}%,description.ilike.%${query}%,technologies.cs.{${query}}`,
    )
  }

  if (type && type !== "All") {
    queryBuilder = queryBuilder.eq("type", type)
  }

  if (experience && experience !== "All") {
    queryBuilder = queryBuilder.eq("experience", experience)
  }

  const { data, error } = await queryBuilder.order("posted_date", { ascending: false })
  return { data, error }
}

export const searchPartnerships = async (query: string, type?: string) => {
  let queryBuilder = supabase.from("community_partnerships").select("*").eq("status", "active")

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,partner_name.ilike.%${query}%,tags.cs.{${query}}`,
    )
  }

  if (type && type !== "all") {
    queryBuilder = queryBuilder.eq("partnership_type", type)
  }

  const { data, error } = await queryBuilder.order("priority", { ascending: false })
  return { data, error }
}

// Utility function to generate slug from title
export const generateSlug = (title: string, id: string) => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()

  return `${slug}-${id}`
}

// Function to extract ID from slug
export const extractIdFromSlug = (slug: string) => {
  const parts = slug.split("-")
  return parts[parts.length - 1]
}
