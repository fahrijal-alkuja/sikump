import { PrismaClient } from '@prisma/client'
import { defineEventHandler } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const prodi: any[] = await prisma.$queryRawUnsafe(`SELECT kode_program_studi as id, nama_program_studi as nama FROM mst_program_studi ORDER BY nama_program_studi ASC`)
    return { success: true, data: prodi }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
