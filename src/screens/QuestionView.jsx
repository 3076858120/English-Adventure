import React, { useEffect, useRef, useState } from 'react'
import { speak } from '../lib/speech'
import { sfxCorrect, sfxWrong } from '../lib/audio'

// 句型彩色渲染:be=蓝 doing=橙 key=紫(语法重点)
export function SentenceText({ en, m = {}, highlight = -1 }) {
  const tokens = en.split(' ')
  return (
    <span className="sentence-text">
      {tokens.map((t, i) => {
        const role = m[i]
        const cls = role === 'be' ? 'tok tok-be' : role === 'doing' ? 'tok tok-doing' : role === 'key' ? 'tok tok-key' : ''
        return (
          <span key={i} className={`${cls} ${i === highlight ? 'tok-flash' : ''}`}>
            {t}{' '}
          </span>
        )
      })}
    </span>
  )
}

export function WordWithUnderline({ word, letters }) {
  const i = word.toLowerCase().indexOf(letters.toLowerCase())
  if (i < 0) return <span>{word}</span>
  return (
    <span>
      {word.slice(0, i)}
      <u className="ph underline">{word.slice(i, i + letters.length)}</u>
      {word.slice(i + letters.length)}
    </span>
  )
}

const PROMPTS = {
  listen: '👂 听一听,选对单词!',
  image: '👀 看图片,选单词!',
  cn: '中译英:选对单词!',
  spell: '🔤 拼出这个单词!',
  sentence: '🔗 连词成句:点词块拼出句子!',
  phonics: '🔍 发音小侦探:读音相同吗?',
  cloze: '✏️ 选词填空!',
  respond: '💬 选出正确的回答!',
  pic: '👀 看图选句子!',
  tf: '📖 读一读,判断对错!',
}

