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
  <div class="user-mgmt px-10 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Manajemen Otoritas</h1>
        <p class="text-slate-400 text-sm font-medium">Pengaturan akun and hak akses administratif</p>
      </div>
      <button @click="openAdd" class="btn-primary-glow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Admin Baru
      </button>
    </div>

    <!-- Compact Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="stats-card-compact glass">
        <label>Total Entitas</label>
        <div class="flex items-end gap-2 mt-1">
          <div class="val">{{ users?.data?.length || 0 }}</div>
          <span class="text-slate-300 text-xs font-bold pb-1">Akun</span>
        </div>
      </div>
      <div class="stats-card-compact glass">
        <label>Akses Aktif</label>
        <div class="flex items-end gap-2 mt-1">
          <div class="val text-emerald-500">{{ users?.data?.filter((u: any) => u.active).length || 0 }}</div>
          <span class="text-emerald-200 text-xs font-bold pb-1">Online</span>
        </div>
      </div>
    </div>

    <!-- Main Table -->
    <div class="glass-card shadow-sm border border-slate-100 overflow-hidden bg-white/40">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-50/50">
            <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas Pengguna</th>
            <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Peran Kontrol</th>
            <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Otoritas</th>
            <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th class="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="u in users?.data" :key="u.id" class="hover:bg-indigo-50/20 transition-all group">
            <td class="px-6 py-4">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform">
                  {{ u.first_name ? u.first_name[0] : 'U' }}
                </div>
                <div>
                  <div class="font-bold text-slate-800 text-sm">{{ u.first_name }} {{ u.last_name }}</div>
                  <div class="text-[11px] text-slate-400 font-medium">@{{ u.username }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span :class="['role-chip', u.role]">
                {{ u.role || 'prodi' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-600 tracking-tight">{{ u.unit_display }}</span>
                <span class="text-[10px] text-slate-300 font-bold font-mono">{{ u.unit_code || 'CENTRAL' }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <div :class="['w-2 h-2 rounded-full ring-4 shadow-sm', u.active ? 'bg-emerald-500 ring-emerald-500/20' : 'bg-slate-300 ring-slate-100']"></div>
                <span :class="['text-[11px] font-bold uppercase tracking-tighter', u.active ? 'text-emerald-600' : 'text-slate-400']">
                  {{ u.active ? 'Aktif' : 'Off' }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openEdit(u)" class="btn-icon-v3 edit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                <button @click="deleteUser(u.id)" class="btn-icon-v3 delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Minimal Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-card-compact bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 w-full max-w-[500px]">
        <div class="text-center mb-8">
           <div class="inline-block px-3 py-1 bg-indigo-50 text-indigo-500 text-[10px] font-black uppercase rounded-full mb-3">{{ isEditing ? 'Modification' : 'Registration' }}</div>
           <h2 class="text-2xl font-black text-slate-800 tracking-tighter">Profil Otoritas</h2>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="field-compact">
              <label>Depan</label>
              <input v-model="form.first_name" placeholder="Nama" />
            </div>
            <div class="field-compact">
              <label>Belakang</label>
              <input v-model="form.last_name" placeholder="Nama" />
            </div>
          </div>

          <div class="field-compact">
            <label>Otoritas Identitas</label>
            <input v-model="form.username" :disabled="isEditing" placeholder="username" />
          </div>

          <div class="field-compact">
            <label>Kata Sandi</label>
            <input v-model="form.password" type="password" placeholder="••••••••" />
          </div>

          <div class="field-compact">
            <label>Unit Otoritas</label>
            <select v-model="form.company" class="w-full">
              <option value="">-- Universitas --</option>
              <option v-for="b in biros?.data" :key="b.id" :value="b.id">{{ b.nama }}</option>
            </select>
          </div>

          <div class="field-compact">
            <label>Tingkat Akses</label>
            <select v-model="form.role" class="w-full">
              <option value="prodi">Admin Unit</option>
              <option value="admin">Admin Universitas</option>
            </select>
          </div>

          <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <label class="switch-v3">
              <input type="checkbox" v-model="form.active" :true-value="1" :false-value="0">
              <span class="slider-v3"></span>
            </label>
            <span class="text-xs font-black text-slate-600 uppercase tracking-tighter">Akun ini dalam status Aktif</span>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button @click="showModal = false" class="btn-cancel-v3">Batal</button>
          <button @click="handleSave" class="btn-save-v3">{{ isEditing ? 'Simpan' : 'Daftarkan' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary-glow { background: #4f46e5; color: white; padding: 0.6rem 1.25rem; border-radius: 12px; font-weight: 800; font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem; }
.stats-card-compact { padding: 1.25rem; border-radius: 20px; background: white; border: 1px solid #f1f5f9; }
.stats-card-compact label { font-size: 0.65rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
.stats-card-compact .val { font-size: 1.5rem; font-weight: 900; color: #1e293b; letter-spacing: -1px; }

.role-chip { padding: 0.2rem 0.6rem; border-radius: 8px; font-size: 0.6rem; font-weight: 900; text-transform: uppercase; }
.role-chip.admin { background: #fee2e2; color: #b91c1c; }
.role-chip.prodi { background: #f1f5f9; color: #475569; }

.btn-icon-v3 { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; background: white; border: 1px solid #f1f5f9; color: #94a3b8; }
.btn-icon-v3.edit:hover { background: #4f46e5; color: white; border-color: #4f46e5; }
.btn-icon-v3.delete:hover { background: #ef4444; color: white; border-color: #ef4444; }

.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.field-compact label { font-size: 0.6rem; font-weight: 900; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.25rem; display: block; padding-left: 0.5rem; }
.field-compact input, .field-compact select { width: 100%; padding: 0.75rem 1rem; background: #f8fafc; border: 2px solid transparent; border-radius: 14px; font-size: 0.85rem; font-weight: 700; transition: all 0.2s; color: #334155; }
.field-compact input:focus { border-color: #e0e7ff; background: white; outline: none; }

.switch-v3 { position: relative; width: 44px; height: 24px; }
.switch-v3 input { opacity: 0; width: 0; height: 0; }
.slider-v3 { position: absolute; cursor: pointer; inset: 0; background-color: #e2e8f0; transition: .4s; border-radius: 24px; }
.slider-v3:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider-v3 { background-color: #10b981; }
input:checked + .slider-v3:before { transform: translateX(20px); }

.btn-save-v3 { flex: 2; padding: 0.85rem; background: #4f46e5; color: white; border-radius: 14px; font-weight: 900; font-size: 0.9rem; border: none; cursor: pointer; }
.btn-cancel-v3 { flex: 1; padding: 0.85rem; background: #f8fafc; color: #64748b; border-radius: 14px; font-weight: 800; font-size: 0.9rem; border: 1px solid #f1f5f9; cursor: pointer; }
</style>
