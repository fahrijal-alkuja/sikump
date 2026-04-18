import { defineEventHandler, readBody, getCookie } from 'h3'
import { prisma } from '../../../utils/prisma'
import { rateLimit } from '../../../utils/limiter'

export default defineEventHandler(async (event) => {
  // Rate Limit: 5 submissions per 30 minutes (prevent spam)
  rateLimit(event, { max: 5, windowMs: 30 * 60 * 1000, keyPrefix: 'survey' })

  const body = await readBody(event)
  const { identitas, penilaian, pimpinan_atasan, terbuka } = body

  const userToken = getCookie(event, 'user')
  const user = userToken ? JSON.parse(userToken) : null

  const now = new Date()
  const currentYear = now.getFullYear().toString()

  try {
    const nik = user?.username || identitas.nik
    const year = identitas.tahun || currentYear

    // 1. DUPLICATION CHECK (Regression/QA)
    const existing: any[] = await prisma.$queryRaw`
      SELECT id FROM survei_tendik WHERE nik = ${nik} AND tahun = ${year} LIMIT 1
    `
    if (existing.length > 0) {
      return {
        success: false,
        message: `Anda sudah mengisi survei untuk tahun ${year}.`
      }
    }

    // 2. DATA VALIDATION (QA)
    const ratings = ['A1','A2','A3','A4','B1','B2','B3','C1','C2','D1','D2','D3','D4','E1','E2','E3','E4']
    const missing = ratings.filter(r => !penilaian[r] || Number(penilaian[r]) === 0)
    if (missing.length > 0) {
       return {
         success: false,
         message: 'Mohon lengkapi semua penilaian sebelum mengirim.'
       }
    }

    // 3. EXECUTE INSERT
    await prisma.$executeRaw`
      INSERT INTO survei_tendik (
        nik, nama, unit_kerja, jabatan, status_kepegawaian, masa_kerja, tahun,
        a1, a2, a3, a4, b1, b2, b3, c1, c2, d1, d2, d3, d4, e1, e2, e3, e4,
        pimpinan_atasan, aspek_memuaskan, aspek_ditingkatkan, saran_perbaikan
      ) VALUES (
        ${nik || null},
        ${identitas.nama || 'Anonim'},
        ${identitas.unit_kerja || null},
        ${identitas.jabatan || null},
        ${identitas.status_kepegawaian || null},
        ${identitas.masa_kerja || null},
        ${year},
        ${Number(penilaian.A1)}, ${Number(penilaian.A2)}, ${Number(penilaian.A3)}, ${Number(penilaian.A4)},
        ${Number(penilaian.B1)}, ${Number(penilaian.B2)}, ${Number(penilaian.B3)},
        ${Number(penilaian.C1)}, ${Number(penilaian.C2)},
        ${Number(penilaian.D1)}, ${Number(penilaian.D2)}, ${Number(penilaian.D3)}, ${Number(penilaian.D4)},
        ${Number(penilaian.E1)}, ${Number(penilaian.E2)}, ${Number(penilaian.E3)}, ${Number(penilaian.E4)},
        ${pimpinan_atasan || null},
        ${terbuka.aspek_memuaskan || ''},
        ${terbuka.aspek_ditingkatkan || ''},
        ${terbuka.saran_perbaikan || ''}
      )
    `

    return {
      success: true,
      message: 'Survei berhasil disimpan'
    }
  } catch (error: any) {
    console.error('Submit survey error:', error)
    return {
      success: false,
      message: 'Gagal menyimpan survei: ' + error.message
    }
  }
})
