import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGame } from '../store/GameContext'
import { CHAPTERS } from '../data/levels'
import { getChapterData } from '../data/curriculum'
import { makeQuiz, makeExamples } from '../data/lessons'
import { speak, stopSpeak, ttsInfo } from '../lib/speech'
import { sfxWin } from '../lib/audio'
import QuestionView, { SentenceText, WordWithUnderline } from './QuestionView'

const SLIDE_MS = 4500

// 没声音自检:告诉家长检测结果和解决办法
function TtsCheck() {
  const [info] = useState(() => ttsInfo())
  const [done, setDone] = useState(false)
  return (
    <div className="tts-check">
      <p className="tts-line">
        {info.supported
          ? `检测结果:本机有 ${info.voiceCount} 个语音包`
          : '检测结果:❌ 此浏览器不支持语音发音'}
      </p>
      <p className="tts-line">
        {info.hasEnglish
          ? `✅ 找到英语语音:${info.englishName}`
          : info.usingFallback
            ? `⚠️ 没有英语语音包,现在用「${info.fallbackName}」代替(能出声,口音重一点)`
            : '❌ 一个语音包都没有,发音暂时不可用(下面的音效不受影响)'}
      </p>
      <button className="btn btn-small btn-primary" onClick={() => speak("Hello! Let's learn English!", { onEnd: () => setDone(true) })}>
        ▶ 试听一下
      </button>
      {done && <p className="tts-line">已播放完毕。如果刚才什么都没听到:请检查设备音量、是否静音 🔇</p>}
      {!info.hasEnglish && (
        <div className="tts-fix">
          <p>想让发音更标准?二选一:</p>
          <p>① 电脑:Windows 设置 → 时间和语言 → 语言和区域 → 添加语言「英语(美国)」并勾选「语音」</p>
          <p>② 或直接用手机浏览器打开本网站(手机自带英语语音)</p>
        </div>
      )}
    </div>
  )
}

