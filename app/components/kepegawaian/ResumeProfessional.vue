<script setup lang="ts">
const props = defineProps<{
  employee: any
}>()

const handlePrint = () => {
  window.print()
}
</script>

<template>
  <div class="resume-container">
    <div class="resume-actions no-print">
      <button @click="handlePrint" class="btn-print">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Cetak Resume Resume
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
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in employee.riwayat_jabatan" :key="job.id">
              <td>{{ job.no_sk || '-' }}</td>
              <td>{{ job.tmt || '-' }}</td>
              <td>{{ job.ikatan_kerja || '-' }} ({{ job.is_aktiv === 'Y' ? 'Aktif' : 'Non-aktif' }})</td>
            </tr>
            <tr v-if="!employee.riwayat_jabatan?.length">
              <td colspan="3" class="text-center">Data tidak tersedia</td>
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
        <div class="timestamp">Dicetak pada: {{ new Date().toLocaleString('id-ID') }}</div>
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
