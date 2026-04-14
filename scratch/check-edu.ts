import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const edu = await prisma.tref_pendidikan.findMany()
  console.log('EDUCATION:', JSON.stringify(edu, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
