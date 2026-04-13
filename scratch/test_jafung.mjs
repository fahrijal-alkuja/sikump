import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('--- PEMETAAN JAFUNG DOSEN ---')
  const mapping = await prisma.$queryRaw`
    SELECT kode_jabatan_akademik, COUNT(*) as jumlah 
    FROM tmst_dosen 
    GROUP BY kode_jabatan_akademik
  `
  console.table(mapping)

  console.log('\n--- SAMPLE DOSEN & JAFUNG NYA ---')
  const samples = await prisma.$queryRaw`
    SELECT nama_dosen, kode_jabatan_akademik 
    FROM tmst_dosen 
    WHERE kode_jabatan_akademik IS NOT NULL 
    LIMIT 5
  `
  console.table(samples)
}

main().catch(console.error).finally(() => prisma.$disconnect())
