import { defineEventHandler } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const { table, id } = event.context.params || {}
    
    let query = ''
    if (table === 'pangkat') query = `DELETE FROM tref_pangkat WHERE id = ${id}`
    else if (table === 'jafung') query = `DELETE FROM tref_jafung WHERE id = ${id}`
    else if (table === 'biro') query = `DELETE FROM tmst_biro WHERE id = ${id}`
    else if (table === 'jabatan') query = `DELETE FROM tref_jabatan WHERE id_jabatan = ${id}`
    else if (table === 'prodi') query = `DELETE FROM mst_program_studi WHERE kode_program_studi = '${id}'`
    else return { success: false, message: 'Tabel tidak valid' }

    await prisma.$executeRawUnsafe(query)
    return { success: true, message: 'Data berhasil dihapus' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
