import { supabase } from "./supabase"

// Enhanced types for the hackathon system
export interface EnhancedHackathon {
  id?: string
  title: string
  description: string
  short_description: string
  start_date: string | null
  end_date: string | null
  registration_deadline?: string | null
  location: string
  mode: "online" | "offline" | "hybrid"
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  prize_pool: string
  max_team_size?: number | null
  min_team_size?: number | null
  difficulty: "beginner" | "intermediate" | "advanced"
  organizer: string
  registration_link?: string | null
  whatsapp_link?: string | null
  image_url?: string | null
  banner_url?: string | null
  featured: boolean
  hackathon_type: "external" | "apna_coding"
  submission_start?: string | null
  submission_end?: string | null
  team_formation_deadline?: string | null
  max_participants?: number | null
  entry_fee?: number
  certificate_provided: boolean
  live_streaming: boolean
  recording_available: boolean
  technologies: string[]
  problem_statements: ProblemStatement[]
  partnerships: Partnership[]
  participants_count: number
  slug?: string
  created_at?: string
  updated_at?: string
  created_by?: string
}

export interface ProblemStatement {
  id?: string
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  resources: string[]
  constraints: string[]
  evaluation_criteria: string[]
  sample_input?: string
  sample_output?: string
}

export interface Partnership {
  id?: string
  name: string
  type: "sponsor" | "organizer" | "supporter" | "media"
  logo_url?: string
  website?: string
  contact_email?: string
  contribution?: string
}

export interface Team {
  id: string
  name: string
  hackathon_id: string
  leader_id: string
  members: TeamMember[]
  invite_code: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: "leader" | "member"
  joined_at: string
}

export interface Submission {
  id: string
  team_id: string
  hackathon_id: string
  title: string
  description: string
  github_url?: string
  demo_url?: string
  video_url?: string
  presentation_url?: string
  additional_links: { [key: string]: string }
  submitted_at: string
  updated_at: string
}

export interface Registration {
  id: string
  hackathon_id: string
  user_id: string
  team_id?: string
  registered_at: string
  status: "registered" | "team_formed" | "submitted" | "cancelled"
}

// Enhanced hackathon functions
export const createEnhancedHackathon = async (
  hackathonData: Omit<EnhancedHackathon, "id" | "created_at" | "updated_at" | "slug">,
) => {
  try {
    // Generate slug from title
    const slug = hackathonData.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    const { data, error } = await supabase
      .from("enhanced_hackathons")
      .insert([
        {
          ...hackathonData,
          slug,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error creating enhanced hackathon:", error)
    return { success: false, error: "Failed to create hackathon" }
  }
}

export const getEnhancedHackathons = async () => {
  try {
    const { data, error } = await supabase
      .from("enhanced_hackathons")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching hackathons:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching hackathons:", error)
    return { success: false, error: "Failed to fetch hackathons", data: [] }
  }
}

export const getEnhancedHackathonById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("enhanced_hackathons").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching hackathon:", error)
      return { success: false, error: error.message, data: null }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching hackathon:", error)
    return { success: false, error: "Failed to fetch hackathon", data: null }
  }
}

export const updateEnhancedHackathon = async (id: string, updates: Partial<EnhancedHackathon>) => {
  try {
    const { data, error } = await supabase
      .from("enhanced_hackathons")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    return { data, error }
  } catch (error) {
    console.error("Error updating hackathon:", error)
    return { data: null, error: { message: "Failed to update hackathon" } }
  }
}

export const deleteEnhancedHackathon = async (id: string) => {
  try {
    const { data, error } = await supabase.from("enhanced_hackathons").delete().eq("id", id)
    return { data, error }
  } catch (error) {
    console.error("Error deleting hackathon:", error)
    return { data: null, error: { message: "Failed to delete hackathon" } }
  }
}

// Problem Statement Functions
export const createProblemStatement = async (problemStatement: Omit<ProblemStatement, "id">) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_problem_statements")
      .insert([
        {
          ...problemStatement,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error creating problem statement:", error)
    return { data: null, error: { message: "Failed to create problem statement" } }
  }
}

export const getProblemStatements = async (hackathonId: string) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_problem_statements")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .order("created_at", { ascending: true })
    return { data: data || [], error }
  } catch (error) {
    console.error("Error fetching problem statements:", error)
    return { data: [], error: { message: "Failed to fetch problem statements" } }
  }
}

export const updateProblemStatement = async (id: string, updates: Partial<ProblemStatement>) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_problem_statements")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error updating problem statement:", error)
    return { data: null, error: { message: "Failed to update problem statement" } }
  }
}

export const deleteProblemStatement = async (id: string) => {
  try {
    const { data, error } = await supabase.from("hackathon_problem_statements").delete().eq("id", id)
    return { data, error }
  } catch (error) {
    console.error("Error deleting problem statement:", error)
    return { data: null, error: { message: "Failed to delete problem statement" } }
  }
}

