import { defineEventHandler, readBody } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const { table, id } = event.context.params || {}
    const body = await readBody(event)
    const { nama, golongan, id_jaf, nama_fakultas } = body

    let query = ''
    if (table === 'pangkat') {
      query = `UPDATE tref_pangkat SET pangkat = '${nama}', golongan = '${golongan}', id_jaf = '${id_jaf}' WHERE id = ${id}`
    } else if (table === 'jafung') {
      query = `UPDATE tref_jafung SET nama = '${nama}' WHERE id = ${id}`
    } else if (table === 'jabatan') {
      query = `UPDATE tref_jabatan SET nama_jabatan = '${nama}' WHERE id_jabatan = ${id}`
    } else if (table === 'prodi') {
      query = `UPDATE mst_program_studi SET nama_program_studi = '${nama}', nama_fakultas = '${nama_fakultas}' WHERE kode_program_studi = '${id}'`
    } else if (table === 'biro') {
      query = `UPDATE tmst_biro SET nama_biro = '${nama}' WHERE id = ${id}`
    } else {
      return { success: false, message: 'Tabel tidak valid' }
    }

    await prisma.$executeRawUnsafe(query)
    return { success: true, message: 'Data berhasil diperbarui' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
