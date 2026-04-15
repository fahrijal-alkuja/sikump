<script setup lang="ts">
import { ref, onMounted } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const props = defineProps<{
  employee: any
}>()

const handleExportPDF = async () => {
  const doc = new jsPDF('p', 'mm', 'a4')
  const e = props.employee
  const pageWidth = doc.internal.pageSize.getWidth()

  // --- HELPER: IMAGE TO BASE64 ---
  const getBase64Image = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.setAttribute('crossOrigin', 'anonymous')
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/jpeg'))
      }
      img.onerror = () => resolve(null)
      img.src = url
    })
  }

  // --- HEADER & LOGO ---
  doc.setFillColor(248, 250, 252)
  doc.rect(0, 0, pageWidth, 45, 'F')
  
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('UNIVERSITAS KUTAI KARTANEGARA', 15, 20)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Sistem Informasi Kepegawaian & Manajemen Personalia', 15, 26)
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(148, 163, 184)
  doc.text('CURRICULUM VITAE', pageWidth - 15, 20, { align: 'right' })

  // --- BIO SECTION ---
  doc.setDrawColor(226, 232, 240)
  doc.line(15, 45, pageWidth - 15, 45)
  
  // Foto Loading
  const photoUrl = e.pp ? `/assets/foto/${e.pp}` : null
  const photoBase64 = photoUrl ? await getBase64Image(photoUrl) : null

  if (photoBase64) {
    doc.addImage(photoBase64, 'JPEG', 15, 55, 35, 45)
  } else {
    doc.setFillColor(241, 245, 249)
    doc.rect(15, 55, 35, 45, 'F')
    doc.setFontSize(25)
    doc.setTextColor(203, 213, 225)
    doc.text(e.nama?.charAt(0) || 'U', 32, 82, { align: 'center' })
  }

  doc.setTextColor(30, 41, 59)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(e.nama?.toUpperCase() || '-', 60, 62)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`NIK: ${e.nik || '-'}`, 60, 68)
  doc.text(`Unit: ${e.unit || '-'}`, 60, 73)
  
  // Bio Table - Improved Date Formatting
  const formatDate = (date: string) => {
    if (!date) return '-'
    const d = new Date(date)
    if (isNaN(d.getTime())) return date
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const bioData = [
    ['Tempat, Tgl Lahir', `: ${e.tempat_lahir || '-'}, ${formatDate(e.tanggal_lahir)}`],
    ['Jenis Kelamin', `: ${e.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}`],
    ['Telepon', `: ${e.telepon || '-'}`],
    ['Alamat', `: ${e.alamat || '-'}`]
  ]

  autoTable(doc, {
    body: bioData,
    startY: 78,
    margin: { left: 58 },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1, textColor: [30, 41, 59] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } }
  })

  // --- TABLES SECTIONS ---
  let currentY = (doc as any).lastAutoTable.finalY + 12

  // 1. Pendidikan
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('RIWAYAT PENDIDIKAN', 15, currentY)
  doc.line(15, currentY + 2, 60, currentY + 2)

  const eduRows = (e.riwayat_pendidikan || []).map((edu: any) => [
    edu.id_pendidikan === 4 ? 'S1' : edu.id_pendidikan === 5 ? 'S2' : edu.id_pendidikan === 6 ? 'S3' : 'Diploma/Lainnya',
    edu.asal_pendidikan,
    edu.tahun_lulus
  ])

  autoTable(doc, {
    head: [['JENJANG', 'INSTITUSI', 'LULUS']],
    body: eduRows.length ? eduRows : [['-', 'Data tidak tersedia', '-']],
    startY: currentY + 6,
    theme: 'striped',
    headStyles: { fillColor: [71, 85, 105] },
    styles: { fontSize: 8.5 }
  })

  // 2. Jabatan
  currentY = (doc as any).lastAutoTable.finalY + 12
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('RIWAYAT JABATAN & FUNGSIONAL', 15, currentY)
  doc.line(15, currentY + 2, 85, currentY + 2)

  const jobRows = (e.riwayat_jabatan || []).map((j: any) => [
    j.no_sk || '-',
    j.tmt || '-',
    j.nama_jabatan || '-',
    `${j.nama_biro || '-'} (${j.is_aktiv === 'Y' ? 'Aktif' : 'Non-aktif'})`
  ])

  autoTable(doc, {
    head: [['NO. SK', 'TMT', 'JABATAN', 'UNIT / KETERANGAN']],
    body: jobRows.length ? jobRows : [['-', '-', '-', 'Data tidak tersedia']],
    startY: currentY + 6,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] },
    styles: { fontSize: 8.5 }
  })

  // 3. Pelatihan & Sertifikasi (Combined for dynamic space)
  currentY = (doc as any).lastAutoTable.finalY + 12
  
  // New Page check
  if (currentY > 240) { doc.addPage(); currentY = 20 }

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('PELATIHAN & SERTIFIKASI', 15, currentY)
  doc.line(15, currentY + 2, 70, currentY + 2)

  const trainingRows = [
    ...(e.riwayat_pelatihan || []).map((t: any) => [t.nama_diklat, t.tempat, t.tahun]),
    ...(e.riwayat_sertifikasi || []).map((s: any) => [s.jenis_sertifikasi, s.bidang_studi, s.tahun])
  ]

  autoTable(doc, {
    head: [['NAMA KEGIATAN / SERTIFIKASI', 'PENYELENGGARA / BIDANG', 'TAHUN']],
    body: trainingRows.length ? trainingRows : [['Data tidak tersedia', '-', '-']],
    startY: currentY + 6,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 8.5 }
  })

  // 4. Riwayat Keluarga
  currentY = (doc as any).lastAutoTable.finalY + 12
  if (currentY > 240) { doc.addPage(); currentY = 20 }

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('DATA KELUARGA', 15, currentY)
  doc.line(15, currentY + 2, 50, currentY + 2)

  const familyRows = (e.riwayat_keluarga || []).map((f: any) => [
    f.nama_ismi || '-',
    f.status_perkawinan || '-',
    f.pekerjaan_ismi || '-'
  ])

  autoTable(doc, {
    head: [['NAMA PASANGAN', 'STATUS', 'PEKERJAAN']],
    body: familyRows.length ? familyRows : [['-', 'Data tidak tersedia', '-']],
    startY: currentY + 6,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 8.5 }
  })

  // --- FOOTER ---
  const finalY = (doc as any).lastAutoTable.finalY + 25
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text(`Dicetak secara sistem pada: ${new Date().toLocaleString('id-ID')}`, 15, finalY)
  
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(9)
  doc.text('Petugas Administrasi,', pageWidth - 60, finalY)
  doc.text('____________________', pageWidth - 60, finalY + 20)

  doc.save(`CV_${e.nama?.replace(/ /g, '_')}.pdf`)
}
</script>

