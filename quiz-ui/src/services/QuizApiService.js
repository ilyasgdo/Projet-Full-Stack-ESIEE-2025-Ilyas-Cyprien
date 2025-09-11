import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  json: true
})

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
      throw error
    }
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
      player_name: playerName,
      answers: answers
    })
  },

  // Auth endpoint
  adminLogin(password) {
    return this.call('post', '/login', { password })
  },

  // Admin endpoints (require token)
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
