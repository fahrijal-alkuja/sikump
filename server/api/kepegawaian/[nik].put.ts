import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { prisma } from '../../utils/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const nik = event.context.params?.nik
  const formData = await readMultipartFormData(event)
  
  if (!nik || !formData) {
    throw createError({ statusCode: 400, statusMessage: 'Data tidak lengkap' })
  }

  const fields: any = {}
  let upload_ktp_name = null
  let upload_foto_name = null

  // Process Multipart Data
  for (const item of formData) {
    if (item.name && item.data) {
      if (item.filename) {
        // Handle File Uploads
        const ext = path.extname(item.filename)
        const fileName = `${nik}_${Date.now()}${ext}`
        const storageRoot = '/www/wwwroot/sikump-storage'
        
        if (item.name === 'upload_ktp') {
          await writeFile(path.join(storageRoot, 'KTP', fileName), item.data)
          upload_ktp_name = fileName
        } else if (item.name === 'upload_foto') {
          await writeFile(path.join(storageRoot, 'foto', fileName), item.data)
          upload_foto_name = fileName
        }
      } else {
        // Handle Regular Fields
        fields[item.name] = item.data.toString()
      }
    }
  }

  const { nama, nidn, nuptk, unit_id, jenis_kelamin, tempat_lahir, tanggal_lahir, telepon, ikatan_kerja, alamat, nomor_ktp, agama, status_aktif, nama_ibu_kandung, tgl_selesai_studi, pendidikan } = fields

  try {
    if (ikatan_kerja === '1' || fields.type === 'dosen') {
      const dbDate = tanggal_lahir || null
      
      // Update basic fields
      await prisma.$executeRaw`
        UPDATE tmst_dosen 
        SET nama_dosen = ${nama}, nidn = ${nidn || ''}, nuptk = ${nuptk || ''}, 
            kode_program_studi = ${unit_id || ''}, jenis_kelamin = ${jenis_kelamin || 'L'}, 
            tempat_lahir = ${tempat_lahir || ''}, 
            tanggal_lahir = ${dbDate ? dbDate : null}, 
            telepon = ${telepon || ''},
            alamat = ${alamat || ''},
            nomor_ktp = ${nomor_ktp || ''},
            agama = ${agama || ''},
            status_aktif = ${status_aktif || '1'},
            nama_ibu_kandung = ${nama_ibu_kandung || ''},
            tgl_selesai_studi = ${tgl_selesai_studi ? tgl_selesai_studi : null},
            kode_jenjang_pendidikan = ${pendidikan || null}
        WHERE nik = ${nik}
      `

      // Update file columns if uploaded
      if (upload_ktp_name) {
        await prisma.$executeRaw`UPDATE tmst_dosen SET upload_ktp = ${upload_ktp_name} WHERE nik = ${nik}`
      }
      if (upload_foto_name) {
        await prisma.$executeRaw`UPDATE tmst_dosen SET pp = ${upload_foto_name} WHERE nik = ${nik}`
      }

      return { success: true, message: 'Data dosen berhasil diperbarui' }
    } else {
      // Update Karyawan/Tendik
      await prisma.$executeRaw`
        UPDATE tmst_karyawan 
        SET nama = ${nama}, jenis_kelamin = ${jenis_kelamin || 'L'}, 
            tempat_lahir = ${tempat_lahir || ''}, 
            tanggal_lahir = ${tanggal_lahir ? tanggal_lahir : null}, 
            telepon = ${telepon || ''},
            alamat = ${alamat || ''},
            nomor_ktp = ${nomor_ktp || ''},
            agama = ${agama || ''},
            status_aktif = ${status_aktif || '1'},
            nama_ibu_kandung = ${nama_ibu_kandung || ''}
        WHERE nik = ${nik}
      `

      if (upload_ktp_name) {
        await prisma.$executeRaw`UPDATE tmst_karyawan SET upload_ktp = ${upload_ktp_name} WHERE nik = ${nik}`
      }
      if (upload_foto_name) {
        await prisma.$executeRaw`UPDATE tmst_karyawan SET pp = ${upload_foto_name} WHERE nik = ${nik}`
      }

      // Update Biro if changed
      if (unit_id) {
        const currentBiro: any[] = await prisma.$queryRaw`SELECT id_biro FROM riwayat_jabatan WHERE nik = ${nik} AND is_aktiv = 'Y' LIMIT 1`
        if (currentBiro.length === 0 || currentBiro[0].id_biro !== unit_id) {
          await prisma.$executeRaw`UPDATE riwayat_jabatan SET is_aktiv = 'N' WHERE nik = ${nik}`
          await prisma.$executeRaw`
            INSERT INTO riwayat_jabatan (nik, id_biro, is_aktiv, tmt) 
            VALUES (${nik}, ${unit_id}, 'Y', DATE_FORMAT(NOW(), '%d-%m-%Y'))
          `
        }
      }
      
      return { success: true, message: 'Data karyawan berhasil diperbarui' }
    }
  } catch (error: any) {
    console.error('Update Error:', error)
    return { success: false, message: error.message || 'Terjadi kesalahan internal pada server' }
  }
})
