import { defineEventHandler } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    
    const users: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name, 
        u.company as unit_code, u.active,
        (SELECT g.name FROM users_groups ug JOIN \`groups\` g ON ug.group_id = g.id WHERE ug.user_id = u.id LIMIT 1) as role
      FROM users u
      ORDER BY u.id DESC
    `)

    // Convert BigInt to Number for JSON serialization
    const serializedUsers = JSON.parse(JSON.stringify(users, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ))

    return { success: true, data: serializedUsers }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
