<template>
  <div class="py-8">
    <div class="max-w-2xl mx-auto">
      <Card class="glass-card p-8 text-center">
        <div class="mb-6">
          <div class="text-6xl mb-4">
            <span ref="partyEmoji" class="party-emoji" aria-hidden="true">🎉</span>
          </div>
          <h1 class="text-3xl font-bold mb-2 text-gradient">Quiz Terminé !</h1>
          <p class="text-lg text-muted-foreground">Félicitations {{ playerName }}</p>
        </div>

        <div v-if="participationScore" class="mb-8">
          <Card class="bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/30 backdrop-blur p-6 mb-6 shadow-[0_0_25px_rgba(59,130,246,0.25)]">
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
              class="glass-card p-3"
              >
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Question {{ index + 1 }}</span>
                  <div class="flex items-center gap-2">
                    <span :class="summary.wasCorrect ? 'text-green-500' : 'text-red-500'">
                      {{ summary.wasCorrect ? 'Correct' : 'Faux' }}
                    </span>
                    <span class="font-semibold">
                      {{ summary.wasCorrect ? '✓ Correct' : '✗ Incorrect' }}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <Button
            @click="playAgain"
            variant="gradient"
            class="w-full hover-float hover-glow"
            size="lg"
          >
                       Rejouer
                     </Button>
                    
                    <Button
                      as-child
                      variant="outline"
                      class="w-full hover-float"
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
import { gsap } from 'gsap'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ParticipationStorageService from '@/services/ParticipationStorageService'
import QuizApiService from '@/services/QuizApiService'

const router = useRouter()
const participationScore = ref(null)
const playerName = ref('')
const partyEmoji = ref(null)

onMounted(() => {
  participationScore.value = ParticipationStorageService.getParticipationScore()
  playerName.value = ParticipationStorageService.getPlayerName()
  
  if (!participationScore.value || !playerName.value) {
    router.push('/')
  }
  // Gentle left-right wave for the party emoji
  if (partyEmoji.value) {
    gsap.to(partyEmoji.value, {
      rotation: 15,
      duration: 1,
      transformOrigin: '30% 70%',
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    })
  }
})

const playAgain = () => {
  ParticipationStorageService.clear()
  router.push('/new-quiz')
}
</script>

<style scoped>
.party-emoji {
  display: inline-block;
  will-change: transform;
}
</style>
