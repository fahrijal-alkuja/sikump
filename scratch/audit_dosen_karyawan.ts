import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function audit() {
  try {
    const karyawanCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM tmst_karyawan`
    const dosenCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM tmst_dosen`
    
    console.log('Karyawan Count:', karyawanCount)
    console.log('Dosen Count:', dosenCount)
    
    const dosenSample = await prisma.$queryRaw`SELECT * FROM tmst_dosen LIMIT 5`
    console.log('Dosen Sample:', JSON.stringify(dosenSample, null, 2))

    const karyawanSample = await prisma.$queryRaw`SELECT nik, nama, ikatan_kerja FROM tmst_karyawan LIMIT 5`
    console.log('Karyawan Sample:', JSON.stringify(karyawanSample, null, 2))
    
    // Check if NIKs in tmst_dosen exist in tmst_karyawan
    const intersect = await prisma.$queryRaw`SELECT COUNT(*) as count FROM tmst_karyawan WHERE nik IN (SELECT nik FROM tmst_dosen)`
    console.log('Overlap NIK Count:', intersect)

  } catch (e) {
    console.error('Audit failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

audit()
