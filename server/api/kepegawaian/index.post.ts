import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { prisma } from '../../utils/prisma'
import { writeFile, rename } from 'fs/promises'
import path from 'path'
import { getStoragePath } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const formData = await readMultipartFormData(event)
  
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'Data tidak lengkap' })
  }

  const fields: any = {}
  let upload_ktp_name = null

  // Process Multipart Data
  for (const item of formData) {
    if (item.name && item.data) {
      if (item.filename && item.name === 'upload_ktp') {
        const ext = path.extname(item.filename)
        fields.nik = fields.nik || 'new' // fallback if nik not yet parsed
        const fileName = `${Date.now()}${ext}` // wait until we have NIK for better name? or just timestamp
        const ktpDir = getStoragePath('KTP')
        await writeFile(path.join(ktpDir, fileName), item.data)
        upload_ktp_name = fileName
      } else {
        fields[item.name] = item.data.toString()
      }
    }
  }

  const { nik, nama, ikatan_kerja, nidn, nuptk, unit_id, jenis_kelamin, tempat_lahir, tanggal_lahir, telepon, pendidikan } = fields

  if (!nik || !nama) {
    throw createError({ statusCode: 400, statusMessage: 'NIK dan Nama wajib diisi' })
  }

  // Rename file once we have NIK if needed, but timestamp is fine
  const ktpFinalName = upload_ktp_name ? `${nik}_ktp_${upload_ktp_name}` : null
  if (upload_ktp_name && ktpFinalName) {
    const ktpDir = getStoragePath('KTP')
    await rename(path.join(ktpDir, upload_ktp_name), path.join(ktpDir, ktpFinalName))
  }

  try {
    if (ikatan_kerja === '1') {
      await prisma.$executeRaw`
        INSERT INTO tmst_dosen (nik, nama_dosen, nidn, nuptk, kode_program_studi, jenis_kelamin, tempat_lahir, tanggal_lahir, telepon, status_aktif, kode_jenjang_pendidikan, upload_ktp)
        VALUES (${nik}, ${nama}, ${nidn || ''}, ${nuptk || ''}, ${unit_id || ''}, ${jenis_kelamin || 'L'}, ${tempat_lahir || ''}, ${tanggal_lahir ? tanggal_lahir : null}, ${telepon || ''}, '1', ${pendidikan || null}, ${ktpFinalName})
      `
      return { success: true, message: 'Dosen berhasil ditambahkan' }
    } else {
      await prisma.$executeRaw`
        INSERT INTO tmst_karyawan (nik, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, telepon, status_aktif, upload_ktp)
        VALUES (${nik}, ${nama}, ${jenis_kelamin || 'L'}, ${tempat_lahir || ''}, ${tanggal_lahir ? tanggal_lahir : null}, ${telepon || ''}, '1', ${ktpFinalName})
      `
      
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
