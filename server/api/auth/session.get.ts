import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  const session = useServerSession(event)
  if (!session) {
    return { success: false }
  }
  return { success: true, user: session }
})
