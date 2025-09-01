import React from 'react'
import { useApp } from '../lib/store'

export default function LibraryView() {
  const { tracks, addTrack, removeTrack, setCurrentTrackId, setTab } = useApp()

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const id = crypto.randomUUID()
    const url = URL.createObjectURL(file)
    addTrack({ id, name: file.name, url, file })
    setCurrentTrackId(id)
    setTab('player')
  }

  return (
    <div className="card">
      <h2>iTunes</h2>
      <div className="subtitle">本地导入音频文件（不会上传）</div>
      <div style={{ marginTop: 12 }}>
        <input type="file" accept="audio/*" onChange={onPick} />
      </div>
      <div style={{ marginTop: 12 }}>
        {tracks.length === 0 ? <div className="small">尚无文件</div> : (
          <ul>
            {tracks.map(t => (
              <li key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 6 }}>
                <button onClick={() => { setCurrentTrackId(t.id); setTab('player') }}>{t.name}</button>
                <button className="danger" onClick={() => removeTrack(t.id)}>删除</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}