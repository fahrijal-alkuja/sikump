import { defineEventHandler } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event) // Only admin can see these stats
    
    // Aggregate activities by operator who has 'prodi' role
    const activeUsers: any = await prisma.$queryRaw`
      SELECT 
        l.nik_operator as username, 
        l.nama_operator as name, 
        u.company as unit_code,
        b.nama_biro as unit_name,
        COUNT(l.id) as activity_count
      FROM activity_logs l
      INNER JOIN users u ON l.nik_operator = u.username
      INNER JOIN users_groups ug ON u.id = ug.user_id
      INNER JOIN \`groups\` g ON ug.group_id = g.id
      LEFT JOIN tmst_biro b ON u.company = b.id_biro
      WHERE g.name = 'prodi'
      GROUP BY l.nik_operator, l.nama_operator, u.company, b.nama_biro
      ORDER BY activity_count DESC
      LIMIT 5
    `

    // Convert BigInt to Number if needed, though COUNT normally returns Int
    const formatted = activeUsers.map((user: any) => ({
      ...user,
      activity_count: Number(user.activity_count)
    }))

    return { success: true, data: formatted }
  } catch (error: any) {
    console.error('Active Users Stats Error:', error)
    return { success: false, message: error.message }
  }
})
