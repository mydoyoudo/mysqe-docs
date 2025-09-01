import React, { useEffect, useRef, useState } from 'react'
import { Cue, parseSRT, formatTime } from '../lib/srt'
import Waveform, { Peaks } from './Waveform'
import ProgressBar from './ProgressBar'
import { useApp, useCurrentTrack } from '../lib/store'

export default function Player() {
  const { currentTrackId, tracks, toggleFavorite, favorites, addBookmark } = useApp()
  const currentTrack = useCurrentTrack()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioName, setAudioName] = useState<string>('尚未选择音频')
  const [audioURL, setAudioURL] = useState<string>('')
  const [cues, setCues] = useState<Cue[]>([])
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [rate, setRate] = useState<number>(1.0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [pointA, setPointA] = useState<number | null>(null)
  const [pointB, setPointB] = useState<number | null>(null)
  
const [activeCueId, setActiveCueId] = useState<string | null>(null)
const [peaks, setPeaks] = useState<Peaks | null>(null)
const audioCtxRef = useRef<AudioContext | null>(null)


async function ensureCtx() {
  if (!audioCtxRef.current) {
    // @ts-ignore
    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    audioCtxRef.current = new Ctor()
  }
  const ctx = audioCtxRef.current!
  try { await ctx.resume() } catch {}
  return ctx
}

async function buildPeaksFromBlob(blob: Blob) {
  try {
    const ctx = await ensureCtx()
    const arrayBuf = await blob.arrayBuffer()
    const audioBuf = await ctx.decodeAudioData(arrayBuf.slice(0))
    const channel = audioBuf.getChannelData(0)
    const samplesOut = Math.min(2000, Math.max(300, Math.floor(channel.length / 1000)))
    const block = Math.floor(channel.length / samplesOut) || 1
    const mins = new Float32Array(samplesOut)
    const maxs = new Float32Array(samplesOut)
    for (let i = 0; i < samplesOut; i++) {
      const start = i * block
      let min = 1.0, max = -1.0
      for (let j = 0; j < block && start + j < channel.length; j++) {
        const v = channel[start + j]
        if (v < min) min = v
        if (v > max) max = v
      }
      mins[i] = min; maxs[i] = max
    }
    setPeaks({ mins, maxs })
  } catch (e) {
    console.warn('生成波形失败：', e)
    setPeaks(null)
  }
}

async function buildPeaks(file: File) {
  try {
    // Lazy init AudioContext
    const ctx = await ensureCtx()

    const arrayBuf = await file.arrayBuffer()
    const audioBuf = await ctx.decodeAudioData(arrayBuf.slice(0)) // copy for Safari

    const channel = audioBuf.getChannelData(0)
    const samplesOut = Math.min(2000, Math.max(300, Math.floor(channel.length / 1000)))
    const block = Math.floor(channel.length / samplesOut) || 1
    const mins = new Float32Array(samplesOut)
    const maxs = new Float32Array(samplesOut)

    for (let i = 0; i < samplesOut; i++) {
      const start = i * block
      let min = 1.0, max = -1.0
      for (let j = 0; j < block && start + j < channel.length; j++) {
        const v = channel[start + j]
        if (v < min) min = v
        if (v > max) max = v
      }
      mins[i] = min
      maxs[i] = max
    }
    setPeaks({ mins, maxs })
  } catch (e) {
    console.warn('生成波形失败：', e)
    setPeaks(null)
  }
}

  const [preservePitch, setPreservePitch] = useState<boolean>(true)
  const [sentenceLoop, setSentenceLoop] = useState<boolean>(false)

  
  // 当全局当前曲目变化时，加载到播放器并生成波形
  useEffect(() => {
    if (!currentTrack) return
    setAudioName(currentTrack.name)
    setAudioURL(currentTrack.url)
    setCues([]); setPeaks(null); setPointA(null); setPointB(null)
    // 优先使用原始 File 生成波形；若无，则从 objectURL 读取 blob
    ;(async () => {
      try {
        if (currentTrack.file) {
          await buildPeaks(currentTrack.file)
        } else if (currentTrack.url.startsWith('blob:')) {
          const res = await fetch(currentTrack.url)
          const blob = await res.blob()
          await buildPeaksFromBlob(blob)
        }
      } catch (e) { console.warn(e) }
    })()
  }, [currentTrackId])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => {
      setCurrentTime(a.currentTime)
      // AB Loop
      if (pointA != null && pointB != null && a.currentTime >= pointB) {
        a.currentTime = pointA
        a.play().catch(()=>{})
      }
      // active cue
      const now = a.currentTime
      const match = cues.find(c => now >= c.start && now < c.end)
      setActiveCueId(match?.id ?? null)
      if (sentenceLoop && match) { setPointA(match.start); setPointB(match.end) }
    }
    const onLoaded = () => { setDuration(a.duration || 0) }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onLoaded)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onLoaded)
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
    }
  }, [cues, pointA, pointB])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.playbackRate = rate
    // Try to preserve pitch across browsers
    try {
      (a as any).preservesPitch = preservePitch;
      (a as any).mozPreservesPitch = preservePitch;
      (a as any).webkitPreservesPitch = preservePitch;
    } catch {}
  }, [rate, preservePitch])

  function onPickAudio(file: File | null) {
    if (!file) return
    setAudioName(file.name)
    const url = URL.createObjectURL(file)
    setAudioURL(url)
    setCues([]) // reset cues when new audio
    setPeaks(null)
    // 生成波形（后台异步）
    buildPeaks(file)
    setPointA(null); setPointB(null)
  }

  async function onPickSRT(file: File | null) {
    if (!file) return
    const text = await file.text()
    const parsed = parseSRT(text)
    setCues(parsed)
  }

  function seek(to: number) {
    const a = audioRef.current
    if (!a) return
    a.currentTime = to
  }

  
