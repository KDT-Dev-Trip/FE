"use client"

import { useEffect, useRef, useState, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
  type: 'normal' | 'glow' | 'spark'
}

interface FloatingGeometry {
  x: number
  y: number
  z: number
  rotation: { x: number; y: number; z: number }
  velocity: { x: number; y: number; z: number }
  rotationSpeed: { x: number; y: number; z: number }
  size: number
  type: 'cube' | 'sphere' | 'pyramid' | 'torus'
  opacity: number
}

export function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particles = useRef<Particle[]>([])
  const geometries = useRef<FloatingGeometry[]>([])
  const mousePos = useRef({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isVisible, setIsVisible] = useState(true)
  const lastFrameTime = useRef(0)
  const targetFPS = 60
  const frameInterval = 1000 / targetFPS

  const createParticle = useCallback((x?: number, y?: number): Particle => {
    const types: Particle['type'][] = ['normal', 'glow', 'spark']
    const colors = [
      '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', 
      '#f59e0b', '#ef4444', '#ec4899', '#6366f1'
    ]
    
    return {
      x: x ?? Math.random() * dimensions.width,
      y: y ?? Math.random() * dimensions.height,
      z: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      vz: (Math.random() - 0.5) * 2,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: Math.random() * 300 + 100,
      type: types[Math.floor(Math.random() * types.length)]
    }
  }, [dimensions])

  const createGeometry = useCallback((): FloatingGeometry => {
    const types: FloatingGeometry['type'][] = ['cube', 'sphere', 'pyramid', 'torus']
    
    return {
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      z: Math.random() * 2000 + 500,
      rotation: { x: 0, y: 0, z: 0 },
      velocity: {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5
      },
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      },
      size: Math.random() * 50 + 20,
      type: types[Math.floor(Math.random() * types.length)],
      opacity: Math.random() * 0.3 + 0.1
    }
  }, [dimensions])

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    const screenX = particle.x + (particle.x - dimensions.width / 2) * (particle.z / 1000) * 0.1
    const screenY = particle.y + (particle.y - dimensions.height / 2) * (particle.z / 1000) * 0.1
    const screenSize = particle.size * (1 + particle.z / 1000)

    ctx.save()
    ctx.globalAlpha = particle.opacity * (1 - particle.life / particle.maxLife)
    
    if (particle.type === 'glow') {
      const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, screenSize * 3)
      gradient.addColorStop(0, particle.color + '80')
      gradient.addColorStop(0.5, particle.color + '40')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(screenX - screenSize * 3, screenY - screenSize * 3, screenSize * 6, screenSize * 6)
    }
    
    if (particle.type === 'spark') {
      ctx.strokeStyle = particle.color
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(screenX - particle.vx * 10, screenY - particle.vy * 10)
      ctx.lineTo(screenX + particle.vx * 10, screenY + particle.vy * 10)
      ctx.stroke()
    } else {
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(screenX, screenY, screenSize, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.restore()
  }, [dimensions])

  const drawGeometry = useCallback((ctx: CanvasRenderingContext2D, geo: FloatingGeometry) => {
    const perspective = 1000
    const scale = perspective / (perspective + geo.z)
    const screenX = (geo.x - dimensions.width / 2) * scale + dimensions.width / 2
    const screenY = (geo.y - dimensions.height / 2) * scale + dimensions.height / 2
    const size = geo.size * scale

    ctx.save()
    ctx.globalAlpha = geo.opacity * scale
    ctx.translate(screenX, screenY)
    ctx.rotate(geo.rotation.z)
    
    const gradient = ctx.createLinearGradient(-size, -size, size, size)
    gradient.addColorStop(0, '#3b82f620')
    gradient.addColorStop(0.5, '#8b5cf640')
    gradient.addColorStop(1, '#06b6d420')
    
    ctx.strokeStyle = '#3b82f6'
    ctx.fillStyle = gradient
    ctx.lineWidth = 1
    
    switch (geo.type) {
      case 'cube':
        ctx.strokeRect(-size/2, -size/2, size, size)
        ctx.fillRect(-size/2, -size/2, size, size)
        break
      case 'sphere':
        ctx.beginPath()
        ctx.arc(0, 0, size/2, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fill()
        break
      case 'pyramid':
        ctx.beginPath()
        ctx.moveTo(0, -size/2)
        ctx.lineTo(-size/2, size/2)
        ctx.lineTo(size/2, size/2)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
        break
      case 'torus':
        ctx.beginPath()
        ctx.arc(0, 0, size/2, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(0, 0, size/4, 0, Math.PI * 2)
        ctx.stroke()
        break
    }
    
    ctx.restore()
  }, [dimensions])

  const animate = useCallback((currentTime: number = 0) => {
    const canvas = canvasRef.current
    if (!canvas || !isVisible) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // FPS 제한
    if (currentTime - lastFrameTime.current < frameInterval) {
      animationRef.current = requestAnimationFrame(animate)
      return
    }
    lastFrameTime.current = currentTime

    ctx.clearRect(0, 0, dimensions.width, dimensions.height)
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, dimensions.width, dimensions.height)

    particles.current = particles.current.filter(particle => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.z += particle.vz
      particle.life++

      const mouseDistX = particle.x - mousePos.current.x
      const mouseDistY = particle.y - mousePos.current.y
      const mouseDist = Math.sqrt(mouseDistX * mouseDistX + mouseDistY * mouseDistY)
      
      if (mouseDist < 100) {
        particle.vx += (particle.x - mousePos.current.x) / mouseDist * 0.1
        particle.vy += (particle.y - mousePos.current.y) / mouseDist * 0.1
      }

      if (particle.x < 0 || particle.x > dimensions.width) particle.vx *= -0.8
      if (particle.y < 0 || particle.y > dimensions.height) particle.vy *= -0.8
      if (particle.z < 0 || particle.z > 1000) particle.vz *= -0.8

      drawParticle(ctx, particle)
      return particle.life < particle.maxLife
    })

    geometries.current.forEach(geo => {
      geo.x += geo.velocity.x
      geo.y += geo.velocity.y
      geo.z += geo.velocity.z
      geo.rotation.x += geo.rotationSpeed.x
      geo.rotation.y += geo.rotationSpeed.y
      geo.rotation.z += geo.rotationSpeed.z

      if (geo.x < -100) geo.x = dimensions.width + 100
      if (geo.x > dimensions.width + 100) geo.x = -100
      if (geo.y < -100) geo.y = dimensions.height + 100
      if (geo.y > dimensions.height + 100) geo.y = -100
      if (geo.z < 100) geo.z = 2000
      if (geo.z > 2500) geo.z = 100

      drawGeometry(ctx, geo)
    })

    // 파티클 수 동적 조절 (모바일에서 성능 최적화)
    const maxParticles = dimensions.width < 768 ? 50 : 100
    while (particles.current.length < maxParticles) {
      particles.current.push(createParticle())
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [dimensions, drawParticle, drawGeometry, createParticle, isVisible, frameInterval])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
      
      for (let i = 0; i < 3; i++) {
        particles.current.push(createParticle(mousePos.current.x, mousePos.current.y))
      }
    }
  }, [createParticle])

  const handleResize = useCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }, [])

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
  }, [handleResize, handleMouseMove])

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return
    
    // 디바이스에 따른 초기 개체 수 조절
    const initialParticles = dimensions.width < 768 ? 30 : 60
    const initialGeometries = dimensions.width < 768 ? 8 : 15
    
    particles.current = Array.from({ length: initialParticles }, () => createParticle())
    geometries.current = Array.from({ length: initialGeometries }, () => createGeometry())
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions, animate, createParticle, createGeometry])

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, #0c0a1e 0%, #1a1135 25%, #2d1b69 50%, #1a1135 75%, #0c0a1e 100%)'
      }}
    />
  )
}