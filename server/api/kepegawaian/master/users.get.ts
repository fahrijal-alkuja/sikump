import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    
    const query = getQuery(event)
    const roleFilter = query.role as string
    const search = query.search as string

    let sql = `
      SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name, 
        u.company as unit_code,
        b.nama_biro as unit_name,
        u.active,
        g.name as role,
        (SELECT rb.nama_biro FROM riwayat_jabatan rj JOIN tmst_biro rb ON rj.id_biro = rb.id_biro WHERE TRIM(rj.nik) = TRIM(u.username) ORDER BY rj.id DESC LIMIT 1) as career_unit
      FROM users u
      LEFT JOIN tmst_biro b ON u.company = b.id_biro
      LEFT JOIN users_groups ug ON u.id = ug.user_id
      LEFT JOIN \`groups\` g ON ug.group_id = g.id
      WHERE 1=1
    `
    
    if (roleFilter === 'tendik') {
      sql += ` AND (LOWER(g.name) IN ('tendik', 'members', 'user', 'umper') OR (u.company IS NOT NULL AND LENGTH(u.company) > 10)) `
    } else if (roleFilter === 'admin') {
      sql += ` AND (LOWER(g.name) IN ('admin', 'administrator', 'superadmin')) `
    } else if (roleFilter === 'prodi') {
      sql += ` AND (LOWER(g.name) LIKE '%prodi%' OR LOWER(g.name) LIKE '%unit%' OR (u.company IS NOT NULL AND u.company != '' AND LENGTH(u.company) <= 10)) `
    }

    if (search) {
      sql += ` AND (u.username LIKE '%${search}%' OR u.first_name LIKE '%${search}%' OR u.last_name LIKE '%${search}%' OR u.email LIKE '%${search}%') `
    }

    sql += ` ORDER BY u.id DESC`

    const users: any[] = await prisma.$queryRawUnsafe(sql)

    // Convert BigInt to Number and filter/map
    const serializedUsers = JSON.parse(JSON.stringify(users, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )).map((u: any) => {
      // Map roles
      let finalRole = u.role
      if (!finalRole || ['umper', 'members', 'user'].includes(finalRole.toLowerCase())) {
        finalRole = 'TENDIK'
      }

      // Unit Display logic
      let unit = u.career_unit || u.unit_name
      if (!unit) {
        if (u.unit_code === '' || finalRole === 'ADMIN') unit = 'UNIVERSITAS (PUSAT)'
        else if (finalRole === 'PRODI') unit = 'ADMIN UNIT / PRODI'
        else unit = 'UNIT KERJA TENDIK'
      }

      return {
        ...u,
        role: finalRole.toUpperCase(),
        unit_display: unit
      }
    })

    return { success: true, data: serializedUsers }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
