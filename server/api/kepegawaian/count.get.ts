import { defineEventHandler } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const totalEmployees = await prisma.tmst_karyawan.count()
    return {
      success: true,
      total: totalEmployees
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
})
