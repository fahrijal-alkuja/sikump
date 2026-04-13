import { defineEventHandler } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  try {
    const id = event.context.params?.id

    await prisma.$executeRaw`DELETE FROM tmst_biro WHERE id = ${id}`

    return { success: true, message: 'Biro berhasil dihapus' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
