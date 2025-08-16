import { supabase } from "./supabase"

export interface UserPermission {
  id: string
  user_id: string
  permission_type: string
  permission_level: string
  granted_by: string
  granted_at: string
  expires_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OrganizerRole {
  id: string
  user_id: string
  role_name: string
  assigned_by: string
  assigned_at: string
  is_active: boolean
  permissions: any
  created_at: string
  updated_at: string
}

// Permission management functions
export const getUserPermissions = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_permissions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return { data, error }
}

export const grantPermission = async (
  userId: string,
  permissionType: string,
  permissionLevel: string,
  expiresAt?: string,
) => {
  const currentUser = await supabase.auth.getUser()
  if (!currentUser.data.user) {
    return { error: { message: "Not authenticated" } }
  }

  const { data, error } = await supabase
    .from("user_permissions")
    .insert([
      {
        user_id: userId,
        permission_type: permissionType,
        permission_level: permissionLevel,
        granted_by: currentUser.data.user.id,
        expires_at: expiresAt || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()

  return { data, error }
}

export const revokePermission = async (permissionId: string) => {
  const { data, error } = await supabase
    .from("user_permissions")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", permissionId)
    .select()

  return { data, error }
}

// Organizer role management functions
export const getOrganizerRoles = async (userId: string) => {
  const { data, error } = await supabase
    .from("organizer_roles")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return { data, error }
}

export const assignOrganizerRole = async (userId: string, roleName: string) => {
  const currentUser = await supabase.auth.getUser()
  if (!currentUser.data.user) {
    return { error: { message: "Not authenticated" } }
  }

  // Check if user already has this role
  const { data: existingRole } = await supabase
    .from("organizer_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role_name", roleName)
    .eq("is_active", true)
    .single()

  if (existingRole) {
    return { error: { message: "User already has this role" } }
  }

  const { data, error } = await supabase
    .from("organizer_roles")
    .insert([
      {
        user_id: userId,
        role_name: roleName,
        assigned_by: currentUser.data.user.id,
        is_active: true,
        permissions: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()

  return { data, error }
}

export const removeOrganizerRole = async (roleId: string) => {
  const { data, error } = await supabase
    .from("organizer_roles")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", roleId)
    .select()

  return { data, error }
}

// Permission checking functions
export const checkUserPermission = async (userId: string, permissionType: string, permissionLevel = "read") => {
  try {
    // First check if user is admin
    const { data: userProfile } = await supabase.from("users").select("role, email").eq("id", userId).single()

    if (userProfile?.role === "admin" || userProfile?.email === "sonishriyash@gmail.com") {
      return true
    }

    // Check organizer roles
    const { data: roles } = await supabase
      .from("organizer_roles")
      .select("role_name")
      .eq("user_id", userId)
      .eq("is_active", true)

    if (roles && roles.length > 0) {
      const hasPermission = roles.some((role) => {
        switch (role.role_name) {
          case "hackathon_organizer":
            return permissionType === "hackathons"
          case "course_instructor":
            return permissionType === "courses"
          case "job_poster":
            return permissionType === "jobs"
          default:
            return false
        }
      })

      if (hasPermission) {
        return true
      }
    }

    // Check direct permissions
    const { data: permissions } = await supabase
      .from("user_permissions")
      .select("*")
      .eq("user_id", userId)
      .eq("permission_type", permissionType)
      .eq("is_active", true)
      .gte("expires_at", new Date().toISOString())

    return permissions && permissions.length > 0
  } catch (error) {
    console.error("Error checking permission:", error)
    return false
  }
}

export const hasPermission = async (permissionType: string, permissionLevel = "read") => {
  const currentUser = await supabase.auth.getUser()
  if (!currentUser.data.user) {
    return false
  }

  return await checkUserPermission(currentUser.data.user.id, permissionType, permissionLevel)
}

// Get permission statistics for admin dashboard
export const getPermissionStats = async () => {
  try {
    const [permissionsResult, rolesResult] = await Promise.all([
      supabase.from("user_permissions").select("*").eq("is_active", true),
      supabase.from("organizer_roles").select("*").eq("is_active", true),
    ])

    const permissions = permissionsResult.data || []
    const roles = rolesResult.data || []

    return {
      total_permissions: permissions.length,
      active_organizers: roles.length,
      permission_types: {
        hackathons: permissions.filter((p) => p.permission_type === "hackathons").length,
        courses: permissions.filter((p) => p.permission_type === "courses").length,
        jobs: permissions.filter((p) => p.permission_type === "jobs").length,
        all: permissions.filter((p) => p.permission_type === "all").length,
      },
      organizer_types: {
        hackathon_organizer: roles.filter((r) => r.role_name === "hackathon_organizer").length,
        course_instructor: roles.filter((r) => r.role_name === "course_instructor").length,
        job_poster: roles.filter((r) => r.role_name === "job_poster").length,
      },
    }
  } catch (error) {
    console.error("Error getting permission stats:", error)
    return {
      total_permissions: 0,
      active_organizers: 0,
      permission_types: { hackathons: 0, courses: 0, jobs: 0, all: 0 },
      organizer_types: { hackathon_organizer: 0, course_instructor: 0, job_poster: 0 },
    }
  }
}

// Get all permissions for a user (including from roles)
export const getAllUserPermissions = async (userId: string) => {
  try {
    const [permissionsResult, rolesResult] = await Promise.all([getUserPermissions(userId), getOrganizerRoles(userId)])

    const permissions = permissionsResult.data || []
    const roles = rolesResult.data || []

    // Convert roles to permission-like objects for unified handling
    const rolePermissions = roles.map((role) => ({
      id: `role-${role.id}`,
      user_id: userId,
      permission_type: getRolePermissionType(role.role_name),
      permission_level: "write",
      granted_by: role.assigned_by,
      granted_at: role.assigned_at,
      expires_at: null,
      is_active: role.is_active,
      created_at: role.created_at,
      updated_at: role.updated_at,
      source: "role",
      role_name: role.role_name,
    }))

    return {
      permissions: [...permissions, ...rolePermissions],
      roles,
    }
  } catch (error) {
    console.error("Error getting all user permissions:", error)
    return { permissions: [], roles: [] }
  }
}

const getRolePermissionType = (roleName: string) => {
  switch (roleName) {
    case "hackathon_organizer":
      return "hackathons"
    case "course_instructor":
      return "courses"
    case "job_poster":
      return "jobs"
    default:
      return "unknown"
  }
}

// Middleware function to check permissions before actions
export const requirePermission = (permissionType: string, permissionLevel = "read") => {
  return async (userId: string) => {
    const hasAccess = await checkUserPermission(userId, permissionType, permissionLevel)
    if (!hasAccess) {
      throw new Error(`Insufficient permissions. Required: ${permissionLevel} access to ${permissionType}`)
    }
    return true
  }
}
