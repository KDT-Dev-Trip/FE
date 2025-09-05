"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Book, 
  ArrowRight,
  Container,
  Globe,
  Package,
  Code,
  Terminal,
  Users,
  Star,
  Clock,
  Zap,
  MessageCircle,
  X,
  Send,
  Bot,
  BarChart3,
  Activity,
  GitBranch,
  Settings,
  CornerDownLeft
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ChatMessage {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

const ChatBot = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '안녕하세요! 저는 도비입니다. DevOps 여행에서 궁금한 점이 있으시면 언제든 물어보세요! ✨',
      isBot: true,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatSize, setChatSize] = useState({ width: 320, height: 384 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // 봇 응답 시뮬레이션
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(inputMessage),
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    
    if (input.includes('docker') || input.includes('도커')) {
      return '🐳 Docker에 대해 궁금하시군요! Docker는 컨테이너화 기술의 핵심입니다. 가상화보다 가볍고 효율적이며, 애플리케이션을 어디서든 동일하게 실행할 수 있게 해줍니다. Docker 가이드에서 자세히 알아보세요!'
    }
    
    if (input.includes('kubernetes') || input.includes('쿠버네티스') || input.includes('k8s')) {
      return '☸️ Kubernetes는 컨테이너 오케스트레이션의 표준입니다! 여러 컨테이너를 자동으로 관리하고, 스케일링, 로드밸런싱, 자동 복구 등을 제공합니다. 중급 이상 사용자에게 추천드려요.'
    }
    
    if (input.includes('helm') || input.includes('헬름')) {
      return '⚓ Helm은 Kubernetes를 위한 패키지 매니저입니다! 복잡한 Kubernetes 애플리케이션을 간단하게 배포하고 관리할 수 있게 해줍니다. Chart 템플릿을 활용하면 배포가 훨씬 쉬워져요.'
    }
    
    if (input.includes('prometheus') || input.includes('프로메테우스') || input.includes('모니터링')) {
      return '📊 Prometheus는 시계열 데이터베이스 기반의 모니터링 시스템입니다! 메트릭을 수집하고 저장하며, PromQL로 강력한 쿼리가 가능해요. Grafana와 함께 사용하면 완벽한 모니터링 스택을 구축할 수 있습니다.'
    }
    
    if (input.includes('grafana') || input.includes('그라파나') || input.includes('대시보드')) {
      return '📈 Grafana는 데이터 시각화의 끝판왕입니다! Prometheus 데이터를 아름다운 차트와 대시보드로 만들어 실시간 시스템 상태를 한눈에 볼 수 있어요. 알림 설정도 가능합니다.'
    }
    
    if (input.includes('argocd') || input.includes('아르고') || input.includes('gitops')) {
      return '🔄 ArgoCD는 GitOps의 핵심 도구입니다! Git 저장소를 진실의 원천으로 사용하여 Kubernetes에 자동으로 배포해요. 선언적 방식으로 안전하고 추적 가능한 배포가 가능합니다.'
    }
    
    if (input.includes('terraform') || input.includes('테라폼') || input.includes('iac')) {
      return '🏗️ Terraform은 Infrastructure as Code의 대표 도구입니다! 코드로 클라우드 인프라를 정의하고 관리할 수 있어요. AWS, Azure, GCP 등 모든 주요 클라우드를 지원합니다.'
    }
    
    if (input.includes('시작') || input.includes('초보') || input.includes('처음')) {
      return '🚀 DevOps를 처음 시작하신다면 Docker부터 시작하시는 것을 추천합니다! Docker → Kubernetes → Helm 순서로 기초를 다진 후, Prometheus/Grafana로 모니터링, ArgoCD로 GitOps, Terraform으로 IaC까지 학습하시면 완벽해요!'
    }
    
    if (input.includes('실습') || input.includes('환경')) {
      return '💻 실습 환경은 로컬에서 Docker Desktop과 Minikube를 설치하시면 됩니다. 각 가이드에 환경 설정 방법이 자세히 나와있으니 따라해보세요. 클라우드 환경도 활용하실 수 있어요!'
    }

    return `💡 "${userInput}"에 대한 구체적인 답변을 드리기 어렵지만, DevOps 관련 질문이시라면 Docker, Kubernetes, Helm, Prometheus, Grafana, ArgoCD, Terraform 가이드를 참고해보세요. 더 구체적으로 질문해주시면 더 정확한 답변을 드릴 수 있어요!`
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: chatSize.width,
      height: chatSize.height
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const deltaX = resizeStart.x - e.clientX
      const deltaY = resizeStart.y - e.clientY
      
      const newWidth = Math.max(280, Math.min(600, resizeStart.width + deltaX))
      const newHeight = Math.max(200, Math.min(800, resizeStart.height + deltaY))
      
      setChatSize({ width: newWidth, height: newHeight })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStart])

  if (!isOpen) return null

  return (
    <div 
      className="fixed bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl z-50 flex flex-col animate-[slideInUp_0.3s_ease-out]"
      style={{ 
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        width: `${chatSize.width}px`, 
        height: `${chatSize.height}px`,
        minWidth: '280px',
        minHeight: '200px',
        maxWidth: '600px',
        maxHeight: '800px',
        cursor: isResizing ? 'nw-resize' : 'default'
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src="/dobi.png"
              alt="도비"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-white font-medium">도비</h3>
            <p className="text-xs text-slate-400">온라인</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" style={{ height: `${chatSize.height - 120}px` }}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.isBot ? "justify-start" : "justify-end"
              )}
            >
              {message.isBot && (
                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="/dobi.png"
                    alt="도비"
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-lg p-3 text-sm",
                  message.isBot
                    ? "bg-slate-800 text-slate-100"
                    : "bg-blue-500 text-white"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src="/dobi.png"
                  alt="도비"
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2 items-start h-10 -mt-2">
          <Input
            placeholder="궁금한 점을 물어보세요..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 h-10"
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 h-10 aspect-square p-0 flex items-center justify-center"
          >
            <CornerDownLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* 리사이즈 핸들 */}
      <div 
        className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize bg-transparent hover:bg-slate-600/20"
        onMouseDown={handleResizeStart}
      />
      <div 
        className="absolute top-0 left-3 right-3 h-3 cursor-n-resize bg-transparent hover:bg-slate-600/20"
        onMouseDown={handleResizeStart}
      />
      <div 
        className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize bg-transparent hover:bg-slate-600/20"
        onMouseDown={handleResizeStart}
      />
      <div 
        className="absolute left-0 top-3 bottom-3 w-3 cursor-w-resize bg-transparent hover:bg-slate-600/20"
        onMouseDown={handleResizeStart}
      />
      <div 
        className="absolute right-0 top-3 bottom-3 w-3 cursor-e-resize bg-transparent hover:bg-slate-600/20"
        onMouseDown={handleResizeStart}
      />
    </div>
  )
}

