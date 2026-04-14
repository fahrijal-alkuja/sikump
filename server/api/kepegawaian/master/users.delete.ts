import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const query = getQuery(event)
    const id = Number(query.id)

    if (!id) return { success: false, message: 'ID required' }

    // Deleting from related tables first
    await prisma.$queryRawUnsafe(`DELETE FROM users_groups WHERE user_id = ${id}`)
    await prisma.$queryRawUnsafe(`DELETE FROM users WHERE id = ${id}`)

    return { success: true, message: 'User deleted' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
