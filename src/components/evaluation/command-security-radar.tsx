"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface CommandAnalysis {
  id: number
  command: string
  command_category: string
  correctness_assessment: "CORRECT" | "PARTIAL" | "INCORRECT"
  efficiency_rating: number
  best_practice_score: number
  security_risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  ai_feedback: string
  analysis_confidence: number
}

interface CommandSecurityRadarProps {
  commands: CommandAnalysis[]
}

export function CommandSecurityRadar({ commands }: CommandSecurityRadarProps) {
  const safeCommands = commands || [];
  
  // Handle empty commands case
  if (safeCommands.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              보안 위험도 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-400">
              명령어 분석 데이터가 없습니다.
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">카테고리별 성능</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-400">
              카테고리 분석 데이터가 없습니다.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // 보안 위험도별 통계
  const securityStats = safeCommands.reduce((acc, cmd) => {
    acc[cmd.security_risk_level] = (acc[cmd.security_risk_level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 카테고리별 통계
  const categoryStats = safeCommands.reduce((acc, cmd) => {
    if (!acc[cmd.command_category]) {
      acc[cmd.command_category] = {
        total: 0,
        correct: 0,
        avgEfficiency: 0,
        avgBestPractice: 0,
        securityIssues: 0
      }
    }
    acc[cmd.command_category].total += 1
    if (cmd.correctness_assessment === 'CORRECT') acc[cmd.command_category].correct += 1
    acc[cmd.command_category].avgEfficiency += cmd.efficiency_rating
    acc[cmd.command_category].avgBestPractice += cmd.best_practice_score
    if (cmd.security_risk_level !== 'LOW') acc[cmd.command_category].securityIssues += 1
    return acc
  }, {} as Record<string, any>)

  // 평균값 계산
  Object.keys(categoryStats).forEach(category => {
    const stats = categoryStats[category]
    stats.avgEfficiency = stats.avgEfficiency / stats.total
    stats.avgBestPractice = stats.avgBestPractice / stats.total
    stats.successRate = (stats.correct / stats.total) * 100
  })

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
      case "MEDIUM": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30" 
      case "HIGH": return "text-orange-500 bg-orange-500/10 border-orange-500/30"
      case "CRITICAL": return "text-red-500 bg-red-500/10 border-red-500/30"
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/30"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "LOW": return <CheckCircle className="w-4 h-4" />
      case "MEDIUM": return <Shield className="w-4 h-4" />
      case "HIGH": return <AlertTriangle className="w-4 h-4" />
      case "CRITICAL": return <XCircle className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 보안 위험도 분포 */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            보안 위험도 분석
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 원형 차트 시뮬레이션 */}
          <div className="relative w-40 h-40 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="rgb(71, 85, 105)"
                strokeWidth="8"
              />
              
              {/* 각 위험도별 세그먼트 */}
              {Object.entries(securityStats).map(([risk, count], index) => {
                const total = safeCommands.length
                const percentage = (count / total) * 100
                const angle = (percentage / 100) * 360
                const startAngle = Object.entries(securityStats).slice(0, index).reduce((acc, [, c]) => 
                  acc + ((c / total) * 360), 0)
                
                const colors = {
                  LOW: "rgb(34, 197, 94)",
                  MEDIUM: "rgb(234, 179, 8)",
                  HIGH: "rgb(249, 115, 22)",
                  CRITICAL: "rgb(239, 68, 68)"
                }

                return (
                  <circle
                    key={risk}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={colors[risk as keyof typeof colors]}
                    strokeWidth="8"
                    strokeDasharray={`${(angle / 360) * 251.33} 251.33`}
                    strokeDashoffset={-((startAngle / 360) * 251.33)}
                    className="transition-all duration-300"
                  />
                )
              })}
            </svg>
            
            {/* 중앙 텍스트 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-white">{safeCommands.length}</div>
              <div className="text-xs text-slate-400">총 명령어</div>
            </div>
          </div>

          {/* 범례 */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(securityStats).map(([risk, count]) => (
              <div key={risk} className={`p-3 rounded-lg border ${getRiskColor(risk)}`}>
                <div className="flex items-center gap-2 mb-1">
                  {getRiskIcon(risk)}
                  <span className="text-sm font-medium">{risk}</span>
                </div>
                <div className="text-lg font-bold">{count}</div>
                <div className="text-xs opacity-75">
                  {((count / safeCommands.length) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 카테고리별 분석 */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">카테고리별 성능</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(categoryStats).map(([category, stats]) => (
            <div key={category} className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white capitalize">{category}</h3>
                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {stats.total} 명령어
                </Badge>
              </div>

              {/* 성능 지표들 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">성공률</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-600/50 rounded-full h-2">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${stats.successRate}%` }}
                      />
                    </div>
                    <span className="text-sm text-white font-medium">
                      {stats.successRate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-1">효율성</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-600/50 rounded-full h-2">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.avgEfficiency / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white font-medium">
                      {stats.avgEfficiency.toFixed(1)}/5
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-1">모범 사례</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-600/50 rounded-full h-2">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.avgBestPractice / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white font-medium">
                      {stats.avgBestPractice.toFixed(1)}/10
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-1">보안 이슈</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-white font-medium">
                      {stats.securityIssues}개
                    </div>
                    {stats.securityIssues === 0 ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}