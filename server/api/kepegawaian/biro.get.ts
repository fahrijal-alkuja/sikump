import { PrismaClient } from '@prisma/client'
import { defineEventHandler } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const biro: any[] = await prisma.$queryRawUnsafe(`SELECT id_biro as id, nama_biro as nama FROM tmst_biro ORDER BY nama_biro ASC`)
    return { success: true, data: biro }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
