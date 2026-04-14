import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async () => {
  try {
    const data = await prisma.tref_pangkat.findMany({
      orderBy: { id: 'asc' }
    })
    return { success: true, data }
  } catch (e) {
    return { success: false, message: 'Gagal mengambil referensi pangkat' }
  }
})
