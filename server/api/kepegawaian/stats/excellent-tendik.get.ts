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
      ORDER BY (
        (SELECT COUNT(*) FROM riwayat_pelatihan rp2 WHERE rp2.nik = k.nik) + 
        (SELECT COUNT(*) FROM tmst_sertifikasi ts2 WHERE ts2.nik = k.nik)
      ) DESC
      LIMIT 10
    `

    // 2. Expertise Analysis (Dominant Keahlian)
    // We fetch all training and certifications for Tendik (Karyawan)
    const expertiseData: any[] = await prisma.$queryRaw`
      SELECT nama_diklat as title FROM riwayat_pelatihan 
      WHERE nik IN (SELECT nik FROM tmst_karyawan)
      UNION ALL
      SELECT bidang_studi as title FROM tmst_sertifikasi
      WHERE nik IN (SELECT nik FROM tmst_karyawan)
    `

    const expertiseMap: Record<string, number> = {}
    // common keywords to categorize expertise
    const keywords = ['Keuangan', 'IT', 'Teknologi', 'Administrasi', 'Arsip', 'Kepegawaian', 'Hukum', 'Akuntansi', 'Perpustakaan', 'Laboratorium', 'Bahasa', 'Kepemimpinan', 'Leadership', 'Layanan']
    
    expertiseData.forEach(item => {
      const title = item.title?.toLowerCase() || ''
      if (!title) return
      
      let foundMatch = false
      keywords.forEach(key => {
        if (title.includes(key.toLowerCase())) {
          expertiseMap[key] = (expertiseMap[key] || 0) + 1
          foundMatch = true
        }
      })
      
      // If no keyword matches, we take the first word as a categorical proxy if it's long enough
      if (!foundMatch) {
         const firstWord = item.title.split(' ')[0]
         if (firstWord.length > 4) {
             expertiseMap[firstWord] = (expertiseMap[firstWord] || 0) + 1
         }
      }
    })

    const topExpertise = Object.entries(expertiseMap)
      .map(([name, count]) => ({ name, count }))
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
