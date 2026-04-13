import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('--- PEMETAAN KODE PENDIDIKAN DOSEN ---')
  // Mencari distribusi kode pendidikan untuk dosen
  const mapping = await prisma.$queryRaw`
    SELECT kode_jenjang_pendidikan, COUNT(*) as jumlah 
    FROM tmst_dosen 
    GROUP BY kode_jenjang_pendidikan
  `
  console.table(mapping)

  console.log('\n--- CONTOH DOSEN DENGAN KODE 1 (S3?) ---')
  const code1 = await prisma.$queryRaw`SELECT nama_dosen, kode_jenjang_pendidikan FROM tmst_dosen WHERE kode_jenjang_pendidikan = '1' LIMIT 3`
  console.table(code1)

  console.log('\n--- CONTOH DOSEN DENGAN KODE 2 (S2?) ---')
  const code2 = await prisma.$queryRaw`SELECT nama_dosen, kode_jenjang_pendidikan FROM tmst_dosen WHERE kode_jenjang_pendidikan = '2' LIMIT 3`
  console.table(code2)
}

main().catch(console.error).finally(() => prisma.$disconnect())
