import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  // In WordPress, the app is mounted on a page route (e.g. /productselector/).
  // Using Vite's BASE_URL would cause the router to prefer the theme asset path.
  history: createWebHistory('/'),
  routes: [],
})

export default router
