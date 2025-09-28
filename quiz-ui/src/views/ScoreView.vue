<template>
  <div class="py-8">
    <div class="max-w-2xl mx-auto">
      <Card class="p-8 text-center">
        <div class="mb-6">
          <div class="text-6xl mb-4">🎉</div>
          <h1 class="text-3xl font-bold mb-2">Quiz Terminé !</h1>
          <p class="text-lg text-muted-foreground">Félicitations {{ playerName }}</p>
        </div>

        <div v-if="participationScore" class="mb-8">
          <Card class="bg-primary/5 p-6 mb-6">
            <div class="text-4xl font-bold text-primary mb-2">
              {{ participationScore.score }}
            </div>
            <p class="text-muted-foreground">Bonnes réponses</p>
          </Card>

          <!-- Detailed Results -->
          <div v-if="participationScore.answersSummaries" class="text-left mb-6">
            <h3 class="text-lg font-semibold mb-4">Détail de vos réponses :</h3>
            <div class="space-y-2">
              <Card 
                v-for="(summary, index) in participationScore.answersSummaries" 
                :key="index"
                class="p-3"
              >
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Question {{ index + 1 }}</span>
                  <span 
                    :class="summary.wasCorrect ? 'text-green-600' : 'text-red-600'"
                    class="font-semibold"
                  >
                    {{ summary.wasCorrect ? '✓ Correct' : '✗ Incorrect' }}
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <Button
            @click="playAgain"
            class="w-full"
            size="lg"
          >
            Rejouer
          </Button>
          
          <Button
            as-child
            variant="outline"
            class="w-full"
            size="lg"
          >
            <router-link to="/">
              Retour à l'accueil
            </router-link>
          </Button>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ParticipationStorageService from '@/services/ParticipationStorageService'
import QuizApiService from '@/services/QuizApiService'

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
