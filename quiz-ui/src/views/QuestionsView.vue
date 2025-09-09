<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {{ currentPosition }} sur {{ totalQuestions || '?' }}</span>
          <span>{{ playerName }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Chargement de la question...</p>
      </div>

      <!-- Question Display -->
      <div v-else-if="currentQuestion" class="bg-white shadow-lg rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          {{ currentQuestion.title }}
        </h2>
        
        <img 
          v-if="currentQuestion.image" 
          :src="currentQuestion.image"
          :alt="currentQuestion.title"
          class="w-full max-w-md mx-auto mb-6 rounded-lg shadow-md"
        />
        
        <p class="text-lg text-gray-800 mb-6">
          {{ currentQuestion.text }}
        </p>
        
        <div class="space-y-3">
          <label 
            v-for="answer in currentQuestion.possibleAnswers" 
            :key="answer.id"
            class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition duration-200"
          >
            <input
              v-model="selectedAnswer"
              type="radio"
              :value="answer.id"
              name="answer"
              class="mr-3 text-blue-600"
            />
            <span class="text-gray-900">{{ answer.text }}</span>
          </label>
        </div>
        
        <div class="mt-6 flex justify-between">
          <button
            @click="goHome"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-200"
          >
            ← Abandonner
          </button>
          
          <button
            @click="nextQuestion"
            :disabled="!selectedAnswer"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
          >
            {{ isLastQuestion ? 'Terminer' : 'Suivant' }}
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <p class="text-red-600 mb-4">Erreur lors du chargement de la question</p>
        <button
          @click="goHome"
          class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import QuizApiService from '@/services/QuizApiService'
import ParticipationStorageService from '@/services/ParticipationStorageService'

const router = useRouter()
const currentQuestion = ref(null)
const currentPosition = ref(1)
const totalQuestions = ref(0)
const selectedAnswer = ref(null)
const answers = ref([])
const loading = ref(true)
const playerName = ref('')

const progressPercentage = computed(() => {
  if (!totalQuestions.value) return 0
  return (currentPosition.value / totalQuestions.value) * 100
})

const isLastQuestion = computed(() => {
  return currentPosition.value === totalQuestions.value
})

onMounted(async () => {
  playerName.value = ParticipationStorageService.getPlayerName()
  if (!playerName.value) {
    router.push('/new-quiz')
    return
  }
  
  await loadQuizInfo()
  await loadQuestion()
})

const loadQuizInfo = async () => {
  try {
    const response = await QuizApiService.getQuizInfo()
    totalQuestions.value = response.data.size
  } catch (error) {
    console.error('Failed to load quiz info:', error)
  }
}

const loadQuestion = async () => {
  loading.value = true
  try {
    const response = await QuizApiService.getQuestionByPosition(currentPosition.value)
    currentQuestion.value = response.data.question
    selectedAnswer.value = null
  } catch (error) {
    console.error('Failed to load question:', error)
    currentQuestion.value = null
  } finally {
    loading.value = false
  }
}

const nextQuestion = async () => {
  if (!selectedAnswer.value) return
  
  // Store the answer
  answers.value.push(selectedAnswer.value)
  
  if (isLastQuestion.value) {
    // Submit all answers
    await submitQuiz()
  } else {
    // Load next question
    currentPosition.value++
    await loadQuestion()
  }
}

const submitQuiz = async () => {
  try {
    const response = await QuizApiService.submitParticipation(playerName.value, answers.value)
    ParticipationStorageService.saveParticipationScore(response.data)
    router.push('/score')
  } catch (error) {
    console.error('Failed to submit quiz:', error)
    alert('Erreur lors de la soumission du quiz')
  }
}

const goHome = () => {
  ParticipationStorageService.clear()
  router.push('/')
}
</script>
