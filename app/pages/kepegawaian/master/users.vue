<script setup lang="ts">
const { data: users, refresh } = await useFetch<any>('/api/kepegawaian/master/users')
const { data: biros } = await useFetch<any>('/api/kepegawaian/biro')

const showModal = ref(false)
const isEditing = ref(false)
const form = ref({
  id: null,
  username: '',
  password: '',
  email: '',
  first_name: '',
  last_name: '',
  company: '',
  role: 'prodi',
  active: 1
})

const openAdd = () => {
  isEditing.value = false
  form.value = { id: null, username: '', password: '', email: '', first_name: '', last_name: '', company: '', role: 'prodi', active: 1 }
  showModal.value = true
}

const openEdit = (u: any) => {
  isEditing.value = true
  form.value = { 
    id: u.id, 
    username: u.username, 
    password: '', // Leave empty to not change
    email: u.email, 
    first_name: u.first_name, 
    last_name: u.last_name, 
    company: u.unit_code, 
    role: u.role || 'prodi', 
    active: u.active 
  }
  showModal.value = true
}

const handleSave = async () => {
  try {
    const method = form.value.id ? 'PUT' : 'POST'
    const res = await $fetch<any>('/api/kepegawaian/master/users', {
      method,
      body: form.value
    })
    if (res.success) {
      showModal.value = false
      refresh()
    } else {
      alert(res.message || 'Gagal menyimpan user')
    }
  } catch (e: any) {
    alert(e.message)
  }
}

const deleteUser = async (id: number) => {
  if (confirm('Hapus user ini?')) {
    const res = await $fetch<any>(`/api/kepegawaian/master/users?id=${id}`, { method: 'DELETE' })
    if (res.success) refresh()
    else alert(res.message)
  }
}
</script>

