import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '0')

  if (event.method === 'DELETE') {
    try {
      await prisma.tmst_pangkat.delete({ where: { id } })
      return { success: true, message: 'Data pangkat dihapus' }
    } catch (e) {
      return { success: false, message: 'Gagal menghapus data' }
    }
  }

  if (event.method === 'PUT') {
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
    } catch (e) {
      return { success: false, message: 'Gagal memperbarui data pangkat' }
    }
  }
})
