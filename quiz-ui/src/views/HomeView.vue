<template>
  <div class="py-8">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">Bienvenue au Quiz</h1>
      <p class="text-xl text-muted-foreground mb-8">Testez vos connaissances et défiez-vous !</p>
      <Button as-child size="lg" class="text-lg px-8 py-3">
        <router-link to="/new-quiz">
          Participer au Quiz
        </router-link>
      </Button>
    </div>

    <!-- Scores Section -->
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold text-center mb-8">🏆 Meilleurs Scores</h2>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-2 text-muted-foreground">Chargement des scores...</p>
      </div>

      <!-- No Scores Message -->
      <Card v-else-if="scores.length === 0" class="text-center py-12">
        <p class="text-muted-foreground">Aucun score disponible pour le moment.</p>
        <p class="text-sm text-muted-foreground mt-2">Soyez le premier à jouer !</p>
      </Card>

      <!-- Desktop Table -->
      <Card v-if="scores.length > 0" class="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-20">Rang</TableHead>
              <TableHead>Joueur</TableHead>
              <TableHead>Score</TableHead>
              <TableHead class="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(score, index) in scores" :key="index">
              <TableCell class="font-medium">
                <div class="flex items-center">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                        :class="getRankClass(index)">
                    {{ index + 1 }}
                  </span>
                </div>
              </TableCell>
              <TableCell class="font-medium">{{ score.playerName }}</TableCell>
              <TableCell>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {{ score.score }}
                </span>
              </TableCell>
              <TableCell class="text-right text-muted-foreground">{{ score.date }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <!-- Mobile Cards -->
      <div v-if="scores.length > 0" class="space-y-4 sm:hidden" role="list" aria-label="Liste des meilleurs scores">
        <Card v-for="(score, index) in scores" :key="index" role="listitem" :aria-label="`Rang ${index + 1}, ${score.playerName}, Score ${score.score}`">
          <CardContent class="p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-3">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                      :class="getRankClass(index)"
                      :aria-label="`Rang ${index + 1}`">
                  {{ index + 1 }}
                </span>
                <span class="font-medium text-foreground">{{ score.playerName }}</span>
              </div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary" :aria-label="`Score ${score.score}`">
                {{ score.score }}
              </span>
            </div>
            <p class="text-sm text-muted-foreground" :aria-label="`Date ${score.date}`">{{ score.date }}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import QuizApiService from '@/services/QuizApiService'
import NotificationService from '@/services/NotificationService'

const scores = ref([])
const loading = ref(true)

const getRankClass = (index) => {
  switch (index) {
    case 0:
      return 'bg-yellow-500 text-yellow-50' // Gold
    case 1:
      return 'bg-gray-400 text-gray-50' // Silver
    case 2:
      return 'bg-amber-600 text-amber-50' // Bronze
    default:
      return 'bg-muted text-muted-foreground'
  }
}

onMounted(async () => {
  try {
    const response = await QuizApiService.getQuizInfo()
    scores.value = response.data.scores || []
  } catch (error) {
    console.error('Failed to load quiz info:', error)
    NotificationService.handleApiError(error)
  } finally {
    loading.value = false
  }
})
</script>
