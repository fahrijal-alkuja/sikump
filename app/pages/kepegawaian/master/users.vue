<script setup lang="ts">
const { data: users, refresh } = await useFetch<any>('/api/kepegawaian/master/users')
const { data: biros } = await useFetch<any>('/api/kepegawaian/biro')

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const selectedUserId = ref<number | null>(null)

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

const confirmDelete = (id: number) => {
  selectedUserId.value = id
  showDeleteModal.value = true
}

const handleExecuteDelete = async () => {
  if (!selectedUserId.value) return
  const res = await $fetch<any>(`/api/kepegawaian/master/users?id=${selectedUserId.value}`, { method: 'DELETE' })
  if (res.success) {
    showDeleteModal.value = false
    refresh()
  } else {
    alert(res.message)
  }
}
</script>

<template>
  <div class="user-mgmt overflow-x-hidden">
    <!-- Header Section -->
    <header class="px-8 pt-8 pb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight">Manajemen Otoritas</h1>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sistem Kontrol Akses UNIKARTA</p>
      </div>
      <button @click="openAdd" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-100">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Registrasi Admin
      </button>
    </header>

    <!-- Balanced Stats Bar -->
    <div class="px-8 flex gap-4 mb-8">
      <div class="flex-1 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
        <label class="text-[10px] font-black text-slate-400 uppercase">Total Akun</label>
        <div class="text-2xl font-black text-slate-800 mt-1">{{ users?.data?.length || 0 }} <span class="text-xs text-slate-300 font-bold">User</span></div>
      </div>
      <div class="flex-1 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
        <label class="text-[10px] font-black text-slate-400 uppercase">Akses Aktif</label>
        <div class="text-2xl font-black text-emerald-500 mt-1">{{ users?.data?.filter((u: any) => u.active).length || 0 }} <span class="text-xs text-emerald-200 font-bold">Aktif</span></div>
      </div>
      <div class="flex-[2]"></div> <!-- Spacer to keep stats aligned left -->
    </div>

    <!-- Data Table Container -->
    <div class="px-8 pb-10">
      <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-slate-50/50 text-left border-b border-slate-50">
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Info</th>
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Peran</th>
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Otoritas Unit</th>
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="u in users?.data" :key="u.id" class="group hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-5">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-indigo-500 text-lg border border-slate-100">
                    {{ u.first_name ? u.first_name[0] : 'U' }}
                  </div>
                  <div>
                    <p class="font-black text-slate-800 text-sm leading-tight">{{ u.first_name }} {{ u.last_name }}</p>
                    <p class="text-[11px] text-slate-400 font-bold">@{{ u.username }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-5">
                <div class="flex justify-center">
                  <span :class="['px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border', u.role === 'admin' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100']">
                    {{ u.role || 'prodi' }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-5">
                <div class="flex flex-col">
                  <span class="text-[13px] font-black text-slate-700 tracking-tight">{{ u.unit_display }}</span>
                  <span class="text-[10px] text-slate-300 font-black font-mono">{{ u.unit_code || 'CENTRAL' }}</span>
                </div>
              </td>
              <td class="px-6 py-5 text-center">
                <div class="inline-flex items-center gap-2 group-hover:scale-110 transition-transform">
                   <div :class="['w-1.5 h-1.5 rounded-full ring-4 shadow-sm', u.active ? 'bg-emerald-500 ring-emerald-500/10' : 'bg-slate-300 ring-slate-100']"></div>
                   <span class="text-[10px] font-black uppercase tracking-tight text-slate-400">{{ u.active ? 'Tersedia' : 'Off' }}</span>
                </div>
              </td>
              <td class="px-6 py-5 text-right">
                <div class="flex justify-end gap-2">
                  <button @click="openEdit(u)" class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button @click="confirmDelete(u.id)" class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Management Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <div class="bg-white rounded-[40px] shadow-2xl p-8 w-full max-w-[480px] animate-in fade-in zoom-in duration-300">
        <div class="text-center mb-10">
          <div class="w-16 h-16 bg-indigo-50 rounded-[22px] flex items-center justify-center text-indigo-500 mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tighter">{{ isEditing ? 'Otorisasi Ulang' : 'Admin Baru' }}</h2>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Konfigurasi Hak Akses Sistem</p>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-300 uppercase ml-2">Nama Depan</label>
              <input v-model="form.first_name" class="w-full px-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-100 font-bold text-sm" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-300 uppercase ml-2">Belakang</label>
              <input v-model="form.last_name" class="w-full px-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-100 font-bold text-sm" />
            </div>
          </div>
          <div class="space-y-1">
             <label class="text-[10px] font-black text-slate-300 uppercase ml-2">Username Otoritas</label>
             <input v-model="form.username" :disabled="isEditing" class="w-full px-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-100 font-bold text-sm" />
          </div>
          <div class="space-y-1">
             <label class="text-[10px] font-black text-slate-300 uppercase ml-2">{{ isEditing ? 'Password Baru (Opsional)' : 'Password Awal' }}</label>
             <input v-model="form.password" type="password" class="w-full px-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-100 font-bold text-sm" />
          </div>
          <div class="space-y-1">
             <label class="text-[10px] font-black text-slate-300 uppercase ml-2">Unit Penugasan</label>
             <select v-model="form.company" class="w-full px-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-100 font-black text-xs uppercase">
                <option value="">-- Universitas (Central) --</option>
                <option v-for="b in biros?.data" :key="b.id" :value="b.id">{{ b.nama }}</option>
             </select>
          </div>
          <div class="space-y-1">
             <label class="text-[10px] font-black text-slate-300 uppercase ml-2">Tingkat Akses</label>
             <select v-model="form.role" class="w-full px-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-100 font-black text-xs uppercase">
                <option value="prodi">Admin Unit / Prodi</option>
                <option value="admin">Super Admin / Universitas</option>
             </select>
          </div>
          <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.active" :true-value="1" :false-value="0" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
            <span class="text-[11px] font-black text-slate-600 uppercase tracking-tighter">Status Akun Aktif</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-10">
          <button @click="showModal = false" class="py-3.5 rounded-2xl border border-slate-100 text-slate-400 font-black text-sm hover:bg-slate-50 transition-colors">Batal</button>
          <button @click="handleSave" class="py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Konfirmasi</button>
        </div>
      </div>
    </div>

    <!-- Modern Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
      <div class="bg-white rounded-[40px] p-10 w-full max-w-[420px] shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-500">
        <div class="w-20 h-20 bg-rose-50 rounded-[30px] flex items-center justify-center text-rose-500 mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </div>
        <div class="text-center">
          <h2 class="text-2xl font-black text-slate-800 tracking-tighter">Hapus Akses?</h2>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">Tindakan ini permanen and akan menangguhkan seluruh izin personil ini.</p>
        </div>
        <div class="flex flex-col gap-3 mt-10">
          <button @click="handleExecuteDelete" class="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-rose-100">Hapus Sekarang</button>
          <button @click="showDeleteModal = false" class="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-black text-sm transition-all">Batalkan</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped for unique modal effects */
.animate-in {
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
