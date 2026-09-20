import React, { useMemo, useState } from 'react'
import { useGame } from '../store/GameContext'
import { getLevel, TOTAL_LEVELS } from '../data/levels'
import { getItem } from '../data/collection'

// 通关奖励页:+50 XP +20 金币,部分关卡开宝箱
export default function Reward({ levelId }) {
  const level = getLevel(levelId)
  const { save, completedCount } = useGame()

  // chest 参数由 Battle 传入(#reward-12?chest=itemId)
  const chestId = useMemo(() => {
    const m = (window.location.hash || '').match(/chest=([\w-]+)/)
    return m ? m[1] : null
  }, [])
  const [chestOpen, setChestOpen] = useState(false)
  const chestItem = chestId ? getItem(chestId) : null

  const nextId = levelId + 1
  const hasNext = nextId <= TOTAL_LEVELS

  return (
    <div className="screen center-screen reward">
      <div className="pop-in reward-card">
        <div className="reward-stars">⭐✨⭐</div>
        <h1>战斗胜利!</h1>
        <p className="reward-line">
          <span className="reward-chip">+50 XP</span>
          <span className="reward-chip">+20 🪙</span>
        </p>
        <p className="reward-progress">已通关 {completedCount} / {TOTAL_LEVELS} 关</p>

        {chestItem && (
          <div className="chest-box">
            <button className={`chest ${chestOpen ? 'opened' : ''}`} onClick={() => setChestOpen(true)}>
              {chestOpen ? '🎊' : '🎁'}
            </button>
            {chestOpen ? (
              <p className="chest-item pop-in">
                获得 <strong>{chestItem.emoji} {chestItem.name}</strong>
                <small>({chestItem.type === 'pet' ? '新宠物!' : '已放入背包'})</small>
              </p>
            ) : (
              <p className="chest-tip">这是宝箱关卡!点开看看 👆</p>
            )}
          </div>
        )}

        <div className="reward-actions">
          {hasNext && (
            <button className="btn btn-primary btn-big" onClick={() => (window.location.hash = `#level-${nextId}`)}>
              挑战下一关 →
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => (window.location.hash = '#map')}>回冒险地图</button>
          {!hasNext && save.completed.length >= TOTAL_LEVELS && (
            <p className="reward-crown">👑 你通关了整个英语王国!你是最棒的英语小英雄!</p>
          )}
        </div>
      </div>
    </div>
  )
}
