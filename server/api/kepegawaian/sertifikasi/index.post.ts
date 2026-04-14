import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const body = await readBody(event)
    const { id, nik, jenis_sertifikasi, bidang_studi, no_reg_sertifikasi, no_sk, tahun, upload_sk_sertifikasi } = body

    if (!nik) {
      throw new Error('NIK is required')
    }

    let result
    if (id) {
      // Update existing
      result = await prisma.tmst_sertifikasi.update({
        where: { id: Number(id) },
        data: {
          nik,
          jenis_sertifikasi,
          bidang_studi,
          no_reg_sertifikasi,
          no_sk,
          tahun,
          upload_sk_sertifikasi
        }
      })
    } else {
      // Create new
      result = await prisma.tmst_sertifikasi.create({
        data: {
          nik,
          jenis_sertifikasi,
          bidang_studi,
          no_reg_sertifikasi,
          no_sk,
          tahun,
          upload_sk_sertifikasi
        }
      })
      
      // Also update tmst_dosen with latest certification info if this is Serdos
      if (jenis_sertifikasi.toLowerCase().includes('pendidik') || jenis_sertifikasi.toLowerCase().includes('dosen')) {
        await prisma.tmst_dosen.updateMany({
          where: { nik },
          data: {
            no_sertifikasi_dosen: no_reg_sertifikasi,
            // Assuming we take the first date of the year if tgl_keluar_sertifikasi_dosen is required
            tgl_keluar_sertifikasi_dosen: new Date(`${tahun}-01-01`)
          }
        })
      }
    }

    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
