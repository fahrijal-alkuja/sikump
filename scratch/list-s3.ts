import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const s3List = await prisma.$queryRaw`
    SELECT nik, nama_dosen, kode_jenjang_pendidikan, 'Jenjang S3' as source
    FROM tmst_dosen
    WHERE kode_jenjang_pendidikan = 1 AND nik NOT LIKE '0000%'
    UNION
    SELECT d.nik, d.nama_dosen, d.kode_jenjang_pendidikan, 'Guru Besar' as source
    FROM tmst_dosen d
    JOIN tmst_jafung rj ON d.nik = rj.nik
    WHERE rj.id_jafung = 4 AND d.nik NOT LIKE '0000%'
  `
  console.log('S3 CANDIDATES:', s3List)
}

main().catch(console.error).finally(() => prisma.$disconnect())
