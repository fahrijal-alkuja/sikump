import { defineEventHandler, getQuery, createError } from 'h3'
import { requireAuth } from '../../utils/auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const session = requireAuth(event)
    const isProdi = session.role === 'prodi' && session.unit
    const u = session.unit?.trim()

    // GLOBAL STATS CACHING
    const CACHE_TTL = 60000 
    const cacheKey = `hr_stats_${u || 'all'}`
    const store = (global as any)._hrStatsCacheStore || {}
    const cache = store[cacheKey]
    const refresh = getQuery(event).refresh === 'true'

    if (!refresh && cache && (Date.now() - cache.timestamp < CACHE_TTL)) {
      return { success: true, stats: cache.data }
    }

    // Determine sub-prodi codes
    let subProdiCodes: string[] = []
    if (isProdi && u) {
      const prodis: any[] = await prisma.$queryRawUnsafe(`
        SELECT kode_program_studi FROM mst_program_studi 
        WHERE kode_program_studi = ? OR kode_fakultas = ?
      `, u, u)
      subProdiCodes = prodis.map(p => p.kode_program_studi)
    }

    const dFilter = subProdiCodes.length > 0 
      ? ` AND d.kode_program_studi IN (${subProdiCodes.map(c => `'${c}'`).join(',')})` 
      : (isProdi ? " AND d.kode_program_studi = 'NONE'" : "")
      
    const kFilter = isProdi 
      ? ` AND EXISTS (SELECT 1 FROM riwayat_jabatan rj WHERE rj.nik = k.nik AND TRIM(rj.id_biro) = '${u}')` 
      : ""
    
    // Optimized runner
    const runQuery = async (query: string) => {
      try { return await prisma.$queryRawUnsafe(query) } catch (e) { console.error('Query Error:', query, e); return [] }
    }

    // Parallel execution for speed
    const [
      dosenRes, karyawanRes, jafungRes, alertsRes, s3Res, s2Res, 
      dTrRes, tTrRes, rDRes, rTRes, hmDRes, hmTRes, ikDRes, ikTRes, certRes
    ]: any[] = await Promise.all([
      runQuery(`SELECT COUNT(*) as count FROM tmst_dosen d WHERE nik NOT LIKE '0000%' ${dFilter}`),
      runQuery(`SELECT COUNT(*) as count FROM tmst_karyawan k WHERE k.nik NOT LIKE '0000%' AND (k.status_aktif='1' OR k.status_aktif IS NULL OR k.status_aktif='') AND k.nik NOT IN (SELECT nik FROM tmst_dosen) ${kFilter}`),
      runQuery(`SELECT id_jafung as code, COUNT(*) as count FROM (SELECT rj.nik, MAX(id_jafung) as id_jafung FROM tmst_jafung rj JOIN tmst_dosen d ON rj.nik = d.nik WHERE d.nik NOT LIKE '0000%' ${dFilter} GROUP BY rj.nik) as st GROUP BY id_jafung`),
      runQuery(`SELECT d.nama_dosen, d.nik, d.nuptk, rj.id_jafung, rj.tmt FROM tmst_jafung rj JOIN tmst_dosen d ON rj.nik = d.nik WHERE rj.id_jafung < 4 AND d.nik NOT LIKE '0000%' ${dFilter} ORDER BY rj.tmt ASC LIMIT 5`),
      runQuery(`SELECT COUNT(DISTINCT rp.nik) as count FROM riwayat_pendidikan rp JOIN tmst_dosen d ON rp.nik = d.nik WHERE rp.id_pendidikan = 6 AND d.nik NOT LIKE '0000%' ${dFilter}`),
      runQuery(`SELECT COUNT(DISTINCT rp.nik) as count FROM riwayat_pendidikan rp JOIN tmst_dosen d ON rp.nik = d.nik WHERE rp.id_pendidikan = 5 AND d.nik NOT LIKE '0000%' ${dFilter}`),
      runQuery(`SELECT COUNT(DISTINCT rp.nik) as count FROM riwayat_pelatihan rp JOIN tmst_dosen d ON rp.nik = d.nik WHERE d.nik NOT LIKE '0000%' ${dFilter}`),
      runQuery(`SELECT COUNT(DISTINCT rp.nik) as count FROM riwayat_pelatihan rp JOIN tmst_karyawan k ON rp.nik = k.nik WHERE k.nik NOT LIKE '0000%' AND k.nik NOT IN (SELECT nik FROM tmst_dosen) ${kFilter}`),
      runQuery(`SELECT d.nama_dosen as nama, d.nik, d.tanggal_lahir, (CASE WHEN (SELECT id_jafung FROM tmst_jafung WHERE nik = d.nik ORDER BY id DESC LIMIT 1) = 4 THEN 70 ELSE 65 END - (YEAR(CURDATE()) - YEAR(d.tanggal_lahir))) as years_left FROM tmst_dosen d WHERE d.nik NOT LIKE '0000%' AND (d.status_aktif='1' OR d.status_aktif IS NULL OR d.status_aktif='') AND d.tanggal_lahir IS NOT NULL ${dFilter} HAVING years_left <= 5 AND years_left >= -5 ORDER BY years_left ASC LIMIT 10`),
      runQuery(`SELECT k.nama, k.nik, k.tanggal_lahir, (58 - (YEAR(CURDATE()) - YEAR(k.tanggal_lahir))) as years_left FROM tmst_karyawan k WHERE k.nik NOT LIKE '0000%' AND (k.status_aktif='1' OR k.status_aktif IS NULL OR k.status_aktif='') AND k.tanggal_lahir IS NOT NULL AND k.nik NOT IN (SELECT nik FROM tmst_dosen) ${kFilter} HAVING years_left <= 5 AND years_left >= -5 ORDER BY years_left ASC LIMIT 10`),
      runQuery(`SELECT unit, COUNT(*) as count FROM (SELECT COALESCE((SELECT b.nama_biro FROM riwayat_jabatan rj JOIN tmst_biro b ON rj.id_biro = b.id_biro WHERE rj.nik = d.nik ORDER BY rj.id DESC LIMIT 1), ps.nama_program_studi) as unit FROM tmst_dosen d LEFT JOIN mst_program_studi ps ON d.kode_program_studi = ps.kode_program_studi WHERE (d.status_aktif='1' OR d.status_aktif IS NULL OR d.status_aktif='') AND d.nik NOT LIKE '0000%' ${dFilter}) as sub WHERE unit IS NOT NULL GROUP BY unit ORDER BY count DESC`),
      runQuery(`SELECT unit, COUNT(*) as count FROM (SELECT (SELECT b.nama_biro FROM riwayat_jabatan rj JOIN tmst_biro b ON rj.id_biro = b.id_biro WHERE rj.nik = k.nik ORDER BY rj.id DESC LIMIT 1) as unit FROM tmst_karyawan k WHERE (k.status_aktif='1' OR k.status_aktif IS NULL OR k.status_aktif='') AND k.nik NOT LIKE '0000%' AND k.nik NOT IN (SELECT nik FROM tmst_dosen) ${kFilter}) as sub WHERE unit IS NOT NULL GROUP BY unit ORDER BY count DESC`),
      runQuery(`SELECT ikatan_kerja as label, COUNT(*) as count FROM (SELECT rj.nik, rj.ikatan_kerja FROM riwayat_jabatan rj JOIN tmst_dosen d ON rj.nik = d.nik WHERE rj.id IN (SELECT MAX(id) FROM riwayat_jabatan GROUP BY nik) AND d.nik NOT LIKE '0000%' ${dFilter}) as st GROUP BY ikatan_kerja`),
      runQuery(`SELECT ikatan_kerja as label, COUNT(*) as count FROM tmst_karyawan k WHERE k.nik NOT LIKE '0000%' AND k.nik NOT IN (SELECT nik FROM tmst_dosen) ${kFilter} GROUP BY ikatan_kerja`),
      runQuery(`SELECT COUNT(DISTINCT s.nik) as count FROM tmst_sertifikasi s JOIN tmst_dosen d ON s.nik = d.nik WHERE d.nik NOT LIKE '0000%' ${dFilter}`)
    ])

    const dCount = Number(dosenRes[0]?.count || 0)
    const kCount = Number(karyawanRes[0]?.count || 0)
    const s3A = Number(s3Res[0]?.count || 0)
    
    const jafung = { asisten_ahli: 0, lektor: 0, lektor_kepala: 0, guru_besar: 0 }
    jafungRes.forEach((r: any) => {
      if (r.code == 1) jafung.asisten_ahli = Number(r.count)
      else if (r.code == 2) jafung.lektor = Number(r.count)
      else if (r.code == 3) jafung.lektor_kepala = Number(r.count)
      else if (r.code == 4) jafung.guru_besar = Number(r.count)
    })

    const finalStats = {
      total: dCount + kCount,
      dosen: { total: dCount, jafung, trained: Number(dTrRes[0]?.count || 0), certified: Number(certRes[0]?.count || 0), s3: s3A, s2: Number(s2Res[0]?.count || 0), ikatanKerja: ikDRes },
      tendik: { total: kCount, trained: Number(tTrRes[0]?.count || 0), s3: 0, s2: 0, s1: 0, sma: 0, ikatanKerja: ikTRes },
      alerts: alertsRes.map((a: any) => ({ ...a, identitas: a.nuptk || a.nik })),
      matrix: { s3Actual: s3A, s3Target: Math.ceil(dCount * 0.4), s2Actual: Number(s2Res[0]?.count || 0) },
      retirementDosen: rDRes,
      retirementTendik: rTRes,
      heatmapDosen: hmDRes,
      heatmapTendik: hmTRes
    }

    const serialize = (obj: any): any => JSON.parse(JSON.stringify(obj, (k, v) => typeof v === 'bigint' ? Number(v) : v))
    const serialized = serialize(finalStats)

    // Update Cache
    const newStore = { ...((global as any)._hrStatsCacheStore || {}), [cacheKey]: { data: serialized, timestamp: Date.now() } }
    ;(global as any)._hrStatsCacheStore = newStore

    return { success: true, stats: serialized }
  } catch (error: any) {
    console.error('Stats API Failure:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Statistics Error',
      message: error.message
    })
  }
})
