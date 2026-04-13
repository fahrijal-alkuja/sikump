import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('--- DISTRIBUSI STATUS AKTIF (DOSEN) ---')
  const statusDosen = await prisma.$queryRaw`SELECT status_aktif, COUNT(*) as jumlah FROM tmst_dosen GROUP BY status_aktif`
  console.table(statusDosen)

  console.log('\n--- DISTRIBUSI STATUS AKTIF (TENDIK) ---')
  const statusKaryawan = await prisma.$queryRaw`SELECT status_aktif, COUNT(*) as jumlah FROM tmst_karyawan GROUP BY status_aktif`
  console.table(statusKaryawan)

  console.log('\n--- CEK DATA PROGRAM STUDI ---')
  const prodi = await prisma.$queryRaw`SELECT kode_program_studi, nama_program_studi FROM mst_program_studi LIMIT 5`
  console.table(prodi)

  console.log('\n--- CEK DATA BIRO ---')
  const biro = await prisma.$queryRaw`SELECT id_biro, nama_biro FROM tmst_biro LIMIT 5`
  console.table(biro)
}

main().catch(console.error).finally(() => prisma.$disconnect())
