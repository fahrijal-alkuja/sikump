import { defineEventHandler, createError } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const nik = getRouterParam(event, 'nik')
  
  if (!nik) {
    throw createError({ statusCode: 400, statusMessage: 'NIK is required' })
  }

  try {
    // 1. Cleanup related transactional data
    await prisma.$executeRawUnsafe(`DELETE FROM riwayat_pendidikan WHERE nik = '${nik}'`)
    await prisma.$executeRawUnsafe(`DELETE FROM riwayat_pelatihan WHERE nik = '${nik}'`)
    await prisma.$executeRawUnsafe(`DELETE FROM riwayat_pengangkatan WHERE nik = '${nik}'`)
    await prisma.$executeRawUnsafe(`DELETE FROM riwayat_keluarga WHERE nik = '${nik}'`)
    await prisma.$executeRawUnsafe(`DELETE FROM tmst_pajak WHERE nik = '${nik}'`)

    // 2. Check and delete from main table
    const isDosenArr: any = await prisma.$queryRawUnsafe(`SELECT nik FROM tmst_dosen WHERE nik = '${nik}'`)
    const isDosen = isDosenArr.length > 0

    if (isDosen) {
      await prisma.$executeRawUnsafe(`DELETE FROM tmst_dosen WHERE nik = '${nik}'`)
    } else {
      await prisma.$executeRawUnsafe(`DELETE FROM tmst_karyawan WHERE nik = '${nik}'`)
    }

    return { success: true, message: 'Data pegawai berhasil dihapus' }
  } catch (error: any) {
    console.error('Delete error:', error)
    return { success: false, message: 'Gagal menghapus data. Data mungkin masih terelasi dengan tabel lain.' }
  }
})
