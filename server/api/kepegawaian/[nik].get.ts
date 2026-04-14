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
      const u = session.unit.trim()
      
      if (data.type === 'dosen') {
        const dUnit = (data.kode_program_studi || '').trim()
        // Check if it's the same prodi OR if the prodi belongs to the faculty
        const isValid: any[] = await prisma.$queryRawUnsafe(`
          SELECT 1 FROM mst_program_studi 
          WHERE (kode_program_studi = '${dUnit}' AND (kode_program_studi = '${u}' OR kode_fakultas = '${u}'))
        `)
        
        if (isValid.length === 0) {
          throw createError({ statusCode: 403, statusMessage: 'Forbidden: Unit mismatch (Dosen)' })
        }
      } else {
        // For Tendik, check latest biro ID
        const check: any = await prisma.$queryRawUnsafe(`
          SELECT id_biro FROM riwayat_jabatan WHERE nik = '${nik}' ORDER BY id DESC LIMIT 1
        `)
        const userBiro = (check[0]?.id_biro || '').trim()
        if (userBiro !== u) {
          throw createError({ statusCode: 403, statusMessage: 'Forbidden: Unit mismatch (Tendik)' })
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
