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
      // Use last digit to determine mission type for consistency
      const isKubernetes = (evaluationId && (evaluationId % 10) % 2 === 0) || Math.random() > 0.5;
      
      if (isKubernetes) {
        // Kubernetes mission evaluation
        return {
          user: {
            id: 1001,
            name: "김데브옵스", 
            totalEvaluations: 15,
            completedEvaluations: 12,
            totalStamps: 8,
            totalPoints: 1250
          },
          evaluations: [{
            id: evaluationId || 2,
            mission_attempt_id: '550e8400-e29b-41d4-a716-446655440002',
            user_id: 1001,
            mission_id: 2,
            mission_title: 'Kubernetes 기초: 배포',
            mission_type: 'KUBERNETES',
            mission_difficulty: 'INTERMEDIATE',
            evaluation_status: 'COMPLETED',
            overall_score: 82,
            correctness_score: 85,
            efficiency_score: 78,
            quality_score: 84,
            code_quality_score: 80,
            security_score: 79,
            style_score: 88,
            score: 82,
            feedback: '쿠버네티스 Deployment와 Service 생성을 성공적으로 완료하셨습니다! YAML 파일 작성 능력이 뛰어나며, kubectl 명령어 사용법도 잘 이해하고 계십니다.',
            feedback_summary: '쿠버네티스 Deployment와 Service 생성을 성공적으로 완료하셨습니다! YAML 파일 작성 능력이 뛰어나며, kubectl 명령어 사용법도 잘 이해하고 계십니다. 리소스 관리와 보안 설정 부분에서 개선할 여지가 있습니다.',
            feedback_details: {
              strengths: [
                'YAML 파일 구조가 올바르게 작성됨',
                '적절한 라벨 셀렉터 사용',
                'Service와 Deployment 연동이 정확함',
                'kubectl 명령어 사용이 체계적임'
              ],
              improvements: [
                '리소스 limits와 requests 설정을 추가하면 더 안정적인 배포가 가능합니다',
                'Health Check (readiness/liveness probe) 설정을 고려해보세요',
                'Label selector 사용을 더 체계적으로 활용해보세요',
                'Security Context 설정 고려'
              ],
              next_steps: [
                'Kubernetes 리소스 관리 심화학습',
                'Health Check 설정 실습',
                '보안 모범사례 학습',
                '고급 배포 전략 익히기'
              ]
            },
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
            commands_executed: 18,
            significant_commands: 14,
            error_commands: 2,
            total_execution_time_ms: 68000,
            evaluation_duration_ms: 3200,
            stamps_earned: 2,
            points_awarded: 150,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
          }],
          commandAnalysis: [
            {
              id: 1,
              mission_attempt_id: "2",
              ai_evaluation_id: 2,
              command: "kubectl apply -f deployment.yaml",
              command_category: "kubernetes",
              correctness_assessment: "CORRECT",
              efficiency_rating: 5,
              best_practice_score: 9,
              security_risk_level: "LOW",
              ai_feedback: "kubectl apply 명령어를 올바르게 사용하셨습니다. YAML 파일을 통한 선언적 배포가 모범 사례입니다.",
              improvement_suggestions: ["--dry-run 옵션으로 사전 검증", "--validate 옵션 사용 권장"],
              alternative_commands: ["kubectl apply -f deployment.yaml --dry-run=client", "kubectl create -f deployment.yaml"],
              analysis_confidence: 0.95,
              created_at: "2024-01-15T15:45:00Z"
            },
            {
              id: 2,
              mission_attempt_id: "2",
              ai_evaluation_id: 2,
              command: "kubectl get deployments",
              command_category: "kubernetes",
              correctness_assessment: "CORRECT",
              efficiency_rating: 4,
              best_practice_score: 8,
              security_risk_level: "LOW",
              ai_feedback: "Deployment 상태 확인을 위한 적절한 명령어입니다.",
              improvement_suggestions: ["-o wide 옵션으로 더 자세한 정보 확인", "--watch 옵션으로 실시간 모니터링"],
              alternative_commands: ["kubectl get deployments -o wide", "kubectl get deployments --watch"],
              analysis_confidence: 0.89,
              created_at: "2024-01-15T14:30:30Z"
            }
          ],
          evaluationHistory: [
            { date: "2024-01-15", score: 82, mission: "Kubernetes 기초: 배포" },
            { date: "2024-01-12", score: 78, mission: "Docker Compose 멀티 컨테이너" },
            { date: "2024-01-10", score: 85, mission: "Docker 컨테이너 기초" },
            { date: "2024-01-05", score: 82, mission: "CI/CD 파이프라인" }
          ],
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
          user: {
            id: 1001,
            name: "김데브옵스",
            totalEvaluations: 15,
            completedEvaluations: 12,
            totalStamps: 8,
            totalPoints: 1250
          },
          evaluations: [{
            id: evaluationId || 1,
            mission_attempt_id: '550e8400-e29b-41d4-a716-446655440001',
            user_id: 1001,
            mission_id: 1,
            mission_title: 'Docker 컨테이너 기초',
            mission_type: 'DOCKER',
            mission_difficulty: 'BEGINNER',
            evaluation_status: 'COMPLETED',
            overall_score: 78,
            correctness_score: 82,
            efficiency_score: 75,
            quality_score: 77,
            code_quality_score: 76,
            security_score: 74,
            style_score: 80,
            score: 78,
            feedback: '도커 컨테이너 관리 기본기를 잘 이해하고 계십니다! 컨테이너 생성, 실행, 관리 과정을 체계적으로 수행하셨습니다.',
            feedback_summary: '도커 컨테이너 관리 기본기를 잘 이해하고 계십니다! 컨테이너 생성, 실행, 관리 과정을 체계적으로 수행하셨습니다. 네트워킹과 볼륨 관리 부분에서 개선할 여지가 있습니다.',
            feedback_details: {
              strengths: [
                'Docker 기초 명령어 숙련',
                '컨테이너 실행 과정 이해',
                '이미지 관리 능력',
                '기본적인 포트 바인딩 설정'
              ],
              improvements: [
                '다음번엔 더 효율적인 명령어 사용을 시도해보세요',
                'docker-compose를 활용한 멀티 컨테이너 관리를 익혀보세요',
                '볼륨 마운트와 네트워크 설정을 더 자세히 학습해보세요',
                '보안 설정 및 리소스 제한 고려'
              ],
              next_steps: [
                'Docker Compose 학습',
                '네트워킹 심화 과정',
                '볼륨 관리 실습',
                '멀티스테이지 빌드 익히기'
              ]
            },
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
            commands_executed: 12,
            significant_commands: 9,
            error_commands: 3,
            total_execution_time_ms: 45000,
            evaluation_duration_ms: 2800,
            stamps_earned: 1,
            points_awarded: 100,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
          }],
          commandAnalysis: [
            {
              id: 1,
              mission_attempt_id: "1",
              ai_evaluation_id: 1,
              command: "docker run -d -p 8080:80 nginx",
              command_category: "docker",
              correctness_assessment: "CORRECT",
              efficiency_rating: 4,
              best_practice_score: 7,
              security_risk_level: "LOW",
              ai_feedback: "Docker 컨테이너 실행 명령어를 올바르게 사용하셨습니다. 포트 바인딩도 적절합니다.",
              improvement_suggestions: ["컨테이너 이름 지정 권장", "리소스 제한 옵션 고려"],
              alternative_commands: ["docker run -d --name my-nginx -p 8080:80 nginx", "docker run -d -p 8080:80 --memory=128m nginx"],
              analysis_confidence: 0.90,
              created_at: "2024-01-15T15:45:00Z"
            },
            {
              id: 2,
              mission_attempt_id: "1",
              ai_evaluation_id: 1,
              command: "docker ps",
              command_category: "docker",
              correctness_assessment: "CORRECT",
              efficiency_rating: 5,
              best_practice_score: 8,
              security_risk_level: "LOW",
              ai_feedback: "컨테이너 상태 확인을 위한 기본적인 명령어입니다.",
              improvement_suggestions: ["-a 옵션으로 모든 컨테이너 확인", "--format 옵션으로 출력 형식 지정"],
              alternative_commands: ["docker ps -a", "docker ps --format table"],
              analysis_confidence: 0.95,
              created_at: "2024-01-15T14:30:30Z"
            }
          ],
          evaluationHistory: [
            { date: "2024-01-15", score: 78, mission: "Docker 컨테이너 기초" },
            { date: "2024-01-12", score: 85, mission: "Docker 이미지 빌드" },
            { date: "2024-01-10", score: 72, mission: "Docker Compose" },
            { date: "2024-01-05", score: 80, mission: "Docker 네트워킹" }
          ],
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