<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Administration</h1>
      
      <!-- Login Form -->
      <div v-if="!isAuthenticated" class="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6 text-center">Connexion Administrateur</h2>
        
        <form @submit.prevent="login">
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Entrez le mot de passe admin"
            />
          </div>
          
          <div v-if="loginError" class="mb-4 text-red-600 text-sm">
            {{ loginError }}
          </div>
          
          <button
            type="submit"
            :disabled="loginLoading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md transition duration-200"
          >
            {{ loginLoading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>
        
        <div class="mt-4 text-center">
          <router-link 
            to="/"
            class="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Retour à l'accueil
          </router-link>
        </div>
      </div>

      <!-- Admin Dashboard -->
      <div v-else>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Tableau de bord</h2>
          <button
            @click="logout"
            class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Déconnexion
          </button>
        </div>
        
        <div class="bg-white shadow-lg rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Actions disponibles</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 border border-gray-200 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Gestion des Questions</h4>
              <p class="text-sm text-gray-600 mb-3">Créer, modifier et supprimer les questions du quiz</p>
              <button class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200">
                Gérer les Questions
              </button>
            </div>
            
            <div class="p-4 border border-gray-200 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Gestion des Participations</h4>
              <p class="text-sm text-gray-600 mb-3">Voir et supprimer les participations enregistrées</p>
              <button 
                @click="confirmDeleteParticipations"
                class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition duration-200"
              >
                Supprimer Participations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
