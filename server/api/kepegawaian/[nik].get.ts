import { defineEventHandler, getRouterParam, createError } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const nik = getRouterParam(event, 'nik')
    if (!nik) throw new Error('NIK is required')

    let data: any = null
    
    // Check in tmst_karyawan (Tendik)
    const karyawan = await prisma.tmst_karyawan.findUnique({
      where: { nik }
    })

    if (karyawan) {
      // Manual fetch for Tendik to avoid include errors
      const [jabatan, pendidikan, pelatihan, keluarga, pengangkatan, pajak, askes, pangkat, sertifikasi] = await Promise.all([
        prisma.riwayat_jabatan.findMany({ where: { nik } }),
        prisma.riwayat_pendidikan.findMany({ where: { nik } }),
        prisma.riwayat_pelatihan.findMany({ where: { nik } }),
        prisma.riwayat_keluarga.findMany({ where: { nik } }),
        prisma.riwayat_pengangkatan.findMany({ where: { nik } }),
        prisma.tmst_pajak.findMany({ where: { nik } }),
        prisma.tmst_askes.findMany({ where: { nik } }),
        prisma.tmst_pangkat.findMany({ where: { nik } }),
        prisma.tmst_sertifikasi.findMany({ where: { nik } })
      ])

      // Fetch latest unit
      const latestJabatan: any = await prisma.$queryRaw`
        SELECT b.nama_biro as unit 
        FROM riwayat_jabatan rj 
        JOIN tmst_biro b ON rj.id_biro = b.id_biro 
        WHERE rj.nik = ${nik} 
        ORDER BY rj.id DESC 
        LIMIT 1
      `
      data = { 
        ...karyawan, 
        type: 'tendik',
        unit: latestJabatan[0]?.unit || 'Kantor Pusat',
        riwayat_jabatan: jabatan,
        riwayat_pendidikan: pendidikan,
        riwayat_pelatihan: pelatihan,
        riwayat_keluarga: keluarga,
        riwayat_pengangkatan: pengangkatan,
        tmst_pajak: pajak,
        tmst_askes: askes,
        riwayat_pangkat: pangkat,
        riwayat_sertifikasi: sertifikasi
      }
    } else {
      // Check in tmst_dosen using Raw SQL
      const dosenRes: any[] = await prisma.$queryRaw`
        SELECT d.*, ps.nama_program_studi as unit 
        FROM tmst_dosen d
        LEFT JOIN mst_program_studi ps ON d.kode_program_studi = ps.kode_program_studi
        WHERE d.nik = ${nik}
      `
      const dosen = dosenRes[0] || null

      if (dosen) {
        // Manually fetch related data
        const [jabatan, pendidikan, pelatihan, keluarga, pengangkatan, pajak, askes, jafung, pangkat, sertifikasi] = await Promise.all([
          prisma.riwayat_jabatan.findMany({ where: { nik } }),
          prisma.riwayat_pendidikan.findMany({ where: { nik } }),
          prisma.riwayat_pelatihan.findMany({ where: { nik } }),
          prisma.riwayat_keluarga.findMany({ where: { nik } }),
          prisma.riwayat_pengangkatan.findMany({ where: { nik } }),
          prisma.tmst_pajak.findMany({ where: { nik } }),
          prisma.tmst_askes.findMany({ where: { nik } }),
          // @ts-ignore
          prisma.riwayat_jafung.findMany({ where: { nik } }),
          prisma.tmst_pangkat.findMany({ where: { nik } }),
          prisma.tmst_sertifikasi.findMany({ where: { nik } })
        ])

        data = {
          ...dosen,
          unit: dosen.unit || '-',
          type: 'dosen',
          nama: dosen.nama_dosen,
          riwayat_jabatan: jabatan,
          riwayat_pendidikan: pendidikan,
          riwayat_pelatihan: pelatihan,
          riwayat_keluarga: keluarga,
          riwayat_pengangkatan: pengangkatan,
          tmst_pajak: pajak,
          tmst_askes: askes,
          riwayat_jafung: jafung,
          riwayat_pangkat: pangkat,
          riwayat_sertifikasi: sertifikasi
        }
      }
    }

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Karyawan/Dosen not found',
      })
    }

    // --- Role-Based Security Check ---
    const session = requireAuth(event)
    if (session.role === 'prodi' && session.unit) {
      if (data.type === 'dosen') {
        if (data.kode_program_studi !== session.unit) {
          throw createError({ statusCode: 403, statusMessage: 'Forbidden: Unit mismatch' })
        }
      } else {
        // For Tendik, check latest biro ID
        const check: any = await prisma.$queryRaw`
          SELECT id_biro FROM riwayat_jabatan WHERE nik = ${nik} ORDER BY id DESC LIMIT 1
        `
        if (check[0]?.id_biro !== session.unit) {
          throw createError({ statusCode: 403, statusMessage: 'Forbidden: Unit mismatch' })
        }
      }
    }

    return {
      success: true,
      data
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
})
