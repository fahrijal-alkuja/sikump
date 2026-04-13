import { PrismaClient } from '@prisma/client'
import { defineEventHandler } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const session = requireAuth(event)
    const logs: any = await prisma.$queryRawUnsafe(`
      SELECT * FROM activity_logs 
      ORDER BY created_at DESC 
      LIMIT 100
    `)
    return { success: true, data: logs }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