const TechCard = ({ 
  icon: Icon, 
  title, 
  description, 
  level, 
  readTime, 
  rating, 
  href,
  gradient,
  tags 
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  level: string
  readTime: string
  rating: number
  href: string
  gradient: string
  tags: string[]
}) => {
  return (
    <Card className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 group flex flex-col">
      <CardHeader className="pb-4 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${gradient} backdrop-blur-sm w-fit`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">
            {level}
          </Badge>
        </div>
        
        <CardTitle className="text-xl text-white mb-2 group-hover:text-blue-300 transition-colors">
          {title}
        </CardTitle>
        
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-blue-500/10 text-blue-300 border-blue-500/30">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 mt-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{readTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{rating}</span>
            </div>
          </div>
        </div>
        
        <Link href={href}>
          <Button className="w-full group-hover:scale-105 transition-transform bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
            가이드 보기
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

const FeatureCard = ({ icon: Icon, title, description }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) => {
  return (
    <div className="text-center space-y-4">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 w-fit mx-auto">
        <Icon className="w-8 h-8 text-blue-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  )
}

export default function TechGuidesPage() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* 헤더 */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
              DevOps 기술 가이드
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              현대적인 개발 환경에서 필수적인 DevOps 기술들을 체계적으로 학습하세요. 
              실무 중심의 가이드와 핸즈온 실습을 통해 전문성을 키워보세요.
            </p>
          </div>
        </div>

        {/* 특징 소개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Code}
            title="실무 중심 내용"
            description="실제 프로덕션 환경에서 사용되는 설정과 베스트 프랙티스를 다룹니다"
          />
          <FeatureCard
            icon={Terminal}
            title="핸즈온 실습"
            description="단계별 실습과 예제 코드를 통해 직접 경험하며 학습합니다"
          />
          <FeatureCard
            icon={Users}
            title="전문가 검증"
            description="30년차 DevOps 엔지니어의 경험과 노하우가 집약된 콘텐츠"
          />
        </div>

        {/* 기술 가이드 카드들 */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">기술별 전문 가이드</h2>
            <p className="text-slate-400">각 기술의 기초부터 고급 활용까지 단계별로 학습하세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TechCard
              icon={Container}
              title="Docker 완벽 가이드"
              description="컨테이너화 기술의 핵심인 Docker를 기초부터 프로덕션 운영까지 완벽하게 마스터하세요. 실무에서 바로 활용할 수 있는 노하우를 제공합니다."
              level="초급 ~ 고급"
              readTime="2-3시간"
              rating={4.9}
              href="/guides/docker"
              gradient="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
              tags={["컨테이너", "가상화", "배포"]}
            />

            <TechCard
              icon={Globe}
              title="Kubernetes 마스터 가이드"
              description="컨테이너 오케스트레이션의 표준인 Kubernetes를 완전히 이해하고, 클러스터 관리부터 고급 운영까지 전문가 수준으로 학습하세요."
              level="중급 ~ 고급"
              readTime="4-5시간"
              rating={4.8}
              href="/guides/kubernetes"
              gradient="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30"
              tags={["오케스트레이션", "클러스터", "마이크로서비스"]}
            />

            <TechCard
              icon={Package}
              title="Helm 패키지 관리"
              description="Kubernetes 애플리케이션을 효율적으로 관리할 수 있는 Helm을 마스터하고, 복잡한 배포를 간단하게 만드는 방법을 배워보세요."
              level="중급"
              readTime="3-4시간"
              rating={4.7}
              href="/guides/helm"
              gradient="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
              tags={["패키지 관리", "템플릿", "배포 자동화"]}
            />

            <TechCard
              icon={BarChart3}
              title="Prometheus 모니터링"
              description="시계열 데이터베이스와 강력한 쿼리 언어(PromQL)를 활용하여 시스템 모니터링과 알림 시스템을 구축해보세요."
              level="중급"
              readTime="4-5시간"
              rating={4.8}
              href="/guides/prometheus"
              gradient="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30"
              tags={["모니터링", "메트릭", "알림", "PromQL"]}
            />

            <TechCard
              icon={Activity}
              title="Grafana 대시보드"
              description="Prometheus 데이터를 시각화하여 아름다운 대시보드를 만들고, 실시간 시스템 상태를 모니터링하는 방법을 학습하세요."
              level="중급"
              readTime="3-4시간"
              rating={4.9}
              href="/guides/grafana"
              gradient="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
              tags={["대시보드", "시각화", "알림", "모니터링"]}
            />

            <TechCard
              icon={GitBranch}
              title="ArgoCD GitOps"
              description="Git을 통한 지속적 배포와 GitOps 패턴을 실습해보고, 선언적 방식으로 Kubernetes 애플리케이션을 관리하세요."
              level="고급"
              readTime="5-6시간"
              rating={4.6}
              href="/guides/argocd"
              gradient="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
              tags={["GitOps", "CI/CD", "자동화", "배포"]}
            />

            <TechCard
              icon={Settings}
              title="Terraform IaC"
              description="Infrastructure as Code를 통해 클라우드 리소스를 선언적으로 관리하고, 인프라 프로비저닝을 자동화하는 방법을 배우세요."
              level="고급"
              readTime="6-7시간"
              rating={4.7}
              href="/guides/terraform"
              gradient="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30"
              tags={["IaC", "프로비저닝", "클라우드", "자동화"]}
            />
          </div>
        </div>

        {/* 학습 경로 추천 */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Book className="w-6 h-6 text-emerald-400" />
              추천 학습 경로
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-emerald-400">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-300 mb-2">Docker 기초 다지기</h3>
                  <p className="text-slate-400 text-sm">컨테이너 개념부터 이미지 빌드, 컨테이너 관리까지</p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-blue-400">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Kubernetes 전문가</h3>
                  <p className="text-slate-400 text-sm">클러스터 아키텍처부터 고급 운영 기법까지</p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-purple-400">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">Helm으로 완성</h3>
                  <p className="text-slate-400 text-sm">패키지 관리와 배포 자동화로 전문성 완성</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 실습 환경 안내 */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-400" />
              실습 환경 준비
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-orange-300 font-semibold mb-3">로컬 개발 환경</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>• Docker Desktop (Windows/Mac)</li>
                  <li>• Minikube 또는 Kind (로컬 K8s)</li>
                  <li>• kubectl CLI</li>
                  <li>• Helm CLI</li>
                  <li>• 선호하는 텍스트 에디터</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-orange-300 font-semibold mb-3">클라우드 환경 (선택)</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>• AWS EKS / Google GKE / Azure AKS</li>
                  <li>• 클라우드 CLI 도구</li>
                  <li>• Terraform (Infrastructure as Code)</li>
                  <li>• 모니터링 도구 (Prometheus, Grafana)</li>
                  <li>• CI/CD 파이프라인</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-blue-300 font-medium mb-2">💡 학습 팁</p>
              <p className="text-slate-400 text-sm">
                각 가이드는 독립적으로 학습 가능하지만, Docker → Kubernetes → Helm 순서로 진행하시면 
                더욱 효과적인 학습이 가능합니다. 실습 위주로 진행하여 실무 역량을 키워보세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 챗봇 호출 버튼 */}
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-2xl hover:scale-110 hover:shadow-3xl transition-all duration-300 ease-out z-50 animate-bounce"
          style={{ animationDuration: '2s' }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* 챗봇 */}
      <ChatBot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  )
}