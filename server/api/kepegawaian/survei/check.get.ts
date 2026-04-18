import { defineEventHandler, getCookie } from 'h3'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const userCookie = getCookie(event, 'user')
  if (!userCookie) return { success: false, message: 'Not logged in' }
  
  const user = JSON.parse(userCookie)
  if (user.role !== 'tendik') return { success: true, filled: true }

  const now = new Date()
  const currentYear = now.getFullYear().toString()
  // Semester 1: Jul - Dec, Semester 2: Jan - Jun
  const currentSemester = now.getMonth() >= 6 ? '1' : '2'

  try {
    const check = await (prisma as any).survei_tendik.findFirst({
      where: {
        nik: user.username,
        tahun: currentYear,
        semester: currentSemester
      }
    })

    return {
      success: true,
      filled: !!check,
      year: currentYear,
      semester: currentSemester
    }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
