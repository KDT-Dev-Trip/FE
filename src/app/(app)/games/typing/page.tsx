"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, Trophy, Clock, Target, Zap } from "lucide-react"

interface GameSession {
  id: string
  title: string
  description: string
  category: 'docker' | 'kubernetes' | 'terraform' | 'ansible' | 'git' | 'linux'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  commands: string[]
  icon: string
}

const gameSessions: GameSession[] = [
  {
    id: 'docker-basics',
    title: 'Docker 이미지 빌드하기',
    description: 'Docker 컨테이너 생성부터 배포까지의 기본 명령어들을 연습합니다',
    category: 'docker',
    difficulty: 'beginner',
    icon: '🐳',
    commands: [
      'docker --version',
      'docker pull nginx:latest',
      'docker images',
      'docker run -d --name my-nginx -p 8080:80 nginx:latest',
      'docker ps',
      'docker logs my-nginx',
      'docker exec -it my-nginx bash',
      'docker stop my-nginx',
      'docker rm my-nginx',
      'docker rmi nginx:latest'
    ]
  },
  {
    id: 'kubernetes-deploy',
    title: 'Kubernetes 앱 배포하기',
    description: '쿠버네티스 클러스터에 애플리케이션을 배포하는 과정을 학습합니다',
    category: 'kubernetes',
    difficulty: 'intermediate',
    icon: '☸️',
    commands: [
      'kubectl cluster-info',
      'kubectl get nodes',
      'kubectl create namespace my-app',
      'kubectl apply -f deployment.yaml',
      'kubectl get deployments -n my-app',
      'kubectl get pods -n my-app',
      'kubectl expose deployment my-app --port=80 --target-port=8080 -n my-app',
      'kubectl get services -n my-app',
      'kubectl scale deployment my-app --replicas=3 -n my-app',
      'kubectl delete namespace my-app'
    ]
  },
  {
    id: 'terraform-infra',
    title: 'Terraform 인프라 구축',
    description: 'Infrastructure as Code로 클라우드 리소스를 관리하는 방법을 익힙니다',
    category: 'terraform',
    difficulty: 'advanced',
    icon: '🏗️',
    commands: [
      'terraform --version',
      'terraform init',
      'terraform fmt',
      'terraform validate',
      'terraform plan -out=tfplan',
      'terraform apply tfplan',
      'terraform state list',
      'terraform output',
      'terraform refresh',
      'terraform destroy'
    ]
  },
  {
    id: 'git-workflow',
    title: 'Git 워크플로우 마스터',
    description: 'Git을 활용한 효율적인 버전 관리 워크플로우를 연습합니다',
    category: 'git',
    difficulty: 'beginner',
    icon: '📚',
    commands: [
      'git status',
      'git add .',
      'git commit -m "Initial commit"',
      'git branch feature/new-feature',
      'git checkout feature/new-feature',
      'git push origin feature/new-feature',
      'git checkout main',
      'git pull origin main',
      'git merge feature/new-feature',
      'git branch -d feature/new-feature'
    ]
  }
]

const categoryColors = {
  docker: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  kubernetes: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  terraform: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  ansible: 'bg-red-500/20 text-red-300 border-red-500/30',
  git: 'bg-green-500/20 text-green-300 border-green-500/30',
  linux: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
}

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-300 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-300 border-red-500/30'
}

