import { defineEventHandler, readMultipartFormData, createError, readBody } from 'h3'
import { requireAuth } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'
import fs from 'node:fs'
import path from 'node:path'
import { getStoragePath } from '../../../utils/storage'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const table = event.context.params?.table
  if (!table) throw createError({ statusCode: 400, statusMessage: 'Table name is required' })

  const parts = await readMultipartFormData(event)
  if (!parts) {
    // Fallback to JSON if not multipart
    const body = await readBody(event)
    const data = { ...body }
    
    // Auto-convert specific DateTime fields & numbers
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

    // @ts-ignore
    const result = await prisma[table].create({ data })
    return { success: true, data: result }
  }

  // Handle Multipart (with Files)
  const data: any = {}

  // 1. First Pass: Get all fields to decide folder if needed
  for (const part of parts) {
    if (part.name && !part.filename) {
      data[part.name] = part.data.toString()
    }
  }

  // 2. Second Pass: Process Files
  for (const part of parts) {
    if (part.name && part.filename) {
      // It's a file
      const ext = path.extname(part.filename)
      const newFilename = `${table}_${Date.now()}${ext}`
      
      // Determine folder based on table & status
      let folder = 'uploads'
      if (table.includes('pendidikan')) folder = 'pendidikan'
      else if (table.includes('pelatihan')) folder = 'sertifikat'
      else if (table.includes('keluarga')) folder = 'kk'
      else if (table.includes('pangkat')) folder = 'pangkat'
      else if (table.includes('pengangkatan') || table.includes('jafung')) folder = 'SK'
      else if (table.includes('jabatan')) {
        // Status 2 is Mutasi, otherwise SKU (Promosi etc)
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

  // Safe Conversion for specific DateTime fields
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

  try {
    // @ts-ignore
    const result = await prisma[table].create({
      data: data
    })

    // --- AUTO-SYNC LOGIC ---
    // 1. Sync Pendidikan to tmst_dosen
    if (table.includes('pendidikan') && data.nik && data.id_pendidikan) {
      const isDosen = await prisma.tmst_dosen.findUnique({ where: { nik: data.nik } })
      if (isDosen) {
        await prisma.tmst_dosen.update({
          where: { nik: data.nik },
          data: { kode_jenjang_pendidikan: Number(data.id_pendidikan) }
        })
      }
    }

    // 2. Sync Jafung (Optional but recommended for consistency)
    if ((table === 'riwayat_jafung' || table === 'tmst_jafung') && data.nik && data.id_jafung) {
      const isDosen = await prisma.tmst_dosen.findUnique({ where: { nik: data.nik } })
      if (isDosen) {
        await prisma.tmst_dosen.update({
          where: { nik: data.nik },
          data: { kode_jabatan_akademik: String(data.id_jafung) }
        })
      }
    }

    return { success: true, data: result }
  } catch (error: any) {
    console.error(`Dynamic Post Error:`, error)
    return { success: false, message: error.message }
  }
})
