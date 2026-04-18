import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getAuthSession } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const nik = session.username // For Tendik, username IS the NIK

  try {
    const employee = await prisma.tmst_karyawan.findUnique({
      where: { nik },
      include: {
        riwayat_pendidikan: true,
        riwayat_pelatihan: true,
        riwayat_keluarga: true,
        riwayat_pengangkatan: {
          orderBy: { id: 'asc' }
        },
        riwayat_pangkat: true,
        riwayat_sertifikasi: true,
        tmst_pajak: true,
        tmst_askes: true
      }
    })

    if (!employee) {
      throw createError({ statusCode: 404, statusMessage: 'Data pegawai tidak ditemukan' })
    }

    // Fetch Jabatan with Names using raw SQL (Prisma relations might be missing for these legacy tables)
    const jabatanWithNames: any[] = await prisma.$queryRaw`
      SELECT rj.*, tj.nama_jabatan, tb.nama_biro 
      FROM riwayat_jabatan rj 
      LEFT JOIN tref_jabatan tj ON rj.id_jabatan = tj.id_jabatan 
      LEFT JOIN tmst_biro tb ON rj.id_biro = tb.id_biro 
      WHERE rj.nik = ${nik}
      ORDER BY rj.id DESC
    `

    // Check Survey Status for Current Year
    const currentYear = new Date().getFullYear().toString()
    const surveyCheck: any[] = await prisma.$queryRaw`
      SELECT id FROM survei_tendik 
      WHERE nik = ${nik} AND tahun = ${currentYear}
      LIMIT 1
    `

    return {
      success: true,
      data: {
        ...employee,
        riwayat_jabatan: jabatanWithNames,
        unit: jabatanWithNames.find(j => j.is_aktiv === 'Y' || j.is_aktiv === '1')?.nama_biro || 'Kantor Pusat',
        type: 'tendik',
        survey_filled: surveyCheck.length > 0
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
})
