import { PrismaClient } from '@prisma/client'
import { defineEventHandler } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const session = requireAuth(event)
    const isProdi = session.role === 'prodi' && session.unit
    const prodiFilter = isProdi ? ` AND d.kode_program_studi = '${session.unit}'` : ''

    const borangData: any = await prisma.$queryRawUnsafe(`
      SELECT 
        d.nama_dosen as "Nama Dosen",
        COALESCE(d.nuptk, '-') as "NUPTK",
        COALESCE(d.nik, '-') as "NIK",
        (SELECT COALESCE(asal_pendidikan, '-') FROM riwayat_pendidikan_dosen r2 WHERE r2.nik = d.nik AND r2.id_pendidikan = 5 LIMIT 1) as "Magister (S2)",
        (SELECT COALESCE(asal_pendidikan, '-') FROM riwayat_pendidikan_dosen r3 WHERE r3.nik = d.nik AND r3.id_pendidikan = 6 LIMIT 1) as "Doktor (S3)",
        COALESCE(ps.nama_program_studi, d.kode_program_studi) as "Bidang Keahlian",
        (SELECT nama FROM (
          SELECT rj.nik, tr.nama 
          FROM tmst_jafung rj 
          JOIN tref_jafung tr ON rj.id_jafung = tr.id
          ORDER BY rj.tmt DESC
        ) as j WHERE j.nik = d.nik LIMIT 1) as "Jabatan Akademik"
      FROM tmst_dosen d
      LEFT JOIN mst_program_studi ps ON d.kode_program_studi = ps.kode_program_studi
      WHERE d.nik NOT LIKE '0000%' ${prodiFilter}
    `)

    return { success: true, data: borangData }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
