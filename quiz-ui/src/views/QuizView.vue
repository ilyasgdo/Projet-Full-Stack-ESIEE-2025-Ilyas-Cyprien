<template>
  <div class="py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-muted-foreground">Chargement des questions...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="!currentQuestion" class="text-center">
        <div class="text-6xl mb-4">❌</div>
        <h2 class="text-2xl font-bold mb-2">Erreur</h2>
        <p class="text-destructive mb-6">Erreur lors du chargement de la question</p>
        <Button variant="outline" @click="goHome">
          Retour à l'accueil
        </Button>
      </div>

      <!-- Quiz Content -->
      <div v-else-if="currentQuestion">
        <!-- Progress Bar -->
        <div class="mb-8">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-muted-foreground">
              Question {{ currentPosition }} sur {{ totalQuestions || '?' }}
            </span>
            <span class="text-sm text-muted-foreground">
              {{ Math.round(progressPercentage) }}%
            </span>
          </div>
          <div class="w-full bg-secondary rounded-full h-2">
            <div 
              class="bg-primary h-2 rounded-full transition-all duration-300"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="bg-card rounded-lg border p-6 mb-6">
          <h2 class="text-xl font-semibold mb-6">{{ currentQuestion.title }}</h2>
          
          <img 
            v-if="currentQuestion.image" 
            :src="currentQuestion.image"
            :alt="currentQuestion.title"
            class="w-full max-w-md mx-auto mb-6 rounded-lg shadow-md"
          />
          
          <p v-if="currentQuestion.text" class="text-lg mb-6">
            {{ currentQuestion.text }}
          </p>
          
          <div class="space-y-3">
            <button
              v-for="(answer, idx) in currentQuestion.possibleAnswers"
              :key="answer.id"
              @click="selectedAnswer = idx + 1"
              :class="[
                'w-full p-4 text-left rounded-lg border transition-all duration-200',
                selectedAnswer === (idx + 1)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 hover:bg-accent'
              ]"
            >
              <div class="flex items-center">
                <div 
                  :class="[
                    'w-4 h-4 rounded-full border-2 mr-3 transition-all',
                    selectedAnswer === (idx + 1)
                      ? 'border-primary bg-primary'
                      : 'border-border'
                  ]"
                ></div>
                {{ answer.text }}
              </div>
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between items-center">
          <Button
            variant="ghost"
            @click="goHome"
            class="text-muted-foreground"
          >
            ← Abandonner
          </Button>
          
          <Button
            @click="nextQuestion"
            :disabled="!selectedAnswer"
            size="lg"
          >
            {{ isLastQuestion ? 'Terminer' : 'Suivant' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
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
    // The API returns the question directly, not wrapped in a 'question' property
    currentQuestion.value = response.data
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
