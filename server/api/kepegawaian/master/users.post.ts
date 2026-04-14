import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'
import { logActivity } from '../../../utils/logger'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const body = await readBody(event)
    const { username, password, email, first_name, last_name, company, role } = body

    if (!username || !password) {
      throw createError({ statusCode: 400, statusMessage: 'Username and password required' })
    }

    // Hash password (legacy format support)
    const hashedPassword = bcrypt.hashSync(password, 10)

    // Create user
    const newUser: any = await (prisma as any).user.create({
      data: {
        username,
        password: hashedPassword,
        email: email || '',
        first_name: first_name || '',
        last_name: last_name || '',
        company: String(company || ''),
        active: 1
      }
    })

    // Assign group
    const groupName = role === 'admin' ? 'admin' : 'prodi'
    const group: any = await prisma.$queryRawUnsafe(`SELECT id FROM \`groups\` WHERE name = '${groupName}' LIMIT 1`)
    
    if (group[0]) {
      await prisma.$queryRawUnsafe(`INSERT INTO users_groups (user_id, group_id) VALUES (${newUser.id}, ${group[0].id})`)
    }

    // Log the activity
    await logActivity(event, 'CREATE_USER', username, `Membuat akun baru untuk ${first_name} ${last_name} (${role})`)

    return { success: true, message: 'User created' }
  } catch (error: any) {
    console.error('Create User Error:', error)
    return { success: false, message: error.message }
  }
})
