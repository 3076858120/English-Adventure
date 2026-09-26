import React, { useMemo, useState } from 'react'
import { useGame } from '../store/GameContext'
import { getSchoolTask, SCHOOL_TASKS } from '../data/schoolTasks'

function speak(text) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.78
  window.speechSynthesis.speak(u)
}

function shuffleQuestion(question, seed) {
  const options = question.options.map((text, index) => ({ text, correct: index === question.answer }))
  // 稳定地打乱，避免每次渲染都跳位置
  let x = seed + 11
  for (let i = options.length - 1; i > 0; i -= 1) {
    x = (x * 9301 + 49297) % 233280
    const j = Math.floor((x / 233280) * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }
  return options
}

export default function SchoolTask({ taskId }) {
  const { save, completeSchoolTask } = useGame()
  const task = getSchoolTask(taskId) || SCHOOL_TASKS[0]
  const [stageIndex, setStageIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)

  const stage = task.bridge[stageIndex]
  const questions = stage?.questions || []
  const question = questions[questionIndex]
  const displayOptions = useMemo(
    () => (question ? shuffleQuestion(question, questionIndex + stageIndex * 17) : []),
    [question, questionIndex, stageIndex],
  )

  const goBack = () => {
    window.location.hash = '#school'
  }

  const nextStage = () => {
    if (stageIndex < task.bridge.length - 1) {
      setStageIndex(stageIndex + 1)
      setQuestionIndex(0)
      setSelected(null)
      setCorrectCount(0)
      setWordIndex(0)
    } else {
      completeSchoolTask(task.id, correctCount, task.bridge.length)
      setFinished(true)
    }
  }

  const choose = (optionIndex) => {
    if (selected !== null || !question) return
    const option = displayOptions[optionIndex]
    setSelected(optionIndex)
    if (option.correct) setCorrectCount((n) => n + 1)
  }

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1)
      setSelected(null)
    } else {
      nextStage()
    }
  }

  if (finished) {
    return (
      <div className="screen school-screen">
        <div className="school-topbar">
          <button className="btn btn-ghost" onClick={goBack}>← 学校任务</button>
        </div>
        <div className="school-complete-card">
          <div className="school-big-emoji">🎉</div>
          <h1>作业准备完成！</h1>
          <p>{save.nickname}，你已经把这张试卷需要的基础知识准备好了。</p>
          <div className="school-paper-card">
            <span>📄</span>
            <div>
              <strong>现在拿出现实中的纸质试卷</strong>
              <small>网页不会显示原卷，也不会直接告诉你答案。</small>
            </div>
          </div>
          <p className="school-tip">如果做题时遇到不会的地方，把错题告诉老师，下次我们再建一个“小怪兽”来解决它。</p>
          <button className="btn btn-primary btn-big" onClick={goBack}>回到学校任务</button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen school-screen">
      <header className="school-topbar">
        <button className="btn btn-ghost" onClick={goBack}>← 学校任务</button>
        <div className="school-progress-mini">准备站 {stageIndex + 1} / {task.bridge.length}</div>
      </header>

      <div className="school-hero">
        <div className="school-icon">{task.icon}</div>
        <div>
          <div className="school-kicker">📚 学校任务 · 作业准备站</div>
          <h1>{task.title}</h1>
          <p>{task.description}</p>
        </div>
      </div>

      <div className="school-path">
        {task.bridge.map((item, i) => (
          <React.Fragment key={item.id}>
            <div className={`school-path-node ${i < stageIndex ? 'done' : ''} ${i === stageIndex ? 'active' : ''}`}>
              <span>{i < stageIndex ? '✓' : i + 1}</span>
              <small>{item.title.replace(/^第[一二三四五六七八九十]+站：/, '')}</small>
            </div>
            {i < task.bridge.length - 1 && <div className={`school-path-line ${i < stageIndex ? 'done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      <section className="school-stage-card">
        <div className="school-stage-heading">
          <span className="school-stage-badge">第 {stageIndex + 1} 站</span>
          <h2>{stage.title}</h2>
          <p>{stage.subtitle}</p>
        </div>

        {stage.type === 'words' && (
          <div>
            <div className="school-word-focus">
              <button className="school-speak" onClick={() => speak(stage.items[wordIndex].word)}>
                🔊
              </button>
              <div className="school-word-emoji">{stage.items[wordIndex].emoji}</div>
              <h2>{stage.items[wordIndex].word}</h2>
              <p>{stage.items[wordIndex].cn}</p>
            </div>
            <div className="school-word-grid">
              {stage.items.map((item, i) => (
                <button
                  key={item.word}
                  className={`school-word-chip ${i === wordIndex ? 'active' : ''}`}
                  onClick={() => setWordIndex(i)}
                >
                  <span>{item.emoji}</span>
                  <strong>{item.word}</strong>
                  <small>{item.cn}</small>
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-big school-next" onClick={nextStage}>我都认识了，下一站 →</button>
          </div>
        )}

        {(stage.type === 'sentences' || stage.type === 'challenge') && question && (
          <div className="school-quiz">
            <div className="school-question-count">小挑战 {questionIndex + 1} / {questions.length}</div>
            <button className="school-sentence" onClick={() => speak(question.prompt)}>
              🔊 <span>{question.prompt}</span>
            </button>
            {question.tip && <div className="school-tip-box">💡 小提示：{question.tip}</div>}
            <div className="school-options">
              {displayOptions.map((option, i) => {
                const state = selected === null ? '' : option.correct ? 'correct' : selected === i ? 'wrong' : 'muted'
                return (
                  <button key={`${option.text}-${i}`} className={`school-option ${state}`} onClick={() => choose(i)} disabled={selected !== null}>
                    {option.text}
                  </button>
                )
              })}
            </div>
            {selected !== null && (
              <div className={`school-feedback ${displayOptions[selected]?.correct ? 'good' : 'try'}`}>
                {displayOptions[selected]?.correct ? '💥 答对啦！继续前进！' : '🌱 先别急，再看看提示，下一题继续。'}
              </div>
            )}
            <button className="btn btn-primary btn-big school-next" disabled={selected === null} onClick={nextQuestion}>
              {questionIndex === questions.length - 1 ? '完成这一站 →' : '下一题 →'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
