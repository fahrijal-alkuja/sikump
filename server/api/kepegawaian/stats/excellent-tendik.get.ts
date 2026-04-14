import { defineEventHandler } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    
    // 1. Get Top 10 Tendik based on Training + Certification counts
    const topTendik: any = await prisma.$queryRaw`
      SELECT 
        k.nik, 
        k.nama, 
        b.nama_biro as unit,
        (SELECT COUNT(*) FROM riwayat_pelatihan rp WHERE rp.nik = k.nik) as total_pelatihan,
        (SELECT COUNT(*) FROM tmst_sertifikasi ts WHERE ts.nik = k.nik) as total_sertifikasi
      FROM tmst_karyawan k
      LEFT JOIN riwayat_jabatan rj ON k.nik = rj.nik AND rj.is_aktiv = 'Y'
      LEFT JOIN tmst_biro b ON rj.id_biro = b.id_biro
      WHERE k.nik NOT IN (SELECT nik FROM tmst_dosen)
      ORDER BY (
        (SELECT COUNT(*) FROM riwayat_pelatihan rp2 WHERE rp2.nik = k.nik) + 
        (SELECT COUNT(*) FROM tmst_sertifikasi ts2 WHERE ts2.nik = k.nik)
      ) DESC
      LIMIT 10
    `

    // 2. Expertise Analysis (Dominant Keahlian)
    // We fetch all training and certifications for Tendik (Karyawan) only
    const expertiseData: any[] = await prisma.$queryRaw`
      SELECT nama_diklat as title FROM riwayat_pelatihan 
      WHERE nik IN (SELECT nik FROM tmst_karyawan WHERE nik NOT IN (SELECT nik FROM tmst_dosen))
      UNION ALL
      SELECT bidang_studi as title FROM tmst_sertifikasi
      WHERE nik IN (SELECT nik FROM tmst_karyawan WHERE nik NOT IN (SELECT nik FROM tmst_dosen))
    `

    const expertiseMap: Record<string, { count: number, members: { nik: string, name: string }[] }> = {}
    // common keywords to categorize expertise
    const keywords = ['Keuangan', 'IT', 'Teknologi', 'Administrasi', 'Arsip', 'Kepegawaian', 'Hukum', 'Akuntansi', 'Perpustakaan', 'Laboratorium', 'Bahasa', 'Kepemimpinan', 'Leadership', 'Layanan']
    
    // We need to fetch names for each item
    const expertiseRaw: any[] = await prisma.$queryRaw`
      SELECT rp.nik, rp.nama_diklat as title, k.nama 
      FROM riwayat_pelatihan rp
      JOIN tmst_karyawan k ON rp.nik = k.nik
      WHERE k.nik NOT IN (SELECT nik FROM tmst_dosen)
      UNION ALL
      SELECT ts.nik, ts.bidang_studi as title, k2.nama
      FROM tmst_sertifikasi ts
      JOIN tmst_karyawan k2 ON ts.nik = k2.nik
      WHERE k2.nik NOT IN (SELECT nik FROM tmst_dosen)
    `

    expertiseRaw.forEach(item => {
      const title = item.title?.toLowerCase() || ''
      if (!title) return
      
      keywords.forEach(key => {
        if (title.includes(key.toLowerCase())) {
          if (!expertiseMap[key]) expertiseMap[key] = { count: 0, members: [] }
          expertiseMap[key].count++
          if (!expertiseMap[key].members.find(m => m.nik === item.nik)) {
            expertiseMap[key].members.push({ nik: item.nik, name: item.nama })
          }
        }
      })
    })

    const topExpertise = Object.entries(expertiseMap)
      .map(([name, data]) => ({ 
        name, 
        count: data.count,
        members: data.members.slice(0, 3) // Show top 3 members to keep it clean
      }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 6)

    return { 
      success: true, 
      data: {
        ranking: topTendik.map((t: any) => ({
          ...t,
          total_pelatihan: Number(t.total_pelatihan),
          total_sertifikasi: Number(t.total_sertifikasi),
          score: Number(t.total_pelatihan) + Number(t.total_sertifikasi)
        })),
        expertise: topExpertise
      }
    }
  } catch (error: any) {
    console.error('Excellent Tendik Error:', error)
    return { success: false, message: error.message }
  }
})
