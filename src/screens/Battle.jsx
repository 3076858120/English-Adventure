import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGame } from '../store/GameContext'
import { getLevel } from '../data/levels'
import { makeQuestions, shuffle } from '../data/lessons'
import { speak } from '../lib/speech'

const DAMAGE = 20
const WRONG_COST = 10

// 一道题的卡片(学习营与战斗共用):选择类题型
export function ChoiceQuestion({ q, onPick, picked, shakeOpt, disabled }) {
  return (
    <div className="option-grid">
      {q.options.map((opt) => {
        const cls = picked === opt ? 'correct' : shakeOpt === opt ? 'wrong shake' : picked || disabled ? 'dim' : ''
        return (
          <button key={opt} className={`option-btn ${cls}`} disabled={disabled || picked} onClick={() => onPick(opt)}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

export default function Battle({ levelId }) {
  const level = getLevel(levelId)
  const { save, completeLevel, levelNeedsCamp, isLevelUnlocked, activePetItem } = useGame()

  const boss = level?.isBoss
  const questions = useMemo(
    () => (level ? makeQuestions(level.chapterId, level.questions, boss) : []),
    [level, boss],
  )
  const maxHp = questions.length * DAMAGE

  const [qi, setQi] = useState(0)
  const [monsterHp, setMonsterHp] = useState(maxHp)
  const [heroHp, setHeroHp] = useState(100)
  const [phase, setPhase] = useState('ask') // ask | attack | win
  const [picked, setPicked] = useState(null)
  const [shakeOpt, setShakeOpt] = useState(null)
  const [wrongCount, setWrongCount] = useState(0)
  const [dmgFloat, setDmgFloat] = useState(null)
  const [spellInput, setSpellInput] = useState([])
  const [spellTiles, setSpellTiles] = useState([])
  const [hintLetter, setHintLetter] = useState(null)
  const timeoutRef = useRef(null)

  const q = questions[qi]
  const pet = activePetItem
  const heroEmoji = '🧒'

  // spell 题:洗字母牌
  useEffect(() => {
    if (q?.type === 'spell') {
      setSpellTiles(shuffle(q.word.split('')))
      setSpellInput([])
      setHintLetter(null)
    }
    setWrongCount(0)
    setPicked(null)
    if (q?.type === 'listen') speak(q.word)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [qi]) // eslint-disable-line react-hooks/exhaustive-deps

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
          <button className="btn btn-primary btn-big" onClick={() => (window.location.hash = '#map')}>
            回冒险地图
          </button>
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
          <h2>要先完成学习营哦！</h2>
          <p>学习 → 练习 → 战斗,一步一步来!</p>
          <button className="btn btn-primary btn-big" onClick={() => (window.location.hash = `#lesson-${level.chapterId}`)}>
            去学习营
          </button>
        </div>
      </div>
    )
  }

  const afterCorrect = () => {
    // 攻击动画阶段:角色冲向怪物 → 命中 → 掉血
    setPhase('attack')
    setDmgFloat(`-${DAMAGE}`)
    timeoutRef.current = setTimeout(() => {
      const hp = Math.max(0, monsterHp - DAMAGE)
      setMonsterHp(hp)
      setDmgFloat(null)
      if (hp <= 0 || qi + 1 >= questions.length) {
        // 胜利
        setPhase('win')
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

  const onCorrect = (opt) => {
    setPicked(opt)
    speak(q.word)
    timeoutRef.current = setTimeout(afterCorrect, 650)
  }

  const onWrong = (opt) => {
    // 答错:不 Game Over,不大幅惩罚,扣一点点血,鼓励再试 + 出提示
    setShakeOpt(opt)
    setHeroHp((h) => Math.max(10, h - WRONG_COST))
    const wc = wrongCount + 1
    setWrongCount(wc)
    if (q.type === 'spell') setHintLetter(q.word[0])
    else if (wc >= 1) {
      // 提示:随机淡化一个错误选项(保留 3 个可选项)
      setTimeout(() => setShakeOpt(null), 500)
    } else {
      setTimeout(() => setShakeOpt(null), 500)
    }
  }

  const pickOption = (opt) => {
    if (picked || phase !== 'ask') return
    if (opt === q.word) onCorrect(opt)
    else onWrong(opt)
  }

  // ---- spell 拼字母 ----
  const tapTile = (letter, idx) => {
    if (picked || phase !== 'ask') return
    const input = [...spellInput, { letter, idx }]
    setSpellInput(input)
    if (input.length >= q.word.length) {
      const attempt = input.map((t) => t.letter).join('')
      if (attempt === q.word) onCorrect(q.word)
      else {
        setHeroHp((h) => Math.max(10, h - WRONG_COST))
        setWrongCount((w) => w + 1)
        setHintLetter(q.word[0])
        setTimeout(() => setSpellInput([]), 450)
      }
    }
  }

  const undoSpell = () => setSpellInput((s) => s.slice(0, -1))

  const usedTiles = new Set(spellInput.map((t) => t.idx))

  const promptText =
    q?.type === 'listen'
      ? '👂 听一听,选对单词!'
      : q?.type === 'image'
        ? '👀 这是什么?选单词!'
        : q?.type === 'cn'
          ? `“${q?.cn}” 用英语怎么说?`
          : q?.type === 'spell'
            ? `🔤 拼出 "${q?.cn}" 的英文!`
            : ''

  return (
    <div className="screen battle" style={{ '--chapter-color': level.chapter.color }}>
      <header className="screen-header">
        <button className="btn btn-ghost" onClick={() => (window.location.hash = '#map')}>← 撤退</button>
        <h1>{boss ? '👑 BOSS 战' : `⚔️ ${level.name}`}</h1>
        <div className="header-stats">{qi + 1}/{questions.length}</div>
      </header>

      <div className="battle-arena">
        {/* 怪物 */}
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

        {/* 主角 + 宠物 */}
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
          <h2 className="quiz-prompt">{promptText}</h2>
          {q.type === 'listen' && (
            <div className="battle-audio-row">
              <button className="audio-big" onClick={() => speak(q.word)}>🔊</button>
              <button className="btn btn-ghost btn-small" onClick={() => speak(q.word)}>再听一遍 ↻</button>
            </div>
          )}
          {q.type === 'image' && <div className="quiz-emoji">{q.emoji}</div>}

          {q.type === 'spell' ? (
            <div className="spell-area">
              <div className="spell-answer">
                {Array.from({ length: q.word.length }).map((_, i) => (
                  <span key={i} className={`spell-slot ${hintLetter && i === 0 ? 'hint' : ''}`}>
                    {spellInput[i]?.letter || ''}
                  </span>
                ))}
              </div>
              <div className="spell-tiles">
                {spellTiles.map((letter, idx) => (
                  <button
                    key={idx}
                    className="spell-tile"
                    disabled={usedTiles.has(idx)}
                    onClick={() => tapTile(letter, idx)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <button className="btn btn-ghost btn-small" onClick={undoSpell} disabled={!spellInput.length}>
                ↩ 撤销一个
              </button>
              {hintLetter && <p className="quiz-hint">💡 提示:第一个字母是 “{hintLetter}”</p>}
            </div>
          ) : (
            <ChoiceQuestion q={q} onPick={pickOption} picked={picked} shakeOpt={shakeOpt} />
          )}

          {wrongCount > 0 && q.type !== 'spell' && (
            <p className="quiz-encourage">答错不扣分!再想想,有提示哦 💪</p>
          )}
        </div>
      )}

      {phase === 'attack' && <div className="battle-banner attack-banner">⚔️ Nice! 打得漂亮!</div>}
      {phase === 'win' && (
        <div className="battle-banner win-banner pop-in">
          🎉 胜利!{level.monster.name}被你打败啦!
        </div>
      )}
    </div>
  )
}
