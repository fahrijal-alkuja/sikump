import { defineEventHandler } from 'h3'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const currentYear = new Date().getFullYear()
    const startYear = currentYear - 4 // Last 5 years including current

    const rawData: any[] = await prisma.$queryRaw`
      SELECT * FROM survei_tendik 
      WHERE tahun >= ${startYear.toString()}
      ORDER BY created_at DESC
    `

    if (rawData.length === 0) {
      return { success: true, stats: null }
    }

    const aspects = {
      pendidikan: ['a1', 'a2', 'a3', 'a4'],
      penelitian: ['b1', 'b2', 'b3'],
      pkm: ['c1', 'c2'],
      layanan: ['d1', 'd2', 'd3', 'd4'],
      tata_kelola: ['e1', 'e2', 'e3', 'e4']
    }

    const calculateAvg = (data: any[], keys: string[]) => {
      let total = 0
      let count = 0
      data.forEach((row: any) => {
        keys.forEach(key => {
          if (row[key]) {
            total += row[key]
            count++
          }
        })
      })
      return count > 0 ? Number((total / count).toFixed(2)) : 0
    }

    // Trend Analysis (Last 5 Years)
    const trend: any = []
    for (let i = 0; i < 5; i++) {
      const year = (startYear + i).toString()
      const yearData = rawData.filter((r: any) => r.tahun === year)
      trend.push({
        year,
        count: yearData.length,
        score: calculateAvg(yearData, [...aspects.pendidikan, ...aspects.penelitian, ...aspects.pkm, ...aspects.layanan, ...aspects.tata_kelola])
      })
    }

    const stats = {
      total_responden: rawData.length,
      trend,
      scores: {
        pendidikan: calculateAvg(rawData, aspects.pendidikan),
        penelitian: calculateAvg(rawData, aspects.penelitian),
        pkm: calculateAvg(rawData, aspects.pkm),
        layanan: calculateAvg(rawData, aspects.layanan),
        tata_kelola: calculateAvg(rawData, aspects.tata_kelola)
      },
      distribution: {
        unit: {} as Record<string, number>,
        status: {} as Record<string, number>,
        masa_kerja: {} as Record<string, number>
      },
      recent_feedback: rawData.slice(0, 50).map((r: any) => ({
        unit: r.unit_kerja,
        memuaskan: r.aspek_memuaskan,
        ditingkatkan: r.aspek_ditingkatkan,
        saran: r.saran_perbaikan,
        date: r.created_at
      })),
      ai_insight: null as any
    }

    // Fill distributions
    rawData.forEach((r: any) => {
      stats.distribution.unit[r.unit_kerja] = (stats.distribution.unit[r.unit_kerja] || 0) + 1
      stats.distribution.status[r.status_kepegawaian] = (stats.distribution.status[r.status_kepegawaian] || 0) + 1
      stats.distribution.masa_kerja[r.masa_kerja] = (stats.distribution.masa_kerja[r.masa_kerja] || 0) + 1
    })

    // Simple In-Memory Cache for AI Insight
    // We use a global variable to store the last analyzed result and the count of respondents at that time
    // In a real production with clusters, use Redis
    const globalCache = (global as any)._surveyAiCache || { lastCount: 0, lastResult: null }
    
    // AI Analysis (ONLY if there are respondents AND count changed or cache empty)
    if (rawData.length > 0) {
      const apiKey = process.env.GEMINI_API_KEY
      
      // Only re-analyze if we have new data
      if (globalCache.lastCount === rawData.length && globalCache.lastResult) {
        stats.ai_insight = globalCache.lastResult
        console.log('Using cached AI insight for survey')
      } else if (!apiKey) {
        stats.ai_insight = { error: 'Konfigurasi AI belum lengkap (GEMINI_API_KEY tidak ditemukan).' }
      } else {
        try {
          const prompt = `
            Context: Hasil Survei Kepuasan Tenaga Kependidikan (Tendik) Universitas.
            Data Statistik (Skala 1-4):
            - Dukungan Pendidikan: ${stats.scores.pendidikan}
            - Dukungan Penelitian: ${stats.scores.penelitian}
            - Dukungan PKM: ${stats.scores.pkm}
            - Layanan & Sistem Informasi: ${stats.scores.layanan}
            - Tata Kelola & Kepuasan Kerja: ${stats.scores.tata_kelola}

            Jawaban Terbuka (Sampel):
            ${stats.recent_feedback.map(f => `- Memuaskan: ${f.memuaskan}. Perbaikan: ${f.saran}`).join('\n')}

            Tugas:
            1. Berikan kesimpulan profesional secara keseluruhan.
            2. Berikan narasi analisis singkat UNTUK SETIAP KRITERIA (Pendidikan, Penelitian, PKM, Layanan, Tata Kelola) berdasarkan skor dan feedback.
            3. Berikan 3 saran strategis untuk pimpinan.
            
            Format Output (JSON Valid):
            {
              "kesimpulan": "...",
              "per_kriteria": {
                "pendidikan": "...",
                "penelitian": "...",
                "pkm": "...",
                "layanan": "...",
                "tata_kelola": "..."
              },
              "saran": ["...", "...", "..."]
            }
          `

          const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          })

          if (!aiResponse.ok) {
            const errBody = await aiResponse.json()
            throw new Error(errBody.error?.message || 'Gemini API Error')
          }

          const aiData = await aiResponse.json()
          let text = aiData.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            // Clean markdown backticks if AI wraps JSON
            text = text.replace(/```json\n?|```/g, '').trim()
            const parsed = JSON.parse(text)
            stats.ai_insight = parsed
            
            // Update Cache
            ;(global as any)._surveyAiCache = {
              lastCount: rawData.length,
              lastResult: parsed
            }
          }
        } catch (aiErr: any) {
          console.error('AI Insight Generation failed:', aiErr)
          stats.ai_insight = { error: 'Gagal menghasilkan analisis AI: ' + aiErr.message }
        }
      }
    }

    return {
      success: true,
      stats
    }
  } catch (error: any) {
    console.error('Analytics error:', error)
    return {
      success: false,
      message: error.message
    }
  }
})
