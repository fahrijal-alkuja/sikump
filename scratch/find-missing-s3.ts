import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const gb = await prisma.$queryRaw`
    SELECT d.nik, d.nama_dosen, d.kode_jenjang_pendidikan
    FROM tmst_dosen d
    WHERE d.nik IN (
      SELECT nik FROM tmst_jafung WHERE id_jafung = 4
    )
  `
  console.log('GURU BESAR:', JSON.stringify(gb, null, 2))
  
  const s3All = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT nik) as count FROM (
      SELECT nik FROM tmst_dosen WHERE kode_jenjang_pendidikan = 1
      UNION
      SELECT nik FROM riwayat_pendidikan WHERE id_pendidikan = 6 OR id_pendidikan = 1
      UNION
      SELECT nik FROM riwayat_pendidikan_dosen WHERE id_pendidikan = '6' OR id_pendidikan = '1' OR id_pendidikan = 'S3'
    ) as combined
  `
  console.log('TOTAL S3 (Combined):', s3All)
}

main().catch(console.error).finally(() => prisma.$disconnect())
