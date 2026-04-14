import { defineEventHandler, getQuery, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)

    const query = getQuery(event)
    const bulan = (query.bulan as string) || new Date().toISOString().slice(0, 7) // Format: YYYY-MM

    // 1. Get Token from Attendance API
    const authUrl = 'https://api-absen.unikarta.ac.id/auth'
    const loginResponse = await $fetch<any>(authUrl, {
      method: 'POST',
      body: {
        email: 'rizal.alkuja@gmail.com',
        password: 'alkuja07'
      }
    })

    const token = loginResponse?.token
    if (!token) {
      throw createError({ statusCode: 401, message: "Koneksi ke sistem absensi gagal (Auth Error)" })
    }

    // 2. Fetch All Absen Users (for mapping NIK to UserId)
    const absenUsers = await $fetch<any[]>('https://api-absen.unikarta.ac.id/users', {
      headers: { Authorization: `Bearer ${token}` }
    })

    // 3. Fetch Absence Logs for the month
    const absenLogs = await $fetch<any[]>(`https://api-absen.unikarta.ac.id/absens/byBulan/${bulan}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // 4. Get All Personnel from SIKUMP (Tendik only)
    const [tendikSikump, biroList] = await Promise.all([
      prisma.tmst_karyawan.findMany({
        include: {
          riwayat_jabatan: {
            where: { is_aktiv: 'Y' }
          }
        }
      }),
      prisma.tmst_biro.findMany()
    ])

    // Create a map for biro names for easy lookup
    const biroMap: Record<string, string> = {}
    biroList.forEach(b => {
      if (b.id_biro) biroMap[b.id_biro] = b.nama_biro
    })

    // Filter out Dosen
    const dosenNiks = (await prisma.tmst_dosen.findMany({ select: { nik: true } })).map(d => d.nik)
    const pureTendik = tendikSikump.filter(t => !dosenNiks.includes(t.nik))

    // 5. Map and Aggregate Data
    const nikToUserIdMap: Record<string, string> = {}
    absenUsers.forEach((u: any) => {
      if (u.profile?.nik) {
        nikToUserIdMap[u.profile.nik] = u._id
      }
    })

    const logMap: Record<string, { count: number, lates: number }> = {}
    absenLogs.forEach((log: any) => {
      if (!logMap[log.userId]) logMap[log.userId] = { count: 0, lates: 0 }
      if (log.statusOut === '1') {
         logMap[log.userId].count++
         if (log.keteranganIn === 'Telat') {
           logMap[log.userId].lates++
         }
      }
    })

    // Final Assembly
    const result = pureTendik.map(t => {
      const uId = nikToUserIdMap[t.nik]
      const logs = (uId ? logMap[uId] : null) || { count: 0, lates: 0 }
      
      const workingDays = 22
      const presenceRate = Math.min((logs.count / workingDays) * 100, 100)
      const disciplineScore = Math.max(presenceRate - (logs.lates * 2), 0)

      const idBiro = t.riwayat_jabatan?.[0]?.id_biro || ''

      return {
        nik: t.nik,
        nama: t.nama || 'Tanpa Nama',
        biro: biroMap[idBiro] || 'Tanpa Unit',
        jabatan: t.riwayat_jabatan?.[0]?.id_jabatan || '-',
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
