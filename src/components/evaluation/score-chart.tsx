"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ScoreData {
  date: string
  score: number
  mission: string
}

interface ScoreChartProps {
  data: ScoreData[]
  title?: string
}

export function ScoreChart({ data, title = "점수 추이" }: ScoreChartProps) {
  const safeData = data || [];
  
  // Handle empty data case
  if (safeData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            평가 데이터가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const maxScore = Math.max(...safeData.map(d => d.score))
  const minScore = Math.min(...safeData.map(d => d.score))
  const avgScore = safeData.reduce((sum, d) => sum + d.score, 0) / safeData.length
  
  // 점수 변화 계산
  const lastScore = safeData[0]?.score || 0
  const previousScore = safeData[1]?.score || 0
  const scoreChange = lastScore - previousScore
  const isImproving = scoreChange > 0

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            {isImproving ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className={`text-sm font-medium ${isImproving ? 'text-emerald-400' : 'text-red-400'}`}>
              {scoreChange > 0 ? '+' : ''}{scoreChange}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 점수 통계 */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400">{maxScore}</div>
            <div className="text-xs text-slate-400">최고점</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{avgScore.toFixed(1)}</div>
            <div className="text-xs text-slate-400">평균점</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">{minScore}</div>
            <div className="text-xs text-slate-400">최저점</div>
          </div>
        </div>

        {/* 스파크라인 차트 */}
        <div className="relative h-32 p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20">
          <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* 차트 영역 */}
            <path
              d={`M ${safeData.map((point, index) => {
                const x = (index / (safeData.length - 1)) * 400
                const y = 100 - ((point.score - minScore) / (maxScore - minScore)) * 80
                return index === 0 ? `M ${x},${y}` : `L ${x},${y}`
              }).join(' ')}`}
              stroke="rgb(59, 130, 246)"
              strokeWidth="3"
              fill="none"
              className="drop-shadow-lg"
            />
            
            {/* 채우기 영역 */}
            <path
              d={`M ${safeData.map((point, index) => {
                const x = (index / (safeData.length - 1)) * 400
                const y = 100 - ((point.score - minScore) / (maxScore - minScore)) * 80
                return index === 0 ? `M ${x},${y}` : `L ${x},${y}`
              }).join(' ')} L 400,100 L 0,100 Z`}
              fill="url(#scoreGradient)"
            />
            
            {/* 데이터 포인트 */}
            {safeData.map((point, index) => {
              const x = (index / (safeData.length - 1)) * 400
              const y = 100 - ((point.score - minScore) / (maxScore - minScore)) * 80
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="rgb(59, 130, 246)"
                    className="drop-shadow-sm"
                  />
                  {index === 0 && (
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill="none"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  )}
                </g>
              )
            })}
          </svg>
          
          {/* 최근 점수 표시 */}
          <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
            <span className="text-blue-400 text-sm font-medium">
              최근: {safeData[0]?.score}점
            </span>
          </div>
        </div>

        {/* 최근 평가 목록 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-400 mb-3">최근 평가</h4>
          {safeData.slice(0, 3).map((evaluation, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
              <div>
                <div className="text-sm font-medium text-white">{evaluation.mission}</div>
                <div className="text-xs text-slate-400">{evaluation.date}</div>
              </div>
              <div className={`text-lg font-bold ${
                evaluation.score >= 90 ? 'text-emerald-400' :
                evaluation.score >= 80 ? 'text-blue-400' :
                evaluation.score >= 70 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {evaluation.score}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}