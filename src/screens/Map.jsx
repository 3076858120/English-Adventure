import React from 'react'
import { useGame } from '../store/GameContext'
import { CHAPTERS, LEVELS } from '../data/levels'

// 冒险地图:10 个章节 × 4 关,每章入口是学习营
function LevelNode({ level, completed, unlocked, needsCamp, onClick }) {
  const state = completed ? 'done' : unlocked ? 'open' : 'locked'
  return (
    <button
      className={`level-node ${state} ${level.isBoss ? 'boss' : ''}`}
      onClick={() => state !== 'locked' && onClick(level)}
    >
      <span className="level-num">{level.isBoss ? 'BOSS' : level.id}</span>
      {completed && <span className="level-check">✓</span>}
      {!completed && unlocked && !level.isBoss && <span className="level-open-dot">●</span>}
      {!completed && unlocked && level.isBoss && <span className="level-monster">{level.monster.emoji}</span>}
      {needsCamp && <span className="level-camp-flag">📚</span>}
    </button>
  )
}

export default function Map() {
  const { save, isLevelUnlocked, campDone, levelNeedsCamp } = useGame()

  const goLevel = (level) => {
    if (levelNeedsCamp(level.id)) {
      window.location.hash = `#lesson-${level.chapterId}`
      return
    }
    window.location.hash = `#level-${level.id}`
  }

  return (
    <div className="screen map">
      <header className="screen-header">
        <button className="btn btn-ghost" onClick={() => (window.location.hash = '#home')}>← 首页</button>
        <h1>🗺️ 冒险地图</h1>
        <div className="header-stats">🪙 {save.coins}</div>
      </header>

      {CHAPTERS.map((ch) => {
        const levels = LEVELS.filter((l) => l.chapterId === ch.id)
        const chapterLevels = levels.map((l) => l.id)
        const allDone = chapterLevels.every((id) => save.completed.includes(id))
        const anyOpen = chapterLevels.some((id) => isLevelUnlocked(id))
        const gated = anyOpen && !campDone(ch.id)

        return (
          <section key={ch.id} className={`chapter-card ${anyOpen ? '' : 'chapter-locked'}`} style={{ '--chapter-color': ch.color }}>
            <div className="chapter-head">
              <span className="chapter-icon">{ch.icon}</span>
              <div className="chapter-meta">
                <h2>{ch.id}. {ch.name}</h2>
                <p>{ch.desc}</p>
              </div>
              {allDone && <span className="chapter-done">🏆 已通关</span>}
            </div>

            <div className="chapter-camp-row">
              <button
                className={`camp-btn ${campDone(ch.id) ? 'done' : anyOpen ? 'glow' : 'locked'}`}
                onClick={() => anyOpen && (window.location.hash = `#lesson-${ch.id}`)}
              >
                {campDone(ch.id) ? '✅ 学习营已完成' : '📚 学习营(先学习!)'}
              </button>
              {gated && <span className="camp-tip">先完成学习营,才能挑战这章的关卡哦!</span>}
            </div>

            <div className="level-grid">
              {levels.map((l) => {
                const unlocked = isLevelUnlocked(l.id)
                return (
                  <LevelNode
                    key={l.id}
                    level={l}
                    completed={save.completed.includes(l.id)}
                    unlocked={unlocked}
                    needsCamp={unlocked && levelNeedsCamp(l.id)}
                    onClick={goLevel}
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
