import { defineEventHandler } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    
    const users: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name, 
        u.company as unit_code,
        b.nama_biro as unit_name,
        u.active,
        (SELECT g.name FROM users_groups ug JOIN \`groups\` g ON ug.group_id = g.id WHERE ug.user_id = u.id LIMIT 1) as role
      FROM users u
      LEFT JOIN tmst_biro b ON u.company = b.id_biro
      ORDER BY u.id DESC
    `)

    // Convert BigInt to Number and fallback for unit_name
    const serializedUsers = JSON.parse(JSON.stringify(users, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )).map((u: any) => ({
      ...u,
      unit_display: u.unit_name || (u.unit_code === '' ? 'Universitas' : u.unit_code)
    }))

    return { success: true, data: serializedUsers }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
