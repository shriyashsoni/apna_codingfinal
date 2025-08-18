import { getCurrentUser, isAdmin as checkIsAdmin } from "./supabase"

export interface AdminPermission {
  canManageUsers: boolean
  canManageHackathons: boolean
  canManageJobs: boolean
  canManageCourses: boolean
  canManagePartnerships: boolean
  canViewAnalytics: boolean
  canManageSettings: boolean
  canManagePermissions: boolean
}

export const checkAdminPermissions = async (): Promise<AdminPermission | null> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return null
    }

    const isAdminUser = await checkIsAdmin(user.email)
    if (!isAdminUser) {
      return null
    }

    // For now, all admins have full permissions
    // In the future, this could be more granular
    return {
      canManageUsers: true,
      canManageHackathons: true,
      canManageJobs: true,
      canManageCourses: true,
      canManagePartnerships: true,
      canViewAnalytics: true,
      canManageSettings: true,
      canManagePermissions: true,
    }
  } catch (error) {
    console.error("Error checking admin permissions:", error)
    return null
  }
}

export const requireAdminPermission = async (permission: keyof AdminPermission): Promise<boolean> => {
  const permissions = await checkAdminPermissions()
  if (!permissions) {
    throw new Error("Access denied: Admin permissions required")
  }

  if (!permissions[permission]) {
    throw new Error(`Access denied: ${permission} permission required`)
  }

  return true
}

// Specific permission checks
export const canManagePartnerships = async (): Promise<boolean> => {
  try {
    return await requireAdminPermission("canManagePartnerships")
  } catch {
    return false
  }
}

export const canViewAnalytics = async (): Promise<boolean> => {
  try {
    return await requireAdminPermission("canViewAnalytics")
  } catch {
    return false
  }
}

export const canManageUsers = async (): Promise<boolean> => {
  try {
    return await requireAdminPermission("canManageUsers")
  } catch {
    return false
  }
}

export const canManageSettings = async (): Promise<boolean> => {
  try {
    return await requireAdminPermission("canManageSettings")
  } catch {
    return false
  }
}

// Utility function to check if user is admin (from attachment)
export const isAdmin = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return false
    }

    return await checkIsAdmin(user.email)
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Enhanced admin check with specific permissions
export const hasAdminAccess = async (requiredPermission?: keyof AdminPermission): Promise<boolean> => {
  try {
    const permissions = await checkAdminPermissions()
    if (!permissions) {
      return false
    }

    if (requiredPermission) {
      return permissions[requiredPermission]
    }

    return true
  } catch (error) {
    console.error("Error checking admin access:", error)
    return false
  }
}

// Middleware function for admin routes
export const withAdminAuth = (requiredPermission?: keyof AdminPermission) => {
  return async () => {
    const hasAccess = await hasAdminAccess(requiredPermission)
    if (!hasAccess) {
      throw new Error("Unauthorized: Admin access required")
    }
    return true
  }
}
