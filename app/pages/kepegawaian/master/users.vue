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
      showModal.value = false;
      refresh();
    } else {
      alert(res.message || 'Gagal menyimpan user')
    }
  } catch (e: any) { alert(e.message) }
}

const confirmDelete = (id: number) => {
  selectedUserId.value = id
  showDeleteModal.value = true
}

const handleExecuteDelete = async () => {
  if (!selectedUserId.value) return
  const res = await $fetch<any>(`/api/kepegawaian/master/users?id=${selectedUserId.value}`, { method: 'DELETE' })
  if (res.success) {
    showDeleteModal.value = false;
    refresh();
  } else { alert(res.message) }
}
</script>

<template>
  <div class="user-admin-wrapper">
    <!-- Header Section -->
    <div class="page-top-bar">
      <div class="title-group">
        <h1 class="page-main-title">Manajemen Otoritas</h1>
        <p class="page-sub-desc">Sistem Pengaturan Hak Akses & Personel Administratif</p>
      </div>
      <button @click="openAdd" class="btn-primary-action">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Registrasi Admin
      </button>
    </div>

    <!-- Stats Section -->
    <div class="stats-row">
      <div class="stat-box glass">
        <span class="stat-label">Total Entitas</span>
        <div class="stat-value-group">
          <span class="stat-number">{{ users?.data?.length || 0 }}</span>
          <span class="stat-unit">Akun Terdaftar</span>
        </div>
      </div>
      <div class="stat-box glass">
        <span class="stat-label">Akses Aktif</span>
        <div class="stat-value-group">
          <span class="stat-number active-color">{{ users?.data?.filter((u: any) => u.active).length || 0 }}</span>
          <span class="stat-unit">Sesi Tersedia</span>
        </div>
      </div>
      <div class="stat-box-empty"></div>
    </div>

    <!-- Table Section -->
    <div class="table-container glass-card">
      <table class="user-data-table">
        <thead>
          <tr>
            <th style="width: 30%">Personal Info</th>
            <th style="width: 15%; text-align: center;">Peran</th>
            <th style="width: 25%">Unit Otoritas</th>
            <th style="width: 15%; text-align: center;">Status</th>
            <th style="width: 15%; text-align: right;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users?.data" :key="u.id" class="user-row-item">
            <td>
              <div class="user-cell-meta">
                <div class="user-avatar-initial">{{ u.first_name ? u.first_name[0] : 'U' }}</div>
                <div class="user-name-info">
                  <div class="full-name-text">{{ u.first_name }} {{ u.last_name }}</div>
                  <div class="username-handle">@{{ u.username }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="role-center-box">
                <span :class="['role-pill-v2', u.role]">{{ u.role || 'prodi' }}</span>
              </div>
            </td>
            <td>
              <div class="unit-cell-info">
                <span class="unit-name-text">{{ u.unit_display }}</span>
                <span class="unit-code-mono">{{ u.unit_code || 'CENTRAL' }}</span>
              </div>
            </td>
            <td>
              <div class="status-center-box">
                <div :class="['status-ring-dot', u.active ? 'is-active' : 'is-off']">
                  <span class="dot-internal"></span>
                  <span class="status-label-text">{{ u.active ? 'Aktif' : 'Off' }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="action-flex-end">
                <button @click="openEdit(u)" class="mini-action-btn edit" title="Edit Data">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button @click="confirmDelete(u.id)" class="mini-action-btn delete" title="Hapus User">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Management Modal -->
    <div v-if="showModal" class="full-modal-overlay">
      <div class="modal-surface-box animate-modal">
        <div class="modal-form-header">
          <div class="header-icon-box">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h2 class="modal-main-title">{{ isEditing ? 'Otorisasi Ulang' : 'Registrasi Admin' }}</h2>
          <p class="modal-sub-title">Pengaturan Hak Akses & Profil Personel</p>
        </div>

        <div class="modal-form-body">
          <div class="form-double-col">
            <div class="input-set">
              <label>Nama Depan</label>
              <input v-model="form.first_name" class="standard-input" placeholder="Nama Depan" />
            </div>
            <div class="input-set">
              <label>Nama Belakang</label>
              <input v-model="form.last_name" class="standard-input" placeholder="Nama Belakang" />
            </div>
          </div>
          
          <div class="input-set">
            <label>Identitas Login (Username/NIK)</label>
            <input v-model="form.username" :disabled="isEditing" class="standard-input" placeholder="Masukkan username" />
          </div>
          
          <div class="input-set">
            <label>{{ isEditing ? 'Password Baru (Opsional)' : 'Kata Sandi Awal' }}</label>
            <input v-model="form.password" type="password" class="standard-input" placeholder="••••••••" />
          </div>
          
          <div class="form-double-col">
            <div class="input-set">
              <label>Unit Kerja</label>
              <select v-model="form.company" class="standard-select">
                <option value="">-- Universitas (Central) --</option>
                <option v-for="b in biros?.data" :key="b.id" :value="b.id">{{ b.nama }}</option>
              </select>
            </div>
            <div class="input-set">
              <label>Role Akses</label>
              <select v-model="form.role" class="standard-select">
                <option value="prodi">Admin Unit / Prodi</option>
                <option value="admin">Admin Universitas</option>
              </select>
            </div>
          </div>
          <div class="toggle-status-bar">
             <div class="toggle-control-group">
               <label class="ios-toggle">
                 <input type="checkbox" v-model="form.active" :true-value="1" :false-value="0">
                 <span class="ios-slider"></span>
               </label>
               <span class="toggle-label-text">Akun dalam status AKTIF</span>
             </div>
          </div>
        </div>

        <div class="modal-form-footer">
          <button @click="showModal = false" class="btn-cancel-modal">Batalkan</button>
          <button @click="handleSave" class="btn-confirm-modal">Lanjutkan</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="full-modal-overlay alert-mode">
      <div class="alert-surface-box animate-modal">
        <div class="alert-icon-ring delete-red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </div>
        <div class="alert-text-group">
          <h2 class="alert-main-title">Hapus Akses?</h2>
          <p class="alert-sub-desc">Tindakan ini permanen and akan menangguhkan seluruh izin personil ini segera.</p>
        </div>
        <div class="alert-action-vertical">
          <button @click="handleExecuteDelete" class="btn-delete-execute">Hapus Sekarang</button>
          <button @click="showDeleteModal = false" class="btn-delete-cancel">Kembali</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-admin-wrapper { padding: 40px; min-height: 100vh; background: transparent; }

/* Header Bar */
.page-top-bar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
.page-main-title { font-size: 32px; font-weight: 900; color: #1e293b; letter-spacing: -1.5px; margin: 0; line-height: 1; }
.page-sub-desc { font-size: 14px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }
.btn-primary-action { 
  background: #4f46e5; color: white; padding: 12px 24px; border-radius: 16px; border: none; font-weight: 800; font-size: 14px;
  display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.3s; box-shadow: 0 10px 20px rgba(79,70,229,0.2);
}
.btn-primary-action svg { width: 18px; height: 18px; }
.btn-primary-action:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(79,70,229,0.3); }

/* Stats Row */
.stats-row { display: flex; gap: 16px; margin-bottom: 30px; }
.stat-box { flex: 1; background: white; padding: 20px; border-radius: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
.stat-label { font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; }
.stat-value-group { display: flex; align-items: flex-end; gap: 8px; margin-top: 5px; }
.stat-number { font-size: 36px; font-weight: 900; color: #1e293b; line-height: 1; letter-spacing: -2px; }
.stat-number.active-color { color: #10b981; }
.stat-unit { font-size: 11px; font-weight: 800; color: #cbd5e1; margin-bottom: 5px; }
.stat-box-empty { flex: 2; }

/* Table Elements */
.table-container { background: white; border-radius: 32px; border: 1px solid #f1f5f9; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03); }
.user-data-table { width: 100%; border-collapse: collapse; }
.user-data-table thead th { padding: 20px; background: #f8fafc; color: #94a3b8; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #f1f5f9; }
.user-row-item td { padding: 20px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.user-row-item:hover { background: #fafafa; }

.user-cell-meta { display: flex; align-items: center; gap: 16px; }
.user-avatar-initial { width: 44px; height: 44px; background: #eef2ff; color: #4f46e5; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; border: 2px solid white; }
.user-name-info { display: flex; flex-direction: column; }
.full-name-text { font-size: 15px; font-weight: 800; color: #334155; }
.username-handle { font-size: 12px; color: #94a3b8; font-weight: 700; }

.role-center-box { display: flex; justify-content: center; }
.role-pill-v2 { padding: 4px 12px; border-radius: 10px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
.role-pill-v2.admin { background: #fee2e2; color: #991b1b; }
.role-pill-v2.prodi { background: #f1f5f9; color: #475569; }

.unit-cell-info { display: flex; flex-direction: column; }
.unit-name-text { font-weight: 800; color: #475569; font-size: 14px; }
.unit-code-mono { font-size: 10px; color: #cbd5e1; font-weight: 800; font-family: monospace; }

.status-center-box { display: flex; justify-content: center; }
.status-ring-dot { display: flex; align-items: center; gap: 8px; }
.dot-internal { width: 8px; height: 8px; border-radius: 50%; }
.status-ring-dot.is-active .dot-internal { background: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.5); }
.status-ring-dot.is-active .status-label-text { color: #10b981; }
.status-ring-dot.is-off .dot-internal { background: #cbd5e1; }
.status-ring-dot.is-off .status-label-text { color: #94a3b8; }
.status-label-text { font-size: 11px; font-weight: 900; text-transform: uppercase; }

.action-flex-end { display: flex; justify-content: flex-end; gap: 8px; }
.mini-action-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid #f1f5f9; background: white; color: #94a3b8; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
.mini-action-btn svg { width: 16px; height: 16px; }
.mini-action-btn.edit:hover { background: #4f46e5; color: white; border-color: #4f46e5; }
.mini-action-btn.delete:hover { background: #ef4444; color: white; border-color: #ef4444; }

/* Modals */
.full-modal-overlay { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(12px); z-index: 2000; padding: 20px; }
.animate-modal { animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes modalIn { from { opacity: 0; transform: scale(0.9) translateY(40px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.modal-surface-box { width: 100%; max-width: 750px; max-height: 90vh; background: white; border-radius: 40px; overflow-y: auto; box-shadow: 0 30px 80px -15px rgba(15, 23, 42, 0.3); }
.modal-form-header { padding: 35px 50px 25px; background: #f8fafc; text-align: center; border-bottom: 1px solid #f1f5f9; }
.header-icon-box { width: 50px; height: 50px; background: #4f46e5; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; margin: 0 auto 12px; }
.header-icon-box svg { width: 24px; height: 24px; }
.modal-main-title { font-size: 24px; font-weight: 900; color: #1e293b; letter-spacing: -1px; margin: 0; }
.modal-sub-title { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; }

.modal-form-body { padding: 40px 60px; display: flex; flex-direction: column; gap: 30px; }
.form-double-col { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; width: 100%; }
.form-double-col .input-set { width: 100%; }
.input-set { display: flex; flex-direction: column; width: 100%; margin-bottom: 5px; }
.input-set label { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; padding-left: 8px; letter-spacing: 0.8px; }
.standard-input, .standard-select { 
  width: 100%; padding: 14px 20px; background: #f1f5f9; border: 2px solid #f1f5f9; border-radius: 18px; 
  font-size: 15px; font-weight: 700; color: #1e293b; transition: all 0.3s; appearance: none;
}
.standard-input::placeholder { color: #cbd5e1; }
.standard-input:focus, .standard-select:focus { outline: none; border-color: #4f46e5; background: white; box-shadow: 0 0 0 5px rgba(79, 70, 229, 0.05); }

.standard-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.25rem center;
  background-size: 1rem;
}

.toggle-status-bar { background: #f8fafc; padding: 18px; border-radius: 22px; margin-top: 10px; border: 1px solid #f1f5f9; }
.toggle-control-group { display: flex; align-items: center; gap: 14px; }
.ios-toggle { position: relative; width: 52px; height: 28px; }
.ios-toggle input { opacity: 0; width: 0; height: 0; }
.ios-slider { position: absolute; inset: 0; background: #e2e8f0; border-radius: 30px; transition: 0.4s; cursor: pointer; }
.ios-slider:before { position: absolute; content: ""; height: 22px; width: 22px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.4s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
input:checked + .ios-slider { background: #10b981; }
input:checked + .ios-slider:before { transform: translateX(24px); }
.toggle-label-text { font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: -0.2px; }

.modal-form-footer { padding: 10px 30px 30px; display: flex; gap: 14px; }
.btn-confirm-modal { flex: 2; padding: 16px; background: #4f46e5; color: white; border-radius: 20px; border: none; font-weight: 800; font-size: 16px; cursor: pointer; transition: all 0.3s; box-shadow: 0 10px 30px -5px rgba(79, 70, 229, 0.4); }
.btn-confirm-modal:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -10px rgba(79, 70, 229, 0.5); }
.btn-cancel-modal { flex: 1; padding: 16px; background: #f1f5f9; color: #64748b; border-radius: 20px; border: none; font-weight: 800; font-size: 16px; cursor: pointer; transition: 0.3s; }
.btn-cancel-modal:hover { background: #e2e8f0; }

/* Alert Modal */
.alert-surface-box { width: 100%; max-width: 400px; background: white; border-radius: 40px; padding: 40px; text-align: center; box-shadow: 0 30px 60px rgba(0,0,0,0.3); }
.alert-icon-ring { width: 80px; height: 80px; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
.alert-icon-ring.delete-red { background: #fff1f2; color: #e11d48; }
.alert-icon-ring svg { width: 40px; height: 40px; }
.alert-main-title { font-size: 28px; font-weight: 900; color: #1e293b; letter-spacing: -1.5px; margin: 0; }
.alert-sub-desc { font-size: 14px; color: #94a3b8; font-weight: 600; margin-top: 10px; line-height: 1.5; }
.alert-action-vertical { display: flex; flex-direction: column; gap: 12px; margin-top: 30px; }
.btn-delete-execute { width: 100%; padding: 16px; background: #e11d48; color: white; border-radius: 18px; border: none; font-weight: 900; cursor: pointer; box-shadow: 0 10px 20px rgba(225,29,72,0.2); transition: 0.3s; }
.btn-delete-execute:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(225,29,72,0.3); }
.btn-delete-cancel { width: 100%; padding: 16px; background: #f8fafc; color: #94a3b8; border-radius: 18px; border: none; font-weight: 800; cursor: pointer; }
</style>
