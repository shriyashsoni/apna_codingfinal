import { createClient } from "@/lib/supabase/client"

// Re-export the client for backward compatibility
export const supabase = createClient()

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
  banner_url?: string
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
  prerequisites?: string[]
  learning_outcomes?: string[]
  agenda?: string
  speaker_info?: string
  certificate_provided?: boolean
  recording_available?: boolean
  live_streaming?: boolean
  social_links?: { [key: string]: string }
  featured?: boolean
  slug?: string
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
  const client = createClient()

  try {
    // Check if profile already exists
    const { data: existingProfile } = await client.from("users").select("id").eq("id", userId).single()

    if (existingProfile) {
      return { data: existingProfile, error: null }
    }

    // Create new profile
    const profileData = {
      id: userId,
      email: userData.email,
      full_name: userData.full_name || userData.email.split("@")[0],
      role: userData.email === "sonishriyash@gmail.com" ? "admin" : userData.role || "user",
      avatar_url: userData.avatar_url || null,
      bio: null,
      github_url: null,
      linkedin_url: null,
      skills: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await client.from("users").insert([profileData]).select().single()

    if (error) {
      console.error("Database error creating profile:", error)
      // Return a basic profile even if database insert fails, for better error recovery
      return { data: profileData, error: null }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in createUserProfile:", error)
    return { data: null, error }
  }
}

// Sign up function
export const signUp = async (email: string, password: string, fullName: string) => {
  const client = createClient()

  try {
    // Input validation
    if (!email || !password || !fullName) {
      return { data: null, error: { message: "All fields are required" } }
    }

    if (password.length < 6) {
      return { data: null, error: { message: "Password must be at least 6 characters long" } }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { data: null, error: { message: "Please enter a valid email address" } }
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        // Use NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL if available, otherwise fallback to window.location.origin
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      console.error("Auth signup error:", error)
      return { data: null, error }
    }

    // Create profile if signup was successful
    if (data.user) {
      try {
        await createUserProfile(data.user.id, {
          email: data.user.email!,
          full_name: fullName,
          role: data.user.email === "sonishriyash@gmail.com" ? "admin" : "user",
        })
      } catch (profileError) {
        console.error("Profile creation error (non-blocking):", profileError)
        // Don't fail signup if profile creation fails
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in signUp:", error)
    return { data: null, error: { message: "An unexpected error occurred during signup" } }
  }
}

// Sign in function
export const signIn = async (email: string, password: string) => {
  const client = createClient()

  try {
    // Input validation
    if (!email || !password) {
      return { data: null, error: { message: "Email and password are required" } }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { data: null, error: { message: "Please enter a valid email address" } }
    }

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Auth signin error:", error)
      // Provide user-friendly error messages
      if (error.message.includes("Invalid login credentials")) {
        return { data: null, error: { message: "Invalid email or password" } }
      }
      if (error.message.includes("Email not confirmed")) {
        return { data: null, error: { message: "Please check your email and confirm your account" } }
      }
      return { data: null, error }
    }

    // Ensure profile exists and create if not
    if (data.user) {
      try {
        const { data: profile } = await client.from("users").select("*").eq("id", data.user.id).single()

        if (!profile) {
          await createUserProfile(data.user.id, {
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || data.user.email!.split("@")[0],
            avatar_url: data.user.user_metadata?.avatar_url,
          })
        }
      } catch (updateError) {
        console.error("Error updating user profile (non-blocking):", updateError)
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in signIn:", error)
    return { data: null, error: { message: "An unexpected error occurred during signin" } }
  }
}

// Google OAuth sign in
export const signInWithGoogle = async () => {
  const client = createClient()

  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Use NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL if available, otherwise fallback to window.location.origin
        redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      console.error("Google OAuth error:", error)
    } else {
      console.log("✅ Google OAuth initiated successfully")
    }

    return { data, error }
  } catch (error) {
    console.error("Error in signInWithGoogle:", error)
    return { data: null, error: { message: "Failed to sign in with Google" } }
  }
}

// Sign out function
export const signOut = async () => {
  const client = createClient()

  try {
    const { error } = await client.auth.signOut()
    if (error) {
      throw error
    }
    console.log("✅ Sign out successful")
  } catch (error) {
    console.error("Error in signOut:", error)
    throw error
  }
}

// Get current user with profile
export const getCurrentUser = async () => {
  const client = createClient()

  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get user profile from users table
    const { data: profile, error: profileError } = await client.from("users").select("*").eq("id", user.id).single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Profile fetch error:", profileError)
      return null
    }

    // If no profile exists, create one
    if (!profile) {
      const newProfileData = {
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split("@")[0],
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
        role: user.email === "sonishriyash@gmail.com" ? "admin" : "user",
      }

      const { data: createdProfile } = await createUserProfile(user.id, newProfileData)

      // Return created profile or a fallback if creation failed
      return (
        createdProfile || {
          id: user.id,
          email: user.email!,
          full_name: newProfileData.full_name,
          role: newProfileData.role,
          avatar_url: newProfileData.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      )
    }

    return profile
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Get session
export const getSession = async () => {
  const client = createClient()

  try {
    const {
      data: { session },
    } = await client.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Get user profile from database
export const getUserProfile = async (userId: string) => {
  const client = createClient()

  try {
    const { data, error } = await client.from("users").select("*").eq("id", userId).single()

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

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const client = createClient()

  try {
    const { data, error } = await client
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error("Error in updateUserProfile:", error)
    return { data: null, error }
  }
}

// Fetch events
export const fetchEvents = async (options?: {
  status?: string
  featured?: boolean
  limit?: number
}) => {
  const client = createClient()

  try {
    let query = client.from("events").select("*")

    if (options?.status) {
      query = query.eq("status", options.status)
    }
    if (options?.featured !== undefined) {
      query = query.eq("featured", options.featured)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    // Default to ordering by event_date for upcoming events
    query = query.order("event_date", { ascending: true })

    const { data, error } = await query
    return { data, error }
  } catch (error) {
    console.error("Error fetching events:", error)
    return { data: null, error }
  }
}

// Fetch hackathons
export const fetchHackathons = async (options?: {
  status?: string
  featured?: boolean
  limit?: number
}) => {
  const client = createClient()

  try {
    let query = client.from("hackathons").select("*")

    if (options?.status) {
      query = query.eq("status", options.status)
    }
    if (options?.featured !== undefined) {
      query = query.eq("featured", options.featured)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    // Default to ordering by start_date for upcoming hackathons
    query = query.order("start_date", { ascending: true })

    const { data, error } = await query
    return { data, error }
  } catch (error) {
    console.error("Error fetching hackathons:", error)
    return { data: null, error }
  }
}

// Fetch jobs
export const fetchJobs = async (options?: {
  status?: string
  type?: string
  limit?: number
}) => {
  const client = createClient()

  try {
    let query = client.from("jobs").select("*")

    if (options?.status) {
      query = query.eq("status", options.status)
    }
    if (options?.type) {
      query = query.eq("type", options.type)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    // Default to ordering by posted_date for recent jobs
    query = query.order("posted_date", { ascending: false })

    const { data, error } = await query
    return { data, error }
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return { data: null, error }
  }
}

// Fetch courses (assuming a 'courses' table exists)
export const fetchCourses = async (options?: {
  status?: string
  category?: string
  level?: string
  limit?: number
}) => {
  const client = createClient()

  try {
    let query = client.from("courses").select("*")

    if (options?.status) {
      query = query.eq("status", options.status)
    }
    if (options?.category) {
      query = query.eq("category", options.category)
    }
    if (options?.level) {
      query = query.eq("level", options.level)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    // Default to ordering by creation date
    query = query.order("created_at", { ascending: false })

    const { data, error } = await query
    return { data, error }
  } catch (error) {
    console.error("Error fetching courses:", error)
    return { data: null, error }
  }
}

// Register for hackathon
export const registerForHackathon = async (
  hackathonId: string,
  userId: string,
  registrationData?: {
    team_name?: string
    team_members?: any[]
    additional_info?: any
  },
) => {
  const client = createClient()

  try {
    const { data, error } = await client
      .from("hackathon_registrations")
      .insert({
        hackathon_id: hackathonId,
        user_id: userId,
        registered_at: new Date().toISOString(),
        status: "registered", // Default status
        ...registrationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Optionally, call RPC for participant count increment here if needed
    // const { error: rpcError } = await client.rpc('increment_hackathon_participants', { hackathon_id: hackathonId })
    // if (rpcError) console.error('Error incrementing participant count:', rpcError)

    return { data, error }
  } catch (error) {
    console.error("Error registering for hackathon:", error)
    return { data: null, error }
  }
}

// Register for event
export const registerForEvent = async (eventId: string, userId: string, additionalInfo?: any) => {
  const client = createClient()

  try {
    const { data, error } = await client
      .from("event_registrations")
      .insert({
        event_id: eventId,
        user_id: userId,
        registered_at: new Date().toISOString(),
        status: "registered", // Default status
        additional_info: additionalInfo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Optionally, call RPC for participant count increment here if needed
    // const { error: rpcError } = await client.rpc('increment_event_participants', { event_id: eventId })
    // if (rpcError) console.error('Error incrementing participant count:', rpcError)

    return { data, error }
  } catch (error) {
    console.error("Error registering for event:", error)
    return { data: null, error }
  }
}
