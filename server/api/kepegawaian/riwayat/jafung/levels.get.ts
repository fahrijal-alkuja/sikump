import { defineEventHandler } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const levels = await prisma.tref_jafung.findMany({
      orderBy: { id: 'asc' }
    })
    return {
      success: true,
      data: levels
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
})
