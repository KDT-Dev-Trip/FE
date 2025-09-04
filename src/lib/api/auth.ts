// Authentication Service Client
// JWT 토큰 기반 인증 시스템

import { API_CONFIG, API_ENDPOINTS, getApiUrl } from './config'

// Authentication DTOs
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  confirmPassword: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    email: string
    name: string
    avatarUrl?: string
    role: 'USER' | 'ADMIN'
    createdAt: string
  }
}

export interface TokenRefreshResponse {
  accessToken: string
  refreshToken: string
}

// Token Storage Keys
const ACCESS_TOKEN_KEY = 'devtrip_access_token'
const REFRESH_TOKEN_KEY = 'devtrip_refresh_token'
const USER_KEY = 'devtrip_user'

// Token Management
export class TokenManager {
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  static setUser(user: AuthResponse['user']): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  static getUser(): AuthResponse['user'] | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return Date.now() >= payload.exp * 1000
    } catch {
      return true
    }
  }
}

// HTTP Client with auto token refresh
class ApiClient {
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  private async request<T>(
    url: string,
    options: RequestInit = {},
    requiresAuth = true
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    }

    if (requiresAuth) {
      const token = TokenManager.getAccessToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401 && requiresAuth) {
      const refreshedToken = await this.handleTokenRefresh()
      if (refreshedToken) {
        headers.Authorization = `Bearer ${refreshedToken}`
        return this.request(url, { ...options, headers }, false)
      } else {
        TokenManager.clearTokens()
        window.location.href = '/login'
        throw new Error('Authentication failed')
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
    
    return response.text() as T
  }

  private async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise(resolve => {
        this.refreshSubscribers.push(resolve)
      })
    }

    this.isRefreshing = true

    try {
      const refreshToken = TokenManager.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await fetch(getApiUrl('AUTH_SERVICE', API_ENDPOINTS.AUTH.REFRESH), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data: TokenRefreshResponse = await response.json()
        TokenManager.setTokens(data.accessToken, data.refreshToken)
        
        this.refreshSubscribers.forEach(callback => callback(data.accessToken))
        this.refreshSubscribers = []
        
        return data.accessToken
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    } finally {
      this.isRefreshing = false
    }

    return null
  }

  async get<T>(url: string, requiresAuth = true): Promise<T> {
    return this.request<T>(url, { method: 'GET' }, requiresAuth)
  }

  async post<T>(url: string, data: any, requiresAuth = true): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }, requiresAuth)
  }

  async put<T>(url: string, data: any, requiresAuth = true): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, requiresAuth)
  }

  async delete<T>(url: string, requiresAuth = true): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' }, requiresAuth)
  }
}

const apiClient = new ApiClient()

// Authentication API Functions
export const authApi = {
  // 이메일/패스워드 로그인
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Mock mode for testing
    if (process.env.NODE_ENV === 'development') {
      const { mockApiResponses } = await import('@/lib/mock-data')
      const mockResponse = mockApiResponses.login
      
      TokenManager.setTokens(mockResponse.accessToken, mockResponse.refreshToken)
      TokenManager.setUser(mockResponse.user)
      
      return mockResponse
    }
    
    const url = getApiUrl('AUTH_SERVICE', API_ENDPOINTS.AUTH.LOGIN)
    const response = await apiClient.post<AuthResponse>(url, credentials, false)
    
    TokenManager.setTokens(response.accessToken, response.refreshToken)
    TokenManager.setUser(response.user)
    
    return response
  },

  // 회원가입
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Mock mode for testing
    if (process.env.NODE_ENV === 'development') {
      const { mockApiResponses } = await import('@/lib/mock-data')
      const mockResponse = mockApiResponses.register
      
      TokenManager.setTokens(mockResponse.accessToken, mockResponse.refreshToken)
      TokenManager.setUser(mockResponse.user)
      
      return mockResponse
    }
    
    const url = getApiUrl('AUTH_SERVICE', API_ENDPOINTS.AUTH.REGISTER)
    const response = await apiClient.post<AuthResponse>(url, data, false)
    
    TokenManager.setTokens(response.accessToken, response.refreshToken)
    TokenManager.setUser(response.user)
    
    return response
  },

  // 카카오 로그인
  async kakaoLogin(code: string): Promise<AuthResponse> {
    const url = getApiUrl('AUTH_SERVICE', API_ENDPOINTS.AUTH.KAKAO_LOGIN)
    const response = await apiClient.post<AuthResponse>(url, { code }, false)
    
    TokenManager.setTokens(response.accessToken, response.refreshToken)
    TokenManager.setUser(response.user)
    
    return response
  },

  // 구글 로그인
  async googleLogin(code: string): Promise<AuthResponse> {
    const url = getApiUrl('AUTH_SERVICE', API_ENDPOINTS.AUTH.GOOGLE_LOGIN)
    const response = await apiClient.post<AuthResponse>(url, { code }, false)
    
    TokenManager.setTokens(response.accessToken, response.refreshToken)
    TokenManager.setUser(response.user)
    
    return response
  },

  // 로그아웃
  async logout(): Promise<void> {
    try {
      const refreshToken = TokenManager.getRefreshToken()
      if (refreshToken) {
        const url = getApiUrl('AUTH_SERVICE', API_ENDPOINTS.AUTH.LOGOUT)
        await apiClient.post(url, { refreshToken }, false)
      }
    } finally {
      TokenManager.clearTokens()
    }
  },

  // 토큰 검증
  async verifyToken(): Promise<{ valid: boolean; user?: AuthResponse['user'] }> {
    const token = TokenManager.getAccessToken()
    if (!token) {
      return { valid: false }
    }

    try {
      const url = getApiUrl('AUTH_SERVICE', API_ENDPOINTS.AUTH.VERIFY_TOKEN)
      const response = await apiClient.get<{ user: AuthResponse['user'] }>(url)
      return { valid: true, user: response.user }
    } catch {
      return { valid: false }
    }
  },

  // 패스워드 재설정
  async resetPassword(email: string): Promise<{ message: string }> {
    const url = getApiUrl('AUTH_SERVICE', API_ENDPOINTS.AUTH.RESET_PASSWORD)
    return apiClient.post(url, { email }, false)
  },

  // 현재 로그인 상태 확인
  isAuthenticated(): boolean {
    const token = TokenManager.getAccessToken()
    return token ? !TokenManager.isTokenExpired(token) : false
  },

  // 현재 사용자 정보
  getCurrentUser(): AuthResponse['user'] | null {
    return TokenManager.getUser()
  }
}

// Export the API client for use in other services
export { apiClient }