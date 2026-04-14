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

    <header class="main-header glass-card" v-if="user">
      <div class="header-left">
        <div class="brand">
          <div class="brand-logo">U</div>
          <div class="brand-text">SIKUMP<span>.unikarta</span></div>
        </div>
        <nav class="main-nav">
          <NuxtLink to="/kepegawaian" class="nav-link" exact-active-class="active">Dashboard</NuxtLink>
          <NuxtLink to="/kepegawaian/dosen" class="nav-link" active-class="active">Dosen</NuxtLink>
          <NuxtLink to="/kepegawaian/tendik" class="nav-link" active-class="active">Tendik</NuxtLink>
          <NuxtLink to="/kepegawaian/berkas" class="nav-link" active-class="active">Berkas</NuxtLink>
          <NuxtLink to="/kepegawaian/laporan" class="nav-link" active-class="active">Laporan</NuxtLink>
          <div class="nav-dropdown">
            <span class="nav-link">Master Data ▾</span>
            <div class="dropdown-content glass-card">
              <NuxtLink to="/kepegawaian/master/biro" class="drop-link">Biro / Lembaga</NuxtLink>
              <NuxtLink to="/kepegawaian/master/prodi" class="drop-link">Program Studi</NuxtLink>
              <NuxtLink to="/kepegawaian/master/pangkat" class="drop-link">Pangkat & Golongan</NuxtLink>
              <NuxtLink to="/kepegawaian/master/jafung" class="drop-link">Jabatan Akademik</NuxtLink>
              <NuxtLink to="/kepegawaian/master/jabatan" class="drop-link">Jabatan Struktural</NuxtLink>
              <div class="dropdown-divider"></div>
              <NuxtLink to="/kepegawaian/logs" class="drop-link">Log Aktivitas</NuxtLink>
            </div>
          </div>
        </nav>
      </div>
      
      <div class="header-right">
        <div class="user-profile">
          <div class="user-info text-right">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-role">{{ user.role === 'admin' ? 'Administrator' : 'Admin Prodi' }}</span>
          </div>
          <div class="user-avatar">{{ user.name?.charAt(0) }}</div>
          <button @click="handleLogout" class="btn-logout" title="Log Keluar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </header>

    <main :class="['main-content', { 'full-width': !user }]">
      <div class="app-container">
        <slot />
      </div>
    </main>
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
  width: 32px;
  height: 32px;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  border-radius: 8px;
  font-size: 0.9rem;
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
  font-size: 0.95rem;
  transition: all 0.2s;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
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
  display: block;
  padding: 0.75rem 1rem;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
  transition: 0.2s;
}

.drop-link:hover { background: rgba(99, 102, 241, 0.1); color: var(--primary); }

.dropdown-divider { height: 1px; background: var(--glass-border); margin: 0.5rem 0; }

.main-content.full-width {
  padding-top: 0;
}

.text-right {
  text-align: right;
}
</style>
