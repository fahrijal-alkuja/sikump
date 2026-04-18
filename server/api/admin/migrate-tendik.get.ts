import { defineEventHandler } from 'h3'
import { prisma } from '../../utils/prisma'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  
  try {
    const groups: any[] = await prisma.$queryRaw`SELECT id FROM \`groups\` WHERE LOWER(name) IN ('tendik', 'members', 'user') ORDER BY FIELD(LOWER(name), 'tendik', 'members', 'user') LIMIT 1`
    const groupId = groups.length > 0 ? groups[0].id : 2

    const employees = await prisma.tmst_karyawan.findMany()
    const allUsers = await (prisma as any).user.findMany()

    let createdCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const emp of employees) {
      const nik = emp.nik
      if (!nik) continue

      const existingUser = await (prisma as any).user.findFirst({ where: { username: nik } })

      if (existingUser) {
        skippedCount++
        continue
      }

      try {
        const hashedPassword = bcrypt.hashSync(nik, 10)
        const newUser = await (prisma as any).user.create({
          data: {
            ip_address: '127.0.0.1',
            username: nik,
            password: hashedPassword,
            email: `${nik}@unikarta.ac.id`,
            first_name: emp.nama || 'User',
            last_name: '',
            company: nik,
            active: 1,
            created_on: Math.floor(Date.now() / 1000)
          }
        })

        await (prisma as any).users_groups.create({
          data: {
            user_id: newUser.id,
            group_id: groupId
          }
        })
        createdCount++
      } catch (err) {
        errorCount++
      }
    }

    const result = {
      success: true,
      debug: {
        total_employees: employees.length,
        total_users_in_db: allUsers.length,
        created: createdCount,
        skipped: skippedCount,
        errors: errorCount,
        target_group_id: groupId
      },
      message: `Migrasi selesai. Dibuat: ${createdCount}, Dilewati: ${skippedCount}`
    }

    // Fix BigInt serialization
    return JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ))
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
