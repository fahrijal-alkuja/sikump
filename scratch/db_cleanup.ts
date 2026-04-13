import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  const tablesToDrop = [
    'barang', 'distribusi', 'tmst_distribusi', 'tref_aset', 'tref_kondisi',
    'tmst_apbu_pemasukan', 'tmst_apbu_pengeluaran', 'tmst_bku', 'tmst_lra_biaya', 
    'tmst_lra_pendapatan', 'tmst_rka', 'tmst_rka_biaya', 'tmst_rka_pendapatan', 
    'tref_akun', 'tref_anggaran', 'tref_apbu_biaya', 'tref_apbu_jenis_biaya', 
    'tref_apbu_pendapatan', 'tref_apbu_sub_biaya', 'tref_subakun', 'tref_timex',
    'tmst_periksa'
  ]

  console.log('Starting database cleanup...')

  for (const table of tablesToDrop) {
    try {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`${table}\``)
      console.log(`Dropped table: ${table}`)
    } catch (e: any) {
      console.error(`Failed to drop ${table}: ${e.message}`)
    }
  }

  console.log('Cleanup complete. Database is now focused on Kepegawaian.')
  await prisma.$disconnect()
}

cleanup()
