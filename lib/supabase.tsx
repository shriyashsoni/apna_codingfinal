import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for admin operations
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient(supabaseUrl, serviceRoleKey)
}

// Create client component client (for use in client components)
export function createClientComponentClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Create server component client (for use in server components)
export function createServerComponentClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
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

export interface Event {
  id: string
  title: string
  description: string
  image_url?: string
  event_date: string
  end_date?: string
  location: string
  event_type: "workshop" | "webinar" | "conference" | "meetup" | "bootcamp" | "seminar"
  technologies: string[]
  organizer: string
  max_participants: number
  current_participants: number
  registration_fee: number
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  registration_open: boolean
  registration_link?: string
  event_mode: "online" | "offline" | "hybrid"
  tags: string[]
  requirements?: string[]
  agenda?: string
  speaker_info?: string
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

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  registered_at: string
  status: "registered" | "cancelled" | "attended"
  additional_info?: any
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

// Auth functions with Google OAuth and Email Integration
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

    // Create user profile in database
    if (data.user && !error) {
      await createUserProfile(data.user.id, {
        email: data.user.email!,
        full_name: fullName,
        role: data.user.email === "sonishriyash@gmail.com" ? "admin" : "user",
      })

      // Send welcome email
      try {
        const { sendEmail, emailTemplates } = await import("./email")
        const template = emailTemplates.welcome(fullName)
        await sendEmail(data.user.email!, template.subject, template.html, "welcome", data.user.id)
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError)
        // Don't fail the signup if email fails
      }
    }

    return { data, error }
  } catch (error) {
    console.error("Error in signUp:", error)
    return { data: null, error }
  }
}

// Primary signIn function - EXPORTED
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    console.error("Error in signIn:", error)
    return { data: null, error }
  }
}

export const signInWithGoogle = async () => {
  try {
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
  } catch (error) {
    console.error("Error in signInWithGoogle:", error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error in signOut:", error)
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
        const { sendEmail, emailTemplates } = await import("./email")
        const template = emailTemplates.welcome(newProfile.full_name)
        await sendEmail(user.email!, template.subject, template.html, "welcome", user.id)
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

// Admin check function with enhanced logic for sonishriyash@gmail.com
export const isAdmin = async (email?: string) => {
  try {
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
    const { data, error } = await supabase.from("users").select("role").eq("email", email).single()

    if (error) return false
    return data?.role === "admin"
  } catch (error) {
    console.error("Error in isAdmin:", error)
    return false
  }
}

// Database functions for Events
export const getEvents = async () => {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "upcoming")
      .order("event_date", { ascending: true })
    return { data, error }
  } catch (error) {
    console.error("Error in getEvents:", error)
    return { data: null, error }
  }
}

export const getAllEvents = async () => {
  try {
    const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("Error in getAllEvents:", error)
    return { data: null, error }
  }
}

export const getEventById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("events").select("*").eq("id", id).single()
    return { data, error }
  } catch (error) {
    console.error("Error in getEventById:", error)
    return { data: null, error }
  }
}

export const createEvent = async (event: Omit<Event, "id" | "created_at" | "updated_at">) => {
  try {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          ...event,
          created_by: currentUser?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error in createEvent:", error)
    return { data: null, error }
  }
}

// Database functions for Hackathons
export const getHackathons = async () => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").order("start_date", { ascending: true })
    return { data, error }
  } catch (error) {
    console.error("Error in getHackathons:", error)
    return { data: null, error }
  }
}

export const getAllHackathons = async () => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("Error in getAllHackathons:", error)
    return { data: null, error }
  }
}

export const getHackathonById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").eq("id", id).single()
    return { data, error }
  } catch (error) {
    console.error("Error in getHackathonById:", error)
    return { data: null, error }
  }
}

export const getHackathonBySlug = async (slug: string) => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").eq("slug", slug).single()
    return { data, error }
  } catch (error) {
    console.error("Error in getHackathonBySlug:", error)
    return { data: null, error }
  }
}

export const createHackathon = async (hackathon: Omit<Hackathon, "id" | "created_at" | "updated_at">) => {
  try {
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
  } catch (error) {
    console.error("Error in createHackathon:", error)
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
    return { data, error }
  } catch (error) {
    console.error("Error in updateHackathon:", error)
    return { data: null, error }
  }
}

