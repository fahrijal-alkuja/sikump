import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function debugIntelligence() {
  console.log('--- Debugging Strategic Intelligence ---')
  
  // 1. Cek Data Pensiun Dosen
  const dosenBirth = await prisma.$queryRawUnsafe(`
    SELECT nama_dosen, tanggal_lahir FROM tmst_dosen WHERE status_aktif = '1' AND tanggal_lahir IS NOT NULL LIMIT 3
  `)
  console.log('Sample Tgl Lahir Dosen:', dosenBirth)

  // 2. Cek Hitungan Pensiun (Query Retirement)
  const retireCheck = await prisma.$queryRawUnsafe(`
    SELECT nama_dosen, (YEAR(CURDATE()) - YEAR(tanggal_lahir)) as age FROM tmst_dosen WHERE status_aktif = '1' LIMIT 5
  `)
  console.log('Hitungan Umur:', retireCheck)

  // 3. Cek Heatmap Join
  const heatmapCheck = await prisma.$queryRawUnsafe(`
    SELECT ps.nama_program_studi FROM tmst_dosen d 
    JOIN mst_program_studi ps ON d.kode_program_studi = ps.kode_program_studi 
    LIMIT 3
  `)
  console.log('Heatmap Join Dosen:', heatmapCheck)
}

debugIntelligence()
