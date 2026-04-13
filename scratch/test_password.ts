import bcrypt from 'bcryptjs'

// Hash murni dari DB Anda (sampel yang saya ambil tadi)
const dbHash = '$2y$12$I91P5KcRzP5PKG9iJkdEgOST02yVpb8mbuBZStTgwgDpEwdydyPU2'

// Kita coba beberapa variasi password umum (atau input dari anda nanti)
const testPassword = 'password' // Contoh

console.log('Original Hash:', dbHash)

// Cara 1: Langsung bandingkan (bcryptjs kadang mendukung $2y$)
try {
  const v1 = bcrypt.compareSync(testPassword, dbHash)
  console.log('Test V1 (Direct):', v1)
} catch (e: any) {
  console.log('Test V1 Error:', e.message)
}

// Cara 2: Ganti $2y ke $2a (Standar Node.js/Bcryptjs)
const nodeHash = dbHash.replace(/^\$2y\$/, '$2a$')
console.log('Node Hash ($2a$):', nodeHash)

try {
  const v2 = bcrypt.compareSync(testPassword, nodeHash)
  console.log('Test V2 (Replace):', v2)
} catch (e: any) {
  console.log('Test V2 Error:', e.message)
}
