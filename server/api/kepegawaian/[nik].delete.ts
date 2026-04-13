import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const nik = getRouterParam(event, 'nik')
  
  if (!nik) {
    throw createError({ statusCode: 400, statusMessage: 'NIK is required' })
  }

  try {
    // 1. Cleanup related transactional data
    await prisma.$executeRaw`DELETE FROM riwayat_pendidikan WHERE nik = ${nik}`
    await prisma.$executeRaw`DELETE FROM riwayat_pelatihan WHERE nik = ${nik}`
    await prisma.$executeRaw`DELETE FROM riwayat_pengangkatan WHERE nik = ${nik}`
    await prisma.$executeRaw`DELETE FROM riwayat_keluarga WHERE nik = ${nik}`
    await prisma.$executeRaw`DELETE FROM tmst_pajak WHERE nik = ${nik}`

    // 2. Check and delete from main table
    const dosen: any = await prisma.tmst_dosen.findUnique({ where: { nik } })
    
    if (dosen) {
      await prisma.tmst_dosen.delete({ where: { nik } })
    } else {
      await prisma.tmst_karyawan.delete({ where: { nik } })
    }

    return { success: true, message: 'Data pegawai berhasil dihapus' }
  } catch (error: any) {
    console.error('Delete error:', error)
    return { success: false, message: 'Gagal menghapus data. Data mungkin masih terelasi dengan tabel lain.' }
  }
})
