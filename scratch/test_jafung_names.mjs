import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('--- NAMA JABATAN AKADEMIK (JAFUNG) ---')
  const refs = await prisma.$queryRaw`SELECT * FROM tref_jafung`
  console.table(refs)
}

main().catch(console.error).finally(() => prisma.$disconnect())
