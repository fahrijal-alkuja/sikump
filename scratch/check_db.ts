import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
  try {
    const total = await prisma.tmst_karyawan.count()
    const sample = await prisma.tmst_karyawan.findMany({ take: 5 })
    console.log('Total Karyawan:', total)
    console.log('Sample Data:', JSON.stringify(sample, null, 2))
  } catch (e) {
    console.error('Error checking database:', e)
  } finally {
    await prisma.$disconnect()
  }
}

check()
