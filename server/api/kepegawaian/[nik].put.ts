import { defineEventHandler, readBody, createError } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)
  const nik = event.context.params?.nik
  const body = await readBody(event)
  
  const { nama, nidn, nuptk, unit_id, jenis_kelamin, tempat_lahir, tanggal_lahir, telepon, ikatan_kerja, alamat, nomor_ktp, agama, status_aktif, nama_ibu_kandung, tgl_selesai_studi } = body

  if (!nik || !nama) {
    throw createError({ statusCode: 400, statusMessage: 'Data tidak lengkap' })
  }

  try {
    if (ikatan_kerja === '1' || body.type === 'dosen') {
      // Update Dosen
      // Use YYYY-MM-DD for MySQL DATE columns
      const dbDate = tanggal_lahir || null

      await prisma.$executeRawUnsafe(`
        UPDATE tmst_dosen 
        SET nama_dosen = '${nama}', nidn = '${nidn || ''}', nuptk = '${nuptk || ''}', 
            kode_program_studi = '${unit_id || ''}', jenis_kelamin = '${jenis_kelamin || 'L'}', 
            tempat_lahir = '${tempat_lahir || ''}', 
            tanggal_lahir = ${dbDate ? `'${dbDate}'` : 'NULL'}, 
            telepon = '${telepon || ''}',
            alamat = '${alamat || ''}',
            nomor_ktp = '${nomor_ktp || ''}',
            agama = '${agama || ''}',
            status_aktif = '${status_aktif || '1'}',
            nama_ibu_kandung = '${nama_ibu_kandung || ''}',
            tgl_selesai_studi = ${tgl_selesai_studi ? `'${tgl_selesai_studi}'` : 'NULL'}
        WHERE nik = '${nik}'
      `)
      return { success: true, message: 'Data dosen berhasil diperbarui' }
    } else {
      // Update Karyawan/Tendik using raw SQL to avoid type issues with stale prisma client
      await prisma.$executeRawUnsafe(`
        UPDATE tmst_karyawan 
        SET nama = '${nama}', jenis_kelamin = '${jenis_kelamin || 'L'}', 
            tempat_lahir = '${tempat_lahir || ''}', 
            tanggal_lahir = ${tanggal_lahir ? `'${tanggal_lahir}'` : 'NULL'}, 
            telepon = '${telepon || ''}',
            alamat = '${alamat || ''}',
            nomor_ktp = '${nomor_ktp || ''}',
            agama = '${agama || ''}',
            status_aktif = '${status_aktif || '1'}',
            nama_ibu_kandung = '${nama_ibu_kandung || ''}'
        WHERE nik = '${nik}'
      `)

      // Update Biro if changed
      if (unit_id) {
        // Check current active biro
        const currentBiro: any[] = await prisma.$queryRawUnsafe(`SELECT id_biro FROM riwayat_jabatan WHERE nik = '${nik}' AND is_aktiv = 'Y' LIMIT 1`)
        if (currentBiro.length === 0 || currentBiro[0].id_biro !== unit_id) {
          // Deactivate old, insert new
          await prisma.$executeRawUnsafe(`UPDATE riwayat_jabatan SET is_aktiv = 'N' WHERE nik = '${nik}'`)
          await prisma.$executeRawUnsafe(`
            INSERT INTO riwayat_jabatan (nik, id_biro, is_aktiv, tmt) 
            VALUES ('${nik}', '${unit_id}', 'Y', DATE_FORMAT(NOW(), '%d-%m-%Y'))
          `)
        }
      }
      
      return { success: true, message: 'Data karyawan berhasil diperbarui' }
    }
  } catch (error: any) {
    console.error('Update Error:', error)
    return { success: false, message: error.message || 'Terjadi kesalahan internal pada server' }
  }
})
