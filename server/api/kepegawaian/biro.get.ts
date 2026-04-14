import { prisma } from '../../utils/prisma'
import { defineEventHandler } from 'h3'
import { useServerSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = useServerSession(event)
    let sql = `SELECT id_biro as id, nama_biro as nama FROM tmst_biro`
    
    if (user?.role === 'prodi' && user.unit) {
      sql += ` WHERE id_biro = '${user.unit.trim()}'`
    }
    
    sql += ` ORDER BY nama ASC`
    
    const biro: any[] = await prisma.$queryRawUnsafe(sql)
    return { success: true, data: biro }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
