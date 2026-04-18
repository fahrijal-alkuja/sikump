<script setup lang="ts">
const user = useUser() // Custom composable to handle session

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  user.value = null
  navigateTo('/login')
}
</script>

<template>
  <div class="app-layout">
    <!-- Background Decor -->
    <div class="app-visuals">
      <div class="glow-sphere sphere-1"></div>
      <div class="glow-sphere sphere-2"></div>
    </div>

    <div v-if="user" class="header-placeholder">
      <header class="main-header glass-card">
        <div class="header-left">
          <div class="brand">
            <div class="brand-logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="brand-text">SIKUMP<span>.unikarta</span></div>
          </div>
          <nav class="main-nav" v-if="user?.role !== 'tendik'">
            <NuxtLink to="/kepegawaian" class="nav-link" exact-active-class="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Dashboard
            </NuxtLink>
            <NuxtLink to="/kepegawaian/dosen" class="nav-link" active-class="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Dosen
            </NuxtLink>
            <NuxtLink to="/kepegawaian/tendik" class="nav-link" active-class="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Tendik
            </NuxtLink>
            <NuxtLink to="/kepegawaian/berkas" class="nav-link" active-class="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              Berkas
            </NuxtLink>
            <NuxtLink to="/kepegawaian/laporan" class="nav-link" active-class="active">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Laporan
            </NuxtLink>
            <div class="nav-dropdown" v-if="user?.role === 'admin'">
              <span class="nav-link">Master Data ▾</span>
              <div class="dropdown-content glass-card">
                <NuxtLink to="/kepegawaian/master/biro" class="drop-link">
                  <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                  Biro / Lembaga
                </NuxtLink>
                <NuxtLink to="/kepegawaian/master/prodi" class="drop-link">
                  <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  Program Studi
                </NuxtLink>
                <NuxtLink to="/kepegawaian/master/pangkat" class="drop-link">
                  <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  Pangkat & Golongan
                </NuxtLink>
                <NuxtLink to="/kepegawaian/master/jafung" class="drop-link">
                  <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                  Jabatan Akademik
                </NuxtLink>
                <NuxtLink to="/kepegawaian/master/jabatan" class="drop-link">
                  <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  Jabatan Struktural
                </NuxtLink>
                <div class="dropdown-divider"></div>
                <NuxtLink to="/kepegawaian/survei/tendik" class="drop-link text-amber-600">
                  <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                  Survei Kepuasan Tendik
                </NuxtLink>
                <div class="dropdown-divider"></div>
                <NuxtLink v-if="user?.role !== 'tendik'" to="/kepegawaian/logs" class="drop-link text-red-500">
                  <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  Log Aktivitas
                </NuxtLink>
                <NuxtLink to="/kepegawaian/presensi" class="drop-link text-blue-600">
                  <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Analisis Presensi
                </NuxtLink>
                
                <template v-if="user?.role !== 'tendik'">
                  <div class="dropdown-divider"></div>
                  <div class="dropdown-label">MANAJEMEN OTORITAS</div>
                  <NuxtLink to="/kepegawaian/master/users?role=tendik" class="drop-link text-indigo-600">
                    <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                    User Tendik
                  </NuxtLink>
                  <NuxtLink to="/kepegawaian/master/users?role=prodi" class="drop-link text-teal-600">
                    <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M20 8v6M23 11h-6"></path></svg>
                    Admin Unit / Prodi
                  </NuxtLink>
                  <NuxtLink to="/kepegawaian/master/users?role=admin" class="drop-link text-amber-600">
                    <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    Admin Universitas
                  </NuxtLink>
                  <NuxtLink to="/kepegawaian/master/users" class="drop-link text-slate-500">
                    <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1-2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Master Seluruh User
                  </NuxtLink>
                </template>

                <template v-else>
                  <div class="dropdown-divider"></div>
                  <NuxtLink to="/kepegawaian/self-service/profile" class="drop-link text-indigo-600">
                    <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Profil Saya
                  </NuxtLink>
                </template>
              </div>
            </div>
          </nav>
        </div>
        
        <div class="header-right">
          <div class="user-profile">
            <div class="user-info text-right">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-role">
                {{ user.role === 'admin' ? 'Administrator' : (user.role === 'tendik' ? 'Tenaga Kependidikan' : 'Admin Unit / Prodi') }}
              </span>
            </div>
            <div class="user-avatar">{{ user.name?.charAt(0) }}</div>
            <button @click="handleLogout" class="btn-logout" title="Log Keluar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </header>
    </div>

    <main :class="['main-content', { 'full-width': !user }]">
      <div class="app-container">
        <slot />
      </div>
    </main>

    <!-- Mandatory Survey Check -->
    <KepegawaianMandatorySurveyModal v-if="user" />
  </div>