export const deleteHackathon = async (id: string) => {
  try {
    const { data, error } = await supabase.from("hackathons").delete().eq("id", id)
    return { data, error }
  } catch (error) {
    console.error("Error in deleteHackathon:", error)
    return { data: null, error }
  }
}

// Database functions for Jobs
export const getJobs = async () => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "active")
      .order("posted_date", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("Error in getJobs:", error)
    return { data: null, error }
  }
}

export const getAllJobs = async () => {
  try {
    const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("Error in getAllJobs:", error)
    return { data: null, error }
  }
}

export const getJobById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single()
    return { data, error }
  } catch (error) {
    console.error("Error in getJobById:", error)
    return { data: null, error }
  }
}

export const createJob = async (job: Omit<Job, "id" | "created_at" | "updated_at">) => {
  try {
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
  } catch (error) {
    console.error("Error in createJob:", error)
    return { data: null, error }
  }
}

// Event registration functions with automatic email confirmation
export const registerForEvent = async (eventId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("event_registrations")
      .insert([
        {
          event_id: eventId,
          user_id: userId,
          registered_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error registering for event:", error)
      return { success: false, error: error.message }
    }

    // Update participant count
    const { error: updateError } = await supabase.rpc("increment_event_participants", {
      event_id: eventId,
    })

    if (updateError) {
      console.error("Error updating participant count:", updateError)
    }

    // Send registration confirmation email automatically
    try {
      const [userResult, eventResult] = await Promise.all([
        supabase.from("users").select("email, full_name").eq("id", userId).single(),
        supabase.from("events").select("title, event_date, location").eq("id", eventId).single(),
      ])

      if (userResult.data && eventResult.data) {
        const { sendEventRegistrationEmail } = await import("./email")
        await sendEventRegistrationEmail(
          userResult.data.email,
          userResult.data.full_name || "User",
          eventResult.data.title,
          new Date(eventResult.data.event_date).toLocaleDateString(),
          eventResult.data.location,
          userId,
        )
        console.log("Event registration email sent successfully")
      }
    } catch (emailError) {
      console.error("Error sending registration email:", emailError)
      // Don't fail the registration if email fails
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in registerForEvent:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export const checkEventRegistration = async (eventId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking registration:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error in checkEventRegistration:", error)
    return false
  }
}

// Hackathon registration functions with automatic email confirmation
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

    // Send registration confirmation email automatically
    try {
      const [userResult, hackathonResult] = await Promise.all([
        supabase.from("users").select("email, full_name").eq("id", userId).single(),
        supabase.from("hackathons").select("title, start_date").eq("id", hackathonId).single(),
      ])

      if (userResult.data && hackathonResult.data) {
        const { sendHackathonRegistrationEmail } = await import("./email")
        await sendHackathonRegistrationEmail(
          userResult.data.email,
          userResult.data.full_name || "User",
          hackathonResult.data.title,
          new Date(hackathonResult.data.start_date).toLocaleDateString(),
          userId,
        )
        console.log("Hackathon registration email sent successfully")
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

// Search functions
export const searchEvents = async (query: string, eventType?: string) => {
  try {
    let queryBuilder = supabase.from("events").select("*").eq("status", "upcoming")

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,technologies.cs.{${query}}`)
    }

    if (eventType && eventType !== "All") {
      queryBuilder = queryBuilder.eq("event_type", eventType)
    }

    const { data, error } = await queryBuilder.order("event_date", { ascending: true })
    return { data, error }
  } catch (error) {
    console.error("Error in searchEvents:", error)
    return { data: null, error }
  }
}

export const searchHackathons = async (query: string, status?: string) => {
  try {
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
  } catch (error) {
    console.error("Error in searchHackathons:", error)
    return { data: null, error }
  }
}

export const searchJobs = async (query: string, type?: string, experience?: string) => {
  try {
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
  } catch (error) {
    console.error("Error in searchJobs:", error)
    return { data: null, error }
  }
}

// Utility function to generate slug from title
export const generateSlug = (title: string, id: string) => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()

  return `${slug}-${id.substring(0, 8)}`
}

// Function to extract ID from slug
export const extractIdFromSlug = (slug: string) => {
  const parts = slug.split("-")
  return parts[parts.length - 1]
}
