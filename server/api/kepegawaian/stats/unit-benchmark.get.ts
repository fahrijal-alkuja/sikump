import { defineEventHandler } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)

    // Agregasi poin per Biro (Tendik)
    const biroStats: any[] = await prisma.$queryRaw`
      SELECT 
        b.nama_biro as unit_name,
        'BIRO' as type,
        COUNT(DISTINCT k.nik) as total_personnel,
        SUM(
          (SELECT COUNT(*) FROM riwayat_pelatihan rp WHERE rp.nik = k.nik) + 
          (SELECT COUNT(*) FROM tmst_sertifikasi ts WHERE ts.nik = k.nik)
        ) as total_points
      FROM tmst_biro b
      JOIN riwayat_jabatan rj ON b.id_biro = rj.id_biro AND rj.is_aktiv = 'Y'
      JOIN tmst_karyawan k ON rj.nik = k.nik
      WHERE k.nik NOT IN (SELECT nik FROM tmst_dosen)
      GROUP BY b.id_biro, b.nama_biro
    `

    // Agregasi poin per Prodi (Dosen)
    const prodiStats: any[] = await prisma.$queryRaw`
      SELECT 
        p.nama_program_studi as unit_name,
        'PRODI' as type,
        COUNT(DISTINCT d.nik) as total_personnel,
        SUM(
          (SELECT COUNT(*) FROM riwayat_pelatihan rp WHERE rp.nik = d.nik) + 
          (SELECT COUNT(*) FROM tmst_sertifikasi ts WHERE ts.nik = d.nik)
        ) as total_points
      FROM tmst_program_studi p
      JOIN tmst_dosen d ON p.kode_program_studi = d.kode_program_studi
      GROUP BY p.kode_program_studi, p.nama_program_studi
    `

    // Menggabungkan and menghitung rata-rata (Benchmark)
    const combined = [...biroStats, ...prodiStats].map(item => {
      const personnelCount = Number(item.total_personnel) || 1
      const points = Number(item.total_points) || 0
      return {
        name: item.unit_name,
        type: item.type,
        personnel: personnelCount,
        points: points,
        average: Number((points / personnelCount).toFixed(2))
      }
    })
    .filter(item => item.personnel > 0)
    .sort((a, b) => b.average - a.average)
    .slice(0, 10) // Tampilkan 10 besar unit

    return { success: true, data: combined }
  } catch (error: any) {
    console.error('Unit Benchmark Error:', error)
    return { success: false, message: error.message }
  }
})
