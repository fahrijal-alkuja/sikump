import { PrismaClient } from '@prisma/client'
import { defineEventHandler, getQuery, createError } from 'h3'

const prisma = new PrismaClient()

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
      if (education === '6') dbEdu = '1'
      else if (education === '5') dbEdu = '2'
      else if (education === '4') dbEdu = '3'

      let sql = `
        SELECT 
          d.nik, d.nuptk, d.nama_dosen as nama, d.tempat_lahir, 
          DATE_FORMAT(d.tanggal_lahir, '%d-%m-%Y') as tanggal_lahir, 
          d.jenis_kelamin, d.telepon, d.status_aktif,
          ps.nama_program_studi as unit,
          (SELECT tj.id_jafung FROM tmst_jafung tj WHERE tj.nik = d.nik ORDER BY tj.id DESC LIMIT 1) as current_jafung
        FROM tmst_dosen d 
        LEFT JOIN mst_program_studi ps ON d.kode_program_studi = ps.kode_program_studi
        WHERE d.nik NOT LIKE '0000%'
      `
      
      // If Admin Prodi, force filter to their unit
      if (isProdi && userUnit) {
        sql += ` AND d.kode_program_studi = '${userUnit}'`
      } else if (biro_id) {
        sql += ` AND d.kode_program_studi = '${biro_id}'`
      }

      if (dbEdu) sql += ` AND d.kode_jenjang_pendidikan = '${dbEdu}'`
      if (status === '1') {
        sql += ` AND (d.status_aktif = '1' OR d.status_aktif IS NULL OR d.status_aktif = '')`
      } else if (status) {
        sql += ` AND d.status_aktif = '${status}'`
      }
      if (search) sql += ` AND (d.nama_dosen LIKE '%${search}%' OR d.nik LIKE '%${search}%')`
      
      if (jafung) {
        sql = `SELECT * FROM (${sql}) as base WHERE current_jafung = '${jafung}'`
      }

      sql += ` ORDER BY nama ASC LIMIT 500`
      const data: any[] = await prisma.$queryRawUnsafe(sql)
      employees = data.map(d => ({ ...d, nuptk: d.nuptk || '-', ikatan_kerja: 'Dosen' }))

    } else {
      // --- TENDIK LOGIC ---
      let sql = `
        SELECT 
          k.nik, k.nama, k.tempat_lahir, 
          DATE_FORMAT(k.tanggal_lahir, '%d-%m-%Y') as tanggal_lahir, 
          k.jenis_kelamin, k.telepon, k.status_aktif,
          (SELECT b.nama_biro 
           FROM riwayat_jabatan rj 
           JOIN tmst_biro b ON rj.id_biro = b.id_biro 
           WHERE rj.nik = k.nik 
           ORDER BY rj.id DESC 
           LIMIT 1) as unit
        FROM tmst_karyawan k
        WHERE k.nik NOT LIKE '0000%'
      `
      
      // If Admin Prodi/Biro, force filter to their unit in riwayat_jabatan
      if (isProdi && userUnit) {
        sql += ` AND EXISTS (SELECT 1 FROM riwayat_jabatan rj WHERE rj.nik = k.nik AND rj.id_biro = '${userUnit}')`
      } else if (biro_id) {
        sql += ` AND EXISTS (SELECT 1 FROM riwayat_jabatan rj WHERE rj.nik = k.nik AND rj.id_biro = '${biro_id}')`
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
        sql += ` AND (k.nama LIKE '%${search}%' OR k.nik LIKE '%${search}%')`
      }

      sql += ` ORDER BY nama ASC LIMIT 500`
      const data: any[] = await prisma.$queryRawUnsafe(sql)
      employees = data.map(k => ({
        ...k,
        unit: k.unit || 'Kantor Pusat',
        nuptk: '-',
        ikatan_kerja: 'Tenaga Kependidikan'
      }))
    }

    return { success: true, data: employees }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
