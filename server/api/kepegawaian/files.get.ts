import { defineEventHandler } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)
    const isProdi = user.role === 'prodi'
    const unit = user.unit
    
    // Collecting ALL digital assets from ALL relevant tables for both Dosen and Tendik
    let sql = `
      -- KTP & PROFILE
      SELECT upload_ktp as file_name, 'KTP' as category, nama_dosen as owner_name, 'KTP' as folder, kode_program_studi as unit_code
      FROM tmst_dosen WHERE upload_ktp != '' AND upload_ktp IS NOT NULL
      
      UNION ALL
      
      SELECT upload_ktp as file_name, 'KTP' as category, k.nama as owner_name, 'KTP' as folder, 
             (SELECT id_biro FROM riwayat_jabatan rj WHERE rj.nik = k.nik ORDER BY rj.id DESC LIMIT 1) as unit_code
      FROM tmst_karyawan k WHERE upload_ktp != '' AND upload_ktp IS NOT NULL
      
      UNION ALL

      -- EDUCATION
      SELECT upload_ijazah as file_name, 'Ijazah' as category, COALESCE(nullif(m.nama_dosen, ''), k.nama) as owner_name, 'pendidikan' as folder,
             COALESCE(m.kode_program_studi, (SELECT id_biro FROM riwayat_jabatan rj WHERE rj.nik = k.nik ORDER BY rj.id DESC LIMIT 1)) as unit_code
      FROM riwayat_pendidikan r 
      LEFT JOIN tmst_dosen m ON r.nik = m.nik 
      LEFT JOIN tmst_karyawan k ON r.nik = k.nik 
      WHERE upload_ijazah != '' AND upload_ijazah IS NOT NULL

      UNION ALL

      -- TRAINING
      SELECT upload as file_name, 'Sertifikat Pelatihan' as category, COALESCE(nullif(m.nama_dosen, ''), k.nama) as owner_name, 'sertifikat' as folder,
             COALESCE(m.kode_program_studi, (SELECT id_biro FROM riwayat_jabatan rj WHERE rj.nik = k.nik ORDER BY rj.id DESC LIMIT 1)) as unit_code
      FROM riwayat_pelatihan r 
      LEFT JOIN tmst_dosen m ON r.nik = m.nik 
      LEFT JOIN tmst_karyawan k ON r.nik = k.nik 
      WHERE upload != '' AND upload IS NOT NULL

      UNION ALL

      -- SK JAFUNG
      SELECT file_upload as file_name, 'SK Jafung' as category, m.nama_dosen as owner_name, 'SK' as folder, m.kode_program_studi as unit_code
      FROM tmst_jafung r 
      JOIN tmst_dosen m ON r.nik = m.nik 
      WHERE file_upload != '' AND file_upload IS NOT NULL

      UNION ALL

      -- KK
      SELECT upload_kk as file_name, 'Kartu Keluarga' as category, COALESCE(nullif(m.nama_dosen, ''), k.nama) as owner_name, 'kk' as folder,
             COALESCE(m.kode_program_studi, (SELECT id_biro FROM riwayat_jabatan rj WHERE rj.nik = k.nik ORDER BY rj.id DESC LIMIT 1)) as unit_code
      FROM riwayat_keluarga r 
      LEFT JOIN tmst_dosen m ON r.nik = m.nik 
      LEFT JOIN tmst_karyawan k ON r.nik = k.nik 
      WHERE upload_kk != '' AND upload_kk IS NOT NULL
    `

    if (isProdi && unit) {
      sql = `SELECT * FROM (${sql}) AS all_files WHERE unit_code = '${unit}'`
    }

    sql += ` ORDER BY file_name DESC LIMIT 1000 `

    const files: any = await prisma.$queryRawUnsafe(sql)

    return { success: true, data: files }
  } catch (error: any) {
    console.error('Files Fetch Error:', error)
    return { success: false, message: error.message }
  }
})
