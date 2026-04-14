import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { setSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required'
    })
  }

  try {
    // 1. Find user by username or email
    // @ts-ignore
    const user: any = await (prisma as any).user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      }
    })

    if (!user) {
      return { success: false, message: 'User tidak ditemukan' }
    }

    if (user.active !== 1) {
      return { success: false, message: 'Akun Anda belum aktif' }
    }

    // 2. Clear current PHP cost prefix ($2y$) to $2a$ for bcryptjs compatibility
    let hash = user.password
    if (hash.startsWith('$2y$')) {
       hash = '$2a$' + hash.substring(4)
    }

    // 3. Verify password
    let isValid = false
    try {
      isValid = bcrypt.compareSync(password, hash)
    } catch (err) {
      console.error('Bcrypt comparison error:', err)
    }
    if (!isValid) {
      return { success: false, message: 'Password salah' }
    }

    // 4. Get User Groups
    const userGroups: any[] = await prisma.$queryRaw`
      SELECT g.id, g.name 
      FROM users_groups ug
      JOIN \`groups\` g ON ug.group_id = g.id
      WHERE ug.user_id = ${user.id}
    `

    // Identify if Admin or Prodi
    const roles = userGroups.map(g => g.name)
    const isAdmin = roles.includes('admin') || roles.includes('kepegawaian') || roles.includes('umper')
    
    const sessionData = {
      id: user.id,
      username: user.username,
      name: `${user.first_name} ${user.last_name}`.trim(),
      role: isAdmin ? 'admin' : 'prodi',
      unit: user.company || null, // Unit code for Prodi filtering
      roles
    }

    // 5. Set Secure Session Cookie
    setSession(event, sessionData)

    return {
      success: true,
      user: sessionData
    }

  } catch (error: any) {
    console.error('Login error:', error)
    return {
      success: false,
      message: 'Terjadi kesalahan pada server'
    }
  }
})
