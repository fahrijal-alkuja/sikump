import { defineEventHandler } from 'h3'
import { prisma } from '../../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const levels = await prisma.tref_pendidikan.findMany({
      orderBy: { id: 'asc' }
    })
    return { success: true, data: levels }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
