import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '../../utils/prisma'
import { useServerSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = query.search as string || ''
    const ikatan_kerja = query.ikatan_kerja as string || '1' 
    const biro_id = query.biro_id as string || ''
    const education = query.education as string || ''
    const jafung = query.jafung as string || ''
    const status = query.status as string || ''

    const user = useServerSession(event)
    const isProdi = user?.role === 'prodi'
    const userUnit = user?.unit

    let employees: any[] = []

    if (ikatan_kerja === '1') {
      // --- DOSEN LOGIC ---
      let dbEdu = education

      // Determine if the unit is a Faculty or a single Prodi
      let subProdiCodes: string[] = []
      if (isProdi && userUnit) {
        const prodiList: any[] = await prisma.$queryRawUnsafe(`
          SELECT kode_program_studi FROM mst_program_studi 
          WHERE kode_program_studi = '${userUnit.trim()}' OR kode_fakultas = '${userUnit.trim()}'
        `)
        subProdiCodes = prodiList.map(p => p.kode_program_studi)
      }

      // If prodi admin but no matching prodi codes found (e.g. Biro), they should see no lecturers
      if (isProdi && userUnit && subProdiCodes.length === 0) {
        return { success: true, data: [] }
      }

      let sql = `
        SELECT 
          d.nik, d.nuptk, d.nama_dosen as nama, d.tempat_lahir, 
          DATE_FORMAT(d.tanggal_lahir, '%d-%m-%Y') as tanggal_lahir, 
          d.jenis_kelamin, d.telepon, d.status_aktif,
          d.kode_jenjang_pendidikan as edu_code,
          ps.nama_program_studi as unit,
          (SELECT tj.id_jafung FROM tmst_jafung tj WHERE tj.nik = d.nik ORDER BY tj.id DESC LIMIT 1) as current_jafung,
          (
            COALESCE((CASE WHEN d.upload_ktp IS NOT NULL AND d.upload_ktp != '' THEN 1 ELSE 0 END), 0) +
            COALESCE((CASE WHEN EXISTS(SELECT 1 FROM riwayat_pendidikan rp WHERE rp.nik = d.nik AND rp.upload_ijazah != '') THEN 1 ELSE 0 END), 0) +
            COALESCE((CASE WHEN EXISTS(SELECT 1 FROM riwayat_jabatan rj WHERE rj.nik = d.nik AND rj.upload_sk != '') THEN 1 ELSE 0 END), 0) +
            COALESCE((CASE WHEN EXISTS(SELECT 1 FROM riwayat_keluarga rk WHERE rk.nik = d.nik AND rk.upload_kk != '') THEN 1 ELSE 0 END), 0) +
            COALESCE((CASE WHEN EXISTS(SELECT 1 FROM tmst_pajak tp WHERE tp.nik = d.nik AND tp.upload_npwp != '') THEN 1 ELSE 0 END), 0) +
            COALESCE((CASE WHEN EXISTS(SELECT 1 FROM tmst_askes ta WHERE ta.nik = d.nik AND ta.upload_askes != '') THEN 1 ELSE 0 END), 0) +
            COALESCE((CASE WHEN EXISTS(SELECT 1 FROM tmst_jafung tj WHERE tj.nik = d.nik AND tj.file_upload != '') THEN 1 ELSE 0 END), 0)
          ) as docs_count
        FROM tmst_dosen d 
        LEFT JOIN mst_program_studi ps ON d.kode_program_studi = ps.kode_program_studi
        WHERE d.nik NOT LIKE '0000%'
      `
      
      if (subProdiCodes.length > 0) {
        sql += ` AND d.kode_program_studi IN (${subProdiCodes.map(c => `'${c}'`).join(',')})`
      } else if (biro_id) {
        sql += ` AND d.kode_program_studi = '${biro_id}'`
      }

      if (dbEdu) sql += ` AND d.kode_jenjang_pendidikan = '${dbEdu}'`
      if (status === '1') {
        sql += ` AND (d.status_aktif = '1' OR d.status_aktif IS NULL OR d.status_aktif = '')`
      } else if (status) {
        sql += ` AND d.status_aktif = '${status}'`
      }
      if (search) sql += ` AND (d.nama_dosen LIKE '%${search.replace(/'/g, "''")}%' OR d.nik LIKE '%${search.replace(/'/g, "''")}%')`
      
      if (jafung) {
        sql = `SELECT * FROM (${sql}) as base WHERE current_jafung = '${jafung}'`
      }

      sql += ` ORDER BY nama ASC LIMIT 500`
      const data: any[] = await prisma.$queryRawUnsafe(sql)
      employees = data.map(d => {
        const docCount = Number(d.docs_count || 0)
        // Unified mapping: 1 or 6 = S3, 5 = S2, 4 = S1
        let eduLabel = 'Lainnya'
        const rawEdu = String(d.edu_code || '')
        if (rawEdu === '1' || rawEdu === '6') eduLabel = 'S3'
        else if (rawEdu === '5') eduLabel = 'S2'
        else if (rawEdu === '4') eduLabel = 'S1'

        return { 
          ...d, 
          docs_count: docCount,
          nuptk: d.nuptk || '-', 
          ikatan_kerja: 'Dosen',
          pendidikan_terakhir: eduLabel,
          data_quality: Math.round((docCount / 7) * 100)
        }
      })

    } else {
      // --- TENDIK LOGIC ---
      let sql = `
        SELECT 
          k.nik, k.nama, k.tempat_lahir, 
          DATE_FORMAT(k.tanggal_lahir, '%d-%m-%Y') as tanggal_lahir, 
          k.jenis_kelamin, k.telepon, k.status_aktif,
          (SELECT id_pendidikan FROM riwayat_pendidikan rp WHERE rp.nik = k.nik ORDER BY id_pendidikan DESC LIMIT 1) as edu_code,
          (SELECT b.nama_biro 
           FROM riwayat_jabatan rj 
           JOIN tmst_biro b ON rj.id_biro = b.id_biro 
           WHERE rj.nik = k.nik 
           ORDER BY rj.id DESC 
           LIMIT 1) as unit,
          (
            COALESCE((CASE WHEN k.upload_ktp IS NOT NULL AND k.upload_ktp != '' THEN 1 ELSE 0 END), 0) +
            COALESCE((CASE WHEN EXISTS(SELECT 1 FROM riwayat_pendidikan rp WHERE rp.nik = k.nik AND rp.upload_ijazah != '') THEN 1 ELSE 0 END), 0) +
            COALESCE((CASE WHEN EXISTS(SELECT 1 FROM riwayat_jabatan rj WHERE rj.nik = k.nik AND rj.upload_sk != '') THEN 1 ELSE 0 END), 0) +
            COALESCE((CASE WHEN EXISTS(SELECT 1 FROM riwayat_keluarga rk WHERE rk.nik = k.nik AND rk.upload_kk != '') THEN 1 ELSE 0 END), 0) +
            COALESCE((CASE WHEN EXISTS(SELECT 1 FROM tmst_pajak tp WHERE tp.nik = k.nik AND tp.upload_npwp != '') THEN 1 ELSE 0 END), 0) +
            COALESCE((CASE WHEN EXISTS(SELECT 1 FROM tmst_askes ta WHERE ta.nik = k.nik AND ta.upload_askes != '') THEN 1 ELSE 0 END), 0) +
            COALESCE((CASE WHEN EXISTS(SELECT 1 FROM riwayat_pelatihan rpl WHERE rpl.nik = k.nik AND rpl.upload != '') THEN 1 ELSE 0 END), 0)
          ) as docs_count
        FROM tmst_karyawan k
        WHERE k.nik NOT LIKE '0000%'
      `
      
      if (isProdi && userUnit) {
        sql += ` 
          AND k.nik IN (
            SELECT TRIM(rj.nik) 
            FROM riwayat_jabatan rj 
            WHERE TRIM(rj.id_biro) = '${userUnit.trim()}'
          )
        `
      } else if (biro_id) {
        sql += ` 
          AND k.nik IN (
            SELECT TRIM(rj.nik) 
            FROM riwayat_jabatan rj 
            WHERE TRIM(rj.id_biro) = '${biro_id}'
          )
        `
      }

      if (education) {
        sql += ` AND EXISTS (SELECT 1 FROM riwayat_pendidikan rp WHERE rp.nik = k.nik AND rp.id_pendidikan = '${education}')`
      }

      if (status === '1') {
        sql += ` AND (k.status_aktif = '1' OR k.status_aktif IS NULL OR k.status_aktif = '')`
      } else if (status) {
        sql += ` AND k.status_aktif = '${status}'`
      }

      if (search) {
        sql += ` AND (k.nama LIKE '%${search.replace(/'/g, "''")}%' OR k.nik LIKE '%${search.replace(/'/g, "''")}%')`
      }

      sql += ` ORDER BY nama ASC LIMIT 500`
      const data: any[] = await prisma.$queryRawUnsafe(sql)
      employees = data.map(k => {
        const docCount = Number(k.docs_count || 0)
        let eduLabel = 'Lainnya'
        const rawEdu = String(k.edu_code || '')
        if (rawEdu === '1' || rawEdu === '6') eduLabel = 'S3'
        else if (rawEdu === '5') eduLabel = 'S2'
        else if (rawEdu === '4') eduLabel = 'S1'

        return {
          ...k,
          docs_count: docCount,
          unit: k.unit || 'Kantor Pusat',
          nuptk: '-',
          ikatan_kerja: 'Tenaga Kependidikan',
          pendidikan_terakhir: eduLabel,
          data_quality: Math.round((docCount / 7) * 100)
        }
      })
    }

    return { success: true, data: employees }
  } catch (error: any) {
    console.error('Fetch Employees Error:', error)
    return { success: false, message: error.message }
  }
})
