import React, { useMemo, useState } from 'react'
import { useGame } from '../store/GameContext'
import { CHAPTERS } from '../data/levels'
import { LESSON_WORDS, makeQuestions, shuffle } from '../data/lessons'
import { speak, stopSpeak } from '../lib/speech'

// Learning Camp 学习营:学习 → 练习 → (去战斗)
export default function Lesson({ chapterId }) {
  const { completeLesson } = useGame()
  const chapter = CHAPTERS[chapterId - 1]
  const words = LESSON_WORDS[chapterId] || []
  const [step, setStep] = useState('learn') // learn | quiz | done
  const [speakIdx, setSpeakIdx] = useState(null)
  const questions = useMemo(() => makeQuestions(chapterId, 4, false), [chapterId])
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState(null)
  const [wrongShake, setWrongShake] = useState(null)

  const q = questions[qi]

  const doSpeak = (word, idx) => {
    setSpeakIdx(idx)
    speak(word, { onEnd: () => setSpeakIdx(null) })
  }

  const startQuiz = () => {
    stopSpeak()
    setStep('quiz')
  }

  const pick = (opt) => {
    if (picked) return
    if (opt === q.word) {
      setPicked(opt)
      speak(q.word)
      setTimeout(() => {
        setPicked(null)
        if (qi + 1 < questions.length) setQi(qi + 1)
        else finish()
      }, 900)
    } else {
      setWrongShake(opt)
      setTimeout(() => setWrongShake(null), 500)
      // 低压力:答错只是提示,继续尝试
    }
  }

  const finish = () => {
    completeLesson(chapterId)
    setStep('done')
  }

  return (
    <div className="screen lesson" style={{ '--chapter-color': chapter?.color }}>
      <header className="screen-header">
        <button className="btn btn-ghost" onClick={() => (window.location.hash = '#map')}>← 地图</button>
        <h1>📚 学习营 · {chapter?.name}</h1>
        <div />
      </header>

      {step === 'learn' && (
        <div className="lesson-learn">
          <p className="lesson-tip">点单词卡片听发音,跟读三遍,然后去练习!</p>
          <div className="word-grid">
            {words.map((w, i) => (
              <button
                key={w.word}
                className={`word-card ${speakIdx === i ? 'speaking' : ''}`}
                onClick={() => doSpeak(w.word, i)}
              >
                <span className="word-emoji">{w.emoji}</span>
                <span className="word-en">{w.word}</span>
                <span className="word-cn">{w.cn}</span>
                <span className="word-audio">🔊</span>
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-big" onClick={startQuiz}>
            我学会了,开始练习！✏️
          </button>
        </div>
      )}

      {step === 'quiz' && q && (
        <div className="lesson-quiz">
          <div className="quiz-progress">第 {qi + 1} / {questions.length} 题</div>
          <h2 className="quiz-prompt">
            {q.type === 'listen' && '👂 听一听,是哪个单词?'}
            {q.type === 'image' && '👀 看图片,选单词!'}
            {q.type === 'cn' && `“${q.cn}” 用英语怎么说?`}
          </h2>
          {q.type === 'listen' && (
            <button className="audio-big" onClick={() => speak(q.word)}>🔊</button>
          )}
          {q.type === 'image' && <div className="quiz-emoji">{q.emoji}</div>}
          {q.type === 'listen' && (
            <button className="btn btn-ghost btn-small replay" onClick={() => speak(q.word)}>再听一遍 ↻</button>
          )}
          <div className="option-grid">
            {q.options.map((opt) => {
              const cls =
                picked === opt ? 'correct' : wrongShake === opt ? 'wrong shake' : picked ? 'dim' : ''
              return (
                <button key={opt} className={`option-btn ${cls}`} onClick={() => pick(opt)}>
                  {opt}
                </button>
              )
            })}
          </div>
          {wrongShake && <p className="quiz-encourage">没关系,再试一次!💪</p>}
        </div>
      )}

      {step === 'done' && (
        <div className="lesson-done center-screen">
          <div className="pop-in">
            <div className="reward-stars">⭐⭐⭐</div>
            <h2>学习营完成！</h2>
            <p>+10 XP · +5 金币</p>
            <p className="lesson-tip">现在去挑战本章关卡吧!</p>
            <button className="btn btn-primary btn-big" onClick={() => (window.location.hash = `#level-${(chapterId - 1) * 4 + 1}`)}>
              出发战斗！⚔️
            </button>
            <button className="btn btn-ghost" onClick={() => (window.location.hash = '#map')}>先回地图</button>
          </div>
        </div>
      )}
    </div>
  )
}
