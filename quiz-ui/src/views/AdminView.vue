<template>
  <div class="py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
      <h1 class="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Administration</h1>

      <!-- Login Form -->
      <div v-if="!isAuthenticated">
        <Card class="max-w-md mx-auto">
          <CardHeader>
            <CardTitle class="text-center">Connexion Administrateur</CardTitle>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="login" class="space-y-4">
              <div class="space-y-2">
                <label for="password" class="block text-sm font-medium mb-2">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  placeholder="Entrez le mot de passe administrateur"
                />
              </div>
              
              <Button type="submit" class="w-full gap-2" size="lg" :disabled="loginLoading">
                <Loader2 v-if="loginLoading" class="h-4 w-4 animate-spin" />
                {{ loginLoading ? 'Connexion...' : 'Se connecter' }}
              </Button>
              <p v-if="loginError" class="text-center text-sm text-destructive">{{ loginError }}</p>
            </form>
          </CardContent>
        </Card>
      </div>

      <!-- Admin Dashboard -->
      <div v-else class="space-y-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 class="text-2xl font-semibold">Tableau de bord</h2>
          <Button variant="ghost" as-child>
            <button @click="logout" aria-label="Se déconnecter">
              Déconnexion
            </button>
          </Button>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Questions Management -->
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Questions</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <p class="text-muted-foreground">
                Gérez les questions du quiz, ajoutez de nouvelles questions ou modifiez les existantes.
              </p>
              <Button class="w-full sm:w-auto" aria-label="Gérer les questions">
                <router-link to="/admin/questions">
                  Gérer les Questions
                </router-link>
              </Button>
            </CardContent>
          </Card>

          <!-- Participations Management -->
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Participations</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <p class="text-muted-foreground">
                Consultez les participations et gérez les scores des utilisateurs.
              </p>
              <div class="space-y-2">
                <Button variant="outline" class="w-full sm:w-auto" aria-label="Voir les participations">
                  Voir les Participations
                </Button>
                <Button 
                  variant="destructive" 
                  @click="confirmDeleteParticipations"
                  class="w-full sm:w-auto gap-2"
                  :disabled="deletingParticipations"
                  :aria-disabled="deletingParticipations ? 'true' : 'false'"
                  aria-label="Supprimer toutes les participations"
                >
                  <Loader2 v-if="deletingParticipations" class="h-4 w-4 animate-spin" />
                  {{ deletingParticipations ? 'Suppression...' : 'Supprimer Toutes les Participations' }}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Loader2 } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import QuizApiService from '@/services/QuizApiService'
import AuthStorageService from '@/services/AuthStorageService'
import NotificationService from '@/services/NotificationService'

const isAuthenticated = ref(false)
const password = ref('')
const loginError = ref('')
const loginLoading = ref(false)
const deletingParticipations = ref(false)

onMounted(() => {
  isAuthenticated.value = AuthStorageService.isAuthenticated()
})

const login = async () => {
  loginLoading.value = true
  loginError.value = ''
  
  try {
    const response = await QuizApiService.adminLogin(password.value)
    AuthStorageService.saveToken(response.data.token)
    isAuthenticated.value = true
    password.value = ''
    NotificationService.success('Connexion réussie')
  } catch (error) {
    loginError.value = 'Mauvais mot de passe'
    NotificationService.error('Échec de la connexion')
  } finally {
    loginLoading.value = false
  }
}

const logout = () => {
  AuthStorageService.clearToken()
  isAuthenticated.value = false
}

const confirmDeleteParticipations = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer toutes les participations ?')) {
    deleteAllParticipations()
  }
}

const deleteAllParticipations = async () => {
  try {
    deletingParticipations.value = true
    const token = AuthStorageService.getToken()
    await QuizApiService.deleteAllParticipations(token)
    NotificationService.success('Toutes les participations ont été supprimées')
  } catch (error) {
    NotificationService.handleApiError(error)
  } finally {
    deletingParticipations.value = false
  }
}
</script>
