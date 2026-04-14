import { H3Event, getCookie, setCookie, deleteCookie } from 'h3'
import crypto from 'crypto'

const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret-change-me-in-production'

export const signSession = (data: any): string => {
  const payload = JSON.stringify(data)
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  return `${Buffer.from(payload).toString('base64')}.${hmac}`
}

export const verifySession = (token: string): any | null => {
  try {
    const [payloadBase64, hmac] = token.split('.')
    if (!payloadBase64 || !hmac) return null

    const payload = Buffer.from(payloadBase64, 'base64').toString()
    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')

    if (hmac !== expectedHmac) {
      console.warn('Invalid session signature detected!')
      return null
    }

    return JSON.parse(payload)
  } catch (e) {
    return null
  }
}

export const getAuthSession = (event: H3Event) => {
  const token = getCookie(event, 'auth_session')
  if (!token) return null
  return verifySession(token)
}

export const setAuthSession = (event: H3Event, data: any) => {
  const signedToken = signSession(data)
  setCookie(event, 'auth_session', signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
    sameSite: 'lax'
  })
}

export const clearAuthSession = (event: H3Event) => {
  deleteCookie(event, 'auth_session')
}
