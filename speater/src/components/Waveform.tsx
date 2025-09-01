import React, { useEffect, useRef, useState } from 'react'
import { Cue } from '../lib/srt'

export interface Peaks {
  mins: Float32Array
  maxs: Float32Array
}

interface Props {
  peaks: Peaks | null
  duration: number
  currentTime: number
  pointA?: number | null
  pointB?: number | null
  onSeek?: (sec: number) => void
  height?: number
  showAxis?: boolean
  cues?: Cue[]
  activeCueId?: string | null
  onSegmentPick?: (start: number, end: number) => void
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)) }

export default function Waveform({ peaks, duration, currentTime, pointA, pointB, onSeek, height = 120, showAxis = true, cues, activeCueId, onSegmentPick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [width, setWidth] = useState<number>(600)

function formatTimeLabel(sec: number) {
  if (!Number.isFinite(sec)) return '0:00'
  sec = Math.max(0, Math.round(sec))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2,'0')}`
}

// Choose a "nice" major tick step aiming for ~8-10 labels across width
function chooseStep(totalSec: number, pixelWidth: number) {
  const targetLabels = 8
  const rough = totalSec / targetLabels
  const bases = [1, 2, 5]
  let pow = 0
  let step = 1
  // find power-of-10 base near rough
  while (Math.pow(10, pow) < rough) pow += 1
  for (let p = Math.max(0, pow-2); p <= pow+2; p++) {
    for (const b of bases) {
      const cand = b * Math.pow(10, p)
      if (cand >= rough) { step = cand; break }
    }
    if (step >= rough) break
  }
  // clamp to seconds
  step = Math.max(1, Math.round(step))
  // minor tick is fraction of major
  const minor = Math.max(1, Math.round(step / 5))
  return { major: step, minor }
}


  // Resize handling
  useEffect(() => {
    function handle() {
      const el = canvasRef.current
      if (!el) return
      const parent = el.parentElement
      if (parent) setWidth(parent.clientWidth)
    }
    handle()
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  useEffect(() => { draw() }, [peaks, width, height, currentTime, pointA, pointB])


function draw() {
  const canvas = canvasRef.current
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const axisH = showAxis ? 20 : 0
  const waveH = height - axisH
  const w = Math.max(10, Math.floor(width))
  canvas.width = Math.max(10, Math.floor(w * dpr))
  canvas.height = Math.floor(height * dpr)

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // bg
  ctx.fillStyle = '#0f121a'
  ctx.fillRect(0,0,w,height)

  // waveform midline
  const mid = waveH / 2
  ctx.strokeStyle = '#1f2430'
  ctx.beginPath()
  ctx.moveTo(0, mid)
  ctx.lineTo(w, mid)
  ctx.stroke()

  if (!peaks) {
    ctx.fillStyle = '#9fb3c8'
    ctx.fillText('未生成波形（导入音频后自动生成）', 12, mid-8)
  } else {
    const count = peaks.mins.length
    const scaleY = (h: number) => h * (waveH / 2) // h in [0..1]
    // grid/ticks
    if (showAxis && duration > 0) {
      const { major, minor } = chooseStep(duration, w)
      ctx.strokeStyle = '#182030'
      ctx.fillStyle = '#9fb3c8'
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto'
      for (let t = 0; t <= Math.ceil(duration); t += minor) {
        const x = Math.floor((t / duration) * w)
        // minor grid line
        ctx.globalAlpha = 0.35
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, waveH)
        ctx.stroke()
      }
      for (let t = 0; t <= Math.ceil(duration); t += major) {
        const x = Math.floor((t / duration) * w)
        // major grid strong
        ctx.globalAlpha = 0.65
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, waveH)
        ctx.stroke()
        // axis line
        ctx.globalAlpha = 1
        ctx.strokeStyle = '#263042'
        ctx.beginPath()
        ctx.moveTo(0, waveH + 0.5)
        ctx.lineTo(w, waveH + 0.5)
        ctx.stroke()
        // labels
        const label = formatTimeLabel(t)
        ctx.fillStyle = '#9fb3c8'
        ctx.fillText(label, Math.max(0, x - 10), waveH + 15)
        ctx.strokeStyle = '#182030'
      }
    }

    
// segment background from SRT cues (optional)
if (cues && duration > 0 && cues.length > 0) {
  for (const c of cues) {
    const x1 = Math.floor(Math.max(0, Math.min(1, c.start / duration)) * w)
    const x2 = Math.floor(Math.max(0, Math.min(1, c.end / duration)) * w)
    const isActive = activeCueId && c.id === activeCueId
    // alternating background
    const alt = (Math.floor(c.start) / 5) % 2 === 0
    ctx.fillStyle = isActive ? 'rgba(100,149,237,0.25)' : (alt ? 'rgba(32,38,52,0.6)' : 'rgba(25,31,44,0.6)')
    ctx.fillRect(x1, 0, Math.max(1, x2 - x1), waveH)
    // boundary line
    ctx.strokeStyle = '#263042'
    ctx.globalAlpha = 0.8
    ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x1, waveH); ctx.stroke()
  }
  ctx.globalAlpha = 1
}

      // waveform columns
    ctx.fillStyle = '#6aa9ff'
    for (let x = 0; x < w; x++) {
      const idx = Math.floor(x * (count / w))
      const min = Math.max(-1, Math.min(1, peaks.mins[idx] ?? 0))
      const max = Math.max(-1, Math.min(1, peaks.maxs[idx] ?? 0))
      const y1 = mid - scaleY(Math.abs(max))
      const y2 = mid + scaleY(Math.abs(min))
      ctx.fillRect(x, y1, 1, Math.max(1, y2 - y1))
    }

    // highlight AB region
    if (pointA != null && pointB != null && duration > 0 && pointB > pointA) {
      const ax = Math.floor(Math.max(0, Math.min(1, pointA / duration)) * w)
      const bx = Math.floor(Math.max(0, Math.min(1, pointB / duration)) * w)
      ctx.fillStyle = 'rgba(52,211,153,0.15)'
      ctx.fillRect(ax, 0, Math.max(1, bx - ax), waveH)
      ctx.strokeStyle = 'rgba(52,211,153,0.8)'
      ctx.beginPath()
      ctx.moveTo(ax, 0); ctx.lineTo(ax, waveH)
      ctx.moveTo(bx, 0); ctx.lineTo(bx, waveH)
      ctx.stroke()
    }
  }

  // current time cursor
  if (duration > 0) {
    const cx = Math.floor(Math.max(0, Math.min(1, currentTime / duration)) * w)
    ctx.strokeStyle = '#34d399'
    ctx.beginPath()
    ctx.moveTo(cx, 0); ctx.lineTo(cx, waveH)
    ctx.stroke()
  }
}

function onClick(e: React.MouseEvent<HTMLCanvasElement>) {
  if (!onSeek || duration <= 0) return
  const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
  const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
  const ratio = x / rect.width
  const t = duration * ratio
  if (e.shiftKey && cues && onSegmentPick) {
    const hit = cues.find(c => t >= c.start && t < c.end)
    if (hit) onSegmentPick(hit.start, hit.end)
  } else {
    onSeek(t)
  }
}
  return (
    <div style={{width: '100%'}}>
      <canvas ref={canvasRef} height={height} onClick={onClick} style={{ width: '100%', height }} />
    </div>
  )
}