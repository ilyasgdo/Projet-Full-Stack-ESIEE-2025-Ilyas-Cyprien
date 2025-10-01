<template>
  <div class="py-8">
    <div class="max-w-md mx-auto">
      <Card class="p-6">
        <h1 class="text-2xl font-bold mb-6 text-center">Nouveau Quiz</h1>
        
        <form @submit.prevent="startQuiz">
          <div class="mb-4">
            <label for="playerName" class="block text-sm font-medium mb-2">
              Votre nom
            </label>
            <input
              id="playerName"
              v-model="playerName"
              type="text"
              required
              class="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              placeholder="Entrez votre nom"
            />
          </div>
          
          <Button
            type="submit"
            :disabled="!playerName.trim()"
            class="w-full"
            size="lg"
          >
            Commencer le Quiz
          </Button>
        </form>
        
        <div class="mt-4 text-center">
          <Button variant="link" as-child>
            <router-link to="/">
              ← Retour à l'accueil
            </router-link>
          </Button>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ParticipationStorageService from '@/services/ParticipationStorageService'

const router = useRouter()
const playerName = ref('')

const startQuiz = () => {
  if (playerName.value.trim()) {
    ParticipationStorageService.savePlayerName(playerName.value.trim())
    router.push('/quiz')
  }
}
</script>
