import React, { useState } from 'react'
import { useGame } from '../store/GameContext'

// 第一次进入:输入游戏昵称(不是真实姓名)
export default function NameGate() {
  const { setName } = useGame()
  const [value, setValue] = useState('')

  const submit = () => {
    setName(value)
    window.location.hash = '#home'
  }

  return (
    <div className="screen center-screen namegate">
      <div className="namegate-card pop-in">
        <div className="namegate-mascots">🐣 🐱 🐶</div>
        <h1 className="namegate-title">勇敢的冒险家，你叫什么名字？</h1>
        <p className="namegate-sub">给自己起一个响亮的冒险昵称吧！(不用真名哦)</p>
        <input
          className="namegate-input"
          value={value}
          maxLength={12}
          placeholder="比如：小勇士、闪电侠…"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && value.trim() && submit()}
          autoFocus
        />
        <button className="btn btn-primary btn-big" disabled={!value.trim()} onClick={submit}>
          开始冒险！🚀
        </button>
      </div>
    </div>
  )
}
