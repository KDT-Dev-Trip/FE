// Mission Management Service Client
// 미션 관리, 터미널 연결, 워크스페이스 관리

import { API_CONFIG, API_ENDPOINTS, getApiUrl, buildUrl } from './config'
import { apiClient } from './auth'

// Mission DTOs
export interface Mission {
  id: number
  title: string
  description: string
  missionType: 'DOCKER' | 'KUBERNETES' | 'HELM' | 'ARGOCD' | 'KAFKA'
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  estimatedTime: number // in minutes
  prerequisites: string[]
  rating: number
  tags: string[]
  objectives: string[]
  resources: {
    documentation?: string
    tutorials?: string[]
    references?: string[]
  }
  isActive: boolean
  countryId: string
  cityId: string
  createdAt: string
  updatedAt: string
}

export interface Country {
  id: string
  name: string
  stack: string
  flag: string
  description: string
  color: string
  coords: { x: number; y: number }
  isActive: boolean
  missions: Mission[]
  cities: City[]
}

export interface City {
  id: string
  name: string
  countryId: string
  coords: { x: number; y: number }
  description: string
  missions: Mission[]
}

export interface MissionAttempt {
  id: string
  missionId: number
  userId: number
  status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'TIMEOUT'
  progress: number // 0-100
  startedAt: string
  completedAt?: string
  timeSpent: number // in minutes
  score?: number
  kubernetesNamespace?: string
  podName?: string
  workspaceS3Path?: string
  logS3Path?: string
  terminalSessionId?: string
  metadata: {
    commands: number
    errors: number
    lastActivity: string
  }
}

export interface TerminalSession {
  sessionId: string
  missionAttemptId: string
  status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  websocketUrl?: string
  podName?: string
  namespace?: string
  containerName?: string
  connectedAt?: string
  disconnectedAt?: string
  lastActivity: string
}

export interface MissionSubmission {
  missionAttemptId: string
  submittedCode?: string
  completionNotes?: string
  requestEvaluation: boolean
}

export interface MissionLog {
  id: string
  missionAttemptId: string
  timestamp: string
  logLevel: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  source: 'USER' | 'SYSTEM' | 'KUBERNETES'
  message: string
  metadata?: any
}

export interface WorkspaceFile {
  path: string
  name: string
  size: number
  isDirectory: boolean
  lastModified: string
  content?: string // only for files when requested
}

