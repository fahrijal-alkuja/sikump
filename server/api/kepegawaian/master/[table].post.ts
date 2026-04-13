import { defineEventHandler, readBody } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const table = event.context.params?.table
    const body = await readBody(event)
    const { id, nama, golongan, id_jaf, nama_fakultas } = body

    let query = ''
    if (table === 'pangkat') {
      query = `INSERT INTO tref_pangkat (pangkat, golongan, id_jaf) VALUES ('${nama}', '${golongan || ''}', '${id_jaf || ''}')`
    } else if (table === 'jafung') {
      query = `INSERT INTO tref_jafung (nama) VALUES ('${nama}')`
    } else if (table === 'jabatan') {
      query = `INSERT INTO tref_jabatan (nama_jabatan) VALUES ('${nama}')`
    } else if (table === 'prodi') {
      query = `INSERT INTO mst_program_studi (kode_program_studi, nama_program_studi, nama_fakultas) VALUES ('${id}', '${nama}', '${nama_fakultas || ''}')`
    } else if (table === 'biro') {
      query = `INSERT INTO tmst_biro (nama_biro) VALUES ('${nama}')`
    } else {
      return { success: false, message: 'Tabel tidak valid' }
    }

    await prisma.$executeRawUnsafe(query)
    return { success: true, message: 'Data berhasil ditambahkan' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
