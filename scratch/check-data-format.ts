import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  try {
    const data = await prisma.riwayat_pendidikan.findFirst({
      where: {
        upload_ijazah: {
          not: ''
        }
      },
      select: {
        upload_ijazah: true
      }
    })
    console.log('Sample Data:', data?.upload_ijazah)
  } catch (err: any) {
    console.error(err?.message || 'Unknown error')
  } finally {
    await prisma.$disconnect()
  }
}

test()
