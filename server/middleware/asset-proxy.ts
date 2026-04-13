import { defineEventHandler, proxyRequest, sendRedirect } from 'h3'
import { existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || ''
  
  // Hanya proses request yang mengarah ke /assets/
  if (url.startsWith('/assets/')) {
    const config = useRuntimeConfig()
    const remoteBase = config.public.productionAssetUrl
    
    // Cek apakah file ada di folder public lokal
    const localPath = join(process.cwd(), 'public', url)
    
    if (!remoteBase) return // skip jika URL produksi belum diisi
    
    if (!existsSync(localPath)) {
      // Jika file tidak ada di lokal, redirect atau proxy ke produksi
      const remoteUrl = `${remoteBase}${url}`
      return sendRedirect(event, remoteUrl)
    }
  }
})
