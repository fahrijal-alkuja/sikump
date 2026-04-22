import { defineEventHandler, readMultipartFormData, createError, readBody } from 'h3'
import { requireAuth } from '../../../../utils/auth'
import { prisma } from '../../../../utils/prisma'
import fs from 'node:fs'
import path from 'node:path'
import { getStoragePath } from '../../../../utils/storage'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const table = event.context.params?.table
  const idStr = event.context.params?.id
  const id = parseInt(idStr || '0')

  if (!table || !id) throw createError({ statusCode: 400, statusMessage: 'Missing table or id' })

  const parts = await readMultipartFormData(event)
  const data: any = {}

  if (parts) {
    // 1. First Pass: Get all fields
    for (const part of parts) {
      if (part.name && !part.filename) {
        data[part.name] = part.data.toString()
      }
    }

    // 2. Second Pass: Process Files
    for (const part of parts) {
      if (part.name && part.filename) {
        // Handle File Update
        const ext = path.extname(part.filename)
        const newFilename = `${table}_${Date.now()}${ext}`
        
        // Determine folder
        let folder = 'uploads'
        if (table.includes('pendidikan')) folder = 'pendidikan'
        else if (table.includes('pelatihan')) folder = 'sertifikat'
        else if (table.includes('keluarga')) folder = 'kk'
        else if (table.includes('pangkat')) folder = 'pangkat'
        else if (table.includes('pengangkatan') || table.includes('jafung')) folder = 'SK'
        else if (table.includes('jabatan')) {
          // Use status if present in data, otherwise fallback to existing status logic if needed
          // But usually the status is sent together with the file in these forms
          folder = data.status === '2' ? 'skMutasi' : 'SK'
        }
        else if (table.includes('pajak')) folder = 'npwp'
        else if (table.includes('askes')) folder = 'askes'

        const uploadDir = getStoragePath(folder)
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
        
        fs.writeFileSync(path.join(uploadDir, newFilename), part.data)
        data[part.name] = newFilename
      }
    }
  } else {
    const body = await readBody(event)
    Object.assign(data, body)
  }

  // Safe Formatting & Conversion
  for (const key in data) {
    if (['tanggal_keluar', 'tanggal_sk'].includes(key)) {
      if (data[key] && data[key] !== 'undefined' && data[key] !== 'null' && data[key] !== '') {
        const d = new Date(data[key])
        if (!isNaN(d.getTime())) data[key] = d
        else delete data[key]
      } else {
        data[key] = null
      }
    }
    if (['id_pendidikan', 'id_pangkat'].includes(key)) {
      if (data[key]) data[key] = parseInt(data[key])
    }
  }
  
  // Exclude ID from update body
  delete data.id

  try {
    // @ts-ignore
    const result = await prisma[table].update({
      where: { id },
      data: data
    })

    // --- AUTO-SYNC LOGIC ---
    // 1. Sync Pendidikan to tmst_dosen
    if (table.includes('pendidikan') && result.nik && (data.id_pendidikan || result.id_pendidikan)) {
      const targetEdu = data.id_pendidikan || result.id_pendidikan
      const isDosen = await prisma.tmst_dosen.findUnique({ where: { nik: result.nik } })
      if (isDosen) {
        await prisma.tmst_dosen.update({
          where: { nik: result.nik },
          data: { kode_jenjang_pendidikan: Number(targetEdu) }
        })
      }
    }

    // 2. Sync Jafung
    if ((table === 'riwayat_jafung' || table === 'tmst_jafung') && result.nik && (data.id_jafung || result.id_jafung)) {
      const targetJafung = data.id_jafung || result.id_jafung
      const isDosen = await prisma.tmst_dosen.findUnique({ where: { nik: result.nik } })
      if (isDosen) {
        await prisma.tmst_dosen.update({
          where: { nik: result.nik },
          data: { kode_jabatan_akademik: String(targetJafung) }
        })
      }
    }

    return { success: true, data: result }
  } catch (error: any) {
    console.error(`Dynamic Put Error:`, error)
    return { success: false, message: error.message }
  }
})
