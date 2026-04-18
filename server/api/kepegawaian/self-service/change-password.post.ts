import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../utils/prisma'
import { getAuthSession } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getAuthSession(event)
  if (!session || !session.username) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { newPassword } = await readBody(event)
  if (!newPassword || newPassword.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password minimal 6 karakter' })
  }

  const nik = session.username
  const hashedPassword = bcrypt.hashSync(newPassword, 10)

  try {
    // 1. Check if user already exists in users table
    const existingUser = await (prisma as any).user.findFirst({
      where: { username: nik }
    })

    if (existingUser) {
      // Update existing password
      await (prisma as any).user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      })
    } else {
      // 2. Create new user record for Tendik (Migration from virtual session to real user)
      const emp = await (prisma as any).tmst_karyawan.findUnique({
        where: { nik }
      })

      if (!emp) throw createError({ statusCode: 404, statusMessage: 'Data karyawan tidak ditemukan' })

      const newUser = await (prisma as any).user.create({
        data: {
          username: nik,
          email: `${nik}@unikarta.ac.id`, // Placeholder email
          password: hashedPassword,
          first_name: emp.nama,
          last_name: '',
          company: nik,
          active: 1,
          created_on: Math.floor(Date.now() / 1000)
        }
      })

      // 3. Assign to 'tendik' group
      const group: any = await (prisma as any).groups.findFirst({ where: { name: 'tendik' } })
      if (group) {
        await (prisma as any).users_groups.create({
          data: {
            user_id: newUser.id,
            group_id: group.id
          }
        })
      }
    }

    return {
      success: true,
      message: 'Password berhasil diperbarui. Silakan gunakan password baru pada login berikutnya.'
    }
  } catch (error: any) {
    console.error('Change password error:', error)
    return {
      success: false,
      message: 'Gagal memperbarui password: ' + error.message
    }
  }
})