function WordBig({ w }) {
  return (
    <div className="teach-word">
      <div className="quiz-emoji">{w.emoji}</div>
      <div className="teach-letters">
        {w.word.split('').map((ch, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.09}s` }}>{ch}</span>
        ))}
      </div>
      {w.sound && <div className="teach-sound">/{w.sound}/</div>}
      <div className="teach-cn">{w.cn}</div>
      <button className="btn btn-ghost btn-small" onClick={() => speak(w.word)}>🔊 再听一遍</button>
    </div>
  )
}

export default function Lesson({ chapterId }) {
  const { completeLesson, activePetItem } = useGame()
  const chapter = CHAPTERS[chapterId - 1]
  const data = getChapterData(chapterId)
  const pet = activePetItem

  const [step, setStep] = useState('teach') // teach | example | quiz | done
  const [slideIdx, setSlideIdx] = useState(0)
  const [auto, setAuto] = useState(true)
  const [exIdx, setExIdx] = useState(0)
  const [qi, setQi] = useState(0)
  const [showTtsCheck, setShowTtsCheck] = useState(false)
  const timerRef = useRef(null)

  const examples = useMemo(() => makeExamples(chapterId), [chapterId])
  const quiz = useMemo(() => makeQuiz(chapterId), [chapterId])

  const slides = useMemo(() => {
    const s = [{ kind: 'title' }]
    for (const w of data.words) s.push({ kind: 'word', w })
    for (const p of data.phrases || []) s.push({ kind: 'word', w: p })
    for (const sn of data.sentences) s.push({ kind: 'sentence', sn })
    if (data.phonics) s.push({ kind: 'phonics' })
    if (data.grammar) s.push({ kind: 'grammar', g: data.grammar })
    if (data.reading) s.push({ kind: 'reading', r: data.reading })
    s.push({ kind: 'ready' })
    return s
  }, [chapterId]) // eslint-disable-line react-hooks/exhaustive-deps

  const slide = slides[Math.min(slideIdx, slides.length - 1)]

  // 微课自动播放 + 每页自动朗读
  useEffect(() => {
    if (step !== 'teach') return undefined
    const s = slides[slideIdx]
    if (!s) return undefined
    if (s.kind === 'word') speak(s.w.word)
    if (s.kind === 'sentence') speak(s.sn.en)
    if (s.kind === 'phonics' && s) speak(data.phonics.focusWords.join(', '), { rate: 0.75 })
    if (s.kind === 'grammar' && s.g.examples?.length) speak(s.g.examples[0].en, { rate: 0.8 })
    if (s.kind === 'reading' && s.r.lines?.length) speak(s.r.lines.join(' '), { rate: 0.8 })
    if (!auto || s.kind === 'ready') return undefined
    timerRef.current = setTimeout(() => setSlideIdx((i) => Math.min(i + 1, slides.length - 1)), SLIDE_MS)
    return () => clearTimeout(timerRef.current)
  }, [step, slideIdx, auto]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stopSpeak(), [])

  const goSlide = (i) => {
    setAuto(false) // 手动翻页后接管控制,不再自动跳页
    setSlideIdx(Math.max(0, Math.min(i, slides.length - 1)))
  }

  const startExample = () => {
    stopSpeak()
    setSlideIdx(0)
    setExIdx(0)
    setStep('example')
  }

  // 例题:进入时朗读
  useEffect(() => {
    if (step !== 'example') return
    const ex = examples[exIdx]
    if (!ex) return
    const q = ex.q
    const t = setTimeout(() => {
      if (q.type === 'image') speak(q.word)
      else if (q.type === 'sentence') speak(q.en)
      else if (q.type === 'phonics') speak(`${q.a}, ${q.b}`, { rate: 0.75 })
    }, 400)
    return () => clearTimeout(t)
  }, [step, exIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  const nextExample = () => {
    if (exIdx + 1 < examples.length) setExIdx(exIdx + 1)
    else {
      setQi(0)
      setStep('quiz')
    }
  }

  // 练习:答对进入下一题;答错交给 QuestionView 提示
  const onQuizAnswer = (correct) => {
    if (!correct) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (qi + 1 < quiz.length) setQi(qi + 1)
      else {
        completeLesson(chapterId)
        setStep('done')
      }
    }, 950)
  }

  const ex = examples[exIdx]

  return (
    <div className="screen lesson" style={{ '--chapter-color': chapter?.color }}>
      <header className="screen-header">
        <button className="btn btn-ghost" onClick={() => (window.location.hash = '#map')}>← 地图</button>
        <h1>📚 学习营 · {chapter?.name}</h1>
        <div className="header-stats">
          {step === 'teach' && `${Math.min(slideIdx + 1, slides.length)}/${slides.length}`}
          {step === 'example' && `例题 ${exIdx + 1}/${examples.length}`}
          {step === 'quiz' && `${qi + 1}/${quiz.length}`}
        </div>
      </header>

      {/* ========== 第一步:动画微课 ========== */}
      {step === 'teach' && (
        <div className="teach-wrap">
          <div className="teach-progress">
            {slides.map((_, i) => (
              <span key={i} className={`dot ${i === slideIdx ? 'on' : i < slideIdx ? 'past' : ''}`} />
            ))}
          </div>

          <div className="teach-slide">
            {slide.kind === 'title' && (
              <div className="teach-title pop-in">
                <div className="teach-icon">{chapter?.icon}</div>
                <h2>{chapter?.name}</h2>
                <p className="teach-sub">{chapter?.desc}</p>
                <p className="teach-tip">▶ 会自动播放,也可以点"下一个"慢慢看</p>
              </div>
            )}

            {slide.kind === 'word' && <WordBig w={slide.w} />}

            {slide.kind === 'sentence' && (
              <div className="teach-sentence">
                <div className="quiz-emoji">{slide.sn.emoji}</div>
                <div className="teach-sentence-en">
                  <SentenceText en={slide.sn.en} m={slide.sn.m} />
                </div>
                <div className="teach-cn">{slide.sn.cn}</div>
                <button className="btn btn-ghost btn-small" onClick={() => speak(slide.sn.en)}>🔊 跟读一遍</button>
                {slide.sn.m && Object.values(slide.sn.m).includes('doing') && (
                  <p className="teach-note"><span className="tok tok-be">is/are</span> + <span className="tok tok-doing">doing</span> = 正在做……</p>
                )}
              </div>
            )}

            {slide.kind === 'phonics' && (
              <div className="teach-phonics">
                <h3>🔊 {data.phonics.title}</h3>
                <p className="teach-tip-big">👄 {data.phonics.tip}</p>
                <div className="chip-row">
                  {data.phonics.focusWords.map((w) => (
                    <button key={w} className="chip-btn" onClick={() => speak(w)}>{w} 🔈</button>
                  ))}
                </div>
                <div className="phonics-pairs">
                  {data.phonics.pairs.slice(0, 4).map((p, i) => (
                    <div key={i} className="phonics-pair-item">
                      <span className="phonics-word"><WordWithUnderline word={p.a} letters={p.la} /></span>
                      <span>vs</span>
                      <span className="phonics-word"><WordWithUnderline word={p.b} letters={p.lb} /></span>
                      <b>{p.same ? '相同 ✓' : '不同 ✗'}</b>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {slide.kind === 'grammar' && (
              <div className="teach-grammar">
                <h3>🧙 语法小课堂:{slide.g.title}</h3>
                <div className="grammar-formula">{slide.g.formula}</div>
                <p className="teach-tip-big">{slide.g.explain}</p>
                {slide.g.examples.map((e, i) => (
                  <button key={i} className="grammar-example" onClick={() => speak(e.en)}>
                    <SentenceText en={e.en} />
                    <span className="grammar-cn">{e.cn}</span>
                  </button>
                ))}
              </div>
            )}

            {slide.kind === 'reading' && (
              <div className="teach-reading">
                <h3>📖 {slide.r.title}</h3>
                <div className="reading-box">
                  {slide.r.lines.map((l, i) => <p key={i} className="reading-line">{l}</p>)}
                  <p className="reading-cn">{slide.r.cn}</p>
                </div>
              </div>
            )}

            {slide.kind === 'ready' && (
              <div className="teach-ready pop-in">
                <div className="quiz-emoji">🎉</div>
                <h2>学会了吗?</h2>
                <p className="teach-sub">接下来 {pet?.emoji || '🐣'} 宠物老师带你做 3 道例题!</p>
              </div>
            )}
          </div>

          <div className="teach-controls">
            <button className="btn btn-ghost" onClick={() => goSlide(slideIdx - 1)} disabled={slideIdx === 0}>⏮ 上一个</button>
            <button className="btn btn-ghost" onClick={() => setAuto(!auto)}>{auto ? '⏸ 暂停' : '▶ 播放'}</button>
            {slide.kind === 'ready' ? (
              <button className="btn btn-primary" onClick={startExample}>去例题 →</button>
            ) : (
              <button className="btn btn-primary" onClick={() => goSlide(slideIdx + 1)}>下一个 ⏭</button>
            )}
          </div>
          <button className="btn btn-ghost btn-small teach-skip" onClick={startExample}>
            跳过微课,直接去例题 ⏩
          </button>
          <button className="btn btn-ghost btn-small teach-skip" onClick={() => setShowTtsCheck(!showTtsCheck)}>
            🔊 没有声音?点我检查
          </button>
          {showTtsCheck && <TtsCheck />}
        </div>
      )}

      {/* ========== 第二步:宠物老师例题演示 ========== */}
      {step === 'example' && ex && (
        <div className="example-wrap">
          <div className="pet-teacher">
            <span className="pet-teacher-avatar">{pet?.emoji || '🐣'}</span>
            <span className="pet-teacher-say">看我的示范!注意正确答案会发光哦~</span>
          </div>
          <div className="lesson-quiz">
            <QuestionView q={ex.q} demo explain={ex.explain} />
          </div>
          <button className="btn btn-primary btn-big" onClick={nextExample}>
            {exIdx + 1 < examples.length ? '我懂了,下一道 →' : '轮到我了,开始练习!✏️'}
          </button>
        </div>
      )}

      {/* ========== 第三步:练习 ========== */}
      {step === 'quiz' && quiz[qi] && (
        <div className="lesson-quiz">
          <QuestionView q={quiz[qi]} onAnswer={onQuizAnswer} />
        </div>
      )}

      {/* ========== 完成 ========== */}
      {step === 'done' && (
        <div className="lesson-done center-screen">
          <div className="pop-in">
            <div className="reward-stars">⭐⭐⭐</div>
            <h2>学习营完成!</h2>
            <p>+10 XP · +5 金币</p>
            <p className="lesson-tip">微课看完、例题学过、练习做过 —— 现在去战斗吧!</p>
            <button className="btn btn-primary btn-big" onClick={() => (window.location.hash = `#level-${(chapterId - 1) * 4 + 1}`)}>
              出发战斗!⚔️
            </button>
            <button className="btn btn-ghost" onClick={() => (window.location.hash = '#map')}>先回地图</button>
          </div>
        </div>
      )}
    </div>
  )
}
