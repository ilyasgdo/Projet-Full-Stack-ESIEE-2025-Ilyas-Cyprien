<template>
  <div class="py-8">
    <div class="max-w-4xl mx-auto">
      <div v-if="loading && !currentQuestion && !noQuestions" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-muted-foreground">Chargement des questions...</p>
      </div>

      <div v-else-if="noQuestions" class="text-center">
        <div class="text-6xl mb-4">📝</div>
        <h2 class="text-2xl font-bold mb-2">Aucune question disponible</h2>
        <p class="text-muted-foreground mb-6">
          Il n'y a actuellement aucune question dans le quiz. Veuillez contacter l'administrateur.
        </p>
        <Button variant="outline" @click="goHome" class="hover-float">
          Retour à l'accueil
        </Button>
      </div>

      <div v-else-if="!currentQuestion && !loading" class="text-center">
        <div class="text-6xl mb-4">❌</div>
        <h2 class="text-2xl font-bold mb-2">Erreur</h2>
        <p class="text-destructive mb-6">Erreur lors du chargement de la question</p>
        <Button variant="outline" @click="goHome" class="hover-float">
          Retour à l'accueil
        </Button>
      </div>

      <div v-else-if="currentQuestion">
        <div class="mb-8 glass-card p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-muted-foreground">
              Question {{ currentPosition }} sur {{ totalQuestions || '?' }}
            </span>
            <span class="text-sm text-muted-foreground">
              {{ Math.round(progressPercentage) }}%
            </span>
          </div>
          <div class="w-full bg-secondary/50 rounded-full h-2 border border-primary/20">
            <div 
              class="bg-primary animate-gradient-x h-2 rounded-full transition-all duration-300 shadow-[0_0_16px_rgba(59,130,246,0.45)]"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>

        <div ref="questionContainer" class="question-container">
          <QuestionDisplay 
            :current-question="currentQuestion"
            @click-on-answer="answerClickedHandler"
            @request-next="nextQuestion"
          />
        </div>

        <div class="flex justify-between items-center">
          <Button
            variant="ghost"
            @click="goHome"
            class="text-muted-foreground hover-float"
            aria-label="Abandonner et retourner à l'accueil"
          >
            ← Abandonner
          </Button>
          
          <Button
            @click="nextQuestion"
            :disabled="!selectedAnswer || submitting"
            size="lg"
            class="gap-2 hover-float hover-glow"
            variant="gradient"
            :aria-disabled="!selectedAnswer || submitting ? 'true' : 'false'"
            :aria-label="submitting ? 'Envoi en cours' : (isLastQuestion ? 'Terminer le quiz' : 'Question suivante')"
          >
            <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
            {{ submitting ? 'Envoi...' : (isLastQuestion ? 'Terminer' : 'Suivant') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import QuestionDisplay from '@/components/QuestionDisplay.vue'
import QuizApiService from '@/services/QuizApiService'
import NotificationService from '@/services/NotificationService'
import ParticipationStorageService from '@/services/ParticipationStorageService'
import { gsap } from 'gsap'

const router = useRouter()

const questionContainer = ref(null)

const currentQuestion = ref(null)
const currentPosition = ref(1)
const totalQuestions = ref(0)
const selectedAnswer = ref(null)
const answers = ref([])
const loading = ref(true)
const submitting = ref(false)
const playerName = ref('')
const noQuestions = ref(false)

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
  
  if (totalQuestions.value === 0) {
    noQuestions.value = true
    loading.value = false
    return
  }
  
  await loadQuestionByPosition(currentPosition.value)
})

const loadQuizInfo = async () => {
  try {
    const response = await QuizApiService.getQuizInfo()
    totalQuestions.value = response.data.size || 0
  } catch (error) {
    console.error('Failed to load quiz info:', error)
    NotificationService.handleApiError(error)
    totalQuestions.value = 0
  }
}

const loadQuestionByPosition = async (position) => {
  loading.value = true
  
  if (currentQuestion.value && questionContainer.value) {
    await gsap.to(questionContainer.value, {
      autoAlpha: 0,
      xPercent: -100,
      duration: 0.45,
      ease: 'power3.inOut'
    })
  }
  
  try {
    const response = await QuizApiService.getQuestionByPosition(position)
    currentQuestion.value = response.data
    selectedAnswer.value = null
    
    if (questionContainer.value) {
      gsap.set(questionContainer.value, { autoAlpha: 0, xPercent: 100 })
      gsap.to(questionContainer.value, {
        autoAlpha: 1,
        xPercent: 0,
        duration: 0.5,
        ease: 'power3.inOut'
      })
    }
  } catch (error) {
    console.error('Failed to load question:', error)
    NotificationService.handleApiError(error)
    currentQuestion.value = null
  } finally {
    loading.value = false
  }
}

const answerClickedHandler = (answerIndex) => {
  selectedAnswer.value = answerIndex
}

const nextQuestion = async () => {
  if (!selectedAnswer.value) return
  
  submitting.value = true
  
  try {
    answers.value.push(selectedAnswer.value)
    
    if (isLastQuestion.value) {
      await endQuiz()
    } else {
      currentPosition.value++
      await loadQuestionByPosition(currentPosition.value)
    }
  } finally {
    submitting.value = false
  }
}

const endQuiz = async () => {
  try {
    const response = await QuizApiService.submitParticipation(playerName.value, answers.value)
    ParticipationStorageService.saveParticipationScore(response.data)
    router.push('/score')
  } catch (error) {
    console.error('Failed to submit quiz:', error)
    NotificationService.handleApiError(error)
  }
}

const goHome = () => {
  ParticipationStorageService.clear()
  router.push('/')
}
</script>

<style scoped>
.question-container {
  transform-origin: center;
  overflow: hidden;
  will-change: transform, opacity;
}
</style>