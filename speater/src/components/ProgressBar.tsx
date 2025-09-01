import React, { useCallback, useMemo, useRef, useState } from 'react'

interface Props {
  duration: number
  currentTime: number
  onSeek: (sec: number) => void
  pointA?: number | null
  pointB?: number | null
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)) }

export default function ProgressBar({ duration, currentTime, onSeek, pointA = null, pointB = null }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState(false)

  const pos = useMemo(() => duration > 0 ? clamp(currentTime / duration, 0, 1) : 0, [currentTime, duration])
  const aPos = useMemo(() => (pointA != null && duration > 0) ? clamp(pointA / duration, 0, 1) : null, [pointA, duration])
  const bPos = useMemo(() => (pointB != null && duration > 0) ? clamp(pointB / duration, 0, 1) : null, [pointB, duration])

  const seekFromClientX = useCallback((clientX: number) => {
    const el = ref.current
    if (!el || duration <= 0) return
    const rect = el.getBoundingClientRect()
    const x = clamp(clientX - rect.left, 0, rect.width)
    const ratio = rect.width === 0 ? 0 : x / rect.width
    onSeek(ratio * duration)
  }, [duration, onSeek])

  function onPointerDown(e: React.MouseEvent<HTMLDivElement>) {
    setDragging(true)
    seekFromClientX(e.clientX)
    const onMove = (ev: MouseEvent) => seekFromClientX(ev.clientX)
    const onUp = () => {
      setDragging(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp, { once: true })
  }

  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    setDragging(true)
    seekFromClientX(e.touches[0].clientX)
    const onMove = (ev: TouchEvent) => {
      if (ev.touches && ev.touches[0]) seekFromClientX(ev.touches[0].clientX)
    }
    const onUp = () => {
      setDragging(false)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
      window.removeEventListener('touchcancel', onUp)
    }
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onUp, { once: true })
    window.addEventListener('touchcancel', onUp, { once: true })
  }

  return (
    <div className={"progress" + (dragging ? " dragging" : "")} ref={ref} onMouseDown={onPointerDown} onTouchStart={onTouchStart}>
      {/* base track */}
      <div className="progress-track" />
      {/* AB region highlight */}
      {(aPos != null && bPos != null && bPos > aPos) && (
        <div className="progress-ab" style={{ left: `${aPos*100}%`, width: `${(bPos - aPos)*100}%` }} />
      )}
      {/* played bar */}
      <div className="progress-played" style={{ width: `${pos*100}%` }} />
      {/* knob */}
      <div className="progress-knob" style={{ left: `${pos*100}%` }} />
    </div>
  )
}