export default function TypingGamePage() {
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0)
  const [currentInput, setCurrentInput] = useState('')
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [errors, setErrors] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [cheatingAttempts, setCheatingAttempts] = useState(0)
  const [showCheatingWarning, setShowCheatingWarning] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const gameTimerRef = useRef<NodeJS.Timeout>()

  const currentCommand = selectedSession?.commands[currentCommandIndex] || ''
  const progress = selectedSession ? (currentCommandIndex / selectedSession.commands.length) * 100 : 0

  const calculateStats = useCallback(() => {
    if (!startTime || !selectedSession) return

    const now = new Date()
    const timeElapsed = (now.getTime() - startTime.getTime()) / 1000 / 60 // minutes
    const totalChars = selectedSession.commands.slice(0, currentCommandIndex + 1).join('').length
    const wordsTyped = totalChars / 5 // standard: 5 chars = 1 word
    const currentWpm = Math.round(wordsTyped / Math.max(timeElapsed, 0.1))
    const currentAccuracy = Math.round(((totalChars - errors) / totalChars) * 100)
    
    setWpm(currentWpm)
    setAccuracy(isNaN(currentAccuracy) ? 100 : currentAccuracy)
  }, [startTime, selectedSession, currentCommandIndex, errors])

  const startGame = (session: GameSession) => {
    setSelectedSession(session)
    setCurrentCommandIndex(0)
    setCurrentInput('')
    setStartTime(new Date())
    setEndTime(null)
    setErrors(0)
    setIsComplete(false)
    setIsPlaying(true)
    setWpm(0)
    setAccuracy(100)
    
    // Focus input after a brief delay
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // 간단한 복붙 방지: paste 이벤트와 키보드 단축키만 차단
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+V 또는 Cmd+V 차단
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault()
      setCheatingAttempts(prev => prev + 1)
      setShowCheatingWarning(true)
      setTimeout(() => setShowCheatingWarning(false), 3000)
      
      if (cheatingAttempts >= 2) {
        alert('복사-붙여넣기는 금지되어 있습니다! 🚫')
        resetGame()
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaying || isComplete) return
    
    const value = e.target.value
    setCurrentInput(value)

    // Check for errors
    if (!currentCommand.startsWith(value) && value !== '') {
      setErrors(prev => prev + 1)
    }

    // Check if command is complete
    if (value === currentCommand) {
      const nextIndex = currentCommandIndex + 1
      
      if (nextIndex >= selectedSession!.commands.length) {
        // Game complete
        setEndTime(new Date())
        setIsComplete(true)
        setIsPlaying(false)
      } else {
        // Move to next command
        setCurrentCommandIndex(nextIndex)
        setCurrentInput('')
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentInput === currentCommand) {
      handleInputChange({ target: { value: currentCommand } } as any)
    }
  }

  const resetGame = () => {
    setSelectedSession(null)
    setIsPlaying(false)
    setCurrentCommandIndex(0)
    setCurrentInput('')
    setStartTime(null)
    setEndTime(null)
    setErrors(0)
    setIsComplete(false)
    setWpm(0)
    setAccuracy(100)
    setCheatingAttempts(0)
    setShowCheatingWarning(false)
  }

  // 복붙 방지 이벤트 핸들러들
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    setCheatingAttempts(prev => prev + 1)
    setShowCheatingWarning(true)
    setTimeout(() => setShowCheatingWarning(false), 3000)
    
    if (cheatingAttempts >= 2) {
      alert('복사-붙여넣기는 금지되어 있습니다! 🚫')
      resetGame()
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault() // 우클릭 방지
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault() // 드래그 방지
  }

  const togglePause = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      inputRef.current?.focus()
    }
  }

  useEffect(() => {
    if (isPlaying && startTime) {
      gameTimerRef.current = setInterval(calculateStats, 100)
    } else {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    }
    
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    }
  }, [isPlaying, startTime, calculateStats])

  if (!selectedSession) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              DevOps 타자 게임 ⌨️
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              실전 DevOps 명령어를 타이핑하며 속도와 정확도를 향상시키세요. 한컴타자연습의 DevOps 버전입니다!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gameSessions.map((session) => (
              <Card key={session.id} className="bg-gray-900/50 border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{session.icon}</span>
                      <div>
                        <CardTitle className="text-white group-hover:text-blue-300 transition-colors">
                          {session.title}
                        </CardTitle>
                        <p className="text-gray-400 text-sm mt-1">{session.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <Badge className={categoryColors[session.category]}>
                        {session.category.toUpperCase()}
                      </Badge>
                      <Badge className={difficultyColors[session.difficulty]}>
                        {session.difficulty.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {session.commands.length} commands
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => startGame(session)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    게임 시작
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={resetGame} variant="outline" size="sm">
              ← 돌아가기
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedSession.icon}</span>
              <h1 className="text-2xl font-bold text-white">{selectedSession.title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={togglePause} size="sm" variant="outline">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button onClick={() => startGame(selectedSession)} size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{wpm}</div>
              <div className="text-sm text-gray-400">WPM</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{accuracy}%</div>
              <div className="text-sm text-gray-400">정확도</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{errors}</div>
              <div className="text-sm text-gray-400">오타</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{currentCommandIndex + 1}</div>
              <div className="text-sm text-gray-400">/ {selectedSession.commands.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>진행률</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Game Area */}
        <Card className="bg-gray-900/50 border-gray-700/50 mb-8">
          <CardContent className="p-8">
            {isComplete ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">게임 완료! 🎉</h2>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                  <div className="bg-gray-800/50 p-4 rounded">
                    <div className="text-2xl font-bold text-blue-400">{wpm}</div>
                    <div className="text-sm text-gray-400">WPM</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded">
                    <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
                    <div className="text-sm text-gray-400">정확도</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded">
                    <div className="text-2xl font-bold text-red-400">{errors}</div>
                    <div className="text-sm text-gray-400">오타</div>
                  </div>
                </div>
                <Button onClick={() => startGame(selectedSession)} className="bg-blue-600 hover:bg-blue-700">
                  다시 도전하기
                </Button>
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-400 mb-2">
                  명령어 {currentCommandIndex + 1} / {selectedSession.commands.length}
                </div>
                
                <div className="bg-black/50 p-6 rounded-lg font-mono mb-6 border border-gray-700">
                  <div className="text-gray-400 text-lg mb-4 leading-relaxed">
                    {currentCommand.split('').map((char, index) => {
                      const typedChar = currentInput[index]
                      if (index < currentInput.length) {
                        return (
                          <span 
                            key={index}
                            className={typedChar === char ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'}
                          >
                            {char}
                          </span>
                        )
                      }
                      return (
                        <span 
                          key={index}
                          className={index === currentInput.length ? 'bg-blue-400/30 animate-pulse' : 'text-gray-400'}
                        >
                          {char}
                        </span>
                      )
                    })}
                  </div>
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  onContextMenu={handleContextMenu}
                  onDragStart={handleDragStart}
                  disabled={!isPlaying}
                  placeholder={isPlaying ? "명령어를 입력하세요..." : "게임이 일시정지되었습니다"}
                  className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-lg focus:outline-none focus:border-blue-500 disabled:opacity-50 select-none"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                
                <div className="mt-4 text-sm text-gray-400 text-center">
                  💡 Tip: 정확하게 타이핑하면 자동으로 다음 명령어로 넘어갑니다
                </div>
                
                {showCheatingWarning && (
                  <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-center animate-pulse">
                    🚫 부정행위가 감지되었습니다! 복사-붙여넣기는 금지입니다. ({cheatingAttempts}/3 경고)
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}