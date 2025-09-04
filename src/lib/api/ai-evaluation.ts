// AI Evaluation Service Client
// AI 기반 미션 평가, 명령어 분석, 성과 통계

import { API_CONFIG, API_ENDPOINTS, getApiUrl, buildUrl } from './config'
import { apiClient } from './auth'
import type { 
  AIEvaluation, 
  EvaluationSummary, 
  CommandAnalysis, 
  UserEvaluationStats,
  MissionEvaluationStats,
  DailyEvaluationStats,
  AIEvaluationResponse
} from '@/types/ai-evaluation'

// Request DTOs
export interface EvaluationRequest {
  missionAttemptId: string
  missionId: number
  evaluationTrigger: 'MISSION_COMPLETION' | 'MANUAL_REQUEST' | 'RETRY'
  submittedCode?: string
  additionalContext?: any
}

export interface EvaluationFilters {
  userId?: number
  missionId?: number
  status?: AIEvaluation['evaluation_status']
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface StatsFilters {
  startDate?: string
  endDate?: string
  missionType?: string
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}

// AI Evaluation API
export const aiEvaluationApi = {
  // Request AI evaluation
  async requestEvaluation(request: EvaluationRequest): Promise<AIEvaluation> {
    const url = getApiUrl('AI_EVALUATION_SERVICE', API_ENDPOINTS.AI_EVALUATION.EVALUATE)
    return apiClient.post<AIEvaluation>(url, request)
  },

  // Get evaluation results
  async getEvaluationResults(evaluationId: number): Promise<EvaluationSummary> {
    const url = buildUrl(
      getApiUrl('AI_EVALUATION_SERVICE', API_ENDPOINTS.AI_EVALUATION.RESULTS), 
      { evaluationId }
    )
    return apiClient.get<EvaluationSummary>(url)
  },

  // Get evaluation history
  async getEvaluationHistory(filters?: EvaluationFilters): Promise<AIEvaluation[]> {
    const url = getApiUrl('AI_EVALUATION_SERVICE', API_ENDPOINTS.AI_EVALUATION.HISTORY)
    const searchParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    
    const finalUrl = searchParams.toString() ? `${url}?${searchParams}` : url
    return apiClient.get<AIEvaluation[]>(finalUrl)
  },

  // Get detailed evaluation statistics
  async getEvaluationStats(filters?: StatsFilters): Promise<{
    summary: {
      totalEvaluations: number
      completedEvaluations: number
      averageScore: number
      averageProcessingTime: number
    }
    dailyStats: DailyEvaluationStats[]
    missionStats: MissionEvaluationStats[]
  }> {
    const url = getApiUrl('AI_EVALUATION_SERVICE', API_ENDPOINTS.AI_EVALUATION.STATS)
    const searchParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    
    const finalUrl = searchParams.toString() ? `${url}?${searchParams}` : url
    return apiClient.get(finalUrl)
  },

  // Get command analysis for an evaluation
  async getCommandAnalysis(evaluationId: number): Promise<CommandAnalysis[]> {
    const url = buildUrl(
      getApiUrl('AI_EVALUATION_SERVICE', API_ENDPOINTS.AI_EVALUATION.COMMAND_ANALYSIS), 
      { evaluationId }
    )
    return apiClient.get<CommandAnalysis[]>(url)
  },

  // Get user performance analytics
  async getUserPerformance(filters?: StatsFilters): Promise<UserEvaluationStats> {
    const url = getApiUrl('AI_EVALUATION_SERVICE', API_ENDPOINTS.AI_EVALUATION.USER_PERFORMANCE)
    const searchParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    
    const finalUrl = searchParams.toString() ? `${url}?${searchParams}` : url
    return apiClient.get<UserEvaluationStats>(finalUrl)
  },

  // Get mission analytics
  async getMissionAnalytics(missionId?: number, filters?: StatsFilters): Promise<MissionEvaluationStats[]> {
    const url = getApiUrl('AI_EVALUATION_SERVICE', API_ENDPOINTS.AI_EVALUATION.MISSION_ANALYTICS)
    const searchParams = new URLSearchParams()
    
    if (missionId) {
      searchParams.append('missionId', String(missionId))
    }
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    
    const finalUrl = searchParams.toString() ? `${url}?${searchParams}` : url
    return apiClient.get<MissionEvaluationStats[]>(finalUrl)
  },

  // Get comprehensive evaluation data (for evaluation page)
  async getComprehensiveEvaluationData(evaluationId?: number): Promise<AIEvaluationResponse> {
    // Mock mode for testing
    if (process.env.NODE_ENV === 'development') {
      // Generate different evaluation data based on evaluationId or random
      const isKubernetes = (evaluationId && evaluationId % 2 === 0) || Math.random() > 0.5;
      
      if (isKubernetes) {
        // Kubernetes mission evaluation
        return {
          evaluations: [{
            id: evaluationId || 2,
            missionAttemptId: '2',
            userId: 1,
            missionId: 2,
            evaluation_status: 'COMPLETED',
            score: 82,
            feedback: '쿠버네티스 Deployment와 Service 생성을 성공적으로 완료하셨습니다! YAML 파일 작성 능력이 뛰어나며, kubectl 명령어 사용법도 잘 이해하고 계십니다.',
            improvements: [
              '리소스 limits와 requests 설정을 추가하면 더 안정적인 배포가 가능합니다',
              'Health Check (readiness/liveness probe) 설정을 고려해보세요',
              'Label selector 사용을 더 체계적으로 활용해보세요'
            ],
            analysis: {
              command_analysis: {
                correctCommands: 12,
                totalCommands: 15,
                commandAccuracy: 0.8,
                commonMistakes: [
                  'kubectl apply 대신 kubectl create 사용',
                  'Service 포트 설정에서 targetPort 누락',
                  'Deployment의 replicas 설정 확인 필요'
                ]
              },
              environment_state: {
                podsRunning: 3,
                servicesCreated: 2,
                deploymentsActive: 1,
                resourceUsage: {
                  cpu: 35.2,
                  memory: 768,
                  disk: 1536
                },
                kubernetesObjects: {
                  deployments: 1,
                  services: 2,
                  pods: 3,
                  configmaps: 0,
                  secrets: 0
                }
              }
            },
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
          }],
          summary: {
            averageScore: 82,
            totalEvaluations: 1,
            completionRate: 1.0,
            strongAreas: ['YAML 작성', 'kubectl 명령어', 'Service 연결'],
            improvementAreas: ['리소스 관리', 'Health Check', 'Security']
          }
        };
      } else {
        // Docker mission evaluation (existing)
        return {
          evaluations: [{
            id: evaluationId || 1,
            missionAttemptId: '1',
            userId: 1,
            missionId: 1,
            evaluation_status: 'COMPLETED',
            score: 78,
            feedback: '도커 컨테이너 관리 기본기를 잘 이해하고 계십니다! 컨테이너 생성, 실행, 관리 과정을 체계적으로 수행하셨습니다.',
            improvements: [
              '다음번엔 더 효율적인 명령어 사용을 시도해보세요',
              'docker-compose를 활용한 멀티 컨테이너 관리를 익혀보세요',
              '볼륨 마운트와 네트워크 설정을 더 자세히 학습해보세요'
            ],
            analysis: {
              command_analysis: {
                correctCommands: 9,
                totalCommands: 12,
                commandAccuracy: 0.75,
                commonMistakes: [
                  '포트 바인딩 실수',
                  '컨테이너 이름 중복',
                  'docker stop 명령어 누락'
                ]
              },
              environment_state: {
                containersRunning: 2,
                imagesDownloaded: 4,
                resourceUsage: {
                  cpu: 28.5,
                  memory: 512,
                  disk: 1024
                },
                dockerObjects: {
                  containers: 3,
                  images: 4,
                  volumes: 1,
                  networks: 2
                }
              }
            },
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
          }],
          summary: {
            averageScore: 78,
            totalEvaluations: 1,
            completionRate: 1.0,
            strongAreas: ['Docker 기초', '컨테이너 실행', '이미지 관리'],
            improvementAreas: ['네트워킹', '볼륨 관리', 'Compose']
          }
        };
      }
    }
    
    const url = getApiUrl('AI_EVALUATION_SERVICE', '/api/evaluations/comprehensive')
    const finalUrl = evaluationId ? `${url}?evaluationId=${evaluationId}` : url
    return apiClient.get<AIEvaluationResponse>(finalUrl)
  },

  // Retry failed evaluation
  async retryEvaluation(evaluationId: number): Promise<AIEvaluation> {
    const url = getApiUrl('AI_EVALUATION_SERVICE', `/api/evaluations/${evaluationId}/retry`)
    return apiClient.post<AIEvaluation>(url, {})
  },

  // Cancel pending evaluation
  async cancelEvaluation(evaluationId: number): Promise<{ message: string }> {
    const url = getApiUrl('AI_EVALUATION_SERVICE', `/api/evaluations/${evaluationId}/cancel`)
    return apiClient.post(url, {})
  },

  // Get evaluation status
  async getEvaluationStatus(evaluationId: number): Promise<{ 
    status: AIEvaluation['evaluation_status']
    progress?: number
    estimatedCompletionTime?: string 
  }> {
    // Mock mode for testing
    if (process.env.NODE_ENV === 'development') {
      return {
        status: 'COMPLETED',
        progress: 100,
        estimatedCompletionTime: new Date().toISOString()
      }
    }
    
    const url = getApiUrl('AI_EVALUATION_SERVICE', `/api/evaluations/${evaluationId}/status`)
    return apiClient.get(url)
  },

  // Get real-time evaluation updates (SSE endpoint)
  createEvaluationEventSource(evaluationId: number): EventSource {
    const url = getApiUrl('AI_EVALUATION_SERVICE', `/api/evaluations/${evaluationId}/events`)
    const token = localStorage.getItem('devtrip_access_token')
    
    return new EventSource(`${url}?token=${token}`)
  }
}