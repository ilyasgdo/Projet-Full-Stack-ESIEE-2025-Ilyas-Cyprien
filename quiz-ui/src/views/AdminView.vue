<template>
  <div class="py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-center mb-8">Administration</h1>

      <!-- Login Form -->
      <div v-if="!isAuthenticated">
        <Card class="max-w-md mx-auto">
          <CardHeader>
            <CardTitle class="text-center">Connexion Administrateur</CardTitle>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="login" class="space-y-4">
              <div>
                <label for="password" class="block text-sm font-medium mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  class="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Entrez le mot de passe administrateur"
                />
              </div>
              
              <Button type="submit" class="w-full" size="lg">
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <!-- Admin Dashboard -->
      <div v-else class="space-y-8">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-semibold">Tableau de bord</h2>
          <Button variant="ghost" as-child>
            <button @click="logout">
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
              <Button class="w-full sm:w-auto">
                <router-link to="/questions">
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
                <Button variant="outline" class="w-full sm:w-auto">
                  Voir les Participations
                </Button>
                <Button 
                  variant="destructive" 
                  @click="confirmDeleteParticipations"
                  class="w-full sm:w-auto"
                >
                  Supprimer Toutes les Participations
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
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import QuizApiService from '@/services/QuizApiService'
import AuthStorageService from '@/services/AuthStorageService'

const isAuthenticated = ref(false)
const password = ref('')
const loginError = ref('')
const loginLoading = ref(false)

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
  } catch (error) {
    loginError.value = 'Mot de passe incorrect'
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
    const token = AuthStorageService.getToken()
    await QuizApiService.deleteAllParticipations(token)
    alert('Toutes les participations ont été supprimées')
  } catch (error) {
    alert('Erreur lors de la suppression des participations')
  }
}
</script>
