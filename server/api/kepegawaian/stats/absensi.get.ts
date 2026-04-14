import { defineEventHandler, getQuery, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)

    const query = getQuery(event)
    const bulan = (query.bulan as string) || new Date().toISOString().slice(0, 7) // Format: YYYY-MM

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

    // 2. Fetch All Absen Users (for mapping NIK to UserId)
    const absenUsers = await $fetch<any[]>(`${process.env.ABSEN_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // 3. Fetch Absence Logs for the month
    const absenLogs = await $fetch<any[]>(`${process.env.ABSEN_API_URL}/absens/byBulan/${bulan}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // 4. Get All Personnel from SIKUMP (Tendik only)
    const [tendikSikump, biroList, prodiList] = await Promise.all([
      prisma.tmst_karyawan.findMany({
        include: {
          riwayat_jabatan: {
            where: { is_aktiv: 'Y' }
          }
        }
      }),
      prisma.tmst_biro.findMany(),
      prisma.mst_program_studi.findMany()
    ])

    // Create a robust map for unit names (mapping both ID and String Code)
    const unitMap: Record<string, string> = {}
    biroList.forEach(b => {
      if (b.id_biro) unitMap[b.id_biro] = b.nama_biro
      unitMap[String(b.id)] = b.nama_biro
    })
    prodiList.forEach(p => {
      // Map prodi by its code or name if found
      if (p.nama_program_studi) {
         // @ts-ignore
         unitMap[p.kode_program_studi || ''] = p.nama_program_studi
      }
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
      const uId = log.userId
      if (!uId) return
      
      if (!logMap[uId]) {
        logMap[uId] = { count: 0, lates: 0 }
      }
      
      const entry = logMap[uId]!
      if (log.statusOut === '1') {
         entry.count++
         if (log.keteranganIn === 'Telat') {
           entry.lates++
         }
      }
    })

    const jabList = await prisma.tref_jabatan.findMany()
    const jabMap: Record<string, string> = {}
    jabList.forEach(j => {
      const name = j.nama_jabatan || 'Unknown'
      jabMap[String(j.id_jabatan)] = name
    })

    // Final Assembly
    const result = pureTendik.map(t => {
      const uId = nikToUserIdMap[t.nik]
      const logs = (uId ? logMap[uId] : null) || { count: 0, lates: 0 }
      
      const workingDays = 22
      const presenceRate = Math.min((logs.count / workingDays) * 100, 100)
      const disciplineScore = Math.max(presenceRate - (logs.lates * 2), 0)

      const activeJabatan = t.riwayat_jabatan?.[0]
      const idBiro = activeJabatan?.id_biro || ''
      
      // Try to find the jabatan name from the reference table
      const rawJabatan = activeJabatan?.id_jabatan || ''
      const namaJabatan = jabMap[rawJabatan] || rawJabatan || '-'

      return {
        nik: t.nik,
        nama: t.nama || 'Tanpa Nama',
        biro: unitMap[idBiro] || 'Tanpa Unit',
        jabatan: namaJabatan,
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
