import React from 'react'
import { useApp, TabKey } from '../lib/store'

const items: { key: TabKey, label: string }[] = [
  { key: 'player', label: 'Player' },
  { key: 'bookmarks', label: 'Bookmarks' },
]

export default function TabBar() {
  const { tab, setTab } = useApp()
  return (
    <div className="tabbar">
      {items.map(it => (
        <button key={it.key} className={'tabitem' + (tab===it.key ? ' active' : '')} onClick={() => setTab(it.key)}>
          {it.label}
        </button>
      ))}
    </div>
  )
}