// Partnership Functions
export const createHackathonPartnership = async (partnership: Omit<Partnership, "id">) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_partnerships")
      .insert([
        {
          ...partnership,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error creating partnership:", error)
    return { data: null, error: { message: "Failed to create partnership" } }
  }
}

export const getHackathonPartnerships = async (hackathonId: string) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_partnerships")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .order("created_at", { ascending: true })
    return { data: data || [], error }
  } catch (error) {
    console.error("Error fetching partnerships:", error)
    return { data: [], error: { message: "Failed to fetch partnerships" } }
  }
}

// Team Management Functions
export const createTeam = async (hackathonId: string, leaderId: string, teamName: string) => {
  try {
    // Generate unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data: team, error: teamError } = await supabase
      .from("enhanced_teams")
      .insert([
        {
          name: teamName,
          hackathon_id: hackathonId,
          leader_id: leaderId,
          invite_code: inviteCode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (teamError) {
      console.error("Team creation error:", teamError)
      return { success: false, error: teamError.message }
    }

    // Add leader as team member
    const { error: memberError } = await supabase.from("enhanced_team_members").insert([
      {
        team_id: team.id,
        user_id: leaderId,
        role: "leader",
        joined_at: new Date().toISOString(),
      },
    ])

    if (memberError) {
      console.error("Team member error:", memberError)
      return { success: false, error: memberError.message }
    }

    // Update registration status
    await supabase
      .from("enhanced_registrations")
      .update({ team_id: team.id, status: "team_formed" })
      .eq("hackathon_id", hackathonId)
      .eq("user_id", leaderId)

    return { success: true, data: team }
  } catch (error) {
    console.error("Error creating team:", error)
    return { success: false, error: "Failed to create team" }
  }
}

export const joinTeam = async (inviteCode: string, userId: string) => {
  try {
    // Find team by invite code
    const { data: team, error: teamError } = await supabase
      .from("enhanced_teams")
      .select("*")
      .eq("invite_code", inviteCode)
      .single()

    if (teamError || !team) {
      return { success: false, error: "Invalid invite code" }
    }

    // Check if user is already in a team for this hackathon
    const { data: existingMember } = await supabase
      .from("enhanced_team_members")
      .select("team_id, enhanced_teams!inner(hackathon_id)")
      .eq("user_id", userId)
      .eq("enhanced_teams.hackathon_id", team.hackathon_id)
      .single()

    if (existingMember) {
      return { success: false, error: "Already in a team for this hackathon" }
    }

    // Check team size limit
    const { data: hackathon } = await supabase
      .from("enhanced_hackathons")
      .select("max_team_size")
      .eq("id", team.hackathon_id)
      .single()

    if (hackathon?.max_team_size) {
      const { count } = await supabase
        .from("enhanced_team_members")
        .select("*", { count: "exact" })
        .eq("team_id", team.id)

      if (count && count >= hackathon.max_team_size) {
        return { success: false, error: "Team is full" }
      }
    }

    // Add user to team
    const { error: memberError } = await supabase.from("enhanced_team_members").insert([
      {
        team_id: team.id,
        user_id: userId,
        role: "member",
        joined_at: new Date().toISOString(),
      },
    ])

    if (memberError) {
      console.error("Join team error:", memberError)
      return { success: false, error: memberError.message }
    }

    // Update registration status
    await supabase
      .from("enhanced_registrations")
      .update({ team_id: team.id, status: "team_formed" })
      .eq("hackathon_id", team.hackathon_id)
      .eq("user_id", userId)

    return { success: true, data: team }
  } catch (error) {
    console.error("Error joining team:", error)
    return { success: false, error: "Failed to join team" }
  }
}

export const getUserTeamsForHackathon = async (userId: string, hackathonId: string) => {
  try {
    const { data, error } = await supabase
      .from("enhanced_team_members")
      .select(`
        *,
        enhanced_teams!inner(
          *,
          enhanced_hackathons!inner(id)
        )
      `)
      .eq("user_id", userId)
      .eq("enhanced_teams.hackathon_id", hackathonId)

    if (error) {
      console.error("Error fetching user teams:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching user teams:", error)
    return { success: false, error: "Failed to fetch teams", data: [] }
  }
}

export const getTeamDetails = async (teamId: string) => {
  try {
    const { data: team, error: teamError } = await supabase.from("enhanced_teams").select("*").eq("id", teamId).single()

    if (teamError) {
      return { success: false, error: teamError.message, data: null }
    }

    const { data: members, error: membersError } = await supabase
      .from("enhanced_team_members")
      .select(`
        *,
        users(id, full_name, email, avatar_url)
      `)
      .eq("team_id", teamId)

    if (membersError) {
      return { success: false, error: membersError.message, data: null }
    }

    const { data: submission } = await supabase.from("enhanced_submissions").select("*").eq("team_id", teamId).single()

    return {
      success: true,
      data: {
        ...team,
        members: members || [],
        submission,
      },
    }
  } catch (error) {
    console.error("Error fetching team details:", error)
    return { success: false, error: "Failed to fetch team details", data: null }
  }
}

// Participation Functions - Fixed for direct registration on Apna Coding
export const registerForEnhancedHackathon = async (hackathonId: string, userId: string) => {
  try {
    // Check if already registered
    const { data: existingRegistration } = await supabase
      .from("enhanced_registrations")
      .select("id")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId)
      .single()

    if (existingRegistration) {
      return { success: false, error: "Already registered for this hackathon" }
    }

    // Register user
    const { data, error } = await supabase
      .from("enhanced_registrations")
      .insert([
        {
          hackathon_id: hackathonId,
          user_id: userId,
          registered_at: new Date().toISOString(),
          status: "registered",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Registration error:", error)
      return { success: false, error: error.message }
    }

    // Update participant count
    await supabase.rpc("increment_enhanced_hackathon_participants", {
      hackathon_id: hackathonId,
    })

    return { success: true, data }
  } catch (error) {
    console.error("Error registering for hackathon:", error)
    return { success: false, error: "Failed to register" }
  }
}

export const checkEnhancedHackathonRegistration = async (hackathonId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("enhanced_registrations")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking registration:", error)
      return { registered: false, data: null }
    }

    return { registered: !!data, data }
  } catch (error) {
    console.error("Error checking registration:", error)
    return { registered: false, data: null }
  }
}

// Submission Functions
export const submitProject = async (
  teamId: string,
  hackathonId: string,
  submissionData: {
    title: string
    description: string
    github_url?: string
    demo_url?: string
    video_url?: string
    presentation_url?: string
    additional_links?: { [key: string]: string }
  },
) => {
  try {
    const { data, error } = await supabase
      .from("enhanced_submissions")
      .upsert([
        {
          team_id: teamId,
          hackathon_id: hackathonId,
          ...submissionData,
          additional_links: submissionData.additional_links || {},
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Submission error:", error)
      return { success: false, error: error.message }
    }

    // Update registration status
    await supabase
      .from("enhanced_registrations")
      .update({ status: "submitted" })
      .eq("hackathon_id", hackathonId)
      .eq("team_id", teamId)

    return { success: true, data }
  } catch (error) {
    console.error("Error submitting project:", error)
    return { success: false, error: "Failed to submit project" }
  }
}

export const getHackathonSubmissions = async (hackathonId: string) => {
  try {
    const { data, error } = await supabase
      .from("enhanced_submissions")
      .select(`
        *,
        enhanced_teams (
          name,
          leader_id
        ),
        hackathon_problem_statements (
          title,
          difficulty,
          max_points
        ),
        users!enhanced_submissions_submitted_by_fkey (
          full_name,
          email
        )
      `)
      .eq("hackathon_id", hackathonId)
      .order("submitted_at", { ascending: false })
    return { data: data || [], error }
  } catch (error) {
    console.error("Error fetching hackathon submissions:", error)
    return { data: [], error: { message: "Failed to fetch hackathon submissions" } }
  }
}

// Statistics Functions
export const getHackathonStatistics = async (hackathonId: string) => {
  try {
    const [registrationsResult, teamsResult, submissionsResult] = await Promise.all([
      supabase.from("enhanced_registrations").select("*", { count: "exact" }).eq("hackathon_id", hackathonId),
      supabase.from("enhanced_teams").select("*", { count: "exact" }).eq("hackathon_id", hackathonId),
      supabase.from("enhanced_submissions").select("*", { count: "exact" }).eq("hackathon_id", hackathonId),
    ])

    return {
      success: true,
      data: {
        totalRegistrations: registrationsResult.count || 0,
        totalTeams: teamsResult.count || 0,
        totalSubmissions: submissionsResult.count || 0,
      },
    }
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return {
      success: false,
      error: "Failed to fetch statistics",
      data: { totalRegistrations: 0, totalTeams: 0, totalSubmissions: 0 },
    }
  }
}

// File upload function for hackathon images
export const uploadHackathonImage = async (file: File, hackathonId: string) => {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `hackathon-${hackathonId}-${Date.now()}.${fileExt}`
    const filePath = `hackathons/${fileName}`

    const { data, error } = await supabase.storage.from("hackathon-images").upload(filePath, file)

    if (error) {
      return { data: null, error }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("hackathon-images").getPublicUrl(filePath)

    return { data: { publicUrl }, error: null }
  } catch (error) {
    console.error("Error uploading image:", error)
    return { data: null, error: { message: "Failed to upload image" } }
  }
}
