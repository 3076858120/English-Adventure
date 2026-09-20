import React, { useEffect, useState } from 'react'
import { GameProvider, useGame } from './store/GameContext'
import NameGate from './screens/NameGate'
import Home from './screens/Home'
import Map from './screens/Map'
import Lesson from './screens/Lesson'
import Battle from './screens/Battle'
import Reward from './screens/Reward'
import Gacha from './screens/Gacha'
import PetRoom from './screens/PetRoom'

// hash 路由:#map #pets #gacha #lesson-3 #level-23 #reward-23 #home
function parseHash() {
  const raw = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0] // 去掉 ?chest= 之类参数
  if (!raw || raw === 'home') return { name: 'home' }
  const m = raw.match(/^(lesson|level|reward)-(\d+)$/)
  if (m) return { name: m[1], arg: Number(m[2]) }
  if (['map', 'pets', 'gacha'].includes(raw)) return { name: raw }
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

  // 没有昵称时强制先进入命名页
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

  return (
    <GameProvider>
      <div className="app-shell">
        <Router route={route} />
      </div>
    </GameProvider>
  )
}