<template>
  <div class="resume-container">
    <div class="resume-actions no-print">
      <button @click="handleExportPDF" class="btn-print">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Ekspor Resume (PDF)
      </button>
    </div>

    <div class="resume-document">
      <header class="resume-header">
        <div class="header-content">
          <div class="uni-logo">U</div>
          <div class="uni-title">
            <h2>UNIVERSITAS KUTAI KARTANEGARA</h2>
            <p>Sistem Informasi Kepegawaian & Manajemen Personalia</p>
          </div>
        </div>
        <div class="doc-type">CURRICULUM VITAE</div>
      </header>

      <section class="resume-section main-bio">
        <div class="bio-photo">
          <img v-if="employee.pp" :src="`/assets/foto/${employee.pp}`" />
          <div v-else class="no-photo">{{ employee.nama?.charAt(0) }}</div>
        </div>
        <div class="bio-details">
          <div class="bio-row">
            <span class="label">Nama Lengkap</span>
            <span class="value name-highlight">{{ employee.nama }}</span>
          </div>
          <div class="bio-row">
            <span class="label">NIK / NIDN</span>
            <span class="value">{{ employee.nik }} / {{ employee.nidn || '-' }}</span>
          </div>
          <div class="bio-row">
            <span class="label">Tempat, Tgl Lahir</span>
            <span class="value">{{ employee.tempat_lahir }}, {{ employee.tanggal_lahir ? new Date(employee.tanggal_lahir).toLocaleDateString('id-ID') : '-' }}</span>
          </div>
          <div class="bio-row">
            <span class="label">Jenis Kelamin</span>
            <span class="value">{{ employee.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' }}</span>
          </div>
          <div class="bio-row">
            <span class="label">Telepon</span>
            <span class="value">{{ employee.telepon || '-' }}</span>
          </div>
          <div class="bio-row">
            <span class="label">Alamat</span>
            <span class="value">{{ employee.alamat || '-' }}</span>
          </div>
        </div>
      </section>

      <section class="resume-section">
        <h3 class="section-title">Riwayat Pendidikan</h3>
        <table class="resume-table">
          <thead>
            <tr>
              <th>Jenjang</th>
              <th>Asal Institusi</th>
              <th>Tahun Lulus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="edu in employee.riwayat_pendidikan" :key="edu.id">
              <td>{{ edu.id_pendidikan === 4 ? 'S1' : edu.id_pendidikan === 5 ? 'S2' : 'D3/SMA' }}</td>
              <td>{{ edu.asal_pendidikan }}</td>
              <td>{{ edu.tahun_lulus }}</td>
            </tr>
            <tr v-if="!employee.riwayat_pendidikan?.length">
              <td colspan="3" class="text-center">Data tidak tersedia</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="resume-section">
        <h3 class="section-title">Riwayat Jabatan & Kepangkatan</h3>
        <table class="resume-table">
          <thead>
            <tr>
              <th>No. SK</th>
              <th>TMT</th>
              <th>Nama Jabatan</th>
              <th>Unit / Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in employee.riwayat_jabatan" :key="job.id">
              <td>{{ job.no_sk || '-' }}</td>
              <td>{{ job.tmt || '-' }}</td>
              <td style="font-weight: 700; color: var(--primary);">{{ job.nama_jabatan || '-' }}</td>
              <td>{{ job.nama_biro || '-' }} ({{ job.is_aktiv === 'Y' ? 'Aktif' : 'Non-aktif' }})</td>
            </tr>
            <tr v-if="!employee.riwayat_jabatan?.length">
              <td colspan="4" class="text-center">Data tidak tersedia</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="resume-section">
        <h3 class="section-title">Riwayat Pelatihan & Sertifikasi</h3>
        <table class="resume-table">
          <thead>
            <tr>
              <th>Nama Pelatihan / Kursus</th>
              <th>Penyelenggara</th>
              <th>Tahun</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="train in employee.riwayat_pelatihan" :key="train.id">
              <td style="font-weight: 700;">{{ train.nama_diklat }}</td>
              <td>{{ train.tempat || '-' }}</td>
              <td>{{ train.tahun || '-' }}</td>
            </tr>
            <tr v-if="!employee.riwayat_pelatihan?.length">
              <td colspan="3" class="text-center">Data tidak tersedia</td>
            </tr>
          </tbody>
        </table>
      </section>

      <footer class="resume-footer">
        <div class="timestamp">
          Dicetak pada: <ClientOnly fallback="-">{{ new Date().toLocaleString('id-ID') }}</ClientOnly>
        </div>
        <div class="signature">
          <p>Petugas Administrasi,</p>
          <div class="sig-space"></div>
          <p>____________________</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.resume-container {
  color: #333;
}

.resume-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

.btn-print {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
}

.resume-document {
  background: white;
  padding: 3rem;
  border-radius: 0.5rem;
  min-height: 29.7cm; /* A4 Ratio */
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.resume-header {
  border-bottom: 3px solid #1a1a1a;
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.uni-logo {
  width: 60px;
  height: 60px;
  background: #1a1a1a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 900;
  border-radius: 12px;
}

.uni-title h2 { margin: 0; font-size: 1.5rem; color: #1a1a1a; }
.uni-title p { margin: 0; color: #666; font-size: 0.875rem; }

.doc-type {
  font-weight: 900;
  font-size: 1.25rem;
  color: #888;
  letter-spacing: 2px;
}

.resume-section {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.main-bio {
  display: flex;
  gap: 2.5rem;
}

.bio-photo img, .bio-photo .no-photo {
  width: 150px;
  height: 200px;
  object-fit: cover;
  border: 1px solid #ddd;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: #ccc;
  font-weight: 900;
}

.bio-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bio-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.bio-row .label { width: 140px; color: #666; font-size: 0.875rem; font-weight: 600; }
.bio-row .value { flex: 1; font-weight: 700; color: #1a1a1a; }
.bio-row .name-highlight { font-size: 1.25rem; color: #000; }

.resume-table {
  width: 100%;
  border-collapse: collapse;
}

.resume-table th {
  text-align: left;
  padding: 0.75rem;
  background: #f9f9f9;
  border: 1px solid #eee;
  font-size: 0.875rem;
}

.resume-table td {
  padding: 0.75rem;
  border: 1px solid #eee;
  font-size: 0.875rem;
}

.resume-footer {
  margin-top: 5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.timestamp { font-size: 0.75rem; color: #888; }
.signature { text-align: center; }
.sig-space { height: 80px; }

@media print {
  .no-print { display: none !important; }
  .resume-document {
    box-shadow: none;
    padding: 0;
    margin: 0;
  }
  body { background: white; }
  .resume-container { background: white; }
}
</style>
