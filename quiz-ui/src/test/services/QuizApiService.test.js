import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock axios before importing the service
vi.mock('axios', () => {
  // Create a single shared mock instance so service and tests use the same one
  const mockInstance = vi.fn()
  mockInstance.interceptors = {
    response: {
      use: vi.fn()
    }
  }
  mockInstance.get = vi.fn()
  mockInstance.post = vi.fn()
  mockInstance.put = vi.fn()
  mockInstance.delete = vi.fn()

  return {
    default: {
      create: vi.fn(() => mockInstance)
    }
  }
})

import QuizApiService from '@/services/QuizApiService'
import axios from 'axios'

const mockedAxios = axios.create()

describe('QuizApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getQuizInfo', () => {
    it('fetches quiz info successfully', async () => {
      const mockResponse = {
        data: {
          size: 10,
          scores: []
        }
      }
      
      mockedAxios.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.getQuizInfo()
      
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
        url: '/quiz-info',
        data: null
      })
      expect(result).toEqual(mockResponse)
    })

    it('handles error when fetching quiz info', async () => {
      const mockError = new Error('Network error')
      mockedAxios.mockRejectedValue(mockError)
      
      await expect(QuizApiService.getQuizInfo()).rejects.toThrow('Network error')
    })
  })

  describe('getQuestionByPosition', () => {
    it('fetches question by position successfully', async () => {
      const mockResponse = {
        data: {
          id: 1,
          title: 'Test Question',
          possibleAnswers: []
        }
      }
      
      mockedAxios.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.getQuestionByPosition(1)
      
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
        url: '/questions?position=1',
        data: null
      })
      expect(result).toEqual(mockResponse)
    })

    it('handles error when fetching question', async () => {
      const mockError = new Error('Question not found')
      mockedAxios.mockRejectedValue(mockError)
      
      await expect(QuizApiService.getQuestionByPosition(999)).rejects.toThrow('Question not found')
    })
  })

  describe('postParticipation', () => {
    it('posts participation successfully', async () => {
      const mockResponse = {
        data: {
          score: 8,
          answers: []
        }
      }
      
      const participationData = {
        playerName: 'John Doe',
        answers: [1, 2, 3, 4]
      }
      
      mockedAxios.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.submitParticipation(participationData.playerName, participationData.answers)
      
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        url: '/participations',
        data: participationData
      })
      expect(result).toEqual(mockResponse)
    })

    it('handles error when posting participation', async () => {
      const mockError = new Error('Validation error')
      const participationData = { playerName: '', answers: [] }
      
      mockedAxios.mockRejectedValue(mockError)
      
      await expect(QuizApiService.submitParticipation(participationData.playerName, participationData.answers)).rejects.toThrow('Validation error')
    })
  })

  describe('login', () => {
    it('logs in successfully', async () => {
      const mockResponse = {
        data: {
          token: 'jwt-token-123'
        }
      }
      
      mockedAxios.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.adminLogin('password123')
      
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        url: '/login',
        data: { password: 'password123' }
      })
      expect(result).toEqual(mockResponse)
    })

    it('handles login error', async () => {
      const mockError = new Error('Invalid credentials')
      mockedAxios.mockRejectedValue(mockError)
      
      await expect(QuizApiService.adminLogin('wrongpassword')).rejects.toThrow('Invalid credentials')
    })
  })

  describe('getAllQuestions', () => {
    it('fetches all questions with token successfully', async () => {
      const mockResponse = {
        data: {
          questions: [
            { id: 1, title: 'Question 1' },
            { id: 2, title: 'Question 2' }
          ]
        }
      }
      
      mockedAxios.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.getAllQuestions('jwt-token-123')
      
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer jwt-token-123'
        },
        url: '/questions/all',
        data: null
      })
      expect(result).toEqual(mockResponse)
    })

    it('handles unauthorized error', async () => {
      const mockError = new Error('Unauthorized')
      mockedAxios.mockRejectedValue(mockError)
      
      await expect(QuizApiService.getAllQuestions('invalid-token')).rejects.toThrow('Unauthorized')
    })
  })

  describe('createQuestion', () => {
    it('creates question successfully', async () => {
      const mockResponse = {
        data: {
          id: 1,
          title: 'New Question'
        }
      }
      
      const questionData = {
        title: 'New Question',
        text: 'Question text',
        image: null,
        possibleAnswers: [
          { text: 'Answer 1' },
          { text: 'Answer 2' }
        ],
        correctAnswerIndex: 0
      }
      
      mockedAxios.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.createQuestion(questionData, 'jwt-token-123')
      
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer jwt-token-123'
        },
        url: '/questions',
        data: questionData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateQuestion', () => {
    it('updates question successfully', async () => {
      const mockResponse = {
        data: {
          id: 1,
          title: 'Updated Question'
        }
      }
      
      const questionData = {
        title: 'Updated Question',
        text: 'Updated text'
      }
      
      mockedAxios.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.updateQuestion(1, questionData, 'jwt-token-123')
      
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer jwt-token-123'
        },
        url: '/questions/1',
        data: questionData
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteQuestion', () => {
    it('deletes question successfully', async () => {
      const mockResponse = { status: 200, data: { success: true } }
      
      mockedAxios.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.deleteQuestion(1, 'jwt-token-123')
      
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer jwt-token-123'
        },
        url: '/questions/1',
        data: null
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteAllQuestions', () => {
    it('deletes all questions successfully', async () => {
      const mockResponse = { status: 200, data: { success: true } }
      
      mockedAxios.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.deleteAllQuestions('jwt-token-123')
      
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer jwt-token-123'
        },
        url: '/questions/all',
        data: null
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteAllParticipations', () => {
    it('deletes all participations successfully', async () => {
      const mockResponse = { status: 200, data: { success: true } }
      
      mockedAxios.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.deleteAllParticipations('jwt-token-123')
      
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer jwt-token-123'
        },
        url: '/participations/all',
        data: null
      })
      expect(result).toEqual(mockResponse)
    })
  })
})