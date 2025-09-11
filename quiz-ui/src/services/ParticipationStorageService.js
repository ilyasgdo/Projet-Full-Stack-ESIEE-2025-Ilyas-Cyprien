export default {
  clear() {
    window.localStorage.removeItem('playerName')
    window.localStorage.removeItem('participationScore')
  },

  savePlayerName(playerName) {
    window.localStorage.setItem('playerName', playerName)
  },

  getPlayerName() {
    return window.localStorage.getItem('playerName')
  },

  saveParticipationScore(participationScore) {
    window.localStorage.setItem('participationScore', JSON.stringify(participationScore))
  },

  getParticipationScore() {
    const score = window.localStorage.getItem('participationScore')
    return score ? JSON.parse(score) : null
  }
}
