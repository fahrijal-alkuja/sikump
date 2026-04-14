import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  const nik = '991020912080786'
  try {
    console.log('--- Testing Dosen Fetch ---')
    const dosenRes: any[] = await prisma.$queryRaw`
      SELECT d.*, ps.nama_program_studi as unit 
      FROM tmst_dosen d
      LEFT JOIN mst_program_studi ps ON d.kode_program_studi = ps.kode_program_studi
      WHERE d.nik = ${nik}
    `
    console.log('Dosen Found:', !!dosenRes[0])

    if (dosenRes[0]) {
      console.log('--- Testing Related Data Fetch ---')
      const jabatan = await prisma.riwayat_jabatan.findMany({ where: { nik } })
      console.log('Jabatan:', jabatan.length)
      
      const pendidikan = await prisma.riwayat_pendidikan.findMany({ where: { nik } })
      console.log('Pendidikan:', pendidikan.length)
      
      const jafung = await (prisma as any).riwayat_jafung.findMany({ where: { nik } })
      console.log('Jafung:', jafung.length)
    }
  } catch (err: any) {
    console.error('ERROR DETECTED:', err.message)
    if (err.code) console.error('Error Code:', err.code)
  } finally {
    await prisma.$disconnect()
  }
}

test()
