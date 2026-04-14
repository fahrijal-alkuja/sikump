import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const nik = event.context.params?.nik

  if (event.method === 'GET') {
    try {
      const data = await prisma.tmst_pangkat.findMany({
        where: { nik: String(nik) },
        orderBy: { tmt: 'desc' }
      })
      return { success: true, data }
    } catch (e) {
      return { success: false, message: 'Gagal mengambil data pangkat' }
    }
  }

  if (event.method === 'POST') {
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
        const filename = `${Date.now()}-${file.filename}`
        await require('fs/promises').writeFile(`./public/assets/pangkat/${filename}`, file.data)
        data.upload_sk = filename
      }

      const res = await prisma.tmst_pangkat.create({
        data: {
          nik: String(nik),
          pangkat: data.pangkat,
          no_sk: data.no_sk,
          tmt: data.tmt,
          upload_sk: data.upload_sk,
          last_update: new Date()
        }
      })
      return { success: true, data: res }
    } catch (e) {
      return { success: false, message: 'Gagal menambah data pangkat' }
    }
  }
})
