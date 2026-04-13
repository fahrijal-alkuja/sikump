import { getCookie, createError, H3Event } from 'h3'

export interface UserSession {
  id: number
  username: string
  name: string
  role: 'admin' | 'prodi'
  unit: string | null
  roles: string[]
}

export const useServerSession = (event: H3Event): UserSession | null => {
  const sessionCookie = getCookie(event, 'auth_session')
  if (!sessionCookie) return null
  
  try {
    return JSON.parse(sessionCookie)
  } catch {
    return null
  }
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
