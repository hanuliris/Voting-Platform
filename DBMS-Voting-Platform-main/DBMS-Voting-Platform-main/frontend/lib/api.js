import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },
}

// Poll API
export const pollApi = {
  getAllPolls: async () => {
    const response = await api.get('/polls')
    return response.data
  },
  
  getPollById: async (id) => {
    const response = await api.get(`/polls/${id}`)
    return response.data
  },
  
  createPoll: async (pollData) => {
    const response = await api.post('/polls', pollData)
    return response.data
  },
  
  updatePoll: async (id, pollData) => {
    const response = await api.put(`/polls/${id}`, pollData)
    return response.data
  },
  
  deletePoll: async (id) => {
    const response = await api.delete(`/polls/${id}`)
    return response.data
  },
  
  deleteAllPolls: async () => {
    const response = await api.delete('/polls/all')
    return response.data
  },
  
  deleteActivePolls: async () => {
    const response = await api.delete('/polls/active')
    return response.data
  },
  
  getActivePolls: async () => {
    const response = await api.get('/polls/active')
    return response.data
  },
}

export const adminApi = {
  importVoters: async (formData) => {
    const response = await api.post('/admin/voters/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  searchVoters: async (query) => {
    const response = await api.get('/admin/voters/search', {
      params: { q: query },
    })
    return response.data
  },

  deleteAllVoters: async () => {
    const response = await api.delete('/admin/voters/all')
    return response.data
  },
}

export const ledgerApi = {
  getEntries: async () => {
    const response = await api.get('/ledger')
    return response.data
  },

  getLatest: async () => {
    const response = await api.get('/ledger/latest')
    return response.data
  },
}

// Candidate API
export const candidateApi = {
  getCandidatesByPollId: async (pollId) => {
    const response = await api.get(`/polls/${pollId}/candidates`)
    return response.data
  },
  
  addCandidate: async (pollId, candidateData) => {
    const response = await api.post(`/polls/${pollId}/candidates`, candidateData)
    return response.data
  },
  
  updateCandidate: async (candidateId, candidateData) => {
    const response = await api.put(`/candidates/${candidateId}`, candidateData)
    return response.data
  },
  
  deleteCandidate: async (candidateId) => {
    const response = await api.delete(`/candidates/${candidateId}`)
    return response.data
  },
}

// Vote API
export const voteApi = {
  castVote: async (voteData) => {
    const response = await api.post('/votes', voteData)
    return response.data
  },
  
  hasUserVoted: async (pollId) => {
    const response = await api.get(`/votes/poll/${pollId}/user`)
    return response.data
  },
  
  getVoteHistory: async () => {
    const response = await api.get('/votes/history')
    return response.data
  },
  
  getPollResults: async (pollId) => {
    const response = await api.get(`/votes/poll/${pollId}/results`)
    return response.data
  },
}

export default api
