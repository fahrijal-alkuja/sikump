import { defineEventHandler, readBody } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id
    const body = await readBody(event)
    const { id_biro, nama_biro } = body

    await prisma.$executeRawUnsafe(`
      UPDATE tmst_biro 
      SET id_biro = '${id_biro}', nama_biro = '${nama_biro}'
      WHERE id = ${id}
    `)

    return { success: true, message: 'Biro berhasil diperbarui' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
