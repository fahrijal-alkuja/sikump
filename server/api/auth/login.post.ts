import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { setAuthSession } from '../../utils/session'
import { logActivity } from '../../utils/logger'
import { rateLimit } from '../../utils/limiter'

export default defineEventHandler(async (event) => {
  // Rate Limit: 10 attempts per 15 minutes
  rateLimit(event, { max: 10, windowMs: 15 * 60 * 1000, keyPrefix: 'login' })

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
    let user: any = await (prisma as any).user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      }
    })

    let roles: string[] = []
    let isTendikOnly = false

    if (!user) {
      // Fallback: Check if it's a NIK login for Tendik Self-Service
      const tendik = await (prisma as any).tmst_karyawan.findUnique({
        where: { nik: username }
      })

      if (tendik) {
        // Simple Logic: Use NIK as password for first-time login if no user record exists
        // (In production, you'd want a proper activation flow)
        if (password === tendik.nik) {
          user = {
            id: 'T-' + tendik.nik,
            username: tendik.nik,
            first_name: tendik.nama,
            last_name: '',
            company: tendik.nik, // Using NIK as company ID for employee direct access
            active: 1
          }
          roles = ['tendik']
          isTendikOnly = true
        } else {
          return { success: false, message: 'Password salah (Gunakan NIK Anda untuk login pertama kali)' }
        }
      } else {
        return { success: false, message: 'User atau NIK tidak ditemukan' }
      }
    }

    if (!isTendikOnly) {
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
      roles = userGroups.map(g => g.name)
    }

    // Identify role
    let roleLabel: 'admin' | 'prodi' | 'tendik' = 'tendik'
    
    if (isTendikOnly) {
      roleLabel = 'tendik'
    } else {
      const isAdmin = roles.some(r => ['admin', 'kepegawaian', 'umper'].includes(r.toLowerCase()))
      const isTendik = roles.some(r => ['tendik', 'members', 'user'].includes(r.toLowerCase()))
      const isProdi = roles.some(r => ['prodi', 'unit'].includes(r.toLowerCase()))

      if (isAdmin) roleLabel = 'admin'
      else if (isTendik) roleLabel = 'tendik'
      else if (isProdi) roleLabel = 'prodi'
      else roleLabel = 'tendik'
    }
    
    const sessionData = {
      id: user.id,
      username: user.username,
      name: isTendikOnly ? user.first_name : `${user.first_name} ${user.last_name}`.trim(),
      role: roleLabel,
      unit: user.company || null,
      roles
    }

    // 5. Set Secure Session Cookie
    setAuthSession(event, sessionData)

    // 6. Log Login Activity
    await logActivity(event, 'LOGIN', username, `Berhasil login ke sistem sebagai ${sessionData.role.toUpperCase()}`)

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
