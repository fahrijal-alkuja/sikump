import { defineEventHandler } from 'h3'
import { requireAuth } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const table = event.context.params?.table
    let query = ''
    
    if (table === 'pangkat') query = 'SELECT id, pangkat as nama, golongan, id_jaf FROM tref_pangkat ORDER BY id ASC'
    else if (table === 'jafung') query = 'SELECT id, nama FROM tref_jafung ORDER BY id ASC'
    else if (table === 'jabatan') query = 'SELECT id_jabatan as id, nama_jabatan as nama FROM tref_jabatan ORDER BY nama_jabatan ASC'
    else if (table === 'prodi') query = 'SELECT kode_program_studi as id, nama_program_studi as nama, nama_fakultas FROM mst_program_studi ORDER BY nama_program_studi ASC'
    else if (table === 'biro') query = 'SELECT id, nama_biro as nama, "" as nama_fakultas FROM tmst_biro ORDER BY nama_biro ASC'
    else return { success: false, message: 'Tabel tidak ditemukan' }

    const data: any[] = await prisma.$queryRawUnsafe(query)
    return { success: true, data }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
