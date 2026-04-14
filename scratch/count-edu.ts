import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const r1 = await prisma.riwayat_pendidikan.count()
  // @ts-ignore
  const r2 = await prisma.riwayat_pendidikan_dosen.count()
  console.log('COUNTS:', { riwayat_pendidikan: r1, riwayat_pendidikan_dosen: r2 })
  
  const sample = await prisma.riwayat_pendidikan.findFirst({ where: { id_pendidikan: 6 } })
  console.log('SAMPLE S3:', sample)
}

main().catch(console.error).finally(() => prisma.$disconnect())
