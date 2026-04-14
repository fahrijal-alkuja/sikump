import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'
import { logActivity } from '../../../utils/logger'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const query = getQuery(event)
    const id = Number(query.id)

    if (!id) return { success: false, message: 'ID required' }

    // Get user info for logging
    const targetUser: any = await (prisma as any).user.findUnique({ where: { id } })

    // Deleting from related tables first
    await prisma.$queryRawUnsafe(`DELETE FROM users_groups WHERE user_id = ${id}`)
    await prisma.$queryRawUnsafe(`DELETE FROM users WHERE id = ${id}`)

    // Log activity
    if (targetUser) {
      await logActivity(event, 'DELETE_USER', targetUser.username, `Menghapus akses user: ${targetUser.first_name} ${targetUser.last_name}`)
    }

    return { success: true, message: 'User deleted' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
