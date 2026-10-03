import React, { useEffect, useState } from 'react'
import { GameProvider, useGame } from './store/GameContext'
import { unlockAudio } from './lib/speech'
import NameGate from './screens/NameGate'
import Home from './screens/Home'
import Map from './screens/Map'
import Lesson from './screens/Lesson'
import Battle from './screens/Battle'
import Reward from './screens/Reward'
import Gacha from './screens/Gacha'
import PetRoom from './screens/PetRoom'
import SchoolHome from './screens/SchoolHome'
import SchoolTask from './screens/SchoolTask'

function parseHash() {
  const raw = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0]
  if (!raw || raw === 'home') return { name: 'home' }
  const m = raw.match(/^(lesson|level|reward)-(\d+)$/)
  if (m) return { name: m[1], arg: Number(m[2]) }
  const school = raw.match(/^school-task-(.+)$/)
  if (school) return { name: 'school-task', arg: school[1] }
  if (['map', 'pets', 'gacha', 'school'].includes(raw)) return { name: raw }
  return { name: 'home' }
}

function LoadingScreen() {
  return (
    <div className="screen center-screen">
      <div className="loading-egg">🥚</div>
      <h2 className="loading-title">正在打开冒险世界…</h2>
      <p className="loading-sub">正在连接云端存档,最多只需几秒钟</p>
    </div>
  )
}

function Router({ route }) {
  const { save, loading } = useGame()

  if (loading) return <LoadingScreen />
  if (!save.nickname) return <NameGate />

  switch (route.name) {
    case 'map':
      return <Map />
    case 'lesson':
      return <Lesson chapterId={route.arg} />
    case 'level':
      return <Battle levelId={route.arg} />
    case 'reward':
      return <Reward levelId={route.arg} />
    case 'gacha':
      return <Gacha />
    case 'pets':
      return <PetRoom />
    case 'school':
      return <SchoolHome />
    case 'school-task':
      return <SchoolTask taskId={route.arg} />
    case 'home':
    default:
      return <Home />
  }
}

export default function App() {
  const [route, setRoute] = useState(parseHash)

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // 首次点击解锁音频(iOS/安卓 WebView 要求用户手势后才能发声)
  useEffect(() => {
    const h = () => unlockAudio()
    document.addEventListener('pointerdown', h, { once: true })
    return () => document.removeEventListener('pointerdown', h)
  }, [])

  return (
    <GameProvider>
      <div className="app-shell">
        <Router route={route} />
      </div>
    </GameProvider>
  )
}