<template>
  <div class="user-mgmt p-8">
    <div class="page-header mb-10">
      <div class="header-content">
        <h1 class="page-title">Manajemen <span>Akses</span></h1>
        <p class="page-subtitle">Pusat kendali akun and otorisasi sistem SIKUMP</p>
      </div>
      <button @click="openAdd" class="btn-primary-glow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Registrasi User Baru
      </button>
    </div>

    <!-- Stats Dashboard Micro -->
    <div class="grid grid-cols-4 gap-6 mb-8">
      <div class="stats-card glass">
        <label>Total Akun</label>
        <div class="val">{{ users?.data?.length || 0 }}</div>
      </div>
      <div class="stats-card glass">
        <label>Akun Aktif</label>
        <div class="val text-emerald-500">{{ users?.data?.filter((u: any) => u.active).length || 0 }}</div>
      </div>
    </div>

    <div class="data-container glass-card">
      <div class="table-scroll">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Personal Info</th>
              <th>Status Peran</th>
              <th>Unit Otoritas</th>
              <th>Aksesibilitas</th>
              <th class="text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users?.data" :key="u.id" class="data-row">
              <td>
                <div class="user-info">
                  <div class="avatar">
                    {{ u.first_name ? u.first_name[0] : 'U' }}
                  </div>
                  <div class="details">
                    <span class="full-name">{{ u.first_name }} {{ u.last_name }}</span>
                    <span class="username">@{{ u.username }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span :class="['role-badge', u.role]">
                  <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle></svg>
                  {{ u.role || 'prodi' }}
                </span>
              </td>
              <td class="text-sm font-semibold text-slate-500">
                {{ u.unit_code || 'Universitas' }}
              </td>
              <td>
                <div :class="['status-pill', u.active ? 'on' : 'off']">
                  {{ u.active ? 'Tersedia' : 'Ditangguhkan' }}
                </div>
              </td>
              <td>
                <div class="actions">
                  <button @click="openEdit(u)" class="btn-icon edit" title="Edit Profil">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button @click="deleteUser(u.id)" class="btn-icon delete" title="Hapus Akun">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Premium Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <div class="icon-bulb">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h2>{{ isEditing ? 'Modifikasi Akun' : 'Akreditasi User' }}</h2>
          <p>{{ isEditing ? 'Perbarui informasi and hak akses user yang sudah ada' : 'Daftarkan admin baru untuk unit kerja tertentu' }}</p>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="field">
              <label>Nama Depan</label>
              <input v-model="form.first_name" placeholder="Contoh: Budi" />
            </div>
            <div class="field">
              <label>Nama Belakang</label>
              <input v-model="form.last_name" placeholder="Contoh: Santoso" />
            </div>
          </div>

          <div class="field">
            <label>Identitas Login (Username/NIK)</label>
            <input v-model="form.username" placeholder="Masukkan username unik" :disabled="isEditing" />
          </div>

          <div class="field">
            <label>{{ isEditing ? 'Reset Password (Kosongkan jika tidak diubah)' : 'Kata Sandi Awal' }}</label>
            <input v-model="form.password" type="password" placeholder="••••••••" />
          </div>

          <div class="field">
            <label>Alamat Email</label>
            <input v-model="form.email" type="email" placeholder="email@unikarta.ac.id" />
          </div>

          <div class="form-grid">
            <div class="field">
              <label>Unit Kerja</label>
              <select v-model="form.company">
                <option value="">-- Pusat/Universitas --</option>
                <option v-for="b in biros?.data" :key="b.id" :value="b.id">{{ b.nama }}</option>
              </select>
            </div>
            <div class="field">
              <label>Role Akses</label>
              <select v-model="form.role">
                <option value="prodi">Admin Prodi/Unit</option>
                <option value="admin">Admin Universitas</option>
              </select>
            </div>
          </div>

          <div class="field-check">
            <label class="switch">
              <input type="checkbox" v-model="form.active" :true-value="1" :false-value="0">
              <span class="slider"></span>
            </label>
            <span>Status Akun Aktif</span>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showModal = false" class="btn-cancel">Batalkan</button>
          <button @click="handleSave" class="btn-save shadow-lg shadow-indigo-200">
            {{ isEditing ? 'Simpan Perubahan' : 'Konfirmasi Registrasi' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title { font-size: 2.5rem; font-weight: 800; color: #1e293b; letter-spacing: -1.5px; margin: 0; }
.page-title span { color: #4f46e5; }
.page-subtitle { color: #64748b; font-weight: 500; margin-top: 0.25rem; }

.btn-primary-glow { 
  background: #4f46e5; color: white; padding: 0.875rem 1.75rem; border-radius: 16px; 
  font-weight: 700; display: flex; align-items: center; gap: 0.75rem; 
  box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4); transition: all 0.3s;
}
.btn-primary-glow:hover { transform: translateY(-3px); box-shadow: 0 15px 30px -5px rgba(79, 70, 229, 0.5); }

.stats-card { background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #f1f5f9; }
.stats-card label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
.stats-card .val { font-size: 1.75rem; font-weight: 800; color: #1e293b; margin-top: 0.25rem; }

.data-container { background: white; border-radius: 24px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.premium-table { width: 100%; border-collapse: separate; border-spacing: 0 0.75rem; }
.premium-table th { padding: 1rem; color: #94a3b8; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }

.data-row { transition: all 0.2s; }
.data-row td { padding: 1.25rem 1rem; background: #fff; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
.data-row td:first-child { border-left: 1px solid #f1f5f9; border-radius: 16px 0 0 16px; }
.data-row td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 16px 16px 0; }
.data-row:hover td { background: #f8fafc; border-color: #e2e8f0; }

.user-info { display: flex; align-items: center; gap: 1rem; }
.avatar { width: 44px; height: 44px; background: #eef2ff; color: #4f46e5; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; }
.details { display: flex; flex-direction: column; }
.full-name { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
.username { font-size: 0.75rem; color: #94a3b8; }

.role-badge { 
  display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; border-radius: 10px; 
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
}
.role-badge.admin { background: #fff1f2; color: #e11d48; }
.role-badge.prodi { background: #f0fdf4; color: #166534; }

.status-pill { display: inline-flex; padding: 0.35rem 0.75rem; border-radius: 100px; font-size: 0.7rem; font-weight: 700; }
.status-pill.on { background: #dcfce7; color: #15803d; }
.status-pill.off { background: #f1f5f9; color: #64748b; }

.actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
.btn-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; background: #f8fafc; border: 1px solid #f1f5f9; cursor: pointer; }
.btn-icon.edit:hover { background: #4f46e5; color: white; border-color: #4f46e5; }
.btn-icon.delete:hover { background: #ef4444; color: white; border-color: #ef4444; }

/* Modal Premium */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-card { background: white; width: 100%; max-width: 560px; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); animation: zoomIn 0.3s ease-out; }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

.modal-header { padding: 2.5rem; text-align: center; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
.icon-bulb { width: 56px; height: 56px; background: #4f46e5; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; box-shadow: 0 10px 20px rgba(79,70,229,0.3); }
.modal-header h2 { font-size: 1.75rem; font-weight: 800; color: #1e293b; margin: 0; letter-spacing: -1px; }
.modal-header p { color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; font-weight: 500; }

.modal-body { padding: 2.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }

.field label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.5rem; display: block; padding-left: 0.25rem; }
.field input, .field select { width: 100%; padding: 0.875rem 1.25rem; background: #f1f5f9; border: 1px solid #f1f5f9; border-radius: 14px; font-size: 0.95rem; font-weight: 500; transition: all 0.3s; }
.field input:focus { outline: none; background: white; border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08); }

.field-check { display: flex; align-items: center; gap: 1rem; background: #f8fafc; padding: 1rem; border-radius: 16px; margin-top: 0.5rem; }
.field-check span { font-weight: 600; color: #1e293b; font-size: 0.9rem; }

.modal-footer { padding: 2rem 2.5rem; display: flex; gap: 1rem; background: #f8fafc; }
.btn-save { flex: 2; padding: 1rem; background: #4f46e5; color: white; border-radius: 16px; font-weight: 800; border: none; cursor: pointer; }
.btn-cancel { flex: 1; padding: 1rem; background: white; color: #64748b; border: 1px solid #e2e8f0; border-radius: 16px; font-weight: 800; cursor: pointer; }

/* Switch Toggle */
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background-color: #e2e8f0; transition: .4s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: #10b981; }
input:checked + .slider:before { transform: translateX(20px); }

@media (max-width: 768px) {
  .grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
  .form-grid { grid-template-columns: 1fr; }
}
</style>
