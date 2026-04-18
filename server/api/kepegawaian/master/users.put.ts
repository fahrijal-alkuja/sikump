import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'
import { logActivity } from '../../../utils/logger'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const body = await readBody(event)
    const { id, username, password, email, first_name, last_name, company, role, active } = body

    if (!id) throw createError({ statusCode: 400, statusMessage: 'User ID required' })

    const updateData: any = {
      username,
      email: email || '',
      first_name: first_name || '',
      last_name: last_name || '',
      company: String(company || ''),
      active: Number(active)
    }

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = bcrypt.hashSync(password, 10)
    }

    // Update user
    await (prisma as any).user.update({
      where: { id: Number(id) },
      data: updateData
    })

    // Update role if changed
    if (role) {
      let searchGroups = []
      if (role === 'admin') searchGroups = ["'admin'"]
      else if (role === 'prodi') searchGroups = ["'prodi'", "'unit'"]
      else searchGroups = ["'tendik'", "'members'", "'user'", "'umper'"]

      const groupResult: any[] = await prisma.$queryRawUnsafe(`
        SELECT id FROM \`groups\` 
        WHERE LOWER(name) IN (${searchGroups.join(',')}) 
        ORDER BY FIELD(LOWER(name), ${searchGroups.join(',')}) 
        LIMIT 1
      `)
      
      if (groupResult[0]) {
        await prisma.$queryRawUnsafe(`DELETE FROM users_groups WHERE user_id = ${id}`)
        await prisma.$queryRawUnsafe(`INSERT INTO users_groups (user_id, group_id) VALUES (${id}, ${groupResult[0].id})`)
      }
    }

    // Log activity
    await logActivity(event, 'UPDATE_USER', username, `Memperbarui profil ${first_name} ${last_name} (${role})`)

    return { success: true, message: 'User updated successfully' }
  } catch (error: any) {
    console.error('Update User Error:', error)
    return { success: false, message: error.message }
  }
})
