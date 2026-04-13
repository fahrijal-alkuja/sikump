import { defineEventHandler, createError } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const table = event.context.params?.table
  const idStr = event.context.params?.id
  const id = parseInt(idStr || '0')

  if (!table || !id) throw createError({ statusCode: 400, statusMessage: 'Missing table or id' })

  try {
    // @ts-ignore
    await prisma[table].delete({
      where: { id }
    })

    return { success: true, message: 'Data deleted successfully' }
  } catch (error: any) {
    console.error(`Delete Error on ${table}:`, error)
    return { success: false, message: error.message }
  }
})
