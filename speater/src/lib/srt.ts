export interface Cue {
  id: string
  start: number
  end: number
  text: string
}

function hmsToSeconds(h: number, m: number, s: number): number {
  return h * 3600 + m * 60 + s
}

export function parseSRT(content: string): Cue[] {
  const blocks = content.split(/\r?\n\r?\n/)
  const cues: Cue[] = []
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).filter(Boolean)
    if (lines.length < 2) continue
    // Common formats: 
    // 1 (index), 
    // 00:00:01,000 --> 00:00:03,000
    // text...
    const timeLine = lines[0].includes('-->') ? lines[0] : lines[1]
    if (!timeLine || !timeLine.includes('-->')) continue

    const [startRaw, endRaw] = timeLine.split('-->').map(s => s.trim())
    const toSec = (raw: string) => {
      const t = raw.replace(',', '.')
      const [hh, mm, ss] = t.split(':').map(Number)
      return hmsToSeconds(hh || 0, mm || 0, parseFloat(String(ss || 0)))
    }
    const start = toSec(startRaw)
    const end = toSec(endRaw)
    const text = (lines.slice(lines[0].includes('-->') ? 1 : 2)).join('\n')
    cues.push({ id: crypto.randomUUID(), start, end, text })
  }
  return cues.sort((a,b) => a.start - b.start)
}

export function formatTime(sec: number): string {
  if (!Number.isFinite(sec)) return '00:00'
  sec = Math.max(0, Math.floor(sec))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}