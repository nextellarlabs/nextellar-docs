'use client'

import { useEffect, useRef } from 'react'

type TabType = -1 | 0 | 1

type PieceDefinition = {
  id: string
  logo: LogoKey
  tabs: {
    top: TabType
    right: TabType
    bottom: TabType
    left: TabType
  }
  base: {
    x: number
    y: number
  }
  logoScale: number
  floatPhase: number
  floatSpeed: number
}

type Point = {
  x: number
  y: number
}

const LOGO_SVGS = {
  next: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="160" height="160" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="#111111" d="M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.568-1.57 6.77-4.06 8.967l-6.23-8.696v6.706h-2.07V6.82h2.07l6.954 9.78z"/>
</svg>`,
  stellar: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="160" height="160" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="#111111" d="M12.003 1.716c-1.37 0-2.7.27-3.948.78A10.18 10.18 0 0 0 2.66 7.901a10.136 10.136 0 0 0-.797 3.954c0 1.382.27 2.716.802 3.963A10.238 10.238 0 0 0 12.003 22.284c1.37 0 2.7-.27 3.948-.78a10.174 10.174 0 0 0 5.394-5.404 10.145 10.145 0 0 0 .8-3.95c0-1.376-.27-2.71-.798-3.955a10.2 10.2 0 0 0-5.396-5.41 10.32 10.32 0 0 0-3.948-.78Zm-1.35 5.242c.39-.183.86-.144 1.242.097l2.752 1.76 1.344-.723a1.2 1.2 0 0 1 1.144.01 1.16 1.16 0 0 1 .575.978c0 .43-.243.825-.622 1.03l-1.423.768.03 2.996 1.394.894a1.2 1.2 0 0 1 .53 1.01 1.16 1.16 0 0 1-.575.98 1.2 1.2 0 0 1-1.144.01l-1.34-.861-2.67 1.683a1.2 1.2 0 0 1-1.86-.99l-.032-3.035-1.467-.94a1.2 1.2 0 0 1-.53-1.01 1.16 1.16 0 0 1 .575-.98 1.2 1.2 0 0 1 1.144-.01l1.504.965.03-3.034c.004-.45.267-.857.688-1.055Z"/>
</svg>`,
  typescript: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="160" height="160" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="#111111" d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0Zm17.01 9.556h-2.487c0-.785-.379-1.236-1.181-1.236-.682 0-1.14.343-1.14.97 0 .614.378.94 1.354 1.333l1.274.5c1.53.59 2.486 1.47 2.486 3.063 0 2.017-1.506 3.026-3.716 3.026-2.12 0-3.69-1.076-3.69-3.174h2.56c0 .94.42 1.394 1.22 1.394.734 0 1.153-.37 1.153-.913 0-.592-.33-.913-1.354-1.34l-1.188-.497c-1.408-.57-2.572-1.427-2.572-3.06 0-1.918 1.466-3.026 3.52-3.026 2.024 0 3.56.999 3.56 2.96Zm-7.082-2.793v2.083H8.49v8.109H6.01V8.846H3.45V6.763Z"/>
</svg>`,
  tailwind: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="160" height="160" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="#38BDF8" d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624.78.792 1.662 1.688 3.012 1.688 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624-.78-.792-1.662-1.688-3.012-1.688Zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624.78.792 1.662 1.688 3.012 1.688 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624-.78-.792-1.662-1.688-3.012-1.688Z"/>
</svg>`,
  eslint: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="160" height="160" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="#111111" d="M7.257 9.132 11.816 6.5a.369.369 0 0 1 .368 0l4.559 2.632a.369.369 0 0 1 .184.32v5.263a.37.37 0 0 1-.184.32l-4.559 2.632a.369.369 0 0 1-.368 0L7.257 15.035a.369.369 0 0 1-.184-.32V9.452c0-.132.07-.255.184-.32Z"/>
</svg>`
} as const

type LogoKey = keyof typeof LOGO_SVGS

const ISO_ANGLE = Math.PI / 6
const ISO_X = Math.cos(ISO_ANGLE)
const ISO_Y = Math.sin(ISO_ANGLE)

function loadP5() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  const globalWindow = window as typeof window & { p5?: any; __p5Loader?: Promise<any> }
  if (globalWindow.p5) return Promise.resolve(globalWindow.p5)
  if (globalWindow.__p5Loader) return globalWindow.__p5Loader

  globalWindow.__p5Loader = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '/vendor/p5.min.js'
    script.async = true
    script.onload = () => resolve(globalWindow.p5)
    script.onerror = () => reject(new Error('Failed to load p5'))
    document.body.appendChild(script)
  })

  return globalWindow.__p5Loader
}

function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function projectIso(x: number, y: number, z = 0): Point {
  return {
    x: (x - y) * ISO_X,
    y: (x + y) * ISO_Y - z,
  }
}

function addArcPoints(
  points: Point[],
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  segments: number
) {
  const step = (endAngle - startAngle) / segments
  for (let i = 1; i <= segments; i += 1) {
    const angle = startAngle + step * i
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    })
  }
}

function buildPuzzlePath(
  width: number,
  height: number,
  tabs: PieceDefinition['tabs'],
  tabRadius: number,
  tabDepth: number
): Point[] {
  const points: Point[] = []
  const halfW = width / 2
  const halfH = height / 2
  const arcSegments = 12

  points.push({ x: -halfW, y: -halfH })

  if (tabs.top === 0) {
    points.push({ x: halfW, y: -halfH })
  } else {
    points.push({ x: -tabRadius, y: -halfH })
    const centerY = -halfH + (tabs.top === 1 ? -tabDepth : tabDepth)
    const startAngle = Math.PI
    const endAngle = tabs.top === 1 ? 0 : Math.PI * 2
    addArcPoints(points, 0, centerY, tabRadius, startAngle, endAngle, arcSegments)
    points.push({ x: halfW, y: -halfH })
  }

  if (tabs.right === 0) {
    points.push({ x: halfW, y: halfH })
  } else {
    points.push({ x: halfW, y: -tabRadius })
    const centerX = halfW + (tabs.right === 1 ? tabDepth : -tabDepth)
    const startAngle = -Math.PI / 2
    const endAngle = Math.PI / 2
    addArcPoints(points, centerX, 0, tabRadius, startAngle, endAngle, arcSegments)
    points.push({ x: halfW, y: halfH })
  }

  if (tabs.bottom === 0) {
    points.push({ x: -halfW, y: halfH })
  } else {
    points.push({ x: tabRadius, y: halfH })
    const centerY = halfH + (tabs.bottom === 1 ? tabDepth : -tabDepth)
    const startAngle = 0
    const endAngle = tabs.bottom === 1 ? Math.PI : -Math.PI
    addArcPoints(points, 0, centerY, tabRadius, startAngle, endAngle, arcSegments)
    points.push({ x: -halfW, y: halfH })
  }

  if (tabs.left !== 0) {
    points.push({ x: -halfW, y: tabRadius })
    const centerX = -halfW + (tabs.left === 1 ? -tabDepth : tabDepth)
    const startAngle = Math.PI / 2
    const endAngle = -Math.PI / 2
    addArcPoints(points, centerX, 0, tabRadius, startAngle, endAngle, arcSegments)
  }

  return points
}

const PIECES: PieceDefinition[] = [
  {
    id: 'stellar',
    logo: 'stellar',
    base: { x: -170, y: -120 },
    tabs: { top: 0, right: 0, bottom: 1, left: 0 },
    logoScale: 0.62,
    floatPhase: 0.2,
    floatSpeed: 0.7,
  },
  {
    id: 'next',
    logo: 'next',
    base: { x: 170, y: -120 },
    tabs: { top: 0, right: 0, bottom: 1, left: 0 },
    logoScale: 0.6,
    floatPhase: 1.4,
    floatSpeed: 0.8,
  },
  {
    id: 'tailwind',
    logo: 'tailwind',
    base: { x: -170, y: 120 },
    tabs: { top: -1, right: 1, bottom: 0, left: 0 },
    logoScale: 0.62,
    floatPhase: 2.3,
    floatSpeed: 0.65,
  },
  {
    id: 'eslint',
    logo: 'eslint',
    base: { x: 0, y: 120 },
    tabs: { top: 0, right: 1, bottom: 0, left: -1 },
    logoScale: 0.54,
    floatPhase: 3.1,
    floatSpeed: 0.72,
  },
  {
    id: 'typescript',
    logo: 'typescript',
    base: { x: 170, y: 120 },
    tabs: { top: -1, right: 0, bottom: 0, left: -1 },
    logoScale: 0.54,
    floatPhase: 4.1,
    floatSpeed: 0.68,
  },
]

const STATE_SEQUENCE = [
  { name: 'disconnected', duration: 2400 },
  { name: 'connecting', duration: 2200 },
  { name: 'connected', duration: 1400 },
  { name: 'disconnecting', duration: 2200 },
] as const

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function magneticEase(t: number) {
  const eased = easeInOutCubic(t)
  if (t < 0.78) return eased
  const snap = easeOutCubic((t - 0.78) / 0.22) * 0.035
  return Math.min(1, eased + snap)
}

export function PuzzleAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let isMounted = true
    let p5Instance: any
    let resizeObserver: ResizeObserver | null = null
    let prefersReducedMotion = false

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion = motionQuery.matches

    const handleMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches
      if (!p5Instance) return
      if (prefersReducedMotion) {
        p5Instance.noLoop()
        p5Instance.redraw()
      } else {
        p5Instance.loop()
      }
    }

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange)
    } else {
      motionQuery.addListener(handleMotionChange)
    }

    loadP5()
      .then((P5) => {
        if (!P5 || !isMounted) return
        p5Instance = new P5((p5: any) => {
        const pieceWidth = 170
        const pieceHeight = 120
        const tabRadius = 22
        const tabDepth = 18
        const depth = 26
        const depthVec = { x: depth * 0.55, y: depth * 0.35 }

        const logos: Record<LogoKey, any> = {} as Record<LogoKey, any>

        const baseCenter = PIECES.reduce(
          (acc, piece) => ({ x: acc.x + piece.base.x, y: acc.y + piece.base.y }),
          { x: 0, y: 0 }
        )
        const centerOffset = {
          x: baseCenter.x / PIECES.length,
          y: baseCenter.y / PIECES.length,
        }

        const connectedPositions = PIECES.map((piece) => ({
          x: piece.base.x - centerOffset.x,
          y: piece.base.y - centerOffset.y,
        }))

        const disconnectedPositions = connectedPositions.map((pos) => {
          const length = Math.hypot(pos.x, pos.y) || 1
          const spread = 1.18
          const extra = 26
          return {
            x: pos.x * spread + (pos.x / length) * extra,
            y: pos.y * spread + (pos.y / length) * extra,
          }
        })

        const shapeCache = PIECES.map((piece) =>
          buildPuzzlePath(pieceWidth, pieceHeight, piece.tabs, tabRadius, tabDepth)
        )

        let layoutBounds = {
          minX: 0,
          maxX: 0,
          minY: 0,
          maxY: 0,
        }

        let stateIndex = 0
        let stateStart = 0

        p5.preload = () => {
          ;(Object.keys(LOGO_SVGS) as LogoKey[]).forEach((key) => {
            logos[key] = p5.loadImage(svgToDataUrl(LOGO_SVGS[key]))
          })
        }

        const computeBounds = () => {
          let minX = Infinity
          let maxX = -Infinity
          let minY = Infinity
          let maxY = -Infinity

          shapeCache.forEach((shape, index) => {
            const pos = disconnectedPositions[index]
            shape.forEach((point) => {
              const projected = projectIso(point.x + pos.x, point.y + pos.y)
              const bottom = {
                x: projected.x + depthVec.x,
                y: projected.y + depthVec.y,
              }
              minX = Math.min(minX, projected.x, bottom.x)
              maxX = Math.max(maxX, projected.x, bottom.x)
              minY = Math.min(minY, projected.y, bottom.y)
              maxY = Math.max(maxY, projected.y, bottom.y)
            })
          })

          layoutBounds = { minX, maxX, minY, maxY }
        }

        const drawPiece = (
          index: number,
          position: Point,
          bob: number,
          logoScale: number,
          strokeWeight: number
        ) => {
          const shape = shapeCache[index]
          const topPoints = shape.map((point) =>
            projectIso(point.x + position.x, point.y + position.y, bob)
          )
          const bottomPoints = topPoints.map((point) => ({
            x: point.x + depthVec.x,
            y: point.y + depthVec.y,
          }))

          const ctx = p5.drawingContext as CanvasRenderingContext2D
          ctx.save()
          ctx.shadowColor = 'rgba(0, 0, 0, 0.08)'
          ctx.shadowBlur = 6
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 3

          p5.noStroke()
          p5.fill('#ffffff')
          p5.beginShape()
          topPoints.forEach((point) => p5.vertex(point.x, point.y))
          p5.endShape(p5.CLOSE)

          ctx.restore()

          const depthDir = depthVec
          for (let i = 0; i < topPoints.length; i += 1) {
            const nextIndex = (i + 1) % topPoints.length
            const current = topPoints[i]
            const next = topPoints[nextIndex]
            const edge = { x: next.x - current.x, y: next.y - current.y }
            const normal = { x: edge.y, y: -edge.x }
            const visible = normal.x * depthDir.x + normal.y * depthDir.y > 0
            if (!visible) continue

            p5.noStroke()
            p5.fill('#f1f1f1')
            p5.beginShape()
            p5.vertex(current.x, current.y)
            p5.vertex(next.x, next.y)
            p5.vertex(bottomPoints[nextIndex].x, bottomPoints[nextIndex].y)
            p5.vertex(bottomPoints[i].x, bottomPoints[i].y)
            p5.endShape(p5.CLOSE)
          }

          p5.stroke('rgba(17, 17, 17, 0.75)')
          p5.strokeWeight(strokeWeight)
          p5.noFill()
          p5.beginShape()
          topPoints.forEach((point) => p5.vertex(point.x, point.y))
          p5.endShape(p5.CLOSE)

          const logo = logos[PIECES[index].logo]
          if (logo) {
            const center = projectIso(position.x, position.y, bob)
            const logoSize = Math.min(pieceWidth, pieceHeight) * logoScale
            p5.imageMode(p5.CENTER)
            p5.image(logo, center.x, center.y - 6, logoSize, logoSize)
          }
        }

        p5.setup = () => {
          const { width, height } = container.getBoundingClientRect()
          p5.createCanvas(Math.max(1, width), Math.max(1, height))
          p5.pixelDensity(window.devicePixelRatio || 1)
          p5.smooth()
          computeBounds()
          stateStart = p5.millis()
          if (prefersReducedMotion) {
            p5.noLoop()
            p5.redraw()
          }
        }

        p5.draw = () => {
          p5.clear()
          p5.background(255)

          const now = p5.millis()
          const state = STATE_SEQUENCE[stateIndex]
          const elapsed = now - stateStart
          const rawT = Math.min(1, elapsed / state.duration)

          if (elapsed > state.duration) {
            stateIndex = (stateIndex + 1) % STATE_SEQUENCE.length
            stateStart = now
          }

          let progress = 0
          if (prefersReducedMotion) {
            progress = 1
          } else if (state.name === 'disconnected') {
            progress = 0
          } else if (state.name === 'connecting') {
            progress = magneticEase(rawT)
          } else if (state.name === 'connected') {
            progress = 1
          } else if (state.name === 'disconnecting') {
            progress = 1 - easeInOutCubic(rawT)
          }

          const layoutWidth = layoutBounds.maxX - layoutBounds.minX
          const layoutHeight = layoutBounds.maxY - layoutBounds.minY
          const padding = 40
          const scale = Math.min(
            (p5.width - padding * 2) / layoutWidth,
            (p5.height - padding * 2) / layoutHeight
          )
          const centerX = (layoutBounds.minX + layoutBounds.maxX) / 2
          const centerY = (layoutBounds.minY + layoutBounds.maxY) / 2
          const strokeWeight = 1 / scale

          p5.push()
          p5.translate(p5.width / 2, p5.height / 2)
          p5.scale(scale)
          p5.translate(-centerX, -centerY)

          const time = now / 1000

          const renderPieces = PIECES.map((piece, index) => {
            const connected = connectedPositions[index]
            const disconnected = disconnectedPositions[index]

            const floatStrength = 1 - progress
            const bob =
              Math.sin(time * PIECES[index].floatSpeed + PIECES[index].floatPhase) *
              6 *
              floatStrength
            const driftX =
              Math.cos(time * 0.8 + PIECES[index].floatPhase) * 3 * floatStrength
            const driftY =
              Math.sin(time * 0.6 + PIECES[index].floatPhase) * 2.5 * floatStrength

            const position = {
              x: disconnected.x + (connected.x - disconnected.x) * progress + driftX,
              y: disconnected.y + (connected.y - disconnected.y) * progress + driftY,
            }

            return {
              index,
              position,
              bob,
              logoScale: PIECES[index].logoScale,
            }
          })

          renderPieces
            .sort((a, b) => a.position.x + a.position.y - (b.position.x + b.position.y))
            .forEach((item) => {
              drawPiece(item.index, item.position, item.bob, item.logoScale, strokeWeight)
            })

          p5.pop()
        }
        }, container)

        resizeObserver = new ResizeObserver((entries) => {
          entries.forEach((entry) => {
            if (!p5Instance) return
            const { width, height } = entry.contentRect
            if (width > 0 && height > 0) {
              p5Instance.resizeCanvas(width, height)
              if (prefersReducedMotion) {
                p5Instance.redraw()
              }
            }
          })
        })

        resizeObserver.observe(container)
      })
      .catch(() => {})

    return () => {
      isMounted = false
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange)
      } else {
        motionQuery.removeListener(handleMotionChange)
      }
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      if (p5Instance) {
        p5Instance.remove()
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[640px] aspect-[4/3] min-h-[280px]"
      aria-hidden="true"
    />
  )
}
