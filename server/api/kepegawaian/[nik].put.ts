import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { requireAdmin, requireSelfOrAdmin } from '../../utils/auth'
import { prisma } from '../../utils/prisma'
import { writeFile } from 'fs/promises'
import path from 'path'
import { getStoragePath } from '../../utils/storage'
import { logActivity } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const nik = event.context.params?.nik as string
  requireSelfOrAdmin(event, nik)
  
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
        if (item.name === 'upload_ktp') {
          const ktpDir = getStoragePath('KTP')
          await writeFile(path.join(ktpDir, fileName), item.data)
          upload_ktp_name = fileName
        } else if (item.name === 'upload_foto') {
          const fotoDir = getStoragePath('foto')
          await writeFile(path.join(fotoDir, fileName), item.data)
          upload_foto_name = fileName
        }
      } else {
        // Handle Regular Fields
        fields[item.name] = item.data.toString()
      }
    }
  }

  console.log('Update Fields for NIK:', nik, fields)

  const { 
    nama, nidn, nuptk, unit_id, jenis_kelamin, tempat_lahir, 
    tanggal_lahir, telepon, ikatan_kerja, alamat, nomor_ktp, 
    agama, status_aktif, nama_ibu_kandung, tgl_selesai_studi, pendidikan 
  } = fields

  try {
    if (fields.type === 'dosen') {
      // Logic for Dosen
      const dbDate = tanggal_lahir && tanggal_lahir !== '' ? new Date(tanggal_lahir) : null
      const stDate = tgl_selesai_studi && tgl_selesai_studi !== '' ? new Date(tgl_selesai_studi) : null
      
      await (prisma as any).tmst_dosen.update({
        where: { nik },
        data: {
          nama_dosen: nama,
          nidn: nidn || '',
          nuptk: nuptk || '',
          kode_program_studi: unit_id || '',
          jenis_kelamin: jenis_kelamin || 'L',
          tempat_lahir: tempat_lahir || '',
          tanggal_lahir: dbDate,
          telepon: telepon || '',
          alamat: alamat || '',
          nomor_ktp: nomor_ktp || '',
          agama: agama || '',
          status_aktif: status_aktif || '1',
          nama_ibu_kandung: nama_ibu_kandung || '',
          tgl_selesai_studi: stDate,
          kode_jenjang_pendidikan: pendidikan ? Number(pendidikan) : null,
          upload_ktp: upload_ktp_name || undefined,
          pp: upload_foto_name || undefined
        }
      })

      // Update Ikatan Kerja in latest riwayat_jabatan for Dosen
      if (ikatan_kerja) {
        await prisma.$executeRaw`
          UPDATE riwayat_jabatan 
          SET ikatan_kerja = ${ikatan_kerja}
          WHERE nik = ${nik} 
          ORDER BY id DESC LIMIT 1
        `
      }

      await logActivity(event, 'UPDATE_DOSEN', nik, `Memperbarui biodata Dosen: ${nama}`)
      return { success: true, message: 'Data dosen berhasil diperbarui' }
    } else {
      // Update Karyawan/Tendik using Prisma (More reliable than raw SQL for various field types)
      const dbDate = tanggal_lahir && tanggal_lahir !== '' ? new Date(tanggal_lahir) : null
      
      await (prisma as any).tmst_karyawan.update({
        where: { nik },
        data: {
          nama: nama,
          jenis_kelamin: jenis_kelamin || 'L',
          tempat_lahir: tempat_lahir || '',
          tanggal_lahir: dbDate,
          telepon: telepon || '',
          alamat: alamat || '',
          nomor_ktp: nomor_ktp || '',
          agama: agama || '',
          status_aktif: status_aktif || '1',
          ikatan_kerja: ikatan_kerja || '',
          nama_ibu_kandung: nama_ibu_kandung || '',
          upload_ktp: upload_ktp_name || undefined,
          pp: upload_foto_name || undefined
        }
      })

      // Update Biro & Ikatan Kerja in riwayat_jabatan if changed
      if (unit_id || ikatan_kerja) {
        const currentRj: any[] = await prisma.$queryRaw`SELECT id, id_biro, ikatan_kerja FROM riwayat_jabatan WHERE nik = ${nik} ORDER BY id DESC LIMIT 1`
        if (currentRj.length > 0) {
          // Update the latest record
          await prisma.$executeRaw`
            UPDATE riwayat_jabatan 
            SET id_biro = COALESCE(${unit_id}, id_biro),
                ikatan_kerja = COALESCE(${ikatan_kerja}, ikatan_kerja)
            WHERE id = ${currentRj[0].id}
          `
        } else if (unit_id) {
          // Create new if none exists
          await prisma.$executeRaw`
            INSERT INTO riwayat_jabatan (nik, id_biro, is_aktiv, tmt, ikatan_kerja) 
            VALUES (${nik}, ${unit_id}, 'Y', DATE_FORMAT(NOW(), '%d-%m-%Y'), ${ikatan_kerja || ''})
          `
        }
      }
      
      await logActivity(event, 'UPDATE_KARYAWAN', nik, `Memperbarui biodata Karyawan: ${nama}`)
      return { success: true, message: 'Data karyawan berhasil diperbarui' }
    }
  } catch (error: any) {
    console.error('Update Error:', error)
    return { success: false, message: error.message || 'Terjadi kesalahan internal pada server' }
  }
})
