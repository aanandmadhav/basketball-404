import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { DESTINATIONS } from './destinations'

type Body = {
  x: number
  y: number
  previousY: number
  vx: number
  vy: number
  angle: number
  angularVelocity: number
  radius: number
}

type Drag = {
  index: number
  pointerId: number
  offsetX: number
  offsetY: number
  lastX: number
  lastY: number
  lastTime: number
}

type Score = {
  index: number
  targetX: number
  startedAt: number
  href: string
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

export default function App() {
  const stageRef = useRef<HTMLDivElement>(null)
  const hoopRef = useRef<HTMLDivElement>(null)
  const ballRefs = useRef<Array<HTMLButtonElement | null>>([])
  const bodiesRef = useRef<Body[]>([])
  const dragRef = useRef<Drag | null>(null)
  const scoringRef = useRef<Score | null>(null)
  const navigatingRef = useRef(false)
  const armedRef = useRef(new Set<number>())
  const animationStartRef = useRef<number | null>(null)
  const initialDropCompleteRef = useRef(false)
  const frameRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)
  const [resetKey, setResetKey] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const positionBodies = useCallback(() => {
    const stage = stageRef.current
    if (!stage || reducedMotion) return

    const bounds = stage.getBoundingClientRect()
    bodiesRef.current = ballRefs.current.map((element, index) => {
      const radius = (element?.offsetWidth || 112) / 2
      const columns = bounds.width < 640 ? 3 : DESTINATIONS.length
      const column = index % columns
      const x = ((column + 0.55) / columns) * bounds.width
      const y = -radius - index * (bounds.width < 640 ? 38 : 28)

      return {
        x: clamp(x, radius, bounds.width - radius),
        y,
        previousY: y,
        vx: (index % 2 ? -1 : 1) * (0.35 + index * 0.08),
        vy: 0,
        angle: (index - 2.5) * 0.08,
        angularVelocity: (index % 2 ? -1 : 1) * 0.004,
        radius,
      }
    })
  }, [reducedMotion])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || reducedMotion) return

    positionBodies()
    armedRef.current.clear()
    scoringRef.current = null
    navigatingRef.current = false
    animationStartRef.current = null
    initialDropCompleteRef.current = false

    const resizeObserver = new ResizeObserver(positionBodies)
    resizeObserver.observe(stage)

    const tick = (time: number) => {
      const bounds = stage.getBoundingClientRect()
      const previous = lastFrameRef.current ?? time
      const step = Math.min((time - previous) / 16.67, 2)
      lastFrameRef.current = time
      const bodies = bodiesRef.current

      if (animationStartRef.current === null) animationStartRef.current = time
      if (time - animationStartRef.current > 1600) initialDropCompleteRef.current = true

      bodies.forEach((body, index) => {
        body.previousY = body.y
        const isDragged = dragRef.current?.index === index
        const score = scoringRef.current

        if (score?.index === index) {
          body.vx += (score.targetX - body.x) * 0.035 * step
          body.vx *= Math.pow(0.82, step)
          body.vy = Math.min(Math.max(body.vy, 2.4) + 0.34 * step, 7)
          body.x += body.vx * step
          body.y += body.vy * step
          body.angle += body.angularVelocity * step

          if (!navigatingRef.current && time - score.startedAt > 620) {
            navigatingRef.current = true
            window.location.assign(score.href)
          }
          return
        }

        if (isDragged) return

        body.vy += 0.42 * step
        body.vx *= Math.pow(0.995, step)
        body.vy *= Math.pow(0.998, step)
        body.x += body.vx * step
        body.y += body.vy * step
        body.angle += body.angularVelocity * step

        if (body.x - body.radius < 0) {
          body.x = body.radius
          body.vx = Math.abs(body.vx) * 0.72
        } else if (body.x + body.radius > bounds.width) {
          body.x = bounds.width - body.radius
          body.vx = -Math.abs(body.vx) * 0.72
        }

        if (body.y + body.radius > bounds.height) {
          body.y = bounds.height - body.radius
          body.vy = -Math.abs(body.vy) * 0.58
          body.vx *= 0.94
          body.angularVelocity *= 0.92
        }
      })

      const hoop = hoopRef.current
      if (hoop && initialDropCompleteRef.current && !scoringRef.current && !navigatingRef.current) {
        const stageBounds = stage.getBoundingClientRect()
        const hoopBounds = hoop.getBoundingClientRect()
        const hoopLeft = hoopBounds.left - stageBounds.left
        const rimY = hoopBounds.top - stageBounds.top + hoopBounds.height * 0.56
        const innerLeft = hoopLeft + hoopBounds.width * 0.27
        const innerRight = hoopLeft + hoopBounds.width * 0.73

        for (let index = 0; index < bodies.length; index += 1) {
          const body = bodies[index]
          if (
            armedRef.current.has(index) &&
            dragRef.current?.index !== index &&
            body.previousY < rimY &&
            body.y >= rimY &&
            body.x > innerLeft &&
            body.x < innerRight
          ) {
            armedRef.current.delete(index)
            body.vx = 0
            body.vy = Math.max(body.vy, 2.4)
            scoringRef.current = {
              index,
              targetX: hoopLeft + hoopBounds.width / 2,
              startedAt: time,
              href: DESTINATIONS[index].href,
            }
            break
          }
        }
      }

      for (let firstIndex = 0; firstIndex < bodies.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < bodies.length; secondIndex += 1) {
          if (
            scoringRef.current?.index === firstIndex ||
            scoringRef.current?.index === secondIndex
          ) continue

          const first = bodies[firstIndex]
          const second = bodies[secondIndex]
          const dx = second.x - first.x
          const dy = second.y - first.y
          const distance = Math.hypot(dx, dy) || 1
          const minimum = first.radius + second.radius
          if (distance >= minimum) continue

          const nx = dx / distance
          const ny = dy / distance
          const overlap = minimum - distance
          const firstDragged = dragRef.current?.index === firstIndex
          const secondDragged = dragRef.current?.index === secondIndex

          if (!firstDragged) {
            first.x -= nx * overlap * (secondDragged ? 1 : 0.5)
            first.y -= ny * overlap * (secondDragged ? 1 : 0.5)
          }
          if (!secondDragged) {
            second.x += nx * overlap * (firstDragged ? 1 : 0.5)
            second.y += ny * overlap * (firstDragged ? 1 : 0.5)
          }

          const relativeVelocity =
            (second.vx - first.vx) * nx + (second.vy - first.vy) * ny
          if (relativeVelocity >= 0) continue

          const impulse = -relativeVelocity * 0.72
          if (!firstDragged) {
            first.vx -= impulse * nx
            first.vy -= impulse * ny
          }
          if (!secondDragged) {
            second.vx += impulse * nx
            second.vy += impulse * ny
          }
        }
      }

      bodies.forEach((body, index) => {
        const element = ballRefs.current[index]
        if (!element) return
        element.style.transform = `translate3d(${body.x - body.radius}px, ${body.y - body.radius}px, 0) rotate(${body.angle}rad)`
      })

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      resizeObserver.disconnect()
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      lastFrameRef.current = null
    }
  }, [positionBodies, reducedMotion, resetKey])

  const handlePointerDown = (index: number, event: PointerEvent<HTMLButtonElement>) => {
    if (reducedMotion) return
    const stage = stageRef.current
    const body = bodiesRef.current[index]
    if (!stage || !body) return

    const bounds = stage.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top
    dragRef.current = {
      index,
      pointerId: event.pointerId,
      offsetX: x - body.x,
      offsetY: y - body.y,
      lastX: x,
      lastY: y,
      lastTime: event.timeStamp,
    }
    event.currentTarget.classList.add('dragging')
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (index: number, event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    const stage = stageRef.current
    const body = bodiesRef.current[index]
    if (!drag || drag.index !== index || drag.pointerId !== event.pointerId || !stage || !body) return

    event.preventDefault()
    const bounds = stage.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top
    const elapsed = Math.max(event.timeStamp - drag.lastTime, 8)

    body.vx = ((x - drag.lastX) / elapsed) * 16
    body.vy = ((y - drag.lastY) / elapsed) * 16
    body.angularVelocity = clamp(body.vx * 0.0025, -0.04, 0.04)
    body.x = clamp(x - drag.offsetX, body.radius, bounds.width - body.radius)
    body.y = clamp(y - drag.offsetY, body.radius, bounds.height - body.radius)
    drag.lastX = x
    drag.lastY = y
    drag.lastTime = event.timeStamp
  }

  const releasePointer = (index: number, event: PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.index !== index || dragRef.current.pointerId !== event.pointerId) return
    dragRef.current = null
    event.currentTarget.classList.remove('dragging')
    if (event.type !== 'pointercancel' && initialDropCompleteRef.current && !scoringRef.current) {
      armedRef.current.add(index)
    }
  }

  return (
    <main className="page">
      <div className="copy">
        <p className="eyebrow">404 · Lost, but not stuck</p>
        <h1>This page slipped away.</h1>
        <p className="lede">Pick up a route and drop it through the hoop to keep exploring.</p>
      </div>

      <div
        ref={stageRef}
        className={`stage ${reducedMotion ? 'reduced' : ''}`}
        aria-label="Site destinations"
      >
        <p className="instruction" aria-hidden="true">
          {reducedMotion ? 'Choose a page' : 'Drag a ball into the hoop'}
        </p>
        <div className="floor" aria-hidden="true" />

        {!reducedMotion && (
          <>
            <div ref={hoopRef} className="hoop hoop-back" aria-label="Drop a ball here to open its page">
              <img src="/assets/basket-hoop.svg" alt="" draggable="false" />
            </div>
            <div className="hoop hoop-front" aria-hidden="true">
              <img src="/assets/basket-hoop-front.svg" alt="" draggable="false" />
            </div>
          </>
        )}

        {DESTINATIONS.map((destination, index) => (
          <button
            key={destination.href}
            ref={(element) => { ballRefs.current[index] = element }}
            type="button"
            aria-label={reducedMotion ? `Open ${destination.label}` : `Drag ${destination.label} into the hoop to open`}
            className={`ball ${destination.tone} ${destination.large ? 'large' : ''}`}
            onPointerDown={(event) => handlePointerDown(index, event)}
            onPointerMove={(event) => handlePointerMove(index, event)}
            onPointerUp={(event) => releasePointer(index, event)}
            onPointerCancel={(event) => releasePointer(index, event)}
            onClick={(event) => {
              if (reducedMotion || event.detail === 0) window.location.assign(destination.href)
            }}
            draggable={false}
          >
            <span>{destination.label}</span>
            <svg className="seams" viewBox="0 0 100 100" aria-hidden="true">
              <path d="M0 50H100" />
              <path d="M50 0V100" />
              <path d="M8 18C30 34 30 66 8 82" />
              <path d="M92 18C70 34 70 66 92 82" />
            </svg>
          </button>
        ))}

        {!reducedMotion && (
          <button
            type="button"
            className="reset"
            onClick={() => {
              armedRef.current.clear()
              scoringRef.current = null
              navigatingRef.current = false
              animationStartRef.current = null
              initialDropCompleteRef.current = false
              setResetKey((key) => key + 1)
            }}
          >
            Drop again
          </button>
        )}
      </div>

    </main>
  )
}
