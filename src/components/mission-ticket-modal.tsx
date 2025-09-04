"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Plane, 
  Clock, 
  Star, 
  MapPin, 
  Users,
  CheckCircle2,
  X,
  Ticket,
  QrCode
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Mission, City, Country } from "@/types/mission"
import { DIFFICULTY_CONFIG, ANIMATION_DURATIONS } from "@/lib/constants"
import { useKeyboardNavigation, useFocusTrap } from "@/hooks/use-keyboard-navigation"
import { TicketSystem } from "@/components/ticket-system"

interface MissionTicketModalProps {
  mission: Mission
  city: City
  country: Country
  isOpen: boolean
  onClose: () => void
}

export function MissionTicketModal({ 
  mission, 
  city, 
  country, 
  isOpen, 
  onClose 
}: MissionTicketModalProps) {
  const [isBooking, setIsBooking] = useState(false)
  const [showPlaneAnimation, setShowPlaneAnimation] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [showWhiteScreen, setShowWhiteScreen] = useState(false)
  const [showTicketSystem, setShowTicketSystem] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  
  const difficultyInfo = DIFFICULTY_CONFIG[mission.difficulty]
  
  // 키보드 네비게이션 추가
  useKeyboardNavigation({
    onEscape: onClose,
    enabled: isOpen && !isBooking
  })
  
  // 포커스 트랩 추가
  useFocusTrap(modalRef, isOpen && !isBooking)
  const currentDate = new Date().toLocaleDateString('ko-KR')
  const flightNumber = `DT${Math.floor(Math.random() * 9000) + 1000}`
  const gate = `G${Math.floor(Math.random() * 50) + 1}`
  const seat = `${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`

  const handleTicketUse = () => {
    // 티켓을 사용한 후 미션 시작
    setShowTicketSystem(false)
    startMission()
  }

  const handleBooking = () => {
    // 티켓 시스템 표시
    setShowTicketSystem(true)
  }

  const startMission = () => {
    setIsBooking(true)
    setShowPlaneAnimation(true)
    
    // 로딩 메시지들 (15초로 단축)
    const messages = [
      { text: '✈️ 탑승 중입니다...', delay: 0 },
      { text: '🛫 이륙 준비 중...', delay: 1500 },
      { text: '☁️ 구름을 뚫고 상승 중...', delay: 3000 },
      { text: '🌟 안전고도에 도달했습니다', delay: 4500 },
      { text: '🧭 목적지로 항로 설정 중...', delay: 6000 },
      { text: '⚡ 제트엔진 최대 출력!', delay: 7500 },
      { text: '🗺️ 미션 환경 준비 중...', delay: 9000 },
      { text: '💻 개발환경 세팅 중...', delay: 10500 },
      { text: '📚 학습자료 로딩 중...', delay: 12000 },
      { text: '🎯 미션 시작 준비 완료!', delay: 13500 }
    ]
    
    messages.forEach(({ text, delay }) => {
      setTimeout(() => {
        setLoadingMessage(text)
      }, delay)
    })
    
    // 14초 후에 화면 전환 효과 시작
    setTimeout(() => {
      setShowWhiteScreen(true)
    }, 14000)
    
    // 15초 후에 페이지 전환
    setTimeout(() => {
      window.location.href = `/missions/${country.stack}/${mission.id}`
    }, ANIMATION_DURATIONS.MODAL_LOADING)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 bg-transparent border-0 shadow-none">
        <DialogTitle className="sr-only">미션 항공편 예약 - {mission.title}</DialogTitle>
        <div ref={modalRef} className="relative animate-fade-in-scale animate-ticket-float depth-effect" role="dialog" aria-labelledby="mission-title" aria-describedby="mission-description">
          
          <Card className="overflow-hidden bg-gradient-to-br from-slate-50/95 to-blue-50/95 border border-white/20 shadow-2xl card-3d animate-premium-glow backdrop-blur-sm">
            <div className="relative">
              {/* 헤더 - 항공사 정보 */}
              <div className={cn(
                "relative overflow-hidden px-8 py-6 bg-gradient-to-r",
                country.color
              )}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-white">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                        <Plane className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">DevTrip Airlines</h2>
                        <p className="text-blue-100 text-sm">DevOps Learning Journey</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-white">
                    <p className="text-sm opacity-80">탑승권 • BOARDING PASS</p>
                    <p className="font-mono text-lg font-bold">{flightNumber}</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                {/* 메인 티켓 섹션 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* 메인 티켓 정보 */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <span className="text-6xl animate-float">{country.flag}</span>
                        <div>
                          <h3 className="text-3xl font-bold text-gray-800">{mission.title}</h3>
                          <p className="text-gray-600 text-lg">{country.description}</p>
                        </div>
                      </div>
                      <Badge className={cn("px-4 py-2 text-sm font-bold", difficultyInfo.color)}>
                        {difficultyInfo.label}
                      </Badge>
                    </div>

                    {/* 출발지-목적지 정보 */}
                    <div className="flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">출발지 • FROM</p>
                        <p className="text-3xl font-bold text-gray-800">ICN</p>
                        <p className="text-sm text-gray-600">인천국제공항</p>
                        <p className="text-xs text-gray-400 mt-1">Seoul, Korea</p>
                      </div>
                      
                      <div className="flex-1 mx-8 relative">
                        <div className="h-px bg-gradient-to-r from-gray-300 via-blue-400 to-gray-300 relative">
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 border-2 border-blue-400">
                            <Plane className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">예상 비행시간: {mission.estimatedTime}분</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">목적지 • TO</p>
                        <p className="text-3xl font-bold text-gray-800">{city.name.substring(0, 3).toUpperCase()}</p>
                        <p className="text-sm text-gray-600">{city.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{country.name}</p>
                      </div>
                    </div>

                    {/* 미션 세부 정보 */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <div>
                            <p className="text-sm text-gray-500">평점</p>
                            <p className="font-semibold text-gray-800">{mission.rating}/5.0</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-500">예상 소요시간</p>
                            <p className="font-semibold text-gray-800">{mission.estimatedTime}분</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-500">기술 스택</p>
                            <p className="font-semibold text-gray-800 uppercase">{country.stack}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-500">난이도</p>
                            <p className="font-semibold text-gray-800">{difficultyInfo.label}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 선수 과목 */}
                    {mission.prerequisites.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">선수 과목 • Prerequisites</p>
                        <div className="flex flex-wrap gap-2">
                          {mission.prerequisites.map((prereq) => (
                            <Badge 
                              key={prereq} 
                              variant="secondary" 
                              className="bg-blue-100 text-blue-700 border border-blue-200"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {prereq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 탑승권 스텁 */}
                  <div className="lg:col-span-1">
                    <div className="h-full bg-gradient-to-b from-gray-100 to-white border-2 border-dashed border-gray-300 rounded-2xl p-6 relative overflow-hidden">
                      {/* 장식용 원형 컷아웃 */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full border-2 border-dashed border-gray-300"></div>
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full border-2 border-dashed border-gray-300"></div>
                      
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-6">
                            <Ticket className="w-5 h-5 text-primary" />
                            <p className="font-semibold text-gray-700">탑승 정보</p>
                          </div>
                          
                          <div className="space-y-4 text-sm">
                            <div className="border-b border-gray-200 pb-3">
                              <p className="text-gray-500">항공편</p>
                              <p className="font-mono font-bold text-gray-800 text-lg">{flightNumber}</p>
                            </div>
                            <div className="border-b border-gray-200 pb-3">
                              <p className="text-gray-500">날짜</p>
                              <p className="font-semibold text-gray-800">{currentDate}</p>
                            </div>
                            <div className="border-b border-gray-200 pb-3">
                              <p className="text-gray-500">좌석</p>
                              <p className="font-mono font-bold text-gray-800">{seat}</p>
                            </div>
                            <div className="border-b border-gray-200 pb-3">
                              <p className="text-gray-500">게이트</p>
                              <p className="font-mono font-bold text-gray-800">{gate}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">클래스</p>
                              <p className="font-semibold text-gray-800">DevOps Premium</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center mt-6">
                          <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3 animate-pulse">
                            <QrCode className="w-12 h-12 text-white" />
                          </div>
                          <p className="text-xs text-gray-500">Mobile Boarding Pass</p>
                          <p className="text-xs text-gray-400 mt-1">Scan at gate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* 액션 버튼들 */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 py-6 text-lg border-2 hover:bg-gray-50 hover:text-gray-700 text-gray-700 border-gray-300"
                    disabled={isBooking}
                  >
                    나중에 예약
                  </Button>
                  <Button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className={cn(
                      "flex-1 py-6 text-lg font-bold text-gray-700 shadow-2xl hover:scale-105 transition-all duration-300",
                      "bg-gradient-to-r", difficultyInfo.gradient,
                      "hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-95",
                      "border border-white/20 relative overflow-hidden",
                      isBooking && "animate-shimmer"
                    )}
                    style={!isBooking ? {
                      backgroundImage: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                      backgroundSize: '200% 100%'
                    } : undefined}
                  >
                    {isBooking ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-3"></div>
                        <span className="relative">
                          탑승 준비 중...
                          <div className="absolute -inset-1 bg-gray-700/20 rounded animate-pulse"></div>
                        </span>
                      </>
                    ) : (
                      <div className="relative flex items-center justify-center">
                        <Plane className="w-5 h-5 mr-3 animate-bounce text-gray-700" />
                        <span className="relative">
                          지금 탑승하기
                          <div className="absolute -bottom-1 left-0 w-full h-px bg-gray-700/50 animate-pulse"></div>
                        </span>
                        <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-gray-700/10 to-transparent animate-shimmer pointer-events-none"></div>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
          
          {/* 20초 비행기 애니메이션과 로딩 메시지들 */}
          {showPlaneAnimation && (
            <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden bg-gradient-to-br from-blue-900/30 via-indigo-900/40 to-slate-900/50">
              {/* 하늘 배경 효과 - 천천히 변화 */}
              <div className="absolute inset-0 opacity-0 animate-fade-in [animation-delay:0.5s] [animation-duration:2s] [animation-fill-mode:both]"
                   style={{
                     background: `
                       radial-gradient(ellipse 60% 40% at 30% 30%, rgba(135,206,235,0.4), transparent),
                       radial-gradient(ellipse 50% 35% at 70% 40%, rgba(176,196,222,0.3), transparent),
                       radial-gradient(ellipse 70% 45% at 50% 80%, rgba(119,136,153,0.2), transparent)
                     `
                   }} />
              
              {/* 천천히 움직이는 비행기 - 13초 동안 */}
              <div 
                className="absolute opacity-100 animate-slow-diagonal-flight [animation-duration:13s] [animation-fill-mode:both]"
                style={{
                  right: '5%',
                  bottom: '5%',
                  transform: 'rotate(45deg)'
                }}
              >
                <div className="relative">
                  {/* 비행기 본체 */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <Plane className="w-20 h-20 text-white drop-shadow-2xl filter brightness-110 transform -rotate-[135deg]" />
                  </div>
                  
                  {/* 강력한 제트 엔진 불꽃 */}
                  <div className="absolute top-1/2 left-full transform -translate-y-1/2">
                    {/* 메인 제트 스트림 - 더 길고 강렬하게 */}
                    <div className="w-64 h-3 bg-gradient-to-r from-orange-600 via-yellow-400 via-red-500 to-transparent animate-pulse"
                         style={{ filter: 'blur(1px)' }} />
                    <div className="w-48 h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent animate-pulse mt-[-3px]"
                         style={{ filter: 'blur(0.5px)', animationDelay: '0.4s' }} />
                    <div className="w-32 h-1 bg-gradient-to-r from-white via-yellow-200 to-transparent animate-pulse mt-[-2px]"
                         style={{ filter: 'blur(0.3px)', animationDelay: '0.2s' }} />
                    
                    {/* 제트 화염 입자들 - 더 많이 */}
                    {Array.from({ length: 20 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{
                          left: `${i * 10}px`,
                          top: `${-4 + Math.sin(i * 0.5) * 3}px`,
                          background: i % 4 === 0 ? '#ff6b35' : i % 4 === 1 ? '#f7931e' : i % 4 === 2 ? '#fff200' : '#ff4444',
                          animationDelay: `${i * 80}ms`,
                          animationDuration: `${0.4 + Math.random() * 0.6}s`
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* 비행기 주변 기류 효과 - 더 강하게 */}
                  <div className="absolute -top-12 -left-12 w-48 h-24 opacity-40"
                       style={{
                         background: 'radial-gradient(ellipse 90% 50%, rgba(255,255,255,0.4), transparent 70%)',
                         filter: 'blur(6px)',
                         animation: 'pulse 1.5s infinite'
                       }} />
                  
                  {/* 강화된 소닉 붐 효과 */}
                  <div className="absolute -inset-8 opacity-70"
                       style={{
                         background: 'radial-gradient(ellipse 140% 40%, transparent 20%, rgba(255,255,255,0.3) 30%, transparent 70%)',
                         filter: 'blur(3px)',
                         animation: 'ping 1.8s infinite'
                       }} />
                </div>
              </div>
              
              {/* 향상된 구름 효과들 - 3D 층감과 자연스러운 움직임 */}
              {Array.from({ length: 15 }, (_, i) => (
                <div
                  key={`enhanced-cloud-${i}`}
                  className="absolute opacity-0 animate-cloud-fade animate-cloud-drift animate-cloud-morph"
                  style={{
                    right: `${5 + i * 6}%`,
                    bottom: `${10 + i * 5}%`,
                    width: `${60 + i * 18}px`,
                    height: `${30 + i * 12}px`,
                    background: `radial-gradient(ellipse ${70 + Math.random() * 30}% ${50 + Math.random() * 20}% at ${40 + Math.random() * 20}% ${50 + Math.random() * 20}%, 
                      rgba(255,255,255,${0.7 - i * 0.03}), 
                      rgba(240,248,255,${0.5 - i * 0.025}) 60%, 
                      rgba(220,235,255,${0.3 - i * 0.015}) 80%, 
                      transparent 90%)`,
                    borderRadius: `${50 + Math.random() * 30}% ${60 + Math.random() * 20}% ${40 + Math.random() * 40}% ${70 + Math.random() * 15}%`,
                    filter: `blur(${1.5 + Math.random() * 2}px)`,
                    transform: `rotate(${Math.random() * 30 - 15}deg) scale(${0.8 + Math.random() * 0.4})`,
                    animationDelay: `${0.5 + i * 0.4}s`,
                    animationDuration: `${6 + i * 0.8}s`
                  }}
                />
              ))}
              
              {/* 메인 구름 덩어리들 - 볼륨감 있게 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* 큰 중앙 구름 */}
                <div 
                  className="w-[400px] h-[200px] opacity-80 animate-cloud-layer animate-cloud-morph"
                  style={{
                    background: `radial-gradient(ellipse 75% 55% at 45% 50%, 
                      rgba(255,255,255,0.9), 
                      rgba(245,252,255,0.75) 35%, 
                      rgba(230,245,255,0.5) 60%, 
                      rgba(210,235,255,0.25) 80%, 
                      transparent 90%)`,
                    borderRadius: '55% 65% 45% 75%',
                    filter: 'blur(3px)',
                    animationDuration: '20s',
                    animationDelay: '2s'
                  }}
                />
                
                {/* 좌측 보조 구름 */}
                <div 
                  className="absolute w-[300px] h-[150px] opacity-70 animate-cloud-drift animate-cloud-morph"
                  style={{
                    left: '-80px',
                    top: '20px',
                    background: `radial-gradient(ellipse 65% 50% at 60% 45%, 
                      rgba(255,255,255,0.85), 
                      rgba(240,248,255,0.65) 45%, 
                      rgba(220,240,255,0.35) 70%, 
                      transparent 85%)`,
                    borderRadius: '45% 75% 55% 35%',
                    filter: 'blur(2.5px)',
                    animationDuration: '25s',
                    animationDelay: '1s'
                  }}
                />
                
                {/* 우측 보조 구름 */}
                <div 
                  className="absolute w-[250px] h-[120px] opacity-75 animate-cloud-fade animate-cloud-morph"
                  style={{
                    right: '-60px',
                    top: '10px',
                    background: `radial-gradient(ellipse 70% 55% at 40% 55%, 
                      rgba(255,255,255,0.88), 
                      rgba(235,248,255,0.68) 40%, 
                      rgba(215,235,255,0.38) 75%, 
                      transparent 88%)`,
                    borderRadius: '35% 55% 65% 45%',
                    filter: 'blur(2.8px)',
                    animationDuration: '18s',
                    animationDelay: '3s'
                  }}
                />
              </div>
              
              {/* 로딩 메시지 표시 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/70 backdrop-blur-md rounded-3xl px-10 py-8 border border-white/30 animate-fade-in-scale shadow-2xl">
                  <div className="text-center text-white">
                    <div className="text-3xl font-bold mb-4 animate-pulse bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                      {loadingMessage}
                    </div>
                    <div className="flex justify-center items-center gap-3 mt-6">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce [animation-delay:0ms] shadow-lg"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce [animation-delay:200ms] shadow-lg"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-bounce [animation-delay:400ms] shadow-lg"></div>
                    </div>
                    <div className="mt-6 text-sm text-blue-100 font-medium tracking-wide">
                      잠시만 기다려주세요...
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 14초 후 화면 전환 효과 */}
              {showWhiteScreen && (
                <div className="absolute inset-0 bg-white opacity-0 animate-fade-in [animation-duration:1s] [animation-fill-mode:both]" />
              )}
            </div>
          )}

          {/* 티켓 시스템 모달 */}
          {showTicketSystem && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110]">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-center mb-2">🎫 티켓이 필요합니다!</h3>
                  <p className="text-gray-600 text-center text-sm">
                    미션을 시작하려면 티켓 1장이 필요합니다.
                  </p>
                </div>
                
                <TicketSystem 
                  onUseTicket={handleTicketUse}
                  canUseMission={true}
                />
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTicketSystem(false)}
                    className="flex-1 text-black hover:text-black"
                  >
                    취소
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}