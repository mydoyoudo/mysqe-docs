import React from 'react'
import { useApp } from '../lib/store'
import { formatTime } from '../lib/srt'

export default function BookmarksView() {
  const { bookmarks, removeBookmark, tracks, setCurrentTrackId, setTab } = useApp()
  const trackName = (id: string) => tracks.find(t => t.id === id)?.name || '(已移除)'
  return (
    <div className="card">
      <h2>File Sharing</h2>
      <div className="subtitle">此处显示你的书签（时间点）。点击可跳转到播放器。</div>
      {bookmarks.length === 0 ? <div className="small" style={{marginTop: 12}}>暂无书签</div> : (
        <ul style={{marginTop: 12}}>
          {bookmarks.map(b => (
            <li key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 6 }}>
              <button onClick={() => { setCurrentTrackId(b.trackId); setTab('player') }}>
                <div style={{textAlign: 'left'}}>
                  <div>{trackName(b.trackId)}</div>
                  <div className="small">{formatTime(b.time)}  {b.note ? ' · '+b.note : ''}</div>
                </div>
              </button>
              <button className="danger" onClick={() => removeBookmark(b.id)}>删除</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}