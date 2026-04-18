import { createError, H3Event } from 'h3'
import { getAuthSession } from './session'

export interface UserSession {
  id: number | string
  username: string
  name: string
  role: 'admin' | 'prodi' | 'tendik'
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
  if (session.role !== 'admin' && session.role !== 'prodi') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Admin access required'
    })
  }
  return session
}

export const requireSelfOrAdmin = (event: H3Event, nik: string) => {
  const session = requireAuth(event)
  const isOwner = String(session.username) === String(nik)
  const isAdmin = session.role === 'admin' || session.role === 'prodi'
  
  if (!isAdmin && !isOwner) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Anda hanya diperbolehkan mengelola data Anda sendiri'
    })
  }
  return session
}
