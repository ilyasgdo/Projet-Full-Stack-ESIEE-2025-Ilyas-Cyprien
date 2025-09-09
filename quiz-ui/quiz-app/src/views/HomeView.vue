<template>
  <div class="container mx-auto px-4 py-8">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Quiz Application</h1>
      <p class="text-xl text-gray-600 mb-8">Testez vos connaissances !</p>
      
      <router-link 
        to="/new-quiz"
        class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
      >
        Participer au Quiz
      </router-link>
    </div>

    <div class="max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Meilleurs Scores</h2>
      
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des scores...</p>
      </div>

      <div v-else-if="scores.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
        <p class="text-gray-600">Aucun score enregistré pour le moment.</p>
        <p class="text-sm text-gray-500 mt-2">Soyez le premier à participer !</p>
      </div>

      <div v-else class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rang
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joueur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(score, index) in scores" :key="index">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ score.playerName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ score.score }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ score.date }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import QuizApiService from '@/services/QuizApiService'

const scores = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await QuizApiService.getQuizInfo()
    scores.value = response.data.scores || []
  } catch (error) {
    console.error('Failed to load quiz info:', error)
  } finally {
    loading.value = false
  }
})
</script>
