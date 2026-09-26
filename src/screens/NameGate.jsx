import React, { useState } from 'react'
import { useGame } from '../store/GameContext'
import { claimPlayerName } from '../store/storage'

// 第一次进入:输入游戏昵称(不是真实姓名)
export default function NameGate() {
  const { setName } = useGame()
  const [value, setValue] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    const clean = value.trim()
    if (!clean || checking) return
    setChecking(true)
    setError('')

    // 云端已配置时,先由数据库检查唯一昵称。
    // 本地模式则允许正常进入,不会阻断游戏。
    const claim = await claimPlayerName(clean)
    if (!claim.ok && claim.reason === 'name_taken') {
      setError('这个冒险家名字已经被使用啦，请换一个名字！')
      setChecking(false)
      return
    }
    if (!claim.ok && !['cloud_unavailable'].includes(claim.reason)) {
      setError('暂时无法检查名字，请稍后再试。')
      setChecking(false)
      return
    }

    const result = setName(clean)
    if (result && typeof result.then === 'function') await result
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
          onChange={(e) => {
            setValue(e.target.value)
            setError('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && value.trim() && submit()}
          autoFocus
          disabled={checking}
        />
        {error && <div className="namegate-error">⚠️ {error}</div>}
        <button className="btn btn-primary btn-big" disabled={!value.trim() || checking} onClick={submit}>
          {checking ? '检查中…' : '开始冒险！🚀'}
        </button>
      </div>
    </div>
  )
}
