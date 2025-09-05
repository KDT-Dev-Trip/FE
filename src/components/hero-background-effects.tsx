"use client"

import { useEffect, useRef, useState } from 'react'

interface FloatingCode {
  x: number
  y: number
  vx: number
  vy: number
  opacity: number
  size: number
  text: string
  life: number
  maxLife: number
}

interface OrbitingIcon {
  angle: number
  radius: number
  speed: number
  size: number
  opacity: number
  icon: string
}

export function HeroBackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const codes = useRef<FloatingCode[]>([])
  const icons = useRef<OrbitingIcon[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isVisible, setIsVisible] = useState(true)
  const mousePos = useRef({ x: 0, y: 0 })
  const time = useRef(0)

  const codeSnippets = [
    'kubectl apply -f',
    'docker build -t',
    'terraform plan',
    'ansible-playbook',
    'helm install',
    'git checkout',
    'npm run build',
    'yarn deploy',
    'docker-compose up',
    'kubectl get pods',
    'terraform apply',
    'git push origin',
    'docker run -d',
    'kubectl scale',
    'helm upgrade'
  ]

  const techIcons = ['🐳', '☸️', '🚀', '⚡', '🔧', '📦', '🌐', '💻', '🎯', '⭐']

  const createFloatingCode = (): FloatingCode => ({
    x: Math.random() * dimensions.width,
    y: Math.random() * dimensions.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -Math.random() * 0.3 - 0.1,
    opacity: Math.random() * 0.6 + 0.2,
    size: Math.random() * 14 + 10,
    text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
    life: 0,
    maxLife: Math.random() * 400 + 200
  })

  const createOrbitingIcon = (index: number): OrbitingIcon => ({
    angle: (index / 8) * Math.PI * 2,
    radius: 150 + Math.random() * 100,
    speed: 0.005 + Math.random() * 0.01,
    size: 20 + Math.random() * 10,
    opacity: 0.3 + Math.random() * 0.4,
    icon: techIcons[Math.floor(Math.random() * techIcons.length)]
  })

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas || !isVisible) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    time.current += 0.01

    // 투명한 배경으로 페이드 아웃 효과
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'
    ctx.fillRect(0, 0, dimensions.width, dimensions.height)

    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2


    // 궤도를 도는 기술 아이콘들
    icons.current.forEach(icon => {
      icon.angle += icon.speed
      const iconX = centerX + Math.cos(icon.angle) * icon.radius
      const iconY = centerY + Math.sin(icon.angle) * icon.radius

      ctx.save()
      ctx.globalAlpha = icon.opacity
      ctx.font = `${icon.size}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // 아이콘 주변 글로우
      ctx.shadowColor = '#3b82f6'
      ctx.shadowBlur = 10
      ctx.fillText(icon.icon, iconX, iconY)
      ctx.restore()
    })

    // 모서리에서 중앙으로 향하는 입자들만 유지
    codes.current = codes.current.filter(code => {
      code.x += code.vx
      code.y += code.vy
      code.life++

      ctx.save()
      ctx.globalAlpha = code.opacity * (1 - code.life / code.maxLife)
      ctx.font = `${code.size}px 'Monaco', 'Menlo', 'Ubuntu Mono', monospace`
      ctx.fillStyle = '#60a5fa'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      
      // 텍스트 글로우 효과
      ctx.shadowColor = '#3b82f6'
      ctx.shadowBlur = 8
      ctx.fillText(code.text, code.x, code.y)
      ctx.restore()

      return code.life < code.maxLife
    })

    // DNA 나선 같은 라인들
    ctx.save()
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.15
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      for (let x = 0; x < dimensions.width; x += 5) {
        const y1 = centerY + Math.sin((x + time.current * 100 + i * 120) * 0.01) * 30
        const y2 = centerY + Math.sin((x + time.current * 80 + i * 120) * 0.008) * 50
        if (x === 0) {
          ctx.moveTo(x, y1)
        } else {
          ctx.lineTo(x, y1)
        }
      }
      ctx.stroke()
    }
    ctx.restore()

    // 모서리에서 중앙으로 향하는 입자들
    if (Math.random() > 0.97) {
      const edge = Math.floor(Math.random() * 4)
      let startX, startY
      switch (edge) {
        case 0: // 상단
          startX = Math.random() * dimensions.width
          startY = 0
          break
        case 1: // 우측
          startX = dimensions.width
          startY = Math.random() * dimensions.height
          break
        case 2: // 하단
          startX = Math.random() * dimensions.width
          startY = dimensions.height
          break
        default: // 좌측
          startX = 0
          startY = Math.random() * dimensions.height
      }

      const particle = createFloatingCode()
      particle.x = startX
      particle.y = startY
      particle.vx = (centerX - startX) / 200
      particle.vy = (centerY - startY) / 200
      particle.opacity = 0.8
      particle.size = 8
      codes.current.push(particle)
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
    
    codes.current = [] // 처음에는 비어있게
    icons.current = Array.from({ length: 8 }, (_, i) => createOrbitingIcon(i))
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
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}