// 共享答题组件:例题演示(demo)/学习营练习/战斗 三处共用
export default function QuestionView({ q, demo = false, explain = '', frozen = false, onAnswer }) {
  const [picked, setPicked] = useState(null) // 正确后锁定
  const [shake, setShake] = useState(null)
  const [wrongN, setWrongN] = useState(0)
  const [tiles, setTiles] = useState([]) // spell/sentence 已点词块
  const [rowShake, setRowShake] = useState(false)
  const timerRef = useRef(null)

  const isTileType = q.type === 'spell' || q.type === 'sentence'
  const disabled = frozen || picked !== null || demo

  useEffect(() => {
    setPicked(null)
    setShake(null)
    setWrongN(0)
    setTiles([])
    if (!demo && (q.type === 'listen' || q.type === 'respond')) {
      const t = setTimeout(() => speak(q.type === 'listen' ? q.word : q.q), 350)
      return () => clearTimeout(t)
    }
    return undefined
  }, [q]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const answer = (correct) => {
    if (correct) {
      setPicked(true)
      sfxCorrect()
      if (q.type === 'listen' || q.type === 'cloze') speak(q.word || q.answer)
      onAnswer && onAnswer(true)
    } else {
      sfxWrong()
      setWrongN((n) => n + 1)
      onAnswer && onAnswer(false)
    }
  }

  const pickOption = (opt, correctText) => {
    if (disabled) return
    if (opt === correctText) answer(true)
    else {
      setShake(opt)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setShake(null), 500)
      answer(false)
    }
  }

  // ---- 词块类(spell / sentence):逐位即时校验,错了立即清空(连点不卡)+ 轻抖提示 ----
  const tileTap = (tile) => {
    if (disabled || tiles.some((x) => x.idx === tile.idx)) return
    const nextLen = tiles.length + 1
    const expected = q.type === 'spell' ? q.word[nextLen - 1] : q.tokens[nextLen - 1]
    if (tile.t !== expected) {
      setTiles([])
      setRowShake(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setRowShake(false), 380)
      setWrongN((n) => n + 1)
      onAnswer && onAnswer(false)
      return
    }
    const next = [...tiles, tile]
    setTiles(next)
    const total = q.type === 'spell' ? q.word.length : q.tokens.length
    if (nextLen === total) answer(true)
  }

  // 连错 2 次后,高亮下一个该点的词块(防卡死 + 温柔提示)
  const hintNext = (() => {
    if (wrongN < 2 || picked) return null
    if (q.type === 'spell') return q.word[tiles.length] || null
    if (q.type === 'sentence') return (q.tokens[tiles.length] || '').replace(/[.!?,]+$/, '')
    return null
  })()

  const tileClass = (tile, text) => {
    let cls = q.type === 'spell' ? 'spell-tile' : 'sentence-tile'
    if (tiles.some((x) => x.idx === tile.idx)) cls += ' used'
    else if (hintNext && text === hintNext) cls += ' hintnext'
    return cls
  }

  // ---- 渲染 ----
  const renderMedia = () => {
    if (q.type === 'listen') {
      return (
        <div className="battle-audio-row">
          <button className="audio-big" onClick={() => speak(q.word)}>🔊</button>
          <button className="btn btn-ghost btn-small" onClick={() => speak(q.word)}>再听一遍 ↻</button>
        </div>
      )
    }
    if (q.type === 'image') {
      return <div className="picture-card"><span className="picture-emoji">{q.emoji}</span></div>
    }
    if (q.type === 'pic') {
      return <div className="picture-card"><span className="picture-emoji">{q.emoji}</span></div>
    }
    if (q.type === 'respond') {
      return (
        <div className="respond-q">
          <button className="respond-bubble" onClick={() => speak(q.q)}>
            {q.q} <span className="respond-audio">🔊</span>
          </button>
        </div>
      )
    }
    if (q.type === 'phonics') {
      return (
        <div className="phonics-pair">
          <span className="phonics-word"><WordWithUnderline word={q.a} letters={q.la} /></span>
          <span className="phonics-vs">vs</span>
          <span className="phonics-word"><WordWithUnderline word={q.b} letters={q.lb} /></span>
        </div>
      )
    }
    if (q.type === 'cloze') {
      return (
        <div className="cloze-line">
          {q.before} <span className={`cloze-blank ${picked || demo ? 'filled' : ''}`}>{picked || demo ? q.answer : '_____'}</span> {q.after}
        </div>
      )
    }
    if (q.type === 'tf') {
      return (
        <div className="reading-box">
          <div className="reading-title">📖 {q.passage.title}</div>
          {q.passage.lines.map((l, i) => <p key={i} className="reading-line">{l}</p>)}
          <p className="reading-cn">{q.passage.cn}</p>
        </div>
      )
    }
    return null
  }

  const renderAnswer = () => {
    if (q.type === 'spell') {
      const word = q.word
      return (
        <div className="spell-area">
          <div className="spell-answer">
            {Array.from({ length: word.length }).map((_, i) => (
              <span key={i} className={`spell-slot ${i === 0 ? 'hint' : ''}`}>{tiles[i]?.t || ''}</span>
            ))}
          </div>
          <div className={`spell-tiles ${rowShake ? 'shake' : ''}`}>
            {q.letters.map((letter, idx) => (
              <button
                key={idx}
                className={tileClass({ idx }, letter)}
                disabled={disabled || tiles.some((x) => x.idx === idx)}
                onClick={() => tileTap({ t: letter, idx })}
              >
                {letter}
              </button>
            ))}
          </div>
          {(tiles.length > 0 || demo) && !picked && (
            <button className="btn btn-ghost btn-small" onClick={() => setTiles((s) => s.slice(0, -1))} disabled={disabled || !tiles.length}>
              ↩ 撤销一个
            </button>
          )}
          <p className="quiz-hint">💡 提示:第一个字母是 “{word[0]}”,意思是“{q.cn}”</p>
        </div>
      )
    }
    if (q.type === 'sentence') {
      if (demo) {
        return (
          <div className="demo-sentence">
            <SentenceText en={q.en} m={q.m} />
          </div>
        )
      }
      return (
        <div className="spell-area">
          <div className="sentence-slots">
            {q.tokens.map((t, i) => (
              <span key={i} className={`sentence-slot ${tiles[i] ? 'filled' : ''}`}>{tiles[i]?.t || ''}</span>
            ))}
          </div>
          <div className={`sentence-tiles ${rowShake ? 'shake' : ''}`}>
            {q.tiles.map((tile) => (
              <button
                key={tile.idx}
                className={tileClass(tile, tile.t.replace(/[.!?,]+$/, ''))}
                disabled={disabled || tiles.some((x) => x.idx === tile.idx)}
                onClick={() => tileTap(tile)}
              >
                {tile.t}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-small" onClick={() => setTiles((s) => s.slice(0, -1))} disabled={disabled || !tiles.length}>
            ↩ 撤销一个
          </button>
          <p className="quiz-hint">💡 意思:“{q.cn}”{wrongN >= 1 && q.tokens[0] ? ` · 第一个词是 “${q.tokens[0]}”` : ''}</p>
        </div>
      )
    }
    if (q.type === 'phonics' || q.type === 'tf') {
      const yesLabel = q.type === 'phonics' ? '✓ 读音相同' : '✓ 对 (T)'
      const noLabel = q.type === 'phonics' ? '✗ 读音不同' : '✗ 错 (F)'
      const yesCorrect = q.type === 'phonics' ? q.same : q.answer
      const pickTF = (choice) => {
        if (disabled) return
        if ((choice === 'yes') === yesCorrect) answer(true)
        else {
          setShake(choice)
          if (timerRef.current) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => setShake(null), 500)
          answer(false)
        }
      }
      return (
        <div className="tf-row">
          <button
            className={`tf-btn ${(picked || demo) && yesCorrect ? 'correct' : shake === 'yes' ? 'wrong shake' : ''}`}
            disabled={disabled}
            onClick={() => pickTF('yes')}
          >
            {yesLabel}
          </button>
          <button
            className={`tf-btn ${(picked || demo) && !yesCorrect ? 'correct' : shake === 'no' ? 'wrong shake' : ''}`}
            disabled={disabled}
            onClick={() => pickTF('no')}
          >
            {noLabel}
          </button>
        </div>
      )
    }
    if (q.type === 'cloze') {
      return (
        <div className="chip-row">
          {q.options.map((opt) => (
            <button
              key={opt}
              className={`chip-btn ${picked && opt === q.answer ? 'correct' : shake === opt ? 'wrong shake' : picked ? 'dim' : ''}`}
              disabled={disabled}
              onClick={() => pickOption(opt, q.answer)}
            >
              {opt}
            </button>
          ))}
        </div>
      )
    }
    // listen / image / cn / respond / pic → 选项
    const sentenceOpts = q.type === 'respond' || q.type === 'pic'
    const correctText = q.type === 'respond' ? q.answer : q.type === 'pic' ? q.answer : q.word
    return (
      <div className="option-grid">
        {q.options.map((opt) => (
          <button
            key={opt}
            className={`option-btn ${sentenceOpts ? 'opt-sent' : ''} ${(picked || demo) && opt === correctText ? 'correct' : shake === opt ? 'wrong shake' : picked ? 'dim' : ''}`}
            disabled={disabled}
            onClick={() => pickOption(opt, correctText)}
          >
            {opt}
          </button>
        ))}
      </div>
    )
  }

  const hint = (() => {
    if (demo) return null
    if (!wrongN) return null
    if (q.type === 'phonics') return `💡 ${q.tip || '再大声读一读这两个词!'}`
    if (q.type === 'cloze') return q.answerCn ? `💡 这个词的意思是:“${q.answerCn}”` : `💡 开头字母是 “${q.answer[0]}”`
    if (q.type === 'respond' || q.type === 'pic') return `💡 正确回答的开头是 “${q.answer.split(' ')[0]}”`
    if (q.type === 'tf') return '💡 再读一遍短文,找找关键句!'
    return `💡 提示:正确答案开头是 “${(q.word || '?')[0]}”`
  })()

  return (
    <div className="question-view">
      <h2 className="quiz-prompt">{PROMPTS[q.type] || '选一选!'}</h2>
      {renderMedia()}
      {renderAnswer()}
      {demo ? (
        explain && <div className="example-bubble pop-in">🐾 {explain}</div>
      ) : (
        wrongN > 0 && !picked && (
          <div>
            <p className="quiz-encourage">答错不扣分,再试一次!💪</p>
            {hint && <p className="quiz-hint">{hint}</p>}
          </div>
        )
      )}
    </div>
  )
}
