<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 text-center">
      <div class="mb-6">
        <div class="text-6xl mb-4">🎉</div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Quiz Terminé !</h1>
        <p class="text-lg text-gray-600">Félicitations {{ playerName }}</p>
      </div>

      <div v-if="participationScore" class="mb-8">
        <div class="bg-blue-50 rounded-lg p-6 mb-6">
          <div class="text-4xl font-bold text-blue-600 mb-2">
            {{ participationScore.score }}
          </div>
          <p class="text-gray-700">Bonnes réponses</p>
        </div>

        <!-- Detailed Results -->
        <div v-if="participationScore.answersSummaries" class="text-left mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Détail de vos réponses :</h3>
          <div class="space-y-2">
            <div 
              v-for="(summary, index) in participationScore.answersSummaries" 
              :key="index"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <span class="text-gray-700">Question {{ index + 1 }}</span>
              <span 
                :class="summary.wasCorrect ? 'text-green-600' : 'text-red-600'"
                class="font-semibold"
              >
                {{ summary.wasCorrect ? '✓ Correct' : '✗ Incorrect' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <button
          @click="playAgain"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
        >
          Rejouer
        </button>
        
        <router-link 
          to="/"
          class="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
        >
          Retour à l'accueil
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ParticipationStorageService from '@/services/ParticipationStorageService'

const router = useRouter()
const participationScore = ref(null)
const playerName = ref('')

onMounted(() => {
  participationScore.value = ParticipationStorageService.getParticipationScore()
  playerName.value = ParticipationStorageService.getPlayerName()
  
  if (!participationScore.value || !playerName.value) {
    router.push('/')
  }
})

const playAgain = () => {
  ParticipationStorageService.clear()
  router.push('/new-quiz')
}
</script>
