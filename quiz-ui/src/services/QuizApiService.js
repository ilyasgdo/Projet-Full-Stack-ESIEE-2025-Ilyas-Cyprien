import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  json: true,
  timeout: 10000 // 10 secondes timeout
})

// Intercepteur pour les réponses d'erreur
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Améliorer les messages d'erreur
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      const status = error.response.status
      const errorData = error.response.data
      
      let errorMessage = 'Erreur serveur'
      
      // Messages d'erreur spécifiques selon le code de statut
      switch (status) {
        case 400:
          errorMessage = errorData?.error || 'Données invalides'
          break
        case 401:
          errorMessage = 'Non autorisé. Veuillez vous reconnecter.'
          break
        case 403:
          errorMessage = 'Accès interdit'
          break
        case 404:
          errorMessage = 'Ressource non trouvée'
          break
        case 413:
          errorMessage = 'Fichier trop volumineux. Taille maximale: 1MB'
          break
        case 422:
          errorMessage = errorData?.error || 'Données non valides'
          break
        case 500:
          errorMessage = 'Erreur interne du serveur'
          break
        case 503:
          errorMessage = 'Service temporairement indisponible'
          break
        default:
          errorMessage = errorData?.error || error.response.statusText || 'Erreur serveur'
      }
      
      error.userMessage = errorMessage
      error.statusCode = status
    } else if (error.request) {
      // La requête a été faite mais pas de réponse
      if (error.code === 'ECONNABORTED') {
        error.userMessage = 'Délai d\'attente dépassé. Veuillez réessayer.'
      } else {
        error.userMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.'
      }
      error.statusCode = 0
    } else {
      // Erreur dans la configuration de la requête
      error.userMessage = 'Erreur de configuration de la requête'
      error.statusCode = -1
    }
    return Promise.reject(error)
  }
)

export default {
  async call(method, resource, data = null, token = null) {
    const headers = {
      'Content-Type': 'application/json',
    }
    if (token != null) {
      headers.authorization = 'Bearer ' + token
    }

    try {
      const response = await instance({
        method,
        headers: headers,
        url: resource,
        data,
      })
      return { status: response.status, data: response.data }
    } catch (error) {
      console.error('API Error:', error)
      
      // Retry logic for certain errors
      if (this.shouldRetry(error) && !error._retryCount) {
        error._retryCount = 1
        console.log('Retrying request...')
        await this.delay(1000) // Wait 1 second before retry
        return this.call(method, resource, data, token)
      }
      
      // Relancer l'erreur avec les informations améliorées
      throw error
    }
  },

  // Helper method to determine if we should retry
  shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600)
  },

  // Helper method for delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  // Public endpoints
  getQuizInfo() {
    return this.call('get', '/quiz-info')
  },

  getQuestionById(id) {
    return this.call('get', `/questions/${id}`)
  },

  getQuestionByPosition(position) {
    return this.call('get', `/questions?position=${position}`)
  },

  submitParticipation(playerName, answers) {
    return this.call('post', '/participations', {
      playerName: playerName,
      answers: answers
    })
  },

  // Auth endpoint
  adminLogin(password) {
    return this.call('post', '/login', { password })
  },

  // Admin endpoints (require token)
  getAllQuestions(token) {
    return this.call('get', '/questions/all', null, token)
  },

  createQuestion(questionData, token) {
    return this.call('post', '/questions', questionData, token)
  },

  updateQuestion(id, questionData, token) {
    return this.call('put', `/questions/${id}`, questionData, token)
  },

  deleteQuestion(id, token) {
    return this.call('delete', `/questions/${id}`, null, token)
  },

  deleteAllQuestions(token) {
    return this.call('delete', '/questions/all', null, token)
  },

  deleteAllParticipations(token) {
    return this.call('delete', '/participations/all', null, token)
  }
}
