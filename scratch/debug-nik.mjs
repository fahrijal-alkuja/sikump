import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  const nik = '991020912080786'
  try {
    console.log('--- Testing Dosen Fetch ---')
    const dosenRes = await prisma.$queryRawUnsafe(`
      SELECT d.*, ps.nama_program_studi as unit 
      FROM tmst_dosen d
      LEFT JOIN mst_program_studi ps ON d.kode_program_studi = ps.kode_program_studi
      WHERE d.nik = '${nik}'
    `)
    console.log('Dosen Found:', !!dosenRes[0])

    if (dosenRes[0]) {
      console.log('--- Testing Related Data Fetch ---')
      try {
        const jabatan = await prisma.riwayat_jabatan.findMany({ where: { nik } })
        console.log('Jabatan:', jabatan.length)
      } catch (e) { console.error('Error Riwayat Jabatan:', e.message) }

      try {
        const pendidikan = await prisma.riwayat_pendidikan.findMany({ where: { nik } })
        console.log('Pendidikan:', pendidikan.length)
      } catch (e) { console.error('Error Riwayat Pendidikan:', e.message) }

      try {
        // Checking riwayat_jafung which is often the culprit
        const jafung = await prisma.$queryRawUnsafe(`SELECT * FROM tmst_jafung WHERE nik = '${nik}'`)
        console.log('Jafung:', jafung.length)
      } catch (e) { console.error('Error Jafung:', e.message) }
    }
  } catch (err) {
    console.error('CRITICAL ERROR:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

test()
