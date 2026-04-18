import { H3Event, createError } from 'h3'

const memoryStore = new Map<string, { count: number; expires: number }>()

export const rateLimit = (event: H3Event, options: { max: number; windowMs: number; keyPrefix?: string }) => {
  const ip = event.node.req.headers['x-forwarded-for'] || event.node.req.socket.remoteAddress || 'unknown'
  const key = `${options.keyPrefix || 'global'}_${ip}`
  const now = Date.now()
  
  const record = memoryStore.get(key)
  
  if (!record || now > record.expires) {
    memoryStore.set(key, { count: 1, expires: now + options.windowMs })
    return
  }
  
  record.count++
  if (record.count > options.max) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Terlalu banyak permintaan. Silakan coba lagi nanti.'
    })
  }
}

// Cleanup interval (every 5 minutes)
if (!(global as any)._limiterCleanup) {
  (global as any)._limiterCleanup = setInterval(() => {
    const now = Date.now()
    for (const [key, val] of memoryStore.entries()) {
      if (now > val.expires) memoryStore.delete(key)
    }
  }, 300000)
}
