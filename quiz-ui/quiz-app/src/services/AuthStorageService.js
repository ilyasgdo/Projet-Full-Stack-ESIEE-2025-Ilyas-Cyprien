export default {
  saveToken(token) {
    window.localStorage.setItem('adminToken', token)
    // Store expiration time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).getTime()
    window.localStorage.setItem('adminTokenExpires', expiresAt.toString())
  },

  getToken() {
    const token = window.localStorage.getItem('adminToken')
    const expiresAt = window.localStorage.getItem('adminTokenExpires')
    
    if (!token || !expiresAt) {
      return null
    }

    // Check if token is expired
    if (Date.now() > parseInt(expiresAt)) {
      this.clearToken()
      return null
    }

    return token
  },

  clearToken() {
    window.localStorage.removeItem('adminToken')
    window.localStorage.removeItem('adminTokenExpires')
  },

  isAuthenticated() {
    return this.getToken() !== null
  }
}
