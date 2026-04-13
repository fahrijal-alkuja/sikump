import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('--- CEK ISI TABEL tmst_jafung ---')
  const jafung = await prisma.$queryRaw`SELECT nik, id_jafung, id_pangkat FROM tmst_jafung LIMIT 10`
  console.table(jafung)

  console.log('\n--- CEK ISI TABEL riwayat_jafung ---')
  const riwayat = await prisma.$queryRaw`SELECT nik, id_jafung, no_sk FROM riwayat_jafung LIMIT 10`
  console.table(riwayat)
}

main().catch(console.error).finally(() => prisma.$disconnect())
