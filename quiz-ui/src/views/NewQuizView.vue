<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">Nouveau Quiz</h1>
      
      <form @submit.prevent="startQuiz">
        <div class="mb-4">
          <label for="playerName" class="block text-sm font-medium text-gray-700 mb-2">
            Votre nom
          </label>
          <input
            id="playerName"
            v-model="playerName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Entrez votre nom"
          />
        </div>
        
        <button
          type="submit"
          :disabled="!playerName.trim()"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md transition duration-200"
        >
          Commencer le Quiz
        </button>
      </form>
      
      <div class="mt-4 text-center">
        <router-link 
          to="/"
          class="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Retour à l'accueil
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ParticipationStorageService from '@/services/ParticipationStorageService'

const router = useRouter()
const playerName = ref('')

const startQuiz = () => {
  if (playerName.value.trim()) {
    ParticipationStorageService.savePlayerName(playerName.value.trim())
    router.push('/questions')
  }
}
</script>
