"use client"

import { useEffect, useRef, useState } from 'react'

interface GridNode {
  x: number
  y: number
  z: number
  pulse: number
  energy: number
  connections: number[]
}

export function HolographicGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const nodes = useRef<GridNode[]>([])
  const time = useRef(0)
  const lastFrameTime = useRef(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initializeGrid()
    }

    const initializeGrid = () => {
      nodes.current = []
      // 모바일에서 더 큰 그리드 크기 사용 (성능 최적화)
      const gridSize = canvas.width < 768 ? 80 : 60
      const offsetX = (canvas.width % gridSize) / 2
      const offsetY = (canvas.height % gridSize) / 2

      for (let x = offsetX; x < canvas.width; x += gridSize) {
        for (let y = offsetY; y < canvas.height; y += gridSize) {
          nodes.current.push({
            x,
            y,
            z: Math.random() * 100,
            pulse: Math.random() * Math.PI * 2,
            energy: Math.random(),
            connections: []
          })
        }
      }

      nodes.current.forEach((node, index) => {
        nodes.current.forEach((otherNode, otherIndex) => {
          if (index !== otherIndex) {
            const distance = Math.sqrt(
              Math.pow(node.x - otherNode.x, 2) + 
              Math.pow(node.y - otherNode.y, 2)
            )
            if (distance < 120 && Math.random() > 0.7) {
              node.connections.push(otherIndex)
            }
          }
        })
      })
    }

    const animate = (currentTime: number = 0) => {
      if (!isVisible) return
      
      // 60 FPS 제한
      if (currentTime - lastFrameTime.current < 16.67) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      lastFrameTime.current = currentTime
      
      time.current += 0.02
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      nodes.current.forEach((node, index) => {
        node.pulse += 0.05
        node.energy = 0.3 + 0.7 * Math.sin(time.current + node.pulse)
        node.z = 50 + 30 * Math.sin(time.current * 0.5 + index * 0.1)

        const intensity = node.energy
        const hue = (time.current * 50 + index * 10) % 360
        const alpha = intensity * 0.8

        ctx.save()
        ctx.globalAlpha = alpha
        
        ctx.shadowColor = `hsl(${hue}, 80%, 60%)`
        ctx.shadowBlur = 20 * intensity

        ctx.fillStyle = `hsl(${hue}, 80%, ${50 + intensity * 30}%)`
        ctx.beginPath()
        ctx.arc(node.x, node.y, 2 + intensity * 3, 0, Math.PI * 2)
        ctx.fill()

        node.connections.forEach(connectionIndex => {
          const connectedNode = nodes.current[connectionIndex]
          if (connectedNode) {
            const distance = Math.sqrt(
              Math.pow(node.x - connectedNode.x, 2) + 
              Math.pow(node.y - connectedNode.y, 2)
            )
            const lineAlpha = Math.max(0, (120 - distance) / 120) * intensity * connectedNode.energy * 0.5

            if (lineAlpha > 0.1) {
              ctx.globalAlpha = lineAlpha
              ctx.strokeStyle = `hsl(${(hue + 60) % 360}, 70%, 60%)`
              ctx.lineWidth = 1 + intensity
              ctx.shadowBlur = 10 * intensity
              
              ctx.beginPath()
              ctx.moveTo(node.x, node.y)
              ctx.lineTo(connectedNode.x, connectedNode.y)
              ctx.stroke()

              const midX = (node.x + connectedNode.x) / 2
              const midY = (node.y + connectedNode.y) / 2
              const pulseSize = Math.sin(time.current * 3 + distance * 0.01) * 2
              
              if (pulseSize > 0) {
                ctx.globalAlpha = lineAlpha * pulseSize
                ctx.fillStyle = `hsl(${(hue + 120) % 360}, 90%, 70%)`
                ctx.beginPath()
                ctx.arc(midX, midY, pulseSize, 0, Math.PI * 2)
                ctx.fill()
              }
            }
          }
        })

        ctx.restore()
      })

      const scanlineY = (time.current * 100) % canvas.height
      nodes.current.forEach((node) => {
        if (Math.abs(node.y - scanlineY) < 2) {
          ctx.save()
          ctx.globalAlpha = 0.8
          ctx.fillStyle = '#00ffff'
          ctx.shadowColor = '#00ffff'
          ctx.shadowBlur = 30
          ctx.beginPath()
          ctx.arc(node.x, node.y, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      })

      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 2
      ctx.shadowColor = '#00ffff'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(0, scanlineY)
      ctx.lineTo(canvas.width, scanlineY)
      ctx.stroke()
      ctx.restore()

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }
    
    resize()
    animate()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-20 pointer-events-none opacity-40"
    />
  )
}