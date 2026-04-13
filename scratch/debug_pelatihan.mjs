import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function debugTrainedTendik() {
  console.log('--- Debugging Trained Tendik ---')
  
  // 1. Total di riwayat_pelatihan
  const rawPelatihan = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM riwayat_pelatihan`)
  console.log('Total baris di riwayat_pelatihan:', rawPelatihan)

  // 2. Cek NIK Tendik yang ada di pelatihan
  const sampleNIK = await prisma.$queryRawUnsafe(`SELECT nik FROM riwayat_pelatihan LIMIT 5`)
  console.log('Contoh NIK di riwayat_pelatihan:', sampleNIK)

  // 3. Cek apakah NIK tersebut ada di tmst_karyawan
  const sampleKaryawan = await prisma.$queryRawUnsafe(`SELECT nik, nama FROM tmst_karyawan LIMIT 5`)
  console.log('Contoh NIK di tmst_karyawan:', sampleKaryawan)

  // 4. Jalankan join yang tadi saya buat
  const joinCheck = await prisma.$queryRawUnsafe(`
    SELECT rp.nik as pelatihan_nik, k.nik as karyawan_nik, k.nama
    FROM riwayat_pelatihan rp
    JOIN tmst_karyawan k ON rp.nik = k.nik
    LIMIT 5
  `)
  console.log('Hasil Join:', joinCheck)
}

debugTrainedTendik()
