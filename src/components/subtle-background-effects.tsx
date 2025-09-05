"use client"

import { useEffect, useRef, useState } from 'react'

interface FloatingDot {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  maxLife: number
}

export function SubtleBackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const dots = useRef<FloatingDot[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isVisible, setIsVisible] = useState(true)
  const mousePos = useRef({ x: 0, y: 0 })

  const createDot = (): FloatingDot => ({
    x: Math.random() * dimensions.width,
    y: Math.random() * dimensions.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.5 + 0.3,
    life: 0,
    maxLife: Math.random() * 300 + 200
  })

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas || !isVisible) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 검은 배경 유지
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, dimensions.width, dimensions.height)

    // 매우 미세한 그리드 패턴 (거의 보이지 않지만 깊이감 추가)
    ctx.strokeStyle = '#111111'
    ctx.lineWidth = 0.5
    ctx.globalAlpha = 0.3
    
    const gridSize = 50
    for (let x = 0; x < dimensions.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, dimensions.height)
      ctx.stroke()
    }
    for (let y = 0; y < dimensions.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(dimensions.width, y)
      ctx.stroke()
    }

    // 떠다니는 점들 - 매우 미세하게
    dots.current = dots.current.filter(dot => {
      dot.x += dot.vx
      dot.y += dot.vy
      dot.life++

      // 경계에서 반사
      if (dot.x <= 0 || dot.x >= dimensions.width) dot.vx *= -1
      if (dot.y <= 0 || dot.y >= dimensions.height) dot.vy *= -1

      // 마우스 근처에서 살짝 밀림 효과
      const mouseDistX = dot.x - mousePos.current.x
      const mouseDistY = dot.y - mousePos.current.y
      const mouseDist = Math.sqrt(mouseDistX * mouseDistX + mouseDistY * mouseDistY)
      
      if (mouseDist < 80) {
        dot.vx += mouseDistX / mouseDist * 0.02
        dot.vy += mouseDistY / mouseDist * 0.02
      }

      // 점 그리기
      ctx.save()
      ctx.globalAlpha = dot.opacity * (1 - dot.life / dot.maxLife)
      ctx.fillStyle = '#333333'
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
      ctx.fill()
      
      // 아주 미세한 글로우 효과
      if (dot.life < dot.maxLife * 0.5) {
        ctx.shadowColor = '#444444'
        ctx.shadowBlur = 3
        ctx.fillStyle = '#555555'
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
      
      ctx.restore()

      return dot.life < dot.maxLife
    })

    // 새 점들 추가 (적게)
    while (dots.current.length < 15) {
      dots.current.push(createDot())
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
  }

  const handleResize = () => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  useEffect(() => {
    handleResize()
    
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return
    
    dots.current = Array.from({ length: 10 }, () => createDot())
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions])

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  )
}