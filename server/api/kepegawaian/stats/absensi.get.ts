import { defineEventHandler, getQuery, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)

    const query = getQuery(event)
    const bulan = (query.bulan as string) || new Date().toISOString().slice(0, 7)

    // 1. Get Token from Attendance API
    const authUrl = `${process.env.ABSEN_API_URL}/auth`
    const loginResponse = await $fetch<any>(authUrl, {
      method: 'POST',
      body: {
        email: process.env.ABSEN_API_EMAIL || 'rizal.alkuja@gmail.com',
        password: process.env.ABSEN_API_PASSWORD || 'alkuja07'
      }
    })

    const token = loginResponse?.token
    if (!token) {
      throw createError({ statusCode: 401, message: "Koneksi ke sistem absensi gagal (Auth Error)" })
    }

    // 2. Fetch All Absen Data
    const [absenUsers, absenLogs] = await Promise.all([
      $fetch<any[]>(`${process.env.ABSEN_API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
      $fetch<any[]>(`${process.env.ABSEN_API_URL}/absens/byBulan/${bulan}`, { headers: { Authorization: `Bearer ${token}` } })
    ])

    // 3. Get All Tendik with their LATEST Unit using RAW SQL (SIKUMP Standard)
    const tendikSikump: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        k.nik, k.nama,
        (SELECT b.nama_biro 
         FROM riwayat_jabatan rj 
         JOIN tmst_biro b ON rj.id_biro = b.id_biro 
         WHERE rj.nik = k.nik 
         ORDER BY rj.id DESC 
         LIMIT 1) as unit,
        (SELECT tj.nama_jabatan 
         FROM riwayat_jabatan rj2 
         JOIN tref_jabatan tj ON rj2.id_jabatan = tj.id_jabatan 
         WHERE rj2.nik = k.nik 
         ORDER BY rj2.id DESC 
         LIMIT 1) as jabatan
      FROM tmst_karyawan k
      WHERE k.nik NOT IN (SELECT nik FROM tmst_dosen)
      AND k.nik NOT LIKE '0000%'
    `)

    // 4. Map Attendance Data (Normalize NIK by removing spaces)
    const nikToUserIdMap: Record<string, string> = {}
    absenUsers.forEach((u: any) => {
      if (u.profile?.nik) {
        const cleanNik = String(u.profile.nik).replace(/\s+/g, '')
        nikToUserIdMap[cleanNik] = u._id
      }
    })

    const logMap: Record<string, { count: number, lates: number }> = {}
    absenLogs.forEach((log: any) => {
      const uId = log.userId
      if (!uId) return
      if (!logMap[uId]) logMap[uId] = { count: 0, lates: 0 }
      
      // Count presence ONLY if they have a checkout time (pulang/statusOut)
      if (log.statusOut === '1' || log.pulang) {
         logMap[uId].count++
         if (log.keteranganIn === 'Telat') {
           logMap[uId].lates++
         }
      }
    })

    // 5. Calculate Dynamic Working Days
    const nowServer = new Date()
    const currentMonthStr = nowServer.toISOString().slice(0, 7)
    const isCurrentMonth = bulan === currentMonthStr
    
    let effectiveWorkingDays = 22
    if (isCurrentMonth) {
      const dayOfMonth = nowServer.getDate()
      // Use (today - 1) as the baseline because today's checkout might not have happened yet
      const referenceDay = Math.max(dayOfMonth - 1, 1)
      effectiveWorkingDays = Math.max(referenceDay - Math.floor(referenceDay * 2 / 7), 1)
    }

    // Final Assembly
    const result = tendikSikump.map(t => {
      const cleanNik = String(t.nik || '').replace(/\s+/g, '')
      const uId = nikToUserIdMap[cleanNik]
      const logs = (uId ? logMap[uId] : null) || { count: 0, lates: 0 }
      
      const presenceRate = Math.min((logs.count / effectiveWorkingDays) * 100, 100)
      const disciplineScore = Math.max(presenceRate - (logs.lates * 2), 0)

      return {
        nik: t.nik,
        nama: t.nama || 'Tanpa Nama',
        biro: t.unit || 'Kantor Pusat', // Fallback matches primary API
        jabatan: t.jabatan || '-',
        hadir: logs.count,
        telat: logs.lates,
        score: Number(disciplineScore.toFixed(1)),
        isMapped: !!uId
      }
    }).sort((a, b) => b.score - a.score)

    return { success: true, data: result, month: bulan }
  } catch (error: any) {
    console.error('Absensi Integration Error:', error)
    return { success: false, message: error.message }
  }
})
