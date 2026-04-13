import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listTables() {
  try {
    const result = await prisma.$queryRaw`SHOW TABLES`
    console.log('Tables in database:', JSON.stringify(result, null, 2))
    
    // Check if tmst_karyawan exists and has data
    const karyawanCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM tmst_karyawan`
    console.log('tmst_karyawan count:', karyawanCount)
    
  } catch (e) {
    console.error('Error listing tables:', e)
  } finally {
    await prisma.$disconnect()
  }
}

listTables()
