"use client"

import { useEffect, useRef, useState } from 'react'

interface Neuron {
  x: number
  y: number
  z: number
  activation: number
  size: number
  connections: Connection[]
  type: 'input' | 'hidden' | 'output'
}

interface Connection {
  to: number
  weight: number
  signal: number
  signalPos: number
}

export function NeuralNetworkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const neurons = useRef<Neuron[]>([])
  const animationRef = useRef<number>()
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
      initializeNetwork()
    }

    const initializeNetwork = () => {
      neurons.current = []
      // 모바일에서 더 작은 네트워크 (성능 최적화)
      const isMobile = canvas.width < 768
      const layers = isMobile ? [
        { count: 4, type: 'input' as const, x: canvas.width * 0.1 },
        { count: 6, type: 'hidden' as const, x: canvas.width * 0.3 },
        { count: 8, type: 'hidden' as const, x: canvas.width * 0.5 },
        { count: 6, type: 'hidden' as const, x: canvas.width * 0.7 },
        { count: 3, type: 'output' as const, x: canvas.width * 0.9 }
      ] : [
        { count: 8, type: 'input' as const, x: canvas.width * 0.1 },
        { count: 12, type: 'hidden' as const, x: canvas.width * 0.3 },
        { count: 16, type: 'hidden' as const, x: canvas.width * 0.5 },
        { count: 12, type: 'hidden' as const, x: canvas.width * 0.7 },
        { count: 6, type: 'output' as const, x: canvas.width * 0.9 }
      ]

      let neuronIndex = 0
      layers.forEach((layer, layerIndex) => {
        const startY = (canvas.height - (layer.count - 1) * 80) / 2
        
        for (let i = 0; i < layer.count; i++) {
          neurons.current.push({
            x: layer.x,
            y: startY + i * 80,
            z: Math.random() * 200,
            activation: 0,
            size: 15 + Math.random() * 10,
            connections: [],
            type: layer.type
          })
          neuronIndex++
        }
      })

      let currentIndex = 0
      layers.forEach((layer, layerIndex) => {
        if (layerIndex < layers.length - 1) {
          const nextLayerStart = currentIndex + layer.count
          const nextLayerEnd = nextLayerStart + layers[layerIndex + 1].count

          for (let i = currentIndex; i < currentIndex + layer.count; i++) {
            for (let j = nextLayerStart; j < nextLayerEnd; j++) {
              if (Math.random() > 0.3) {
                neurons.current[i].connections.push({
                  to: j,
                  weight: (Math.random() - 0.5) * 2,
                  signal: 0,
                  signalPos: 0
                })
              }
            }
          }
        }
        currentIndex += layer.count
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
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      neurons.current.forEach((neuron, index) => {
        const baseActivation = 0.3 + 0.7 * Math.sin(time.current + index * 0.1)
        const networkActivation = Math.sin(time.current * 2 + index * 0.05) * 0.5 + 0.5
        neuron.activation = Math.max(0, Math.min(1, baseActivation * networkActivation))

        const intensity = neuron.activation
        let color = '#3b82f6'
        let glowColor = '#60a5fa'
        
        switch (neuron.type) {
          case 'input':
            color = '#10b981'
            glowColor = '#34d399'
            break
          case 'hidden':
            color = '#8b5cf6'
            glowColor = '#a78bfa'
            break
          case 'output':
            color = '#ef4444'
            glowColor = '#f87171'
            break
        }

        ctx.save()
        ctx.globalAlpha = 0.8 + intensity * 0.2
        
        ctx.shadowColor = glowColor
        ctx.shadowBlur = intensity * 30
        
        const gradient = ctx.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, neuron.size + intensity * 10
        )
        gradient.addColorStop(0, color)
        gradient.addColorStop(0.7, color + '80')
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(neuron.x, neuron.y, neuron.size + intensity * 10, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(neuron.x, neuron.y, neuron.size * 0.6, 0, Math.PI * 2)
        ctx.fill()

        if (intensity > 0.7) {
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          ctx.globalAlpha = (intensity - 0.7) * 3
          ctx.beginPath()
          ctx.arc(neuron.x, neuron.y, neuron.size + 5, 0, Math.PI * 2)
          ctx.stroke()
        }

        ctx.restore()
      })

      neurons.current.forEach((neuron) => {
        neuron.connections.forEach((connection) => {
          const targetNeuron = neurons.current[connection.to]
          if (!targetNeuron) return

          const distance = Math.sqrt(
            Math.pow(targetNeuron.x - neuron.x, 2) + 
            Math.pow(targetNeuron.y - neuron.y, 2)
          )

          const signalStrength = neuron.activation * Math.abs(connection.weight)
          
          if (signalStrength > 0.3) {
            ctx.save()
            ctx.globalAlpha = signalStrength * 0.6
            
            const lineWidth = 1 + signalStrength * 3
            ctx.lineWidth = lineWidth
            ctx.strokeStyle = connection.weight > 0 ? '#10b981' : '#ef4444'
            ctx.shadowColor = connection.weight > 0 ? '#10b981' : '#ef4444'
            ctx.shadowBlur = lineWidth * 2

            ctx.beginPath()
            ctx.moveTo(neuron.x, neuron.y)
            ctx.lineTo(targetNeuron.x, targetNeuron.y)
            ctx.stroke()

            if (Math.random() > 0.95) {
              connection.signal = signalStrength
              connection.signalPos = 0
            }

            if (connection.signal > 0) {
              connection.signalPos += 0.05
              const signalX = neuron.x + (targetNeuron.x - neuron.x) * connection.signalPos
              const signalY = neuron.y + (targetNeuron.y - neuron.y) * connection.signalPos

              ctx.globalAlpha = connection.signal * (1 - connection.signalPos)
              ctx.fillStyle = '#ffffff'
              ctx.shadowColor = '#ffffff'
              ctx.shadowBlur = 20
              ctx.beginPath()
              ctx.arc(signalX, signalY, 3 + connection.signal * 2, 0, Math.PI * 2)
              ctx.fill()

              if (connection.signalPos >= 1) {
                connection.signal = 0
                connection.signalPos = 0
              }
            }

            ctx.restore()
          }
        })
      })

      const brainwaveY = canvas.height * 0.05 + Math.sin(time.current * 3) * 20
      ctx.save()
      ctx.strokeStyle = '#06b6d4'
      ctx.lineWidth = 2
      ctx.shadowColor = '#06b6d4'
      ctx.shadowBlur = 10
      ctx.globalAlpha = 0.6
      
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x += 5) {
        const y = brainwaveY + 
          Math.sin((x + time.current * 100) * 0.01) * 15 +
          Math.sin((x + time.current * 50) * 0.02) * 8 +
          Math.sin((x + time.current * 200) * 0.005) * 25
        
        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
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
      className="fixed inset-0 -z-30 pointer-events-none opacity-30"
    />
  )
}