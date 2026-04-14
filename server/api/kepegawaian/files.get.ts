import { defineEventHandler } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    
    // Collecting ALL digital assets from ALL relevant tables for both Dosen and Tendik
    const files: any = await prisma.$queryRawUnsafe(`
      -- KTP & PROFILE (NEWLY ADDED)
      SELECT upload_ktp as file_name, 'KTP' as category, nama_dosen as owner_name, 'KTP' as folder 
      FROM tmst_dosen WHERE upload_ktp != '' AND upload_ktp IS NOT NULL
      
      UNION ALL
      
      SELECT upload_ktp as file_name, 'KTP' as category, nama as owner_name, 'KTP' as folder 
      FROM tmst_karyawan WHERE upload_ktp != '' AND upload_ktp IS NOT NULL
      
      UNION ALL

      -- EDUCATION (DOZEN & TENDIK)
      SELECT upload_ijazah as file_name, 'Ijazah' as category, COALESCE(nullif(m.nama_dosen, ''), k.nama) as owner_name, 'pendidikan' as folder 
      FROM riwayat_pendidikan r 
      LEFT JOIN tmst_dosen m ON r.nik = m.nik 
      LEFT JOIN tmst_karyawan k ON r.nik = k.nik 
      WHERE upload_ijazah != '' AND upload_ijazah IS NOT NULL

      UNION ALL

      -- TRAINING (BOTH)
      SELECT upload as file_name, 'Sertifikat Pelatihan' as category, COALESCE(nullif(m.nama_dosen, ''), k.nama) as owner_name, 'sertifikat' as folder 
      FROM riwayat_pelatihan r 
      LEFT JOIN tmst_dosen m ON r.nik = m.nik 
      LEFT JOIN tmst_karyawan k ON r.nik = k.nik 
      WHERE upload != '' AND upload IS NOT NULL

      UNION ALL

      -- STRUCTURAL POSITION (BOTH)
      SELECT upload_sk as file_name, 'SK Jabatan' as category, COALESCE(nullif(m.nama_dosen, ''), k.nama) as owner_name, 'SK' as folder 
      FROM riwayat_jabatan r 
      LEFT JOIN tmst_dosen m ON r.nik = m.nik 
      LEFT JOIN tmst_karyawan k ON r.nik = k.nik 
      WHERE upload_sk != '' AND upload_sk IS NOT NULL

      UNION ALL

      -- ACADEMIC POSITION (JAFUNG)
      SELECT file_upload as file_name, 'SK Jafung' as category, m.nama_dosen as owner_name, 'SK' as folder 
      FROM tmst_jafung r 
      JOIN tmst_dosen m ON r.nik = m.nik 
      WHERE file_upload != '' AND file_upload IS NOT NULL

      UNION ALL

      -- APPOINTMENT (BOTH)
      SELECT upload_sk as file_name, 'SK Kepegawaian' as category, COALESCE(nullif(m.nama_dosen, ''), k.nama) as owner_name, 'SK' as folder 
      FROM riwayat_pengangkatan r 
      LEFT JOIN tmst_dosen m ON r.nik = m.nik 
      LEFT JOIN tmst_karyawan k ON r.nik = k.nik 
      WHERE upload_sk != '' AND upload_sk IS NOT NULL

      UNION ALL

      -- FAMILY (KK)
      SELECT upload_kk as file_name, 'Kartu Keluarga' as category, COALESCE(nullif(m.nama_dosen, ''), k.nama) as owner_name, 'kk' as folder 
      FROM riwayat_keluarga r 
      LEFT JOIN tmst_dosen m ON r.nik = m.nik 
      LEFT JOIN tmst_karyawan k ON r.nik = k.nik 
      WHERE upload_kk != '' AND upload_kk IS NOT NULL

      UNION ALL

      -- TAX & ASKES
      SELECT upload_npwp as file_name, 'NPWP' as category, COALESCE(nullif(m.nama_dosen, ''), k.nama) as owner_name, 'npwp' as folder 
      FROM tmst_pajak r 
      LEFT JOIN tmst_dosen m ON r.nik = m.nik 
      LEFT JOIN tmst_karyawan k ON r.nik = k.nik 
      WHERE upload_npwp != '' AND upload_npwp IS NOT NULL

      UNION ALL

      SELECT upload_askes as file_name, 'Kartu Askes/BPJS' as category, COALESCE(nullif(m.nama_dosen, ''), k.nama) as owner_name, 'askes' as folder 
      FROM tmst_askes r 
      LEFT JOIN tmst_dosen m ON r.nik = m.nik 
      LEFT JOIN tmst_karyawan k ON r.nik = k.nik 
      WHERE upload_askes != '' AND upload_askes IS NOT NULL

      ORDER BY file_name DESC
      LIMIT 1000
    `)

    return { success: true, data: files }
  } catch (error: any) {
    console.error('Files Fetch Error:', error)
    return { success: false, message: error.message }
  }
})
