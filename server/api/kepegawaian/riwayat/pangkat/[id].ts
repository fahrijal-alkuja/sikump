import { defineEventHandler, readMultipartFormData, getMethod } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { getStoragePath } from '../../../../utils/storage'
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const param = event.context.params?.id || ''
  const method = getMethod(event)

  // GET: Fetch list of pangkat for employee NIK
  if (method === 'GET') {
    try {
      const data = await prisma.tmst_pangkat.findMany({
        where: { nik: String(param) },
        orderBy: { tmt: 'desc' }
      })
      return { success: true, data }
    } catch (e: any) {
      return { success: false, message: e?.message || 'Gagal mengambil data pangkat' }
    }
  }

  // POST: Create new pangkat entry for employee NIK
  if (method === 'POST') {
    const body = await readMultipartFormData(event)
    const data: any = {}
    let file: any = null

    body?.forEach(item => {
      if (item.name === 'upload_sk' && item.filename) {
        file = item
      } else if (item.name) {
        data[item.name] = item.data.toString()
      }
    })

    try {
      if (file) {
        const ext = path.extname(file.filename)
        const filename = `pangkat_${Date.now()}${ext}`
        const uploadDir = getStoragePath('pangkat')
        fs.writeFileSync(path.join(uploadDir, filename), file.data)
        data.upload_sk = filename
      }

      const res = await prisma.tmst_pangkat.create({
        data: {
          nik: String(param),
          pangkat: data.pangkat || '',
          no_sk: data.no_sk || '',
          tmt: data.tmt || '',
          upload_sk: data.upload_sk || null,
          last_update: new Date()
        }
      })
      return { success: true, data: res }
    } catch (e: any) {
      console.error('Error adding pangkat:', e)
      return { success: false, message: e?.message || 'Gagal menambah data pangkat' }
    }
  }

  // PUT: Update existing pangkat entry by ID
  if (method === 'PUT') {
    const id = parseInt(param || '0')
    const body = await readMultipartFormData(event)
    const data: any = {}
    let file: any = null

    body?.forEach(item => {
      if (item.name === 'upload_sk' && item.filename) {
        file = item
      } else if (item.name) {
        data[item.name] = item.data.toString()
      }
    })

    try {
      if (file) {
        const ext = path.extname(file.filename)
        const filename = `pangkat_${Date.now()}${ext}`
        const uploadDir = getStoragePath('pangkat')
        fs.writeFileSync(path.join(uploadDir, filename), file.data)
        data.upload_sk = filename
      }

      const res = await prisma.tmst_pangkat.update({
        where: { id },
        data: {
          pangkat: data.pangkat,
          no_sk: data.no_sk,
          tmt: data.tmt,
          upload_sk: data.upload_sk || undefined,
          last_update: new Date()
        }
      })
      return { success: true, data: res }
    } catch (e: any) {
      console.error('Error updating pangkat:', e)
      return { success: false, message: e?.message || 'Gagal memperbarui data pangkat' }
    }
  }

  // DELETE: Delete pangkat entry by ID
  if (method === 'DELETE') {
    const id = parseInt(param || '0')
    try {
      await prisma.tmst_pangkat.delete({ where: { id } })
      return { success: true, message: 'Data pangkat dihapus' }
    } catch (e: any) {
      return { success: false, message: e?.message || 'Gagal menghapus data' }
    }
  }

  return { success: false, message: `Method ${method} tidak didukung` }
})