</template>

<style>
:root {
  --primary: #6366f1;
  --bg-main: #f1f5f9;
  --glass-bg: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(0, 0, 0, 0.08);
  --text-main: #1e293b;
  --text-muted: #64748b;
  --card-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
}

.app-layout {
  min-height: 100vh;
  background: var(--bg-main);
  color: var(--text-main);
  position: relative;
  overflow-x: hidden;
}

.app-visuals {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.glow-sphere {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.1;
}

.sphere-1 {
  top: -10%;
  right: -5%;
  background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
}

.sphere-2 {
  bottom: -15%;
  left: -10%;
  background: radial-gradient(circle, #818cf8 0%, transparent 70%);
}

.main-header {
  position: sticky;
  top: 1.5rem;
  left: 2rem;
  right: 2rem;
  margin: 0 auto;
  max-width: 1400px;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 2rem;
  border-radius: 1.25rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo {
  width: 40px;
  height: 40px;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.brand-logo svg {
  width: 100%;
  height: 100%;
}

.brand-text {
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: -0.5px;
  color: #1e293b;
}

.brand-text span {
  color: var(--primary);
}

.main-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #64748b;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.2s;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.nav-icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
}

.nav-link:hover .nav-icon, .nav-link.active .nav-icon {
  opacity: 1;
}

.nav-link:hover {
  color: var(--primary);
  background: rgba(99, 102, 241, 0.05);
}

.nav-link.active {
  color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 700;
  font-size: 0.95rem;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: white;
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 800;
  color: var(--primary);
}

.btn-logout {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
  opacity: 0.7;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.1);
  opacity: 1;
}

.main-content {
  padding-top: 3rem;
  padding-bottom: 5rem;
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

/* Dropdown Styles */
.nav-dropdown { position: relative; display: inline-block; cursor: pointer; }
.nav-dropdown::after { content: ''; position: absolute; top: 100%; left: 0; right: 0; height: 1.5rem; background: transparent; }
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
}

.dropdown-content {
  display: none;
  position: absolute;
  top: calc(100% + 1rem);
  left: 0;
  min-width: 220px;
  padding: 0.5rem;
  z-index: 200;
  border-radius: 12px;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.nav-dropdown:hover .dropdown-content { display: block; }

.drop-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #64748b;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 8px;
  transition: 0.2s;
}

.drop-icon {
  width: 16px;
  height: 16px;
  opacity: 0.5;
}

.drop-link:hover .drop-icon {
  opacity: 1;
  color: var(--primary);
}

.drop-link:hover { background: rgba(99, 102, 241, 0.1); color: var(--primary); }

.dropdown-divider { height: 1px; background: var(--glass-border); margin: 0.5rem 0; }

.main-content.full-width {
  padding-top: 0;
}

.text-right {
  text-align: right;
}

/* Master Menu Overrides */
.dropdown-label { font-size: 10px; font-weight: 950; color: #94a3b8; padding: 10px 15px 5px; text-transform: uppercase; letter-spacing: 1px; }
.drop-link { border-radius: 12px !important; margin: 2px 0; }
.drop-link:hover { transform: translateX(5px); background: #f8fafc !important; }
</style>
