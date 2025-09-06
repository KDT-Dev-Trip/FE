"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Fish, Trophy, Clock, Target, Anchor, Play, Pause, RotateCcw } from "lucide-react"

interface FishType {
  id: string
  name: string
  icon: string
  points: number
  rarity: 'common' | 'rare' | 'legendary'
  speed: number
  description: string
}

const fishTypes: FishType[] = [
  {
    id: 'docker-whale',
    name: 'Docker',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    points: 100,
    rarity: 'common',
    speed: 2,
    description: '컨테이너화 플랫폼'
  },
  {
    id: 'argocd-octopus',
    name: 'ArgoCD',
    icon: 'https://raw.githubusercontent.com/cncf/artwork/master/projects/argo/icon/color/argo-icon-color.svg',
    points: 200,
    rarity: 'rare',
    speed: 3,
    description: 'GitOps 배포 도구'
  },
  {
    id: 'kubernetes-fish',
    name: 'Kubernetes',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg',
    points: 150,
    rarity: 'common',
    speed: 2.5,
    description: '컨테이너 오케스트레이션'
  },
  {
    id: 'terraform-turtle',
    name: 'Terraform',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg',
    points: 300,
    rarity: 'legendary',
    speed: 1.5,
    description: 'Infrastructure as Code'
  },
  {
    id: 'prometheus-fire',
    name: 'Prometheus',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prometheus/prometheus-original.svg',
    points: 180,
    rarity: 'common',
    speed: 2.8,
    description: '모니터링 시스템'
  }
]

interface Fish {
  id: string
  type: FishType
  x: number
  y: number
  direction: number
  caught: boolean
}

const rarityColors = {
  common: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  rare: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  legendary: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
}

