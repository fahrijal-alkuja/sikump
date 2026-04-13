import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('--- CEK REFERENSI PENDIDIKAN ---')
  const pendidikan = await prisma.$queryRaw`SELECT * FROM tref_pendidikan`
  console.table(pendidikan)

  console.log('\n--- SAMPLE DATA DOSEN (KODE PENDIDIKAN) ---')
  const sampleDosen = await prisma.$queryRaw`SELECT nik, nama_dosen, kode_jenjang_pendidikan FROM tmst_dosen WHERE kode_jenjang_pendidikan IS NOT NULL LIMIT 5`
  console.table(sampleDosen)

  console.log('\n--- SAMPLE DATA KARYAWAN (TENDIK) RIWAYAT PENDIDIKAN ---')
  const sampleRiwayat = await prisma.$queryRaw`SELECT nik, id_pendidikan FROM riwayat_pendidikan LIMIT 5`
  console.table(sampleRiwayat)
}

main().catch(console.error).finally(() => prisma.$disconnect())
