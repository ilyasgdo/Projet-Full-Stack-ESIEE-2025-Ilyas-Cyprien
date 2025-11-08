<template>
  <div class="flex flex-col min-h-full w-full">
    <!-- Hero Section -->
    <div class="text-center flex-1 flex flex-col justify-center items-center py-12 px-4">
      <h1 class="text-5xl sm:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent drop-shadow-[0_2px_10px_rgba(59,130,246,0.25)]">Bienvenue au Quiz de Mathématiques</h1>
      <p class="text-xl text-muted-foreground mb-8">Testez vos connaissances en algèbre, géométrie et analyse !</p>
      <Button variant="gradient" as-child size="lg" class="text-lg px-8 py-3 shadow-lg shadow-primary/30 hover:shadow-[0_0_25px_rgba(59,130,246,0.45)] hover:-translate-y-[1px] hover-float hover-glow transition-all duration-300">
        <router-link to="/new-quiz">
          Participer au Quiz
        </router-link>
      </Button>
      <div class="flex justify-center gap-2 mt-6">
        <span class="math-badge" aria-label="Somme">∑</span>
        <span class="math-badge" aria-label="Intégrale">∫</span>
        <span class="math-badge" aria-label="Pi">π</span>
        <span class="math-badge" aria-label="Racine">√</span>
        <span class="math-badge" aria-label="Infini">∞</span>
        <span class="math-badge" aria-label="Delta">Δ</span>
      </div>
    </div>

    <!-- Scores Section -->
    <div class="max-w-4xl mx-auto w-full px-4 pb-8">
      <h2 class="text-2xl font-bold text-center mb-8 text-gradient with-gradient-underline">🏆 Meilleurs Scores</h2>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-2 text-muted-foreground">Chargement des scores...</p>
      </div>

      <!-- No Scores Message -->
      <Card v-else-if="scores.length === 0" class="text-center py-12 glass-card p-6">
        <p class="text-muted-foreground">Aucun score disponible pour le moment.</p>
        <p class="text-sm text-muted-foreground mt-2">Soyez le premier à jouer !</p>
      </Card>

      <!-- Desktop Table -->
<Card v-if="scores.length > 0" class="hidden sm:block glass-card">
       <Table>
          <TableHeader class="bg-gradient-to-r from-primary/10 to-accent/10">
            <TableRow>
              <TableHead class="w-20">Rang</TableHead>
              <TableHead>Joueur</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(score, index) in scores" :key="index" class="hover:bg-muted/50 transition-all">
              <TableCell class="font-medium">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                      :class="getRankClass(index)"
                      :aria-label="`Rang ${index + 1}`">
                  {{ index + 1 }}
                </span>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-3">
                  <span class="font-medium text-foreground">{{ score.playerName }}</span>
                </div>
              </TableCell>
              <TableCell>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover-glow" :aria-label="`Score ${score.score}`">
                  {{ score.score }}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <!-- Mobile Cards -->
      <div v-if="scores.length > 0" class="sm:hidden space-y-4">
        <Card v-for="(score, index) in scores" :key="index" class="p-4 hover-glow glass-card">
          <CardContent class="flex items-center justify-between">
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
