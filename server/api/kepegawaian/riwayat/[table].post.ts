import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const table = event.context.params?.table
  if (!table) throw createError({ statusCode: 400, statusMessage: 'Table name is required' })

  const parts = await readMultipartFormData(event)
  if (!parts) {
    // Fallback to JSON if not multipart
    const body = await readBody(event)
    const data = { ...body }
    if (data.tmt && data.tmt.includes('-') && data.tmt.split('-')[0].length === 4) {
      data.tmt = data.tmt.split('-').reverse().join('-')
    }
    // @ts-ignore
    const result = await prisma[table].create({ data })
    return { success: true, data: result }
  }

  // Handle Multipart (with Files)
  const data: any = {}
  const files: any[] = []

  for (const part of parts) {
    if (part.name && part.filename) {
      // It's a file
      const ext = path.extname(part.filename)
      const newFilename = `${table}_${Date.now()}${ext}`
      
      // Determine folder based on table
      let folder = 'uploads'
      if (table.includes('pendidikan')) folder = 'pendidikan'
      else if (table.includes('pelatihan')) folder = 'sertifikat'
      else if (table.includes('keluarga')) folder = 'kk'
      else if (table.includes('pengangkatan') || table.includes('jabatan') || table.includes('jafung')) folder = 'SK'
      else if (table.includes('pajak')) folder = 'npwp'
      else if (table.includes('askes')) folder = 'askes'

      // Determine base storage directory
      // Priority: ENV variable, then external path, then fallback to public/assets
      let baseStorage = process.env.STORAGE_PATH || '/www/wwwroot/sikump-storage'
      
      // If dev or the storage path doesn't exist yet, fallback to local for safety
      if (process.env.NODE_ENV === 'development' || !fs.existsSync(baseStorage)) {
        baseStorage = path.join(process.cwd(), 'public/assets')
      }

      const uploadDir = path.join(baseStorage, folder)
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
      
      fs.writeFileSync(path.join(uploadDir, newFilename), part.data)
      data[part.name] = newFilename
    } else if (part.name) {
      // It's a field
      data[part.name] = part.data.toString()
    }
  }

  // Clean data fields
  if (data.tmt && data.tmt.includes('-') && data.tmt.split('-')[0].length === 4) {
    data.tmt = data.tmt.split('-').reverse().join('-')
  }
  // Convert numeric strings to numbers if they look like IDs
  if (data.id_pendidikan) data.id_pendidikan = parseInt(data.id_pendidikan)
  if (data.id_jafung) data.id_jafung = parseInt(data.id_jafung)

  try {
    // @ts-ignore
    const result = await prisma[table].create({
      data: data
    })
    return { success: true, data: result }
  } catch (error: any) {
    console.error(`Dynamic Post Error:`, error)
    return { success: false, message: error.message }
  }
})
