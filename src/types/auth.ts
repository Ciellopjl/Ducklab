// ============================================================================
// CENTRALIZED AUTHENTICATION TYPES — Single Source of Truth for RBAC
// ============================================================================

/** 
 * User Roles Union.
 */
export type UserRole = 'BOSS' | 'STAFF' | 'REVOKED' | 'UNKNOWN'

/** 
 * Fully typed JWT token.
 */
export interface JWTToken {
  sub?: string
  email?: string
  name?: string
  picture?: string
  role?: UserRole
  iat?: number
  exp?: number
  jti?: string
  empresaAtiva?: string
  empresas?: any[]
}

/** 
 * Type Guards.
 */
export function isBoss(role: unknown): role is 'BOSS' {
  return role === 'BOSS'
}

export function isStaff(role: unknown): role is 'STAFF' {
  return role === 'STAFF'
}

export function isRevoked(role: unknown): role is 'REVOKED' {
  return role === 'REVOKED'
}

/**
 * Safely parses external input into a UserRole.
 * Case-insensitive and Null-safe.
 */
export function parseRole(value: unknown): UserRole {
  if (!value || typeof value !== 'string') return 'UNKNOWN'
  
  const normalized = value.trim().toUpperCase()
  const validRoles: UserRole[] = ['BOSS', 'STAFF', 'REVOKED']
  
  if (validRoles.includes(normalized as UserRole)) {
    return normalized as UserRole
  }
  
  return 'UNKNOWN'
}
