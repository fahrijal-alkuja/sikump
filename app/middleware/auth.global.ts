export default defineNuxtRouteMiddleware(async (to) => {
  const user = useUser()
  
  // Skip if we already have user (client-side)
  if (import.meta.client && user.value) return

  // Fetch session dari server jika belum ada di memori
  try {
    const data: any = await $fetch('/api/auth/session')
    if (data?.success) {
      user.value = data.user
    } else {
      user.value = null
      if (to.path !== '/login') return navigateTo('/login')
    }
  } catch (err) {
    user.value = null
    if (to.path !== '/login') return navigateTo('/login')
  }

  // Redirect if not logged in
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // Redirect if logged in and going to login
  if (user.value && to.path === '/login') {
    return navigateTo('/kepegawaian')
  }
})
