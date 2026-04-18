import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { prisma } from '../../utils/prisma'
import { writeFile, rename } from 'fs/promises'
import path from 'path'
import { getStoragePath } from '../../utils/storage'
import { logActivity } from '../../utils/logger'

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
      await logActivity(event, 'CREATE_DOSEN', nik, `Menambah data Dosen baru: ${nama}`)
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
      
      // AUTOMATE USER CREATION FOR TENDIK
      try {
        const bcrypt = await import('bcryptjs')
        const hashedPassword = bcrypt.hashSync(nik, 10)
        
        // 1. Create User
        await prisma.$executeRaw`
          INSERT INTO users (ip_address, username, password, email, first_name, last_name, company, active, created_on)
          VALUES ('127.0.0.1', ${nik}, ${hashedPassword}, ${nik + '@unikarta.ac.id'}, ${nama}, '', ${nik}, 1, UNIX_TIMESTAMP())
        `
        
        // 2. Assign to Tendik Group (Group 3 is usually tendik, but let's find it or use 2 for members)
        const groups: any[] = await prisma.$queryRaw`SELECT id FROM \`groups\` WHERE name = 'tendik' LIMIT 1`
        const groupId = groups.length > 0 ? groups[0].id : 2 // Default to 2 if 'tendik' group not found

        const userRows: any[] = await prisma.$queryRaw`SELECT id FROM users WHERE username = ${nik} LIMIT 1`
        if (userRows.length > 0) {
          await prisma.$executeRaw`
            INSERT INTO users_groups (user_id, group_id)
            VALUES (${userRows[0].id}, ${groupId})
          `
        }
      } catch (userErr) {
        console.error('Auto-user creation failed:', userErr)
        // We don't throw error here to not block the main process
      }
      
      await logActivity(event, 'CREATE_KARYAWAN', nik, `Menambah data Karyawan baru: ${nama}`)
      return { success: true, message: 'Karyawan berhasil ditambahkan & User Akses Tersedia' }
    }
  } catch (error: any) {
    console.error('Create error:', error)
    return { success: false, message: 'Gagal menambah data. NIK mungkin sudah tersedia.' }
  }
})
