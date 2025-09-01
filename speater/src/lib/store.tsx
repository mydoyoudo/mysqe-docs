import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export interface Track {
  id: string
  name: string
  url: string          // objectURL
  file?: File          // 原始文件（用于生成波形）
  duration?: number
}

export interface Bookmark {
  id: string
  trackId: string
  time: number
  note?: string
  createdAt: number
}

export type TabKey = 'player' | 'bookmarks'

interface AppState {
  tab: TabKey
  setTab: (t: TabKey) => void

  tracks: Track[]
  addTrack: (t: Track) => void
  removeTrack: (id: string) => void
  currentTrackId: string | null
  setCurrentTrackId: (id: string | null) => void

  favorites: string[]            // trackIds
  toggleFavorite: (id: string) => void
  recents: string[]              // trackIds (most recent first)
  touchRecent: (id: string) => void

  bookmarks: Bookmark[]
  addBookmark: (b: Omit<Bookmark, 'id'|'createdAt'>) => void
  removeBookmark: (id: string) => void
}

const Ctx = createContext<AppState | null>(null)

const LS_KEYS = {
  favorites: 'speater-favorites',
  bookmarks: 'speater-bookmarks',
  recents: 'speater-recents'
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<TabKey>('player')
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.favorites) || '[]') } catch { return [] }
  })
  const [recents, setRecents] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.recents) || '[]') } catch { return [] }
  })
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.bookmarks) || '[]') } catch { return [] }
  })

  useEffect(() => { localStorage.setItem(LS_KEYS.favorites, JSON.stringify(favorites)) }, [favorites])
  useEffect(() => { localStorage.setItem(LS_KEYS.bookmarks, JSON.stringify(bookmarks)) }, [bookmarks])
  useEffect(() => { localStorage.setItem(LS_KEYS.recents, JSON.stringify(recents)) }, [recents])

  function addTrack(t: Track) {
    setTracks(prev => {
      const exists = prev.find(x => x.id === t.id)
      return exists ? prev.map(x => x.id===t.id? t : x) : [...prev, t]
    })
  }
  function removeTrack(id: string) {
    setTracks(prev => prev.filter(x => x.id !== id))
    if (currentTrackId === id) setCurrentTrackId(null)
  }
  function toggleFavorite(id: string) {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev])
  }
  function touchRecent(id: string) {
    setRecents(prev => [id, ...prev.filter(x => x !== id)])
  }
  function addBookmark(b: Omit<Bookmark, 'id'|'createdAt'>) {
    setBookmarks(prev => [{ id: crypto.randomUUID(), createdAt: Date.now(), ...b }, ...prev])
  }
  function removeBookmark(id: string) {
    setBookmarks(prev => prev.filter(x => x.id !== id))
  }

  const value: AppState = {
    tab, setTab,
    tracks, addTrack, removeTrack, currentTrackId, setCurrentTrackId,
    favorites, toggleFavorite, recents, touchRecent,
    bookmarks, addBookmark, removeBookmark
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function useCurrentTrack(): Track | null {
  const { tracks, currentTrackId } = useApp()
  return useMemo(() => tracks.find(t => t.id === currentTrackId) ?? null, [tracks, currentTrackId])
}