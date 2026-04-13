import { defineEventHandler, readBody } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  try {
    const body = await readBody(event)
    const { id_biro, nama_biro } = body

    if (!id_biro || !nama_biro) {
      return { success: false, message: 'ID Biro dan Nama Biro wajib diisi' }
    }

    await prisma.$executeRaw`
      INSERT INTO tmst_biro (id_biro, nama_biro)
      VALUES (${id_biro}, ${nama_biro})
    `

    return { success: true, message: 'Biro berhasil ditambahkan' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
