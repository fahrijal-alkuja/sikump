import { defineEventHandler } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const id = event.context.params?.id

    if (!id) {
      throw new Error('ID is required')
    }

    await prisma.tmst_sertifikasi.delete({
      where: { id: Number(id) }
    })

    return { success: true, message: 'Data deleted successfully' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
