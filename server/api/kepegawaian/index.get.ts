import { defineEventHandler, getQuery, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)
    const query = getQuery(event)
    const search = String(query.search || '')
    const ikatan_kerja = String(query.ikatan_kerja || '1')
    const biro_id = String(query.biro_id || '')
    const education = String(query.education || '')
    const jafung = String(query.jafung || '')
    const status = String(query.status || '')

    const isProdi = user.role === 'prodi'
    const userUnit = user.unit || ''

    const params: any[] = []
    let employees: any[] = []

    if (ikatan_kerja === '1') {
      // --- DOSEN LOGIC ---
      let subProdiCodes: string[] = []
      if (isProdi && userUnit) {
        const pList: any[] = await prisma.$queryRawUnsafe(`
          SELECT kode_program_studi FROM mst_program_studi 
          WHERE kode_program_studi = ? OR kode_fakultas = ?
        `, userUnit.trim(), userUnit.trim())
        subProdiCodes = pList.map(p => p.kode_program_studi)
        
        if (subProdiCodes.length === 0) return { success: true, data: [] }
      }

      let sql = `
        SELECT 
          d.nik, d.nuptk, d.nama_dosen as nama, d.tempat_lahir, 
          DATE_FORMAT(d.tanggal_lahir, '%d-%m-%Y') as tanggal_lahir, 
          d.jenis_kelamin, d.telepon, d.status_aktif,
          d.kode_jenjang_pendidikan as edu_code,
          ps.nama_program_studi as homebase,
          COALESCE(
            (SELECT b.nama_biro FROM riwayat_jabatan rj 
             JOIN tmst_biro b ON rj.id_biro = b.id_biro 
             WHERE rj.nik = d.nik AND (rj.is_aktiv = '1' OR rj.is_aktiv = 'Y' OR rj.is_aktiv IS NULL)
             ORDER BY rj.id DESC LIMIT 1),
            ps.nama_program_studi
          ) as unit,
          (SELECT tj.id_jafung FROM tmst_jafung tj WHERE tj.nik = d.nik ORDER BY tj.id DESC LIMIT 1) as current_jafung,
          (
            COALESCE((CASE WHEN d.upload_ktp != '' AND d.upload_ktp IS NOT NULL THEN 1 ELSE 0 END), 0) +
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
        sql += ` AND (d.kode_program_studi IN (${subProdiCodes.map(() => '?').join(',')}) OR d.nik IN (SELECT nik FROM riwayat_jabatan WHERE id_biro IN (${subProdiCodes.map(() => '?').join(',')})))`
        params.push(...subProdiCodes, ...subProdiCodes)
      } else if (biro_id) {
        sql += ` AND (d.kode_program_studi = ? OR d.nik IN (SELECT nik FROM riwayat_jabatan WHERE id_biro = ? AND (is_aktiv = '1' OR is_aktiv = 'Y' OR is_aktiv IS NULL)))`
        params.push(biro_id, biro_id)
      }

      if (education) {
        sql += ` AND d.kode_jenjang_pendidikan = ?`
        params.push(education)
      }

      if (status === '1') {
        sql += ` AND (d.status_aktif = '1' OR d.status_aktif IS NULL OR d.status_aktif = '')`
      } else if (status) {
        sql += ` AND d.status_aktif = ?`
        params.push(status)
      }

      if (search) {
        sql += ` AND (d.nama_dosen LIKE ? OR d.nik LIKE ?)`
        params.push(`%${search}%`, `%${search}%`)
      }
      
      if (jafung) {
        sql = `SELECT * FROM (${sql}) as base WHERE current_jafung = ?`
        params.push(jafung)
      }

      sql += ` ORDER BY nama ASC LIMIT 500`
      const data: any[] = await prisma.$queryRawUnsafe(sql, ...params)
      employees = data.map(d => {
        const docCount = Number(d.docs_count || 0)
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
          is_struktural: d.unit !== d.homebase,
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
            COALESCE((CASE WHEN k.upload_ktp != '' AND k.upload_ktp IS NOT NULL THEN 1 ELSE 0 END), 0) +
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
      
      const tParams: any[] = []
      if (isProdi && userUnit) {
        sql += ` AND k.nik IN (SELECT TRIM(rj.nik) FROM riwayat_jabatan rj WHERE TRIM(rj.id_biro) = ?)`
        tParams.push(userUnit.trim())
      } else if (biro_id) {
        sql += ` AND k.nik IN (SELECT TRIM(rj.nik) FROM riwayat_jabatan rj WHERE TRIM(rj.id_biro) = ?)`
        tParams.push(biro_id.trim())
      }

      if (education) {
        sql += ` AND EXISTS (SELECT 1 FROM riwayat_pendidikan rp WHERE rp.nik = k.nik AND rp.id_pendidikan = ?)`
        tParams.push(education)
      }

      if (status === '1') {
        sql += ` AND (k.status_aktif = '1' OR k.status_aktif IS NULL OR k.status_aktif = '')`
      } else if (status) {
        sql += ` AND k.status_aktif = ?`
        tParams.push(status)
      }

      if (search) {
        sql += ` AND (k.nama LIKE ? OR k.nik LIKE ?)`
        tParams.push(`%${search}%`, `%${search}%`)
      }

      sql += ` ORDER BY nama ASC LIMIT 500`
      const data: any[] = await prisma.$queryRawUnsafe(sql, ...tParams)
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
    console.error('API Error:', error)
    return { success: false, message: error.message || 'Server Internal Error' }
  }
})
