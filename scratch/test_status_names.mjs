import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('--- CEK DIBERI NAMA APA TABEL STATUS NYA ---')
  const tables = await prisma.$queryRaw`SHOW TABLES LIKE '%status%'`
  console.table(tables)

  try {
    const statusRefs = await prisma.$queryRaw`SELECT * FROM tref_status_kepegawaian`
    console.log('--- ISI tref_status_kepegawaian ---')
    console.table(statusRefs)
  } catch(e) {}
}

main().catch(console.error).finally(() => prisma.$disconnect())
