import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGame } from '../store/GameContext'
import { getLevel } from '../data/levels'
import { makeQuestions } from '../data/lessons'
import { speak } from '../lib/speech'
import { sfxWin } from '../lib/audio'
import QuestionView from './QuestionView'

const DAMAGE = 20
const WRONG_COST = 10

export default function Battle({ levelId }) {
  const level = getLevel(levelId)
  const { completeLevel, levelNeedsCamp, isLevelUnlocked, activePetItem } = useGame()

  const boss = level?.isBoss
  const questions = useMemo(
    () => (level ? makeQuestions(level.chapterId, level.questions, boss, levelId) : []),
    [level, boss, levelId],
  )
  const maxHp = questions.length * DAMAGE

  const [qi, setQi] = useState(0)
  const [monsterHp, setMonsterHp] = useState(maxHp)
  const [heroHp, setHeroHp] = useState(100)
  const [phase, setPhase] = useState('ask') // ask | attack | win
  const [dmgFloat, setDmgFloat] = useState(null)
  const [wrongCount, setWrongCount] = useState(0)
  const timeoutRef = useRef(null)

  const q = questions[qi]
  const pet = activePetItem
  const heroEmoji = '🧒'

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [qi])

  if (!level) {
    return (
      <div className="screen center-screen">
        <p>关卡不存在</p>
        <button className="btn btn-primary" onClick={() => (window.location.hash = '#map')}>回地图</button>
      </div>
    )
  }

  // 未解锁 → 友好提示回地图(直接路由也不能跳关)
  if (!isLevelUnlocked(levelId)) {
    return (
      <div className="screen center-screen">
        <div className="pop-in camp-gate">
          <div className="reward-stars">🔒</div>
          <h2>这一关还没解锁哦!</h2>
          <p>先打败前面的怪物,就能来到这里啦!</p>
          <button className="btn btn-primary btn-big" onClick={() => (window.location.hash = '#map')}>回冒险地图</button>
        </div>
      </div>
    )
  }

  // 学习营没完成 → 劝退到学习营
  if (levelNeedsCamp(levelId)) {
    return (
      <div className="screen center-screen">
        <div className="pop-in camp-gate">
          <div className="reward-stars">📚</div>
          <h2>要先完成学习营哦!</h2>
          <p>微课 → 例题 → 练习 → 战斗,一步一步来!</p>
          <button className="btn btn-primary btn-big" onClick={() => (window.location.hash = `#lesson-${level.chapterId}`)}>
            去学习营
          </button>
        </div>
      </div>
    )
  }

  const afterCorrect = () => {
    setPhase('attack')
    setDmgFloat(`-${DAMAGE}`)
    timeoutRef.current = setTimeout(() => {
      const hp = Math.max(0, monsterHp - DAMAGE)
      setMonsterHp(hp)
      setDmgFloat(null)
      if (hp <= 0 || qi + 1 >= questions.length) {
        setPhase('win')
        sfxWin()
        speak('You win! Great job!')
        timeoutRef.current = setTimeout(() => {
          const { chestItem } = completeLevel(levelId)
          window.location.hash = `#reward-${levelId}${chestItem ? `?chest=${chestItem.id}` : ''}`
        }, 1600)
      } else {
        setPhase('ask')
        setQi(qi + 1)
      }
    }, 1100)
  }

  const onAnswer = (correct) => {
    if (phase !== 'ask') return
    if (correct) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(afterCorrect, 700)
    } else {
      // 答错:不 Game Over,轻微扣血鼓励重试(QuestionView 内部会给提示)
      setHeroHp((h) => Math.max(10, h - WRONG_COST))
      setWrongCount((w) => w + 1)
    }
  }

  return (
    <div className="screen battle" style={{ '--chapter-color': level.chapter.color }}>
      <header className="screen-header">
        <button className="btn btn-ghost" onClick={() => (window.location.hash = '#map')}>← 撤退</button>
        <h1>{boss ? '👑 BOSS 战' : `⚔️ ${level.name}`}</h1>
        <div className="header-stats">{qi + 1}/{questions.length}</div>
      </header>

      <div className="battle-arena">
        <div className={`monster-side ${phase === 'attack' ? 'monster-hit' : ''}`}>
          <div className="hp-bar monster-hp">
            <div className="hp-fill" style={{ width: `${(monsterHp / maxHp) * 100}%` }} />
          </div>
          <div className={`monster ${boss ? 'monster-boss' : ''}`}>
            <span className="monster-emoji">{level.monster.emoji}</span>
            {dmgFloat && <span className="dmg-float">{dmgFloat}</span>}
          </div>
          <p className="monster-name">{level.monster.name}</p>
        </div>

        <div className={`hero-side ${phase === 'attack' ? 'hero-attack' : ''}`}>
          <div className="hero">{heroEmoji}</div>
          {pet && <div className="hero-pet">{pet.emoji}</div>}
          <div className="hp-bar hero-hp">
            <div className="hp-fill" style={{ width: `${heroHp}%` }} />
          </div>
        </div>
      </div>

      {phase === 'ask' && q && (
        <div className="battle-question">
          <QuestionView q={q} frozen={phase !== 'ask'} onAnswer={onAnswer} />
        </div>
      )}

      {phase === 'attack' && <div className="battle-banner attack-banner">⚔️ Nice! 打得漂亮!</div>}
      {phase === 'win' && (
        <div className="battle-banner win-banner pop-in">🎉 胜利!{level.monster.name}被你打败啦!</div>
      )}
    </div>
  )
}
