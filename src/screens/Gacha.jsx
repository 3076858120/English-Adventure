import React, { useState } from 'react'
import { useGame } from '../store/GameContext'
import { GACHA_COST, RARITIES, ITEM_TYPES } from '../data/collection'

// 盲盒商店:纯金币抽取,无任何真实货币
export default function Gacha() {
  const { save, doGacha } = useGame()
  const [pulling, setPulling] = useState(false)
  const [result, setResult] = useState(null)

  const pull = () => {
    if (pulling || save.coins < GACHA_COST) return
    setPulling(true)
    setResult(null)
    setTimeout(() => {
      const res = doGacha()
      setResult(res)
      setPulling(false)
    }, 1200)
  }

  const canPull = save.coins >= GACHA_COST

  return (
    <div className="screen gacha">
      <header className="screen-header">
        <button className="btn btn-ghost" onClick={() => (window.location.hash = '#home')}>← 首页</button>
        <h1>🎁 盲盒商店</h1>
        <div className="header-stats">🪙 {save.coins}</div>
      </header>

      <div className="gacha-machine-card">
        <div className={`gacha-machine ${pulling ? 'shaking' : ''}`}>
          <div className="gacha-box">{result?.item ? result.item.emoji : result ? '💛' : '❓'}</div>
        </div>

        {pulling && <p className="gacha-pulling">盲盒晃动中… ✨</p>}

        {!pulling && result && (
          <div className={`gacha-result pop-in ${result.rarity === 'NONE' ? 'none' : ''}`}>
            {result.kind === 'item' ? (
              <>
                <span
                  className="rarity-tag"
                  style={{ background: RARITIES.find((r) => r.id === result.rarity)?.color }}
                >
                  {RARITIES.find((r) => r.id === result.rarity)?.label}
                </span>
                <p className="gacha-item-name">
                  {result.item.emoji} {result.item.name}
                </p>
                <p className="gacha-item-type">
                  {result.item.type === 'coin'
                    ? '金币直接到账!'
                    : result.item.type === 'pet'
                      ? '新宠物加入你的小窝!'
                      : '已放入宠物小窝的背包'}
                </p>
              </>
            ) : (
              <p className="gacha-none">{result.message}</p>
            )}
          </div>
        )}

        <button className={`btn btn-primary btn-big ${pulling ? 'disabled' : ''}`} disabled={pulling || !canPull} onClick={pull}>
          抽一次 · 60 🪙
        </button>
        {!canPull && <p className="gacha-tip">金币不够啦!去闯关就能赚金币 💪</p>}
        <p className="gacha-balance">当前余额:{save.coins} 金币</p>
      </div>

      <div className="gacha-info">
        <details>
          <summary>🎲 中奖概率(公开透明)</summary>
          <ul className="rarity-list">
            {RARITIES.map((r) => (
              <li key={r.id}>
                <span className="rarity-dot" style={{ background: r.color }} />
                {r.label}
                <strong>{((r.weight / 100) * 100).toFixed(0)}%</strong>
              </li>
            ))}
          </ul>
          <p className="gacha-note">用游戏金币抽取 · 没有真实货币 · 纯开心</p>
        </details>
      </div>

      {save.gacha.history.length > 0 && (
        <div className="gacha-history">
          <h3>最近抽到的</h3>
          <div className="history-row">
            {save.gacha.history.slice(0, 8).map((h, i) => (
              <span key={i} className="history-chip" title={h.item?.name || '谢谢参与'}>
                {h.item?.emoji || '💛'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
