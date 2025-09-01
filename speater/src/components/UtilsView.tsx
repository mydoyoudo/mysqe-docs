import React, { useMemo, useState } from 'react'
import { useApp } from '../lib/store'

export default function UtilsView() {
  const { tracks, favorites, setCurrentTrackId, setTab } = useApp()
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return tracks.filter(t => t.name.toLowerCase().includes(s))
  }, [tracks, q])

  return (
    <div className="card">
      <h2>Utils</h2>
      <div className="subtitle">搜索、收藏</div>
      <div className="row" style={{marginTop: 12}}>
        <input placeholder="搜索文件名…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div style={{marginTop: 12}}>
        <div className="small">搜索结果</div>
        {list.length === 0 ? <div className="small">无匹配</div> : (
          <ul>
            {list.map(t => (
              <li key={t.id} style={{ padding: 6 }}>
                <button onClick={() => { setCurrentTrackId(t.id); setTab('player') }}>{t.name}</button>
                {favorites.includes(t.id) && <span className="small">  ★已收藏</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}