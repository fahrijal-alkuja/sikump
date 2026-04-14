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

const handleSave = async () => {
  try {
    const method = form.value.id ? 'POST' : 'POST' // Use POST for both or implement proper PUT
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
  <div class="user-mgmt p-6">
    <div class="page-header">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Manajemen User</h1>
        <p class="text-slate-500 mt-1">Kelola akun akses Sistem Informasi Kepegawaian</p>
      </div>
      <button @click="openAdd" class="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Tambah User Baru
      </button>
    </div>

    <div class="glass-card mt-8 overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-100">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-50/50 border-b border-slate-100">
            <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">User</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Role</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Unit Kerja</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
            <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="u in users?.data" :key="u.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  {{ u.first_name ? u.first_name[0] : 'U' }}
                </div>
                <div>
                  <div class="font-bold text-slate-800">{{ u.first_name }} {{ u.last_name }}</div>
                  <div class="text-xs text-slate-400">{{ u.username }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
               <span class="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">{{ u.role || 'prodi' }}</span>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ u.unit_code || '-' }}</td>
            <td class="px-6 py-4">
              <span :class="['status-badge', u.active ? 'active' : 'inactive']">
                {{ u.active ? 'Aktif' : 'Non-Aktif' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="deleteUser(u.id)" class="text-red-400 hover:text-red-600 p-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal User -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content glass-card max-w-lg w-full bg-white rounded-3xl p-8">
        <h2 class="text-2xl font-black mb-6 text-slate-800 tracking-tight">Tambah User Baru</h2>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
               <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Depan</label>
               <input v-model="form.first_name" placeholder="John" class="form-input" />
            </div>
            <div class="space-y-1">
               <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Belakang</label>
               <input v-model="form.last_name" placeholder="Doe" class="form-input" />
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Username</label>
            <input v-model="form.username" placeholder="john.doe" class="form-input" />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Password</label>
            <input v-model="form.password" type="password" placeholder="••••••••" class="form-input" />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Email</label>
            <input v-model="form.email" type="email" placeholder="john@email.com" class="form-input" />
          </div>
          
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Unit Kerja (Prodi/Fakultas)</label>
            <select v-model="form.company" class="form-input">
              <option value="">-- Pilih Unit --</option>
              <option v-for="b in biros?.data" :key="b.id" :value="b.id">{{ b.nama }}</option>
            </select>
          </div>

          <div class="flex gap-4 pt-6">
            <button @click="showModal = false" class="btn-ghost flex-1">Batal</button>
            <button @click="handleSave" class="btn-primary flex-1 justify-center">Simpan User</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; }
.btn-primary { background: #4f46e5; color: white; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; transition: transform 0.2s; }
.btn-primary:active { transform: scale(0.95); }
.btn-ghost { background: #f8fafc; color: #64748b; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; }
.form-input { width: 100%; padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 0.9rem; background: #fdfdfd; }
.form-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 100px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.inactive { background: #fee2e2; color: #991b1b; }
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
.modal-content { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1); }
</style>
