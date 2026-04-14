import { createError, H3Event } from 'h3'
import { getAuthSession } from './session'

export interface UserSession {
  id: number
  username: string
  name: string
  role: 'admin' | 'prodi'
  unit: string | null
  roles: string[]
}

export const useServerSession = (event: H3Event): UserSession | null => {
  return getAuthSession(event)
}

export const requireAuth = (event: H3Event) => {
  const session = useServerSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  return session
}

export const requireAdmin = (event: H3Event) => {
  const session = requireAuth(event)
  if (session.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Admin access required'
    })
  }
  return session
}
