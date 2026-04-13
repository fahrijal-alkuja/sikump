import { PrismaClient } from '@prisma/client'

// Try connecting with root/no-password to see if it works
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root@localhost:3306/db_bauk'
    }
  }
})

async function testRoot() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Connection with root successful!')
    const tables = await prisma.$queryRaw`SHOW TABLES`
    console.log('Tables:', JSON.stringify(tables, null, 2))
  } catch (e: any) {
    console.error('Connection with root failed:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

testRoot()
