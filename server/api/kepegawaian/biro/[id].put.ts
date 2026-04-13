import { defineEventHandler, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  try {
    const id = event.context.params?.id
    const body = await readBody(event)
    const { id_biro, nama_biro } = body

    await prisma.$executeRaw`
      UPDATE tmst_biro 
      SET id_biro = ${id_biro}, nama_biro = ${nama_biro}
      WHERE id = ${id}
    `

    return { success: true, message: 'Biro berhasil diperbarui' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
