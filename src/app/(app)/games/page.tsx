"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Keyboard, Trophy, Clock, Target, Play, Star, Users, Zap } from "lucide-react"

interface GameInfo {
  id: string
  title: string
  description: string
  icon: string
  category: 'typing' | 'puzzle' | 'strategy' | 'arcade'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  playerCount: string
  estimatedTime: string
  features: string[]
  link: string
  isNew?: boolean
  isPopular?: boolean
}

const games: GameInfo[] = [
  {
    id: 'typing-game',
    title: 'DevOps 타자게임',
    description: '실전 DevOps 명령어를 타이핑하며 속도와 정확도를 향상시키세요. Docker, Kubernetes, Terraform 등 다양한 기술 스택을 지원합니다.',
    icon: '⌨️',
    category: 'typing',
    difficulty: 'beginner',
    playerCount: '1명',
    estimatedTime: '10-30분',
    features: ['실시간 WPM 측정', '정확도 분석', '부정행위 방지', '다양한 기술 스택'],
    link: '/games/typing',
    isNew: true,
    isPopular: true
  },
  // 미래에 추가될 게임들
  {
    id: 'command-quiz',
    title: '명령어 퀴즈',
    description: 'DevOps 명령어와 옵션에 대한 지식을 테스트하는 퀴즈 게임입니다.',
    icon: '🧠',
    category: 'puzzle',
    difficulty: 'intermediate',
    playerCount: '1명',
    estimatedTime: '15-25분',
    features: ['객관식 퀴즈', '난이도별 문제', '상세한 해설', '점수 랭킹'],
    link: '/quiz-game',
    isNew: false,
    isPopular: false
  },
  {
    id: 'infrastructure-builder',
    title: '인프라 구축 시뮬레이션',
    description: '가상 환경에서 클라우드 인프라를 설계하고 구축하는 전략 게임입니다.',
    icon: '🏗️',
    category: 'strategy',
    difficulty: 'advanced',
    playerCount: '1-4명',
    estimatedTime: '30-60분',
    features: ['3D 시각화', '실시간 멀티플레이', '비용 최적화', '장애 시뮬레이션'],
    link: '/infra-builder',
    isNew: false,
    isPopular: false
  },
  {
    id: 'container-race',
    title: '컨테이너 레이싱',
    description: '컨테이너 배포 속도를 겨루는 실시간 아케이드 게임입니다.',
    icon: '🏎️',
    category: 'arcade',
    difficulty: 'beginner',
    playerCount: '1-8명',
    estimatedTime: '5-15분',
    features: ['실시간 대전', '파워업 아이템', '커스텀 트랙', '리더보드'],
    link: '/container-race',
    isNew: false,
    isPopular: false
  }
]

const categoryColors = {
  typing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  puzzle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  strategy: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  arcade: 'bg-green-500/20 text-green-300 border-green-500/30'
}

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-300 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-300 border-red-500/30'
}

export default function GamesPage() {
  const availableGames = games.filter(game => game.id === 'typing-game')
  const comingSoonGames = games.filter(game => game.id !== 'typing-game')

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            DevTrip 게임센터 🎮
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            재미있는 게임을 통해 DevOps 기술을 학습하세요. 다양한 장르의 게임으로 실력을 향상시킬 수 있습니다.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-gray-900/50 border-gray-700/50 text-center">
            <CardContent className="p-6">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">1</div>
              <div className="text-sm text-gray-400">이용 가능한 게임</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-700/50 text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">1,247</div>
              <div className="text-sm text-gray-400">총 플레이어</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-700/50 text-center">
            <CardContent className="p-6">
              <Zap className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-sm text-gray-400">출시 예정</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-700/50 text-center">
            <CardContent className="p-6">
              <Star className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">4.9</div>
              <div className="text-sm text-gray-400">평균 평점</div>
            </CardContent>
          </Card>
        </div>

        {/* Available Games */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Play className="h-6 w-6 text-green-400" />
            <h2 className="text-3xl font-bold text-white">지금 플레이 가능</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableGames.map((game) => (
              <Card key={game.id} className="bg-gray-900/50 border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group relative overflow-hidden">
                {game.isNew && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/50">NEW</Badge>
                  </div>
                )}
                {game.isPopular && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">인기</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{game.icon}</span>
                      <div>
                        <CardTitle className="text-white group-hover:text-blue-300 transition-colors">
                          {game.title}
                        </CardTitle>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{game.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">플레이어:</span>
                      <span className="text-white">{game.playerCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">소요시간:</span>
                      <span className="text-white">{game.estimatedTime}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge className={categoryColors[game.category]}>
                        {game.category.toUpperCase()}
                      </Badge>
                      <Badge className={difficultyColors[game.difficulty]}>
                        {game.difficulty.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-300">주요 기능:</h4>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {game.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                      <Link href={game.link}>
                        <Play className="mr-2 h-4 w-4" />
                        게임 시작
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Coming Soon Games */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Clock className="h-6 w-6 text-orange-400" />
            <h2 className="text-3xl font-bold text-white">출시 예정</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoonGames.map((game) => (
              <Card key={game.id} className="bg-gray-900/30 border-gray-700/30 relative overflow-hidden opacity-75">
                <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="h-12 w-12 text-orange-400 mx-auto mb-2" />
                    <p className="text-orange-300 font-semibold">출시 예정</p>
                    <p className="text-gray-400 text-sm">개발 중...</p>
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{game.icon}</span>
                      <div>
                        <CardTitle className="text-gray-300">
                          {game.title}
                        </CardTitle>
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{game.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Badge className={categoryColors[game.category] + ' opacity-60'}>
                        {game.category.toUpperCase()}
                      </Badge>
                      <Badge className={difficultyColors[game.difficulty] + ' opacity-60'}>
                        {game.difficulty.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-400">예정된 기능:</h4>
                      <ul className="text-xs text-gray-500 space-y-1">
                        {game.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}