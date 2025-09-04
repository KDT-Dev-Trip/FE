// Mock data for testing the application without backend connection

export const mockUser = {
  id: 1,
  email: "test@devtrip.com",
  name: "DevTrip 여행자",
  avatarUrl: "/default-avatar.png",
  role: "USER" as const,
  createdAt: new Date().toISOString(),
}

export const mockAuthResponse = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  user: mockUser,
}

export const mockMissions = [
  {
    id: 1,
    title: "Docker 기초: 컨테이너 생성",
    description: "Docker를 사용해 첫 번째 컨테이너를 생성하고 실행해보세요.",
    difficulty: "beginner",
    stack: "docker",
    country: "korea",
    city: "seoul",
    estimatedTime: 30,
    completed: true,
    score: 95,
  },
  {
    id: 2,
    title: "Docker Compose: 다중 컨테이너",
    description: "Docker Compose를 사용해 웹 앱과 데이터베이스를 함께 실행해보세요.",
    difficulty: "intermediate",
    stack: "docker",
    country: "korea",
    city: "busan",
    estimatedTime: 45,
    completed: true,
    score: 88,
  },
  {
    id: 3,
    title: "쿠버네티스 기초: 배포",
    description: "쿠버네티스 클러스터에 첫 번째 애플리케이션을 배포해보세요.",
    difficulty: "intermediate",
    stack: "kubernetes",
    country: "germany",
    city: "berlin",
    estimatedTime: 60,
    completed: false,
    score: null,
  },
  {
    id: 4,
    title: "Jenkins CI/CD 파이프라인",
    description: "Jenkins를 사용해 자동화된 빌드 파이프라인을 구축해보세요.",
    difficulty: "advanced",
    stack: "jenkins",
    country: "usa",
    city: "san-francisco",
    estimatedTime: 90,
    completed: false,
    score: null,
  },
]

export const mockStacks = [
  {
    id: 1,
    name: "Docker",
    slug: "docker",
    description: "컨테이너화 기술의 기초부터 고급까지",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    color: "#2496ED",
    totalMissions: 8,
    completedMissions: 4,
  },
  {
    id: 2,
    name: "Kubernetes",
    slug: "kubernetes",
    description: "컨테이너 오케스트레이션 마스터",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
    color: "#326CE5",
    totalMissions: 12,
    completedMissions: 2,
  },
  {
    id: 3,
    name: "ArgoCD",
    slug: "argocd",
    description: "GitOps 기반 지속적 배포",
    icon: "/tech-icons/argocd.svg",
    color: "#F14C4C",
    totalMissions: 6,
    completedMissions: 1,
  },
  {
    id: 4,
    name: "Jenkins",
    slug: "jenkins",
    description: "CI/CD 파이프라인 자동화",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg",
    color: "#D33833",
    totalMissions: 10,
    completedMissions: 0,
  },
  {
    id: 5,
    name: "Helm",
    slug: "helm",
    description: "쿠버네티스 패키지 매니저",
    icon: "/tech-icons/helm.svg",
    color: "#0F1689",
    totalMissions: 5,
    completedMissions: 1,
  },
]

export const mockUserProgress = {
  totalMissions: 41,
  completedMissions: 8,
  totalScore: 736,
  averageScore: 92,
  totalLearningTime: 24 * 60, // minutes
  badges: [
    { id: 1, name: "Docker 마스터", description: "Docker 미션 5개 완료", icon: "🐳" },
    { id: 2, name: "첫 번째 발걸음", description: "첫 번째 미션 완료", icon: "👶" },
    { id: 3, name: "연속 학습자", description: "7일 연속 학습", icon: "🔥" },
  ],
}

// Mock API responses
export const mockApiResponses = {
  login: mockAuthResponse,
  register: mockAuthResponse,
  missions: mockMissions,
  stacks: mockStacks,
  userProgress: mockUserProgress,
}