import { H3Event } from 'h3'
import { prisma } from './prisma'
import { useServerSession } from './auth'

export const logActivity = async (event: H3Event, action: string, target?: string, detail?: string) => {
  const session = useServerSession(event)
  if (!session) return

  try {
    // We use $executeRaw or $queryRaw if the model is not perfectly synced, 
    // but activity_logs is in the schema, so we can use standard prisma call
    await (prisma as any).activity_logs.create({
      data: {
        nik_operator: session.username,
        nama_operator: session.name,
        aksi: action,
        target_nik: target,
        detail: detail,
        created_at: new Date()
      }
    })
  } catch (e) {
    console.error('Failed to log activity:', e)
  }
}
