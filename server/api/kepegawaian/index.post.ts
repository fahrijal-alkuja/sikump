import { defineEventHandler, readBody, createError } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const body = await readBody(event)
  
  const { nik, nama, ikatan_kerja, nidn, nuptk, unit_id, jenis_kelamin, tempat_lahir, tanggal_lahir, telepon } = body

  if (!nik || !nama) {
    throw createError({ statusCode: 400, statusMessage: 'NIK dan Nama wajib diisi' })
  }

  try {
    if (ikatan_kerja === '1') {
      await prisma.$executeRawUnsafe(`
        INSERT INTO tmst_dosen (nik, nama_dosen, nidn, nuptk, kode_program_studi, jenis_kelamin, tempat_lahir, tanggal_lahir, telepon, status_aktif)
        VALUES ('${nik}', '${nama}', '${nidn || ''}', '${nuptk || ''}', '${unit_id || ''}', '${jenis_kelamin || 'L'}', '${tempat_lahir || ''}', ${tanggal_lahir ? `'${tanggal_lahir}'` : 'NULL'}, '${telepon || ''}', '1')
      `)
      return { success: true, message: 'Dosen berhasil ditambahkan' }
    } else {
      await prisma.tmst_karyawan.create({
        data: {
          nik,
          nama,
          jenis_kelamin,
          tempat_lahir,
          tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : null,
          telepon,
          status_aktif: 'Y',
          ikatan_kerja: '2'
        }
      })
      
      // If biro selected, add to riwayat_jabatan as the current one
      if (unit_id) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO riwayat_jabatan (nik, id_biro, is_aktiv, tmt)
          VALUES ('${nik}', '${unit_id}', 'Y', DATE_FORMAT(NOW(), '%d-%m-%Y'))
        `)
      }
      
      return { success: true, message: 'Karyawan berhasil ditambahkan' }
    }
  } catch (error: any) {
    return { success: false, message: 'Gagal menambah data. NIK mungkin sudah tersedia.' }
  }
})
