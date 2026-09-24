import { useEffect, useRef } from 'react'

export default function BlueprintCanvas({ points = [], width = 520, height = 360 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const validPoints = points.filter(
      (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
    )
    const minX = validPoints.length ? Math.min(...validPoints.map((point) => point.x)) : 0
    const maxX = validPoints.length ? Math.max(...validPoints.map((point) => point.x)) : 0
    const minY = validPoints.length ? Math.min(...validPoints.map((point) => point.y)) : 0
    const maxY = validPoints.length ? Math.max(...validPoints.map((point) => point.y)) : 0
    const padding = 24
    const rangeX = maxX - minX
    const rangeY = maxY - minY
    const scale = Math.min(
      rangeX === 0 ? Infinity : (canvas.width - padding * 2) / rangeX,
      rangeY === 0 ? Infinity : (canvas.height - padding * 2) / rangeY,
    )
    const safeScale = Number.isFinite(scale) ? scale : 1
    const drawingWidth = rangeX * safeScale
    const drawingHeight = rangeY * safeScale
    const offsetX = (canvas.width - drawingWidth) / 2
    const offsetY = (canvas.height - drawingHeight) / 2
    const canvasPoints = validPoints.map((point) => ({
      x: offsetX + (point.x - minX) * safeScale,
      y: offsetY + (point.y - minY) * safeScale,
    }))

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgba(148,163,184,0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
    if (canvasPoints.length > 1) {
      ctx.strokeStyle = '#93c5fd'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y)
      for (let i = 1; i < canvasPoints.length; i++) {
        const p = canvasPoints[i]
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }
    ctx.fillStyle = '#fbbf24'
    for (const p of canvasPoints) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [points])

  return (
    <canvas
      id="blueprint-canvas"
      className="blueprint-canvas"
      ref={ref}
      width={width}
      height={height}
      role="img"
      aria-label="Lienzo del blueprint actual"
      style={{ '--canvas-max-width': `${width}px` }}
    />
  )
}
