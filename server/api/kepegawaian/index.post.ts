import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  
  const { nik, nama, ikatan_kerja, nidn, nuptk, unit_id, jenis_kelamin, tempat_lahir, tanggal_lahir, telepon, pendidikan } = body

  if (!nik || !nama) {
    throw createError({ statusCode: 400, statusMessage: 'NIK dan Nama wajib diisi' })
  }

  try {
    if (ikatan_kerja === '1') {
      await prisma.$executeRaw`
        INSERT INTO tmst_dosen (nik, nama_dosen, nidn, nuptk, kode_program_studi, jenis_kelamin, tempat_lahir, tanggal_lahir, telepon, status_aktif, kode_jenjang_pendidikan)
        VALUES (${nik}, ${nama}, ${nidn || ''}, ${nuptk || ''}, ${unit_id || ''}, ${jenis_kelamin || 'L'}, ${tempat_lahir || ''}, ${tanggal_lahir ? tanggal_lahir : null}, ${telepon || ''}, '1', ${pendidikan || null})
      `
      return { success: true, message: 'Dosen berhasil ditambahkan' }
    } else {
      // @ts-ignore
      await prisma.tmst_karyawan.create({
        data: {
          nik,
          nama,
          jenis_kelamin,
          tempat_lahir,
          tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : null,
          telepon,
          status_aktif: 'Y'
        }
      })
      
      // If biro selected, add to riwayat_jabatan as the current one
      if (unit_id) {
        await prisma.$executeRaw`
          INSERT INTO riwayat_jabatan (nik, id_biro, is_aktiv, tmt)
          VALUES (${nik}, ${unit_id}, 'Y', DATE_FORMAT(NOW(), '%d-%m-%Y'))
        `
      }
      
      return { success: true, message: 'Karyawan berhasil ditambahkan' }
    }
  } catch (error: any) {
    console.error('Create error:', error)
    return { success: false, message: 'Gagal menambah data. NIK mungkin sudah tersedia.' }
  }
})
