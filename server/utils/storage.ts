import path from 'path'
import fs from 'fs'

export const getStoragePath = (folderName?: string) => {
  // Use STORAGE_PATH env var if available, otherwise fallback to standard production path
  let baseStorage = process.env.STORAGE_PATH || '/www/wwwroot/sikump-storage'
  
  // If we are in development OR the storage path doesn't exist on this machine,
  // fallback to the project's public/assets directory for local testing.
  if (process.env.NODE_ENV === 'development' || !fs.existsSync(baseStorage)) {
    baseStorage = path.join(process.cwd(), 'public/assets')
  }

  const finalPath = folderName ? path.join(baseStorage, folderName) : baseStorage
  
  // Ensure the directory exists
  if (!fs.existsSync(finalPath)) {
    fs.mkdirSync(finalPath, { recursive: true })
  }
  
  return finalPath
}