function findCurrentCueIndex(now: number) {
  if (!cues || cues.length === 0) return -1
  return cues.findIndex(c => now >= c.start && now < c.end)
}
function seekPrevSentence() {
  const idx = findCurrentCueIndex(audioRef.current?.currentTime || 0)
  const target = idx > 0 ? cues[idx-1] : cues[0]
  if (target) { seek(target.start); if (sentenceLoop) { setPointA(target.start); setPointB(target.end) } }
}
function seekNextSentence() {
  const idx = findCurrentCueIndex(audioRef.current?.currentTime || 0)
  const target = idx >= 0 && idx < cues.length-1 ? cues[idx+1] : cues[cues.length-1]
  if (target) { seek(target.start); if (sentenceLoop) { setPointA(target.start); setPointB(target.end) } }
}

  function toggle() {
    const a = audioRef.current
    if (!a) return
    if (a.paused) a.play().catch(()=>{}); else a.pause()
  }


useEffect(() => {
  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); seek(Math.max(0, (audioRef.current?.currentTime || 0) - 5)) }
    if (e.key === 'ArrowRight') { e.preventDefault(); seek(Math.min(duration, (audioRef.current?.currentTime || 0) + 5)) }
    if (e.key.toLowerCase() === 'j') { e.preventDefault(); seekPrevSentence() }
    if (e.key.toLowerCase() === 'k') { e.preventDefault(); seekNextSentence() }
    if (e.key.toLowerCase() === 'l') { e.preventDefault(); setSentenceLoop(v => !v) }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [duration, cues, sentenceLoop])

  return (
    <div className="card">
      <h2>Speater Web MVP</h2>
      <div className="subtitle">本地运行 / 导入音频与 SRT / 变速不变调 / A-B 循环 / 逐句跳转</div>

      <div className="row" style={{marginTop: 12}}>
        <label className="col">
          <span className="small">导入音频（mp3/m4a/wav）</span>
          <input type="file" accept="audio/*" onChange={e => onPickAudio(e.target.files?.[0] ?? null)} />
        </label>

        <label className="col">
          <span className="small">导入字幕（.srt）</span>
          <input type="file" accept=".srt,text/plain" onChange={e => onPickSRT(e.target.files?.[0] ?? null)} />
        </label>
      </div>

      <div className="col" style={{marginTop: 12}}>
        <div className="small">当前音频：{audioName}</div>
        <audio ref={audioRef} src={audioURL} preload="metadata" />
        <div className="row">
          
      <div className="row" style={{flexWrap:'wrap', gap:8}}>
        <button onClick={() => setPointA(currentTime)}>A</button>
        <button onClick={() => setPointB(currentTime)}>B</button>
        <button className="danger" onClick={() => { setPointA(null); setPointB(null); }}>清AB</button>
        <button onClick={() => addBookmark({ trackId: currentTrackId!, time: currentTime, note: '' })}>加书签</button>
        <button onClick={seekPrevSentence}>上一句</button>
        <button onClick={seekNextSentence}>下一句</button>
        <label className="row" style={{gap:6}}><input type="checkbox" checked={sentenceLoop} onChange={e=>setSentenceLoop(e.target.checked)} /><span className="small">句循环</span></label>
        <button onClick={() => currentTrackId && toggleFavorite(currentTrackId)}>
          {currentTrackId && favorites.includes(currentTrackId) ? '★ 已收藏' : '☆ 收藏'}
        </button>
        <button onClick={() => seek(Math.max(0, currentTime - 5))}>« 5s</button>
        <button onClick={() => seek(Math.min(duration, currentTime + 5))}>5s »</button>
      </div>

          <button className="primary" onClick={toggle}>{isPlaying ? '暂停' : '播放'}</button>
          <div className="range-group">
            <span className="small">进度</span>
            <input
              type="range"
              min={0}
              max={Math.max(0.1, duration)}
              step={0.05}
              value={currentTime}
              onChange={e => seek(parseFloat(e.target.value))}
              style={{width: 280}}
            />
            <span className="small">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>

        <div className="row">
          <div className="range-group">
            <span className="small">变速</span>
            <input type="range" min={0.5} max={2.0} step={0.05} value={rate} onChange={e => setRate(parseFloat(e.target.value))} />
            <span className="small">{rate.toFixed(2)}x</span>
          </div>
          <label className="row" style={{gap: 6}}>
            <input type="checkbox" checked={preservePitch} onChange={e => setPreservePitch(e.target.checked)} />
            <span className="small">保持音调（实验性）</span>
          </label>
        </div>

        <div className="row">
          <button onClick={() => setPointA(currentTime)}>设 A</button>
          <button onClick={() => setPointB(currentTime)}>设 B</button>
          <button className="danger" onClick={() => { setPointA(null); setPointB(null); }}>清除 A-B</button>
          <div className="small">A: {pointA != null ? formatTime(pointA) : '--'}，B: {pointB != null ? formatTime(pointB) : '--'}</div>
        </div>
      </div>


<div className="col" style={{marginTop: 12}}>
  <div className="small">波形（点击可跳转）</div>
  <Waveform
    peaks={peaks}
    duration={duration}
    currentTime={currentTime}
    pointA={pointA}
    pointB={pointB}
    onSeek={seek}
    height={120}
  />
</div>

<div className="col" style={{marginTop: 16}}>

        <div className="small">字幕（点击跳转）</div>
        <div className="list">
          {cues.map(c => (
            <div
              key={c.id}
              onClick={() => seek(c.start)}
              className={"line " + (activeCueId === c.id ? 'active' : '')}
            >
              <span className="time">[{formatTime(c.start)}]</span>{" "}
              <span className="text">{c.text}</span>
            </div>
          ))}
          {cues.length === 0 && <div className="small">未导入 SRT 字幕</div>}
        </div>
      </div>

      <div className="footer">
        本页面仅在本地浏览器运行，不上传任何文件。你可以离线打包为 PWA（后续可加）。
      </div>
    </div>
  )
}