import React from 'react'
import Player from './components/Player'
import TabBar from './components/TabBar'
import BookmarksView from './components/BookmarksView'
import { AppProvider, useApp } from './lib/store'

function Screen() {
  const { tab } = useApp()
  return (
    <div className="container">
      <h1>Speater</h1>
      <div style={{ height: 12 }} />
      {tab === 'player' && <Player />}
      {tab === 'bookmarks' && <BookmarksView />}
      <TabBar />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Screen />
    </AppProvider>
  )
}
