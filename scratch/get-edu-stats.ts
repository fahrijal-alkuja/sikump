import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const prisma = new PrismaClient()

async function main() {
  const eduDosen = await prisma.$queryRaw`SELECT kode_jenjang_pendidikan, COUNT(*) as count FROM tmst_dosen GROUP BY kode_jenjang_pendidikan`
  const eduHistory = await prisma.$queryRaw`SELECT id_pendidikan, COUNT(*) as count FROM riwayat_pendidikan GROUP BY id_pendidikan`
  
  const result = {
    eduDosen,
    eduHistory
  }
  
  fs.writeFileSync('scratch/edu-result.json', JSON.stringify(result, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
