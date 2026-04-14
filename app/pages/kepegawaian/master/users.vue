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
    password: '', 
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
    <div class="flex justify-between items-end mb-12">
      <div>
        <h1 class="text-4xl font-black text-slate-800 tracking-tighter">Manajemen <span class="text-indigo-600">Otoritas</span></h1>
        <p class="text-slate-400 font-medium mt-1">Pusat kendali akun and perizinan sistem SIKUMP</p>
      </div>
      <button @click="openAdd" class="btn-primary-glow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Registrasi Admin
      </button>
    </div>

    <!-- Stats Dashboard Micro -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div class="stats-card glass flex justify-between items-center group">
        <div>
          <label>Total Entitas</label>
          <div class="val">{{ users?.data?.length || 0 }}</div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
      </div>
      <div class="stats-card glass flex justify-between items-center group">
        <div>
          <label>Akses Aktif</label>
          <div class="val text-emerald-500">{{ users?.data?.filter((u: any) => u.active).length || 0 }}</div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
      </div>
    </div>

    <div class="data-container glass-card bg-white/50 backdrop-blur-xl border border-white/20">
      <div class="table-scroll">
        <table class="premium-table w-full">
          <thead>
            <tr>
              <th class="pl-6">Identitas Pengguna</th>
              <th>Peran</th>
              <th>Unit Otoritas</th>
              <th>Status</th>
              <th class="text-right pr-6">Tindakan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users?.data" :key="u.id" class="data-row">
              <td class="pl-6">
                <div class="user-info">
                  <div class="avatar-glow">
                    {{ u.first_name ? u.first_name[0] : 'U' }}
                  </div>
                  <div class="details">
                    <span class="full-name">{{ u.first_name }} {{ u.last_name }}</span>
                    <span class="username">@{{ u.username }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span :class="['role-chip', u.role]">
                  {{ u.role || 'prodi' }}
                </span>
              </td>
              <td>
                <div class="unit-box">
                  <span class="unit-name">{{ u.unit_display }}</span>
                  <span class="unit-code">{{ u.unit_code || 'CENTER' }}</span>
                </div>
              </td>
              <td>
                <div :class="['status-indicator', u.active ? 'active' : 'inactive']">
                  {{ u.active ? 'Tersedia' : 'Nonaktif' }}
                </div>
              </td>
              <td class="pr-6 text-right">
                <div class="flex justify-end gap-2">
                  <button @click="openEdit(u)" class="action-btn edit" title="Edit Otoritas">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button @click="deleteUser(u.id)" class="action-btn delete" title="Hapus Akun">
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
           <div class="modal-badge">{{ isEditing ? 'Edit Profile' : 'New Account' }}</div>
           <h2>Otorisasi Pengguna</h2>
           <p>Tentukan hak akses and unit kerja personel administratif</p>
        </div>

        <div class="modal-body">
          <div class="grid grid-cols-2 gap-4">
            <div class="field">
              <label>Nama Depan</label>
              <input v-model="form.first_name" placeholder="John" />
            </div>
            <div class="field">
              <label>Nama Belakang</label>
              <input v-model="form.last_name" placeholder="Doe" />
            </div>
          </div>

          <div class="field">
            <label>Username Otoritas</label>
            <input v-model="form.username" :disabled="isEditing" placeholder="username.unikarta" />
          </div>

          <div class="field">
            <label>{{ isEditing ? 'Reset Password (Opsional)' : 'Password Utama' }}</label>
            <input v-model="form.password" type="password" placeholder="••••••••" />
          </div>

          <div class="field">
            <label>Email Institusi</label>
            <input v-model="form.email" type="email" placeholder="personel@unikarta.ac.id" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="field">
              <label>Unit Penugasan</label>
              <select v-model="form.company">
                <option value="">-- Universitas (Pusat) --</option>
                <option v-for="b in biros?.data" :key="b.id" :value="b.id">{{ b.nama }}</option>
              </select>
            </div>
            <div class="field">
              <label>Tingkat Akses</label>
              <select v-model="form.role">
                <option value="prodi">Admin Unit/Fakultas</option>
                <option value="admin">Super Admin (Rektorat)</option>
              </select>
            </div>
          </div>

          <div class="status-toggle-box">
             <div class="flex items-center gap-3">
               <label class="switch">
                 <input type="checkbox" v-model="form.active" :true-value="1" :false-value="0">
                 <span class="switch-slider"></span>
               </label>
               <span class="text-sm font-bold text-slate-700">Akun ini dalam status Aktif</span>
             </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showModal = false" class="btn-cancel">Batal</button>
          <button @click="handleSave" class="btn-save">
            {{ isEditing ? 'Perbarui Otoritas' : 'Luncurkan Akun' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary-glow { 
  background: #4f46e5; color: white; padding: 0.8rem 1.75rem; border-radius: 20px; 
  font-weight: 800; display: flex; align-items: center; gap: 0.75rem; 
  box-shadow: 0 10px 30px -10px #4f46e5; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-primary-glow:hover { transform: translateY(-3px); box-shadow: 0 15px 40px -10px #4f46e5; }

.stats-card { background: white; padding: 1.75rem; border-radius: 28px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
.stats-card label { display: block; font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; }
.stats-card .val { font-size: 2.25rem; font-weight: 900; color: #1e293b; margin-top: 0.25rem; letter-spacing: -2px; }

.premium-table thead th { padding: 1.25rem 1rem; color: #cbd5e1; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; text-align: left; }
.data-row td { padding: 1.25rem 1rem; border-top: 1px solid #f8fafc; vertical-align: middle; }
.data-row:hover { background: #fafafa; }

.user-info { display: flex; align-items: center; gap: 1.25rem; }
.avatar-glow { width: 44px; height: 44px; background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); color: #4338ca; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.25rem; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.details { display: flex; flex-direction: column; }
.full-name { font-weight: 800; color: #334155; font-size: 1rem; letter-spacing: -0.5px; }
.username { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }

.role-chip { padding: 0.3rem 0.75rem; border-radius: 10px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
.role-chip.admin { background: #fee2e2; color: #991b1b; }
.role-chip.prodi { background: #f1f5f9; color: #475569; }

.unit-box { display: flex; flex-direction: column; }
.unit-name { font-weight: 800; color: #475569; font-size: 0.9rem; }
.unit-code { font-size: 0.65rem; color: #cbd5e1; font-weight: 900; }

.status-indicator { display: inline-flex; items-center: center; gap: 0.4rem; font-size: 0.75rem; font-weight: 800; }
.status-indicator.active { color: #10b981; }
.status-indicator.active::before { content: ''; width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
.status-indicator.inactive { color: #94a3b8; }
.status-indicator.inactive::before { content: ''; width: 8px; height: 8px; background: #cbd5e1; border-radius: 50%; }

.action-btn { width: 40px; height: 40px; border-radius: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.3s; background: #fcfcfc; border: 1px solid #f1f5f9; color: #94a3b8; }
.action-btn.edit:hover { background: #4f46e5; color: white; border-color: #4f46e5; box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
.action-btn.delete:hover { background: #ef4444; color: white; border-color: #ef4444; box-shadow: 0 4px 12px rgba(239,68,68,0.3); }

/* Modal Design v2 */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-card { background: white; width: 100%; max-width: 580px; border-radius: 36px; padding: 3rem; box-shadow: 0 30px 60px -15px rgba(15, 23, 42, 0.2); }
.modal-badge { display: inline-block; background: #f1f5f9; color: #64748b; padding: 0.3rem 0.8rem; border-radius: 100px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; margin-bottom: 1rem; }
.modal-header h2 { font-size: 2rem; font-weight: 900; color: #1e293b; letter-spacing: -1px; margin: 0; }
.modal-header p { color: #94a3b8; font-size: 0.95rem; margin-top: 0.5rem; margin-bottom: 2rem; }

.field label { font-size: 0.7rem; font-weight: 900; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.6rem; display: block; }
.field input, .field select { width: 100%; padding: 1rem 1.25rem; background: #f8fafc; border: 2px solid #f8fafc; border-radius: 18px; font-size: 1rem; font-weight: 600; transition: all 0.3s; }
.field input:focus { border-color: #4f46e5; background: white; outline: none; }

.status-toggle-box { background: #f8fafc; padding: 1.25rem; border-radius: 20px; margin-top: 1rem; }
.switch { position: relative; display: inline-block; width: 50px; height: 28px; }
.switch input { opacity: 0; width: 0; height: 0; }
.switch-slider { position: absolute; cursor: pointer; inset: 0; background-color: #e2e8f0; transition: .4s; border-radius: 34px; }
.switch-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .switch-slider { background-color: #10b981; }
input:checked + .switch-slider:before { transform: translateX(22px); }

.modal-footer { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-save { flex: 2; padding: 1.1rem; background: #4f46e5; color: white; border-radius: 20px; font-weight: 900; border: none; box-shadow: 0 10px 20px -5px #4f46e5; cursor: pointer; transition: transform 0.2s; }
.btn-cancel { flex: 1; padding: 1.1rem; background: #f1f5f9; color: #64748b; border-radius: 20px; font-weight: 800; cursor: pointer; }
.btn-save:hover { transform: translateY(-2px); }
</style>