// Mission Management API
export const missionApi = {
  // Get all missions
  async getMissions(filters?: {
    countryId?: string
    missionType?: Mission['missionType']
    difficulty?: Mission['difficulty']
    isActive?: boolean
  }): Promise<Mission[]> {
    const url = getApiUrl('MISSION_SERVICE', API_ENDPOINTS.MISSION.LIST)
    const searchParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    
    const finalUrl = searchParams.toString() ? `${url}?${searchParams}` : url
    return apiClient.get<Mission[]>(finalUrl)
  },

  // Get mission by ID
  async getMission(id: number): Promise<Mission> {
    const url = buildUrl(getApiUrl('MISSION_SERVICE', API_ENDPOINTS.MISSION.DETAIL), { id })
    return apiClient.get<Mission>(url)
  },

  // Start a mission
  async startMission(missionId: number): Promise<MissionAttempt> {
    // Mock mode for testing
    if (process.env.NODE_ENV === 'development') {
      return {
        id: Date.now(),
        missionId,
        userId: 1,
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        score: null,
        feedback: null,
        workspaceData: null,
        terminalSessionId: null
      }
    }
    
    const url = buildUrl(getApiUrl('MISSION_SERVICE', API_ENDPOINTS.MISSION.START), { id: missionId })
    return apiClient.post<MissionAttempt>(url, {})
  },

  // Submit mission
  async submitMission(missionId: number, submission: MissionSubmission): Promise<{ message: string; evaluationId?: number }> {
    // Mock mode for testing
    if (process.env.NODE_ENV === 'development') {
      return {
        message: '미션이 성공적으로 제출되었습니다!',
        evaluationId: Date.now()
      }
    }
    
    const url = buildUrl(getApiUrl('MISSION_SERVICE', API_ENDPOINTS.MISSION.SUBMIT), { id: missionId })
    return apiClient.post(url, submission)
  },

  // Get countries and cities
  async getCountries(): Promise<Country[]> {
    const url = getApiUrl('MISSION_SERVICE', API_ENDPOINTS.MISSION.COUNTRIES)
    return apiClient.get<Country[]>(url)
  },

  async getCities(countryId: string): Promise<City[]> {
    const url = buildUrl(getApiUrl('MISSION_SERVICE', API_ENDPOINTS.MISSION.CITIES), { countryId })
    return apiClient.get<City[]>(url)
  },

  // Terminal management
  async connectTerminal(missionId: number, attemptId: string): Promise<TerminalSession> {
    // Mock mode for testing
    if (process.env.NODE_ENV === 'development') {
      return {
        sessionId: `session-${Date.now()}`,
        websocketUrl: `ws://localhost:9002/terminal/${attemptId}`,
        status: 'CONNECTED',
        createdAt: new Date().toISOString()
      }
    }
    
    const url = buildUrl(getApiUrl('MISSION_SERVICE', API_ENDPOINTS.MISSION.TERMINAL_CONNECT), { id: missionId })
    return apiClient.post<TerminalSession>(url, { attemptId })
  },

  async disconnectTerminal(missionId: number, sessionId: string): Promise<{ message: string }> {
    // Mock mode for testing
    if (process.env.NODE_ENV === 'development') {
      return {
        message: '터미널 연결이 해제되었습니다.'
      }
    }
    
    const url = buildUrl(getApiUrl('MISSION_SERVICE', API_ENDPOINTS.MISSION.TERMINAL_DISCONNECT), { id: missionId })
    return apiClient.post(url, { sessionId })
  },

  // Get mission logs
  async getMissionLogs(missionId: number, attemptId: string, filters?: {
    logLevel?: MissionLog['logLevel']
    source?: MissionLog['source']
    startTime?: string
    endTime?: string
    limit?: number
  }): Promise<MissionLog[]> {
    const url = buildUrl(getApiUrl('MISSION_SERVICE', API_ENDPOINTS.MISSION.LOGS), { id: missionId })
    const searchParams = new URLSearchParams({ attemptId })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    
    return apiClient.get<MissionLog[]>(`${url}?${searchParams}`)
  },

  // Workspace management
  async getWorkspaceFiles(missionId: number, attemptId: string, path: string = '/'): Promise<WorkspaceFile[]> {
    const url = buildUrl(getApiUrl('MISSION_SERVICE', API_ENDPOINTS.MISSION.WORKSPACE), { id: missionId })
    const searchParams = new URLSearchParams({ attemptId, path })
    return apiClient.get<WorkspaceFile[]>(`${url}?${searchParams}`)
  },

  async getFileContent(missionId: number, attemptId: string, filePath: string): Promise<{ content: string; encoding: string }> {
    const url = buildUrl(getApiUrl('MISSION_SERVICE', API_ENDPOINTS.MISSION.WORKSPACE), { id: missionId })
    const searchParams = new URLSearchParams({ attemptId, filePath, includeContent: 'true' })
    return apiClient.get(`${url}/file?${searchParams}`)
  },

  // Get user's mission attempts
  async getUserMissionAttempts(filters?: {
    missionId?: number
    status?: MissionAttempt['status']
    limit?: number
    offset?: number
  }): Promise<MissionAttempt[]> {
    const url = getApiUrl('MISSION_SERVICE', '/api/missions/attempts')
    const searchParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    
    const finalUrl = searchParams.toString() ? `${url}?${searchParams}` : url
    return apiClient.get<MissionAttempt[]>(finalUrl)
  },

  // Get specific mission attempt
  async getMissionAttempt(attemptId: string): Promise<MissionAttempt> {
    const url = getApiUrl('MISSION_SERVICE', `/api/missions/attempts/${attemptId}`)
    return apiClient.get<MissionAttempt>(url)
  }
}