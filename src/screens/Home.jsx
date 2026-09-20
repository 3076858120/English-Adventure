import React from 'react'
import { useGame } from '../store/GameContext'
import { TOTAL_LEVELS } from '../data/levels'
import { getItem } from '../data/collection'

function CloudBadge() {
  const { cloudStatus, cloudError, retrySync } = useGame()
  const label =
    cloudStatus === 'cloud'
      ? '☁️ 云端已同步'
      : cloudStatus === 'disabled'
        ? '📴 本地模式'
        : cloudStatus === 'loading'
          ? '⏳ 连接中…'
          : '📴 本地模式(点我重试)'
  return (
    <button
      className={`cloud-badge ${cloudStatus === 'cloud' ? 'ok' : 'warn'}`}
      title={cloudError || '游戏进度保存在这台设备'}
      onClick={() => cloudStatus === 'local' && retrySync()}
    >
      {label}
    </button>
  )
}

export default function Home() {
  const { save, completedCount, nextRoute, activePetItem } = useGame()
  const pet = activePetItem || getItem(save.activePet) || getItem('chick0')

  return (
    <div className="screen home">
      <header className="home-header">
        <CloudBadge />
      </header>

      <div className="hero-card">
        <div className="hero-avatar">{pet?.emoji || '🐥'}</div>
        <div className="hero-info">
          <h1 className="hero-name">{save.nickname}</h1>
          <p className="hero-title-line">🏅 {save.xp} XP · 🪙 {save.coins} 金币</p>
          <p className="hero-streak">🔥 连续学习 {save.streak} 天</p>
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-text">
          <span>冒险进度</span>
          <strong>{completedCount} / {TOTAL_LEVELS} 关</strong>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(completedCount / TOTAL_LEVELS) * 100}%` }} />
        </div>
      </div>

      <button className="btn btn-primary btn-big btn-start" onClick={() => { window.location.hash = nextRoute }}>
        {completedCount === 0 ? '开始今日冒险！' : '继续冒险！'}
      </button>

      <nav className="home-nav">
        <button className="nav-card" onClick={() => (window.location.hash = '#map')}>
          <span className="nav-emoji">🗺️</span>
          <span>冒险地图</span>
          <small>40 关等你挑战</small>
        </button>
        <button className="nav-card" onClick={() => (window.location.hash = '#pets')}>
          <span className="nav-emoji">🏠</span>
          <span>宠物小窝</span>
          <small>{pet?.name || '我的宠物'}</small>
        </button>
        <button className="nav-card" onClick={() => (window.location.hash = '#gacha')}>
          <span className="nav-emoji">🎁</span>
          <span>盲盒商店</span>
          <small>60 金币抽一次</small>
        </button>
      </nav>

      <footer className="home-foot">English Adventure · 英语小冒险 · 学习 → 练习 → 战斗!</footer>
    </div>
  )
}
