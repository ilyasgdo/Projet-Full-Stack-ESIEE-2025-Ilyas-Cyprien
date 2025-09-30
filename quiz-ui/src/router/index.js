import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/new-quiz',
      name: 'newQuiz',
      component: () => import('../views/NewQuizView.vue')
    },
    {
      path: '/questions',
      name: 'questions',
      component: () => import('../views/QuizView.vue')
    },
    {
      path: '/score',
      name: 'score',
      component: () => import('../views/ScoreView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue')
    },
    {
      path: '/admin/questions',
      name: 'questions-management',
      component: () => import('../views/QuestionsManagementView.vue')
    }
  ]
})

export default router
