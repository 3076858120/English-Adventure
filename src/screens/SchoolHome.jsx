import React from 'react'
import { useGame } from '../store/GameContext'
import { SCHOOL_TASKS } from '../data/schoolTasks'

export default function SchoolHome() {
  const { save } = useGame()

  const openTask = (task) => {
    window.location.hash = `#school-task-${task.id}`
  }

  return (
    <div className="screen school-screen">
      <header className="school-topbar">
        <button className="btn btn-ghost" onClick={() => (window.location.hash = '#home')}>← 首页</button>
        <div className="school-progress-mini">📚 学校任务</div>
      </header>

      <div className="school-landing">
        <div className="school-landing-icon">🏫</div>
        <div>
          <div className="school-kicker">给 {save.nickname} 的作业准备站</div>
          <h1>学校任务</h1>
          <p>这里不做电子版试卷。我们先把基础补好，再回到现实中的纸质作业。</p>
        </div>
      </div>

      <div className="school-rule-card">
        <span>🌱</span>
        <div>
          <strong>网页的任务只有一个：</strong>
          <p>帮你准备好完成学校作业所需要的单词、发音、句型和基础能力。</p>
        </div>
      </div>

      <section className="school-task-list">
        {SCHOOL_TASKS.map((task, index) => {
          const done = save.schoolTasks?.completed?.includes(task.id)
          const unlocked = index === 0 || save.schoolTasks?.completed?.includes(SCHOOL_TASKS[index - 1].id)
          return (
            <button
              key={task.id}
              className={`school-task-card ${done ? 'done' : ''} ${!unlocked ? 'locked' : ''}`}
              disabled={!unlocked}
              onClick={() => openTask(task)}
            >
              <div className="school-task-number">{done ? '✓' : index + 1}</div>
              <div className="school-task-icon">{task.icon}</div>
              <div className="school-task-info">
                <small>{done ? '准备完成' : unlocked ? '可以开始' : '完成上一关后解锁'}</small>
                <strong>{task.shortTitle}</strong>
                <span>{task.description}</span>
              </div>
              <div className="school-task-arrow">{done ? '↺' : unlocked ? '→' : '🔒'}</div>
            </button>
          )
        })}
      </section>

      <div className="school-parent-note">
        👩‍🏫 <strong>给家教老师：</strong>以后每拿到一张新的真实试卷，就新增一个学校任务关卡；网页只做桥梁，不替孩子完成原卷。
      </div>
    </div>
  )
}
