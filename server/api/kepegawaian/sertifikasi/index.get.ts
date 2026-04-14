import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const query = getQuery(event)
    const nik = query.nik as string

    const where = nik ? { nik } : {}

    const data = await prisma.tmst_sertifikasi.findMany({
      where,
      orderBy: { tahun: 'desc' }
    })

    return { success: true, data }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
