import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const ASSETS_PATH = path.join(process.cwd(), 'public/assets')
const TRASH_PATH = path.join(process.cwd(), 'deleted_assets')

async function cleanup() {
  console.log('🚀 Starting Asset Cleanup...')
  
  if (!fs.existsSync(ASSETS_PATH)) {
    console.error('❌ Assets folder not found at:', ASSETS_PATH)
    return
  }
  
  if (!fs.existsSync(TRASH_PATH)) fs.mkdirSync(TRASH_PATH)

  // 1. Get all documented filenames from DB
  const documentedFiles = new Set<string>()

  // Tables and columns to check
  const checks = [
    { table: 'tmst_dosen', column: 'pp' },
    { table: 'tmst_dosen', column: 'upload_ktp' },
    { table: 'tmst_karyawan', column: 'pp' },
    { table: 'tmst_karyawan', column: 'upload_ktp' },
    { table: 'riwayat_pendidikan_dosen', column: 'upload_ijazah' },
    { table: 'riwayat_pendidikan', column: 'upload_ijazah' },
    { table: 'riwayat_jabatan', column: 'upload_sk' },
    { table: 'tmst_sertifikasi', column: 'upload_sk_sertifikasi' },
    { table: 'tmst_skpns', column: 'upload_skpns' },
  ]

  for (const check of checks) {
    try {
      const records: any[] = await (prisma as any)[check.table].findMany({
        select: { [check.column]: true },
        where: { [check.column]: { not: null } }
      })
      records.forEach(r => {
        if (r[check.column]) documentedFiles.add(r[check.column])
      })
    } catch (e) {
      console.warn(`⚠️ Table ${check.table} or column ${check.column} skipped.`)
    }
  }

  console.log(`📊 Found ${documentedFiles.size} unique files documented in database.`)

  // 2. Scan physical files and move orphans
  let totalFiles = 0
  let movedCount = 0

  function scanDir(dir: string) {
    const items = fs.readdirSync(dir)
    for (const item of items) {
      const fullPath = path.join(dir, item)
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath)
      } else {
        totalFiles++
        // Check if filename is in database
        if (!documentedFiles.has(item)) {
          const relativePath = path.relative(ASSETS_PATH, dir)
          const targetDir = path.join(TRASH_PATH, relativePath)
          if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
          
          fs.renameSync(fullPath, path.join(targetDir, item))
          movedCount++
        }
      }
    }
  }

  scanDir(ASSETS_PATH)

  console.log(`✅ Cleanup Complete!`)
  console.log(`📂 Total files scanned: ${totalFiles}`)
  console.log(`🗑️ Files moved to 'deleted_assets': ${movedCount}`)
  console.log(`💡 You can now delete 'deleted_assets' folder if everything looks good.`)
}

cleanup().finally(() => prisma.$disconnect())
