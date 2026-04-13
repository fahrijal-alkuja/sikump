import { PrismaClient } from '@prisma/client'
import { defineEventHandler } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const session = requireAuth(event)
    const isProdi = session.role === 'prodi' && session.unit
    const prodiFilter = isProdi ? ` AND d.kode_program_studi = '${session.unit}'` : ''
    
    const runQuery = async (query: string) => {
      try { return await prisma.$queryRawUnsafe(query) } catch (e) { return [] }
    }

    // 1. Basic Counts
    const dosenRes: any = await runQuery(`SELECT COUNT(*) as count FROM tmst_dosen d WHERE nik NOT LIKE '0000%' ${prodiFilter}`)
    const karyawanRes: any = isProdi ? [{count: 0}] : await runQuery(`
      SELECT COUNT(*) as count FROM tmst_karyawan 
      WHERE nik NOT LIKE '0000%' 
      AND (status_aktif = '1' OR status_aktif IS NULL OR status_aktif = '')
      AND nik NOT IN (SELECT nik FROM tmst_dosen)
    `)
    const dosenCount = Number(dosenRes[0]?.count || 0)
    const karyawanCount = Number(karyawanRes[0]?.count || 0)

    // 2. Jafung
    const jafungCountRes: any = await runQuery(`
      SELECT id_jafung as code, COUNT(*) as count FROM (
        SELECT rj.nik, MAX(id_jafung) as id_jafung FROM tmst_jafung rj
        JOIN tmst_dosen d ON rj.nik = d.nik
        WHERE d.nik NOT LIKE '0000%' ${prodiFilter}
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
      WHERE rj.id_jafung < 4 AND d.nik NOT LIKE '0000%' ${prodiFilter}
      ORDER BY rj.tmt ASC
      LIMIT 5
    `)
    
    const s3CountRes: any = await runQuery(`
      SELECT COUNT(DISTINCT nik) as count FROM riwayat_pendidikan_dosen WHERE id_pendidikan = 6
    `)
    const s3Actual = Number(s3CountRes[0]?.count || 0)
    const s3Target = Math.ceil(dosenCount * 0.4) 

    // 5. Training Counts (Separate)
    const dosenTrainingRes: any = await runQuery(`SELECT COUNT(DISTINCT nik) as count FROM riwayat_pelatihan WHERE nik IN (SELECT nik FROM tmst_dosen)`)
    const tendikTrainingRes: any = await runQuery(`SELECT COUNT(DISTINCT nik) as count FROM riwayat_pelatihan WHERE nik IN (SELECT nik FROM tmst_karyawan) AND nik NOT IN (SELECT nik FROM tmst_dosen)`)
    
    const dosenTrainingCount = Number(dosenTrainingRes[0]?.count || 0)
    const tendikTrainingCount = Number(tendikTrainingRes[0]?.count || 0)

    // 6. Trained Lists (Separate)
    const trainedDosenList: any = await runQuery(`
      SELECT d.nama_dosen as nama, d.nik, ps.nama_program_studi as unit
      FROM tmst_dosen d
      JOIN mst_program_studi ps ON d.kode_program_studi = ps.kode_program_studi
      WHERE d.nik IN (SELECT DISTINCT nik FROM riwayat_pelatihan)
      LIMIT 10
    `)

    const trainedTendikList: any = await runQuery(`
      SELECT k.nama, k.nik,
        (SELECT b.nama_biro FROM riwayat_jabatan rj JOIN tmst_biro b ON rj.id_biro = b.id_biro WHERE rj.nik = k.nik ORDER BY rj.id DESC LIMIT 1) as unit
      FROM tmst_karyawan k
      WHERE k.nik IN (SELECT DISTINCT nik FROM riwayat_pelatihan)
      AND k.nik NOT IN (SELECT nik FROM tmst_dosen)
      LIMIT 10
    `)

    // 7. RETIREMENT: DOSEN (65/70 Years)
    const retirementDosenRes: any = await runQuery(`
      SELECT 
        d.nama_dosen as nama, d.nik, d.tanggal_lahir,
        (CASE 
          WHEN (SELECT id_jafung FROM tmst_jafung WHERE nik = d.nik ORDER BY id DESC LIMIT 1) = 4 THEN 70
          ELSE 65 
        END - (YEAR(CURDATE()) - YEAR(d.tanggal_lahir))) as years_left
      FROM tmst_dosen d
      WHERE d.nik NOT LIKE '0000%' AND (d.status_aktif = '1' OR d.status_aktif IS NULL OR d.status_aktif = '') AND d.tanggal_lahir IS NOT NULL
      HAVING years_left <= 5 AND years_left >= -5
      ORDER BY years_left ASC LIMIT 10
    `)

    // 7.5 RETIREMENT: TENDIK (58 Years) - Exclude Dosen
    const retirementTendikRes: any = await runQuery(`
      SELECT 
        nama, nik, tanggal_lahir,
        (58 - (YEAR(CURDATE()) - YEAR(tanggal_lahir))) as years_left
      FROM tmst_karyawan 
      WHERE nik NOT LIKE '0000%' 
      AND (status_aktif = '1' OR status_aktif IS NULL OR status_aktif = '') 
      AND tanggal_lahir IS NOT NULL
      AND nik NOT IN (SELECT nik FROM tmst_dosen)
      HAVING years_left <= 5 AND years_left >= -5
      ORDER BY years_left ASC LIMIT 10
    `)

    // 8. HEATMAP: DOSEN (Per Prodi) - Looser status filter to match actual data
    const heatmapDosenRes: any = await runQuery(`
      SELECT ps.nama_program_studi as unit, COUNT(*) as count 
      FROM tmst_dosen d 
      JOIN mst_program_studi ps ON d.kode_program_studi = ps.kode_program_studi
      WHERE (d.status_aktif = '1' OR d.status_aktif IS NULL OR d.status_aktif = '')
      AND d.nik NOT LIKE '0000%'
      GROUP BY ps.nama_program_studi 
      ORDER BY count DESC
    `)

    // 9. HEATMAP: TENDIK (Per Biro) - Simplified and robust latest unit lookup
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
      ) as sub WHERE unit IS NOT NULL
      GROUP BY unit
      ORDER BY count DESC
    `)

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
          trainedList: trainedDosenList
        },
        tendik: { 
          total: karyawanCount,
          trained: tendikTrainingCount,
          trainedList: trainedTendikList
        },
        alerts: alertsRes.map((a: any) => ({ ...a, identitas: a.nuptk || a.nik })),
        matrix: { s3Actual, s3Target },
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