export default function FishingGamePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [fishCaught, setFishCaught] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [fish, setFish] = useState<Fish[]>([])
  const [hookX, setHookX] = useState(400)
  const [hookY, setHookY] = useState(100)
  const [isHookDropped, setIsHookDropped] = useState(false)
  const [catchedFish, setCatchedFish] = useState<FishType[]>([])
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set())
  
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const gameTimerRef = useRef<NodeJS.Timeout>()
  const fishSpawnTimerRef = useRef<NodeJS.Timeout>()
  const animationFrameRef = useRef<number>()
  const fishIdCounter = useRef<number>(0)

  const gameAreaWidth = 900
  const gameAreaHeight = 500
  const hookSpeed = 8

  // 물고기 생성 (중복 방지)
  const spawnFish = useCallback(() => {
    if (!isPlaying || isPaused) return

    fishIdCounter.current += 1
    const randomType = fishTypes[Math.floor(Math.random() * fishTypes.length)]
    const fromLeft = Math.random() < 0.5
    const newFish: Fish = {
      id: `fish-${fishIdCounter.current}-${Date.now()}`, // 고유 ID 보장
      type: randomType,
      x: fromLeft ? 50 : gameAreaWidth - 50, // 화면 안에서 시작
      y: 200 + Math.random() * 200, // y 범위 줄임
      direction: fromLeft ? 1 : -1,
      caught: false
    }

    setFish(prev => {
      // 너무 많은 물고기가 있으면 생성 안함
      if (prev.length >= 8) {
        return prev
      }
      
      // 중복 ID 체크
      if (prev.some(f => f.id === newFish.id)) {
        return prev
      }
      
      return [...prev, newFish]
    })
  }, [isPlaying, isPaused, gameAreaWidth])


  // 키보드 입력 처리
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isPlaying || isPaused) return
    
    const key = e.key.toLowerCase()
    if (['a', 'd', 's', 'w', 'arrowleft', 'arrowright', 'arrowdown', 'arrowup'].includes(key)) {
      e.preventDefault()
      setKeysPressed(prev => new Set([...prev, key]))
    }
  }, [isPlaying, isPaused])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase()
    if (['a', 'd', 's', 'w', 'arrowleft', 'arrowright', 'arrowdown', 'arrowup'].includes(key)) {
      setKeysPressed(prev => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }
  }, [])

  // 게임 시작
  const startGame = () => {
    setIsPlaying(true)
    setIsPaused(false)
    setScore(0)
    setTimeLeft(90)
    setFishCaught(0)
    setIsGameOver(false)
    setFish([])
    setHookX(450)
    setHookY(60)
    setIsHookDropped(false)
    setCatchedFish([])
    setKeysPressed(new Set())
    fishIdCounter.current = 0
    lastCaughtTime.current = 0
    
    // 게임 시작 시 초기 물고기 3마리 생성
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          fishIdCounter.current += 1
          const randomType = fishTypes[Math.floor(Math.random() * fishTypes.length)]
          const fromLeft = Math.random() < 0.5
          const newFish: Fish = {
            id: `fish-${fishIdCounter.current}-${Date.now()}`,
            type: randomType,
            x: fromLeft ? 50 : gameAreaWidth - 50, // 화면 안에서 시작
            y: 200 + Math.random() * 200,
            direction: fromLeft ? 1 : -1,
            caught: false
          }
          
          setFish(prev => [...prev, newFish])
        }, i * 500) // 0.5초 간격으로 생성
      }
    }, 500) // 게임 시작 0.5초 후부터
  }

  // 게임 일시정지
  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // 게임 리셋
  const resetGame = () => {
    setIsPlaying(false)
    setIsPaused(false)
    setScore(0)
    setTimeLeft(90)
    setFishCaught(0)
    setIsGameOver(false)
    setFish([])
    setHookX(450)
    setHookY(60)
    setIsHookDropped(false)
    setCatchedFish([])
    setKeysPressed(new Set())
    fishIdCounter.current = 0
    lastCaughtTime.current = 0
  }

  // 타이머
  useEffect(() => {
    if (isPlaying && !isPaused && timeLeft > 0) {
      gameTimerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isPlaying) {
      setIsGameOver(true)
      setIsPlaying(false)
    }

    return () => {
      if (gameTimerRef.current) clearTimeout(gameTimerRef.current)
    }
  }, [isPlaying, isPaused, timeLeft])

  // 물고기 스폰 (더 자주)
  useEffect(() => {
    if (isPlaying && !isPaused) {
      fishSpawnTimerRef.current = setInterval(spawnFish, 1200) // 1.2초로 더 자주
    } else {
      if (fishSpawnTimerRef.current) clearInterval(fishSpawnTimerRef.current)
    }

    return () => {
      if (fishSpawnTimerRef.current) clearInterval(fishSpawnTimerRef.current)
    }
  }, [isPlaying, isPaused, spawnFish])

  // 물고기 애니메이션 (간단하고 부드럽게)
  useEffect(() => {
    let animationId: number
    
    const updateFish = () => {
      if (isPlaying && !isPaused) {
        setFish(prev => prev
          .map(f => ({
            ...f,
            x: f.x + (f.type.speed * f.direction),
            y: f.y + Math.sin(Date.now() * 0.002 + f.x * 0.008) * 1.5
          }))
          .filter(f => f.x > -100 && f.x < gameAreaWidth + 100 && !f.caught)
        )
      }
      
      if (isPlaying && !isPaused) {
        animationId = requestAnimationFrame(updateFish)
      }
    }

    if (isPlaying && !isPaused) {
      updateFish()
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isPlaying, isPaused])

  // Hook 이동 (키 입력 기반)
  useEffect(() => {
    if (!isPlaying || isPaused || keysPressed.size === 0) return

    const interval = setInterval(() => {
      if (keysPressed.has('a') || keysPressed.has('arrowleft')) {
        setHookX(prev => Math.max(30, prev - hookSpeed))
      }
      if (keysPressed.has('d') || keysPressed.has('arrowright')) {
        setHookX(prev => Math.min(gameAreaWidth - 30, prev + hookSpeed))
      }
      if (keysPressed.has('s') || keysPressed.has('arrowdown')) {
        setHookY(prev => {
          if (!isHookDropped && prev <= 80) {
            setIsHookDropped(true)
          }
          return Math.min(gameAreaHeight - 60, prev + hookSpeed * 2)
        })
      }
      if (keysPressed.has('w') || keysPressed.has('arrowup')) {
        setHookY(prev => {
          if (prev <= 80) {
            setIsHookDropped(false)
            return 60
          }
          return Math.max(60, prev - hookSpeed * 2)
        })
      }
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [isPlaying, isPaused, keysPressed, isHookDropped, hookSpeed, gameAreaWidth, gameAreaHeight])

  // 물고기 잡기 체크 (ref 기반으로 안정화)
  const lastCaughtTime = useRef<number>(0)
  
  useEffect(() => {
    if (!isPlaying || isPaused || !isHookDropped) return

    const interval = setInterval(() => {
      const now = Date.now()
      // 최근에 잡았으면 0.5초 대기 (중복 방지)
      if (now - lastCaughtTime.current < 500) return
      
      setFish(prev => {
        const fishToCatch = prev.find(f => {
          if (f.caught) return false
          const distance = Math.sqrt(
            Math.pow(f.x - hookX, 2) + Math.pow(f.y - hookY, 2)
          )
          return distance < 50
        })
        
        if (fishToCatch) {
          lastCaughtTime.current = now
          setScore(s => s + fishToCatch.type.points)
          setFishCaught(c => c + 1)
          setCatchedFish(prevCaught => [...prevCaught, fishToCatch.type])
          
          return prev.map(f => 
            f.id === fishToCatch.id ? { ...f, caught: true } : f
          )
        }
        
        return prev
      })
    }, 100) // 100ms로 늘려서 안정화

    return () => clearInterval(interval)
  }, [isPlaying, isPaused, isHookDropped, hookX, hookY])

  // 키보드 이벤트 리스너
  useEffect(() => {
    if (isPlaying) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('keyup', handleKeyUp)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('keyup', handleKeyUp)
      }
    }
  }, [handleKeyDown, handleKeyUp, isPlaying])

  if (!isPlaying && !isGameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-blue-400 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-blue-800 mb-4">
              🎣 Jenkins 아저씨의 DevOps 낚시 🎣
            </h1>
            <p className="text-blue-700 text-lg max-w-2xl mx-auto mb-8">
              Jenkins 아저씨가 DevOps 바다에서 Docker 고래와 ArgoCD 문어를 낚아보세요!
            </p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 mb-8">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Anchor className="h-6 w-6" />
                게임 방법
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
                <div>
                  <h3 className="font-semibold mb-2">🎮 조작법</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• A/← : 왼쪽으로 이동</li>
                    <li>• D/→ : 오른쪽으로 이동</li>
                    <li>• S/↓ : 낚시바늘 내리기</li>
                    <li>• W/↑ : 낚시바늘 올리기</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🐟 잡을 수 있는 것들</h3>
                  <div className="space-y-1 text-sm">
                    {fishTypes.map(fish => (
                      <div key={fish.id} className="flex items-center gap-3">
                        <img src={fish.icon} alt={fish.name} className="w-6 h-6 object-contain" />
                        <span className="flex-1">{fish.name}</span>
                        <Badge className={rarityColors[fish.rarity]}>
                          {fish.points}점
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button 
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xl px-8 py-4"
            >
              🎣 낚시 시작!
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-blue-400 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={resetGame} variant="outline" size="sm">
              ← 돌아가기
            </Button>
            <h1 className="text-2xl font-bold text-blue-800">Jenkins 아저씨의 DevOps 낚시</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={togglePause} size="sm" variant="outline" className="flex items-center gap-2">
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {isPaused ? '재개' : '일시정지'}
            </Button>
            <Button onClick={startGame} size="sm" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              다시시작
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">{score}</div>
              <div className="text-sm text-blue-600">점수</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Fish className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">{fishCaught}</div>
              <div className="text-sm text-blue-600">잡은 수</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">{timeLeft}</div>
              <div className="text-sm text-blue-600">초</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        <Card className="bg-blue-500/20 backdrop-blur-sm border-blue-300">
          <CardContent className="p-4">
            <div 
              ref={gameAreaRef}
              className="relative bg-gradient-to-b from-blue-300/50 to-blue-600/70 rounded-lg overflow-hidden"
              style={{ width: gameAreaWidth, height: gameAreaHeight, margin: '0 auto' }}
            >
              {/* Jenkins 아저씨 (낚시꾼) */}
              <div 
                className="absolute ease-linear"
                style={{ 
                  left: hookX - 30, 
                  top: 10,
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
                  transition: 'left 0.05s ease-out'
                }}
              >
                <img 
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg"
                  alt="Jenkins"
                  className="w-16 h-16 object-contain"
                />
              </div>

              {/* 낚시줄 */}
              <div 
                className="absolute border-l-2 border-yellow-600 shadow-sm"
                style={{
                  left: hookX,
                  top: 50,
                  height: hookY - 50,
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
                  transition: 'left 0.05s ease-out, height 0.1s ease-out'
                }}
              />

              {/* 낚시바늘 */}
              <div 
                className="absolute"
                style={{ 
                  left: hookX - 8, 
                  top: hookY - 8,
                  transform: isHookDropped ? 'scale(1.2)' : 'scale(1)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                  transition: 'left 0.05s ease-out, top 0.1s ease-out, transform 0.2s ease-out'
                }}
              >
                <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full border-2 border-yellow-300 shadow-lg" />
              </div>

              {/* 물고기들 */}
              {fish.map(f => !f.caught && (
                <div
                  key={f.id}
                  className="absolute transition-all duration-75 ease-linear"
                  style={{ 
                    left: f.x - 25, 
                    top: f.y - 25,
                    transform: f.direction === -1 ? 'scaleX(-1)' : 'scaleX(1)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    zIndex: 10
                  }}
                >
                  <img 
                    src={f.type.icon} 
                    alt={f.type.name}
                    className="w-12 h-12 object-contain"
                    style={{
                      filter: f.type.rarity === 'legendary' ? 'drop-shadow(0 0 8px gold)' : 
                             f.type.rarity === 'rare' ? 'drop-shadow(0 0 6px #3b82f6)' :
                             'drop-shadow(0 0 4px rgba(255,255,255,0.5))'
                    }}
                  />
                </div>
              ))}

              {/* 물결 효과 */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-700/90 to-transparent">
                <div className="absolute bottom-0 left-0 right-0">
                  <div className="h-3 bg-gradient-to-r from-blue-300/60 via-blue-200/80 to-blue-300/60 animate-pulse" />
                  <div className="h-2 bg-gradient-to-r from-blue-400/40 via-blue-300/60 to-blue-400/40 animate-pulse delay-300" />
                  <div className="h-1 bg-gradient-to-r from-blue-500/30 via-blue-400/50 to-blue-500/30 animate-pulse delay-700" />
                </div>
              </div>

              {isPaused && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-4xl font-bold">⏸️ 일시정지</div>
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <div className="bg-blue-100/80 rounded-lg p-3 text-blue-800">
                <p className="font-semibold text-sm">💡 조작법</p>
                <p className="text-xs mt-1">
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono shadow">A</kbd>/<kbd className="px-2 py-1 bg-white rounded text-xs font-mono shadow">←</kbd> 왼쪽 이동 | 
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono shadow mx-1">D</kbd>/<kbd className="px-2 py-1 bg-white rounded text-xs font-mono shadow">→</kbd> 오른쪽 이동 | 
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono shadow mx-1">S</kbd>/<kbd className="px-2 py-1 bg-white rounded text-xs font-mono shadow">↓</kbd> 내리기 | 
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono shadow mx-1">W</kbd>/<kbd className="px-2 py-1 bg-white rounded text-xs font-mono shadow">↑</kbd> 올리기
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 잡은 물고기 목록 */}
        {catchedFish.length > 0 && (
          <Card className="mt-6 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">🏆 잡은 DevOps 생물들</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[...new Set(catchedFish.map(f => f.id))].map(fishId => {
                  const fishType = fishTypes.find(f => f.id === fishId)!
                  const count = catchedFish.filter(f => f.id === fishId).length
                  return (
                    <Badge key={fishId} className={`${rarityColors[fishType.rarity]} flex items-center gap-2 px-3 py-2`}>
                      <img src={fishType.icon} alt={fishType.name} className="w-5 h-5 object-contain" />
                      {fishType.name} x{count}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 게임 오버 */}
        {isGameOver && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-center text-blue-800">
                  🎣 낚시 완료! 🎣
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-800">{score}점</div>
                    <div className="text-blue-600">총 {fishCaught}마리 잡음</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button onClick={startGame} className="w-full bg-blue-600 hover:bg-blue-700">
                      다시 낚시하기
                    </Button>
                    <Button onClick={resetGame} variant="outline" className="w-full">
                      메인으로
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}