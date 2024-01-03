import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
      path: '/',
      component: () => import('@/views/01cube/index.vue'),
    },
    {
      path: '/three/amap',
      component:() => import('@/views/02amap/index.vue')
    },
    {
      path: '/three/amap/01',
      component:() => import('@/views/03amap/index.vue')
    }
    ]
})
export default router
