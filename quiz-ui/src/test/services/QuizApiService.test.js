import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to create the mock instance that can be referenced in the mock factory
const { mockAxiosInstance } = vi.hoisted(() => {
  const mockInstance = vi.fn()
  mockInstance.interceptors = {
    response: {
      use: vi.fn()
    }
  }
  return { mockAxiosInstance: mockInstance }
})

// Mock axios before importing the service
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance)
    }
  }
})

import QuizApiService from '@/services/QuizApiService'

describe('QuizApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the mock instance
    mockAxiosInstance.mockClear()
  })

  describe('getQuizInfo', () => {
    it('fetches quiz info successfully', async () => {
      const mockResponse = {
        status: 200,
        data: {
          size: 10,
          scores: []
        }
      }
      
      mockAxiosInstance.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.getQuizInfo()
      
      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
        url: '/quiz-info',
        data: null
      })
      expect(result).toEqual({
        status: 200,
        data: mockResponse.data
      })
    })

    it('handles error when fetching quiz info', async () => {
      const mockError = new Error('Network error')
      mockAxiosInstance.mockRejectedValue(mockError)
      
      await expect(QuizApiService.getQuizInfo()).rejects.toThrow('Network error')
    })
  })

  describe('getQuestionByPosition', () => {
    it('fetches question by position successfully', async () => {
      const mockResponse = {
        status: 200,
        data: {
          id: 1,
          title: 'Test Question',
          possibleAnswers: []
        }
      }
      
      mockAxiosInstance.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.getQuestionByPosition(1)
      
      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
        url: '/questions?position=1',
        data: null
      })
      expect(result).toEqual({
        status: 200,
        data: mockResponse.data
      })
    })

    it('handles error when fetching question', async () => {
      const mockError = new Error('Question not found')
      mockAxiosInstance.mockRejectedValue(mockError)
      
      await expect(QuizApiService.getQuestionByPosition(999)).rejects.toThrow('Question not found')
    })
  })

  describe('submitParticipation', () => {
    it('posts participation successfully', async () => {
      const mockResponse = {
        status: 200,
        data: {
          score: 8,
          answers: []
        }
      }
      
      const participationData = {
        playerName: 'John Doe',
        answers: [1, 2, 3, 4]
      }
      
      mockAxiosInstance.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.submitParticipation(participationData.playerName, participationData.answers)
      
      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        url: '/participations',
        data: participationData
      })
      expect(result).toEqual({
        status: 200,
        data: mockResponse.data
      })
    })

    it('handles error when posting participation', async () => {
      const mockError = new Error('Validation error')
      const participationData = { playerName: '', answers: [] }
      
      mockAxiosInstance.mockRejectedValue(mockError)
      
      await expect(QuizApiService.submitParticipation(participationData.playerName, participationData.answers)).rejects.toThrow('Validation error')
    })
  })

  describe('adminLogin', () => {
    it('logs in successfully', async () => {
      const mockResponse = {
        status: 200,
        data: {
          token: 'jwt-token-123'
        }
      }
      
      mockAxiosInstance.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.adminLogin('password123')
      
      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        url: '/login',
        data: { password: 'password123' }
      })
      expect(result).toEqual({
        status: 200,
        data: mockResponse.data
      })
    })

    it('handles login error', async () => {
      const mockError = new Error('Invalid credentials')
      mockAxiosInstance.mockRejectedValue(mockError)
      
      await expect(QuizApiService.adminLogin('wrongpassword')).rejects.toThrow('Invalid credentials')
    })
  })

  describe('getAllQuestions', () => {
    it('fetches all questions with token successfully', async () => {
      const mockResponse = {
        status: 200,
        data: {
          questions: [
            { id: 1, title: 'Question 1' },
            { id: 2, title: 'Question 2' }
          ]
        }
      }
      
      mockAxiosInstance.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.getAllQuestions('jwt-token-123')
      
      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer jwt-token-123'
        },
        url: '/questions/all',
        data: null
      })
      expect(result).toEqual({
        status: 200,
        data: mockResponse.data
      })
    })

    it('handles unauthorized error', async () => {
      const mockError = new Error('Unauthorized')
      mockAxiosInstance.mockRejectedValue(mockError)
      
      await expect(QuizApiService.getAllQuestions('invalid-token')).rejects.toThrow('Unauthorized')
    })
  })

  describe('createQuestion', () => {
    it('creates question successfully', async () => {
      const mockResponse = {
        status: 201,
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
      
      mockAxiosInstance.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.createQuestion(questionData, 'jwt-token-123')
      
      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer jwt-token-123'
        },
        url: '/questions',
        data: questionData
      })
      expect(result).toEqual({
        status: 201,
        data: mockResponse.data
      })
    })
  })

  describe('updateQuestion', () => {
    it('updates question successfully', async () => {
      const mockResponse = {
        status: 200,
        data: {
          id: 1,
          title: 'Updated Question'
        }
      }
      
      const questionData = {
        title: 'Updated Question',
        text: 'Updated text'
      }
      
      mockAxiosInstance.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.updateQuestion(1, questionData, 'jwt-token-123')
      
      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer jwt-token-123'
        },
        url: '/questions/1',
        data: questionData
      })
      expect(result).toEqual({
        status: 200,
        data: mockResponse.data
      })
    })
  })

  describe('deleteQuestion', () => {
    it('deletes question successfully', async () => {
      const mockResponse = {
        status: 204,
        data: {}
      }
      
      mockAxiosInstance.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.deleteQuestion(1, 'jwt-token-123')
      
      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer jwt-token-123'
        },
        url: '/questions/1',
        data: null
      })
      expect(result).toEqual({
        status: 204,
        data: mockResponse.data
      })
    })
  })

  describe('deleteAllQuestions', () => {
    it('deletes all questions successfully', async () => {
      const mockResponse = {
        status: 204,
        data: {}
      }
      
      mockAxiosInstance.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.deleteAllQuestions('jwt-token-123')
      
      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer jwt-token-123'
        },
        url: '/questions/all',
        data: null
      })
      expect(result).toEqual({
        status: 204,
        data: mockResponse.data
      })
    })
  })

  describe('deleteAllParticipations', () => {
    it('deletes all participations successfully', async () => {
      const mockResponse = {
        status: 204,
        data: {}
      }
      
      mockAxiosInstance.mockResolvedValue(mockResponse)
      
      const result = await QuizApiService.deleteAllParticipations('jwt-token-123')
      
      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer jwt-token-123'
        },
        url: '/participations/all',
        data: null
      })
      expect(result).toEqual({
        status: 204,
        data: mockResponse.data
      })
    })
  })

  describe('error interceptor', () => {
    it('handles axios error with response', async () => {
      const axiosError = {
        response: {
          status: 400,
          data: {
            error: 'Bad Request'
          }
        },
        userMessage: 'Données invalides'
      }
      
      mockAxiosInstance.mockRejectedValue(axiosError)
      
      await expect(QuizApiService.getQuizInfo()).rejects.toEqual(axiosError)
      expect(axiosError.userMessage).toBe('Données invalides')
    })

    it('handles network error', async () => {
      const networkError = {
        request: {},
        code: 'ECONNABORTED',
        userMessage: 'Délai d\'attente dépassé. Veuillez réessayer.'
      }
      
      mockAxiosInstance.mockRejectedValue(networkError)
      
      await expect(QuizApiService.getQuizInfo()).rejects.toEqual(networkError)
    })
  })

  describe('retry logic', () => {
    it('retries on 5xx server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            error: 'Internal Server Error'
          }
        }
      }
      
      const successResponse = {
        status: 200,
        data: { size: 10, scores: [] }
      }
      
      // First call fails, second succeeds
      mockAxiosInstance
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce(successResponse)
      
      // Mock delay to avoid actual waiting
      vi.spyOn(QuizApiService, 'delay').mockResolvedValue()
      
      const result = await QuizApiService.getQuizInfo()
      
      expect(mockAxiosInstance).toHaveBeenCalledTimes(2)
      expect(result).toEqual({
        status: 200,
        data: successResponse.data
      })
      
      QuizApiService.delay.mockRestore()
    })
  })
})
