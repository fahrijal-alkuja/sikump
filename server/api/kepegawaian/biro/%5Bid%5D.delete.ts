import { defineEventHandler } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id

    await prisma.$executeRawUnsafe(`DELETE FROM tmst_biro WHERE id = ${id}`)

    return { success: true, message: 'Biro berhasil dihapus' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
