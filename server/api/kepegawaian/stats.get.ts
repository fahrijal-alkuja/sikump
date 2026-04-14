import { defineEventHandler } from 'h3'
import { requireAuth } from '../../utils/auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const session = requireAuth(event)
    const isProdi = session.role === 'prodi' && session.unit
    const u = session.unit?.trim()

    // Determine sub-prodi codes for faculty-level stats
    let subProdiCodes: string[] = []
    if (isProdi && u) {
      const prodis: any[] = await prisma.$queryRawUnsafe(`
        SELECT kode_program_studi FROM mst_program_studi 
        WHERE kode_program_studi = '${u}' OR kode_fakultas = '${u}'
      `)
      subProdiCodes = prodis.map(p => p.kode_program_studi)
    }

    const dFilter = subProdiCodes.length > 0 ? ` AND d.kode_program_studi IN (${subProdiCodes.map(c => `'${c}'`).join(',')})` : (isProdi ? ' AND 1=0' : '')
    // Tendik filter based on latest riwayat_jabatan
    const kFilter = isProdi ? ` AND EXISTS (SELECT 1 FROM riwayat_jabatan rj WHERE rj.nik = k.nik AND TRIM(rj.id_biro) = '${u}')` : ''
    
    const runQuery = async (query: string) => {
      try { return await prisma.$queryRawUnsafe(query) } catch (e) { return [] }
    }

    // 1. Basic Counts
    const dosenRes: any = await runQuery(`SELECT COUNT(*) as count FROM tmst_dosen d WHERE nik NOT LIKE '0000%' ${dFilter}`)
    const karyawanRes: any = await runQuery(`
      SELECT COUNT(*) as count FROM tmst_karyawan k
      WHERE k.nik NOT LIKE '0000%' 
      AND (k.status_aktif = '1' OR k.status_aktif IS NULL OR k.status_aktif = '')
      AND k.nik NOT IN (SELECT nik FROM tmst_dosen)
      ${kFilter}
    `)
    const dosenCount = Number(dosenRes[0]?.count || 0)
    const karyawanCount = Number(karyawanRes[0]?.count || 0)

    // 2. Jafung (Dosen Only)
    const jafungCountRes: any = await runQuery(`
      SELECT id_jafung as code, COUNT(*) as count FROM (
        SELECT rj.nik, MAX(id_jafung) as id_jafung FROM tmst_jafung rj
        JOIN tmst_dosen d ON rj.nik = d.nik
        WHERE d.nik NOT LIKE '0000%' ${dFilter}
        GROUP BY rj.nik
      ) as latest_jafung GROUP BY id_jafung
    `)
    const jafung = { asisten_ahli: 0, lektor: 0, lektor_kepala: 0, guru_besar: 0 }
    jafungCountRes.forEach((r: any) => {
      if (r.code == 1) jafung.asisten_ahli = Number(r.count)
      else if (r.code == 2) jafung.lektor = Number(r.count)
      else if (r.code == 3) jafung.lektor_kepala = Number(r.count)
      else if (r.code == 4) jafung.guru_besar = Number(r.count)
    })

    // 3. SMART ALERTS: Promotion Due
    const alertsRes: any = await runQuery(`
      SELECT d.nama_dosen, d.nik, d.nuptk, rj.id_jafung, rj.tmt
      FROM tmst_jafung rj
      JOIN tmst_dosen d ON rj.nik = d.nik
      WHERE rj.id_jafung < 4 AND d.nik NOT LIKE '0000%' ${dFilter}
      ORDER BY rj.tmt ASC
      LIMIT 5
    `)
    
    const s3CountRes: any = await runQuery(`
      SELECT COUNT(DISTINCT rp.nik) as count 
      FROM riwayat_pendidikan rp
      JOIN tmst_dosen d ON rp.nik = d.nik
      WHERE rp.id_pendidikan = 6 AND d.nik NOT LIKE '0000%' ${dFilter}
    `)
    const s3Actual = Number(s3CountRes[0]?.count || 0)
    const s3Target = Math.ceil(dosenCount * 0.4) 

    const s2CountRes: any = await runQuery(`
      SELECT COUNT(DISTINCT rp.nik) as count 
      FROM riwayat_pendidikan rp
      JOIN tmst_dosen d ON rp.nik = d.nik
      WHERE rp.id_pendidikan = 5 AND d.nik NOT LIKE '0000%' ${dFilter}
    `)
    const s2Actual = Number(s2CountRes[0]?.count || 0)

    // 5. Training Counts
    const dosenTrainingRes: any = await runQuery(`
      SELECT COUNT(DISTINCT rp.nik) as count FROM riwayat_pelatihan rp
      JOIN tmst_dosen d ON rp.nik = d.nik
      WHERE d.nik NOT LIKE '0000%' ${dFilter}
    `)
    const tendikTrainingRes: any = await runQuery(`
      SELECT COUNT(DISTINCT rp.nik) as count FROM riwayat_pelatihan rp
      JOIN tmst_karyawan k ON rp.nik = k.nik
      WHERE k.nik NOT LIKE '0000%' 
      AND k.nik NOT IN (SELECT nik FROM tmst_dosen)
      ${kFilter}
    `)
    
    const dosenTrainingCount = Number(dosenTrainingRes[0]?.count || 0)
    const tendikTrainingCount = Number(tendikTrainingRes[0]?.count || 0)

    // 6. Trained Lists
    const trainedDosenList: any = await runQuery(`
      SELECT d.nama_dosen as nama, d.nik, ps.nama_program_studi as unit
      FROM tmst_dosen d
      JOIN mst_program_studi ps ON d.kode_program_studi = ps.kode_program_studi
      WHERE d.nik IN (SELECT DISTINCT nik FROM riwayat_pelatihan)
      ${dFilter}
      LIMIT 10
    `)

    const trainedTendikList: any = await runQuery(`
      SELECT k.nama, k.nik,
        (SELECT b.nama_biro FROM riwayat_jabatan rj JOIN tmst_biro b ON rj.id_biro = b.id_biro WHERE rj.nik = k.nik ORDER BY rj.id DESC LIMIT 1) as unit
      FROM tmst_karyawan k
      WHERE k.nik IN (SELECT DISTINCT nik FROM riwayat_pelatihan)
      AND k.nik NOT IN (SELECT nik FROM tmst_dosen)
      ${kFilter}
      LIMIT 10
    `)

    // 7. RETIREMENT
    const retirementDosenRes: any = await runQuery(`
      SELECT 
        d.nama_dosen as nama, d.nik, d.tanggal_lahir,
        (CASE 
          WHEN (SELECT id_jafung FROM tmst_jafung WHERE nik = d.nik ORDER BY id DESC LIMIT 1) = 4 THEN 70
          ELSE 65 
        END - (YEAR(CURDATE()) - YEAR(d.tanggal_lahir))) as years_left
      FROM tmst_dosen d
      WHERE d.nik NOT LIKE '0000%' AND (d.status_aktif = '1' OR d.status_aktif IS NULL OR d.status_aktif = '') 
      AND d.tanggal_lahir IS NOT NULL ${dFilter}
      HAVING years_left <= 5 AND years_left >= -5
      ORDER BY years_left ASC LIMIT 10
    `)

    const retirementTendikRes: any = await runQuery(`
      SELECT 
        k.nama, k.nik, k.tanggal_lahir,
        (58 - (YEAR(CURDATE()) - YEAR(k.tanggal_lahir))) as years_left
      FROM tmst_karyawan k
      WHERE k.nik NOT LIKE '0000%' 
      AND (k.status_aktif = '1' OR k.status_aktif IS NULL OR k.status_aktif = '') 
      AND k.tanggal_lahir IS NOT NULL
      AND k.nik NOT IN (SELECT nik FROM tmst_dosen)
      ${kFilter}
      HAVING years_left <= 5 AND years_left >= -5
      ORDER BY years_left ASC LIMIT 10
    `)

    // 8. HEATMAP: DOSEN
    const heatmapDosenRes: any = await runQuery(`
      SELECT ps.nama_program_studi as unit, COUNT(*) as count 
      FROM tmst_dosen d 
      JOIN mst_program_studi ps ON d.kode_program_studi = ps.kode_program_studi
      WHERE (d.status_aktif = '1' OR d.status_aktif IS NULL OR d.status_aktif = '')
      AND d.nik NOT LIKE '0000%' ${dFilter}
      GROUP BY ps.nama_program_studi 
      ORDER BY count DESC
    `)

    // 9. HEATMAP: TENDIK
    const heatmapTendikRes: any = await runQuery(`
      SELECT unit, COUNT(*) as count FROM (
        SELECT 
          (SELECT b.nama_biro 
           FROM riwayat_jabatan rj 
           JOIN tmst_biro b ON rj.id_biro = b.id_biro 
           WHERE rj.nik = k.nik 
           ORDER BY rj.id DESC 
           LIMIT 1) as unit
        FROM tmst_karyawan k
        WHERE (k.status_aktif = '1' OR k.status_aktif IS NULL OR k.status_aktif = '')
        AND k.nik NOT LIKE '0000%'
        AND k.nik NOT IN (SELECT nik FROM tmst_dosen)
        ${kFilter}
      ) as sub WHERE unit IS NOT NULL
      GROUP BY unit
      ORDER BY count DESC
    `)

    const s3TendikRes: any = await runQuery(`
      SELECT COUNT(DISTINCT k.nik) as count FROM riwayat_pendidikan rp
      JOIN tmst_karyawan k ON rp.nik = k.nik
      WHERE rp.id_pendidikan = 6 AND k.nik NOT IN (SELECT nik FROM tmst_dosen) ${kFilter}
    `)
    const s2TendikRes: any = await runQuery(`
      SELECT COUNT(DISTINCT k.nik) as count FROM riwayat_pendidikan rp
      JOIN tmst_karyawan k ON rp.nik = k.nik
      WHERE rp.id_pendidikan = 5 AND k.nik NOT IN (SELECT nik FROM tmst_dosen) ${kFilter}
    `)
    const s1TendikRes: any = await runQuery(`
      SELECT COUNT(DISTINCT k.nik) as count FROM riwayat_pendidikan rp
      JOIN tmst_karyawan k ON rp.nik = k.nik
      WHERE rp.id_pendidikan = 4 AND k.nik NOT IN (SELECT nik FROM tmst_dosen) ${kFilter}
    `)
    const smaTendikRes: any = await runQuery(`
      SELECT COUNT(DISTINCT k.nik) as count FROM riwayat_pendidikan rp
      JOIN tmst_karyawan k ON rp.nik = k.nik
      WHERE rp.id_pendidikan = 2 AND k.nik NOT IN (SELECT nik FROM tmst_dosen) ${kFilter}
    `)

    // Count certified from tmst_sertifikasi
    const certifiedDosenRes: any = await runQuery(`
      SELECT COUNT(DISTINCT s.nik) as count FROM tmst_sertifikasi s
      JOIN tmst_dosen d ON s.nik = d.nik
      WHERE d.nik NOT LIKE '0000%' ${dFilter}
    `)
    const certifiedDosenCount = Number(certifiedDosenRes[0]?.count || 0)

    // 9. CONVERT BIGINT TO NUMBER (Fix Serialization Error)
    const serialize = (obj: any): any => {
      return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
      ))
    }

    return {
      success: true,
      stats: serialize({
        total: dosenCount + karyawanCount,
        dosen: { 
          total: dosenCount, 
          jafung,
          trained: dosenTrainingCount,
          trainedList: trainedDosenList,
          certified: certifiedDosenCount,
          s3: s3Actual,
          s2: s2Actual,
          s1: 0, // Dosen always at least S2/S3
          sma: 0
        },
        tendik: { 
          total: karyawanCount,
          trained: tendikTrainingCount,
          trainedList: trainedTendikList,
          certified: 0, // Tendik placeholder
          s3: Number(s3TendikRes[0]?.count || 0),
          s2: Number(s2TendikRes[0]?.count || 0),
          s1: Number(s1TendikRes[0]?.count || 0),
          sma: Number(smaTendikRes[0]?.count || 0)
        },
        alerts: alertsRes.map((a: any) => ({ ...a, identitas: a.nuptk || a.nik })),
        matrix: { s3Actual, s3Target, s2Actual },
        retirementDosen: retirementDosenRes,
        retirementTendik: retirementTendikRes,
        heatmapDosen: heatmapDosenRes,
        heatmapTendik: heatmapTendikRes
      })
    }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
