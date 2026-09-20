import React, { useState } from 'react'
import { useGame } from '../store/GameContext'
import Pet3D from '../components/Pet3D'
import { ITEM_TYPES, ROOM_THEMES, getItem } from '../data/collection'

// 宠物小窝:3D 宠物 + 装备 + 背包 + 房间 + 云端存档(家长转移码)
export default function PetRoom() {
  const {
    save, cloudStatus, cloudError, lastSyncAt,
    setActivePet, equipItem, unequipSlot, placeRoomItem, removeRoomItem, setRoomTheme,
    syncNow, retrySync, getTransferCode, restoreByTransferCode,
  } = useGame()
  const [tab, setTab] = useState('pet')
  const [syncMsg, setSyncMsg] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [showParent, setShowParent] = useState(false)

  const pet = getItem(save.activePet) || getItem('chick0')
  const ownedPets = save.pets.map(getItem).filter(Boolean)
  const invCounts = save.inventory.reduce((m, id) => ({ ...m, [id]: (m[id] || 0) + 1 }), {})
  const invItems = Object.entries(invCounts).map(([id, n]) => ({ item: getItem(id), n })).filter((x) => x.item)

  const doSync = async () => {
    setSyncMsg('同步中…')
    const info = await syncNow()
    setSyncMsg(info.available ? '✅ 已同步到云端' : '⚠️ 云端不可用,进度仍保存在本机')
  }

  const copyCode = async () => {
    const code = await getTransferCode()
    if (!code) {
      setSyncMsg('⚠️ 云端未连接,无法生成转移码')
      return
    }
    try {
      await navigator.clipboard.writeText(code)
      setSyncMsg('✅ 转移码已复制,发给家长保存即可')
    } catch {
      setSyncMsg('请手动复制:' + code.slice(0, 24) + '…')
    }
  }

  const restore = async () => {
    if (!codeInput.trim()) return
    setSyncMsg('恢复中…')
    const ok = await restoreByTransferCode(codeInput)
    setSyncMsg(ok ? '🎉 恢复成功!进度已找回' : '❌ 转移码无效,请检查是否复制完整')
    if (ok) setCodeInput('')
  }

  const theme = ROOM_THEMES.find((t) => t.id === save.roomTheme) || ROOM_THEMES[0]
  const syncText =
    cloudStatus === 'cloud'
      ? `☁️ 云端已同步${lastSyncAt ? ` · ${new Date(lastSyncAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : ''}`
      : cloudStatus === 'disabled'
        ? '📴 本地模式(未配置云端)'
        : `📴 本地模式${cloudError ? ` · ${cloudError.slice(0, 40)}` : ''}`

  return (
    <div className="screen petroom" style={{ '--wall': theme.wall, '--floor': theme.floor }}>
      <header className="screen-header">
        <button className="btn btn-ghost" onClick={() => (window.location.hash = '#home')}>← 首页</button>
        <h1>🏠 宠物小窝</h1>
        <div className="header-stats">🪙 {save.coins}</div>
      </header>

      {/* 3D 宠物舞台 */}
      <div className="pet-stage" style={{ background: `linear-gradient(${theme.wall} 60%, ${theme.floor} 60%)` }}>
        <Pet3D color={pet?.petColor || '#FFD54F'} emoji={pet?.emoji || '🐥'} height={240} />
        <div className="pet-name-tag">{pet?.emoji} {pet?.name}</div>
        <div className="pet-hat-overlay">{save.equipment.hat && getItem(save.equipment.hat)?.emoji}</div>
        <div className="pet-face-overlay">{save.equipment.face && getItem(save.equipment.face)?.emoji}</div>
      </div>

      <nav className="petroom-tabs">
        <button className={`tab-btn ${tab === 'pet' ? 'active' : ''}`} onClick={() => setTab('pet')}>🐾 宠物</button>
        <button className={`tab-btn ${tab === 'bag' ? 'active' : ''}`} onClick={() => setTab('bag')}>🎒 背包</button>
        <button className={`tab-btn ${tab === 'room' ? 'active' : ''}`} onClick={() => setTab('room')}>🛋️ 小屋</button>
        <button className={`tab-btn ${tab === 'cloud' ? 'active' : ''}`} onClick={() => setTab('cloud')}>☁️ 云存档</button>
      </nav>

      {tab === 'pet' && (
        <div className="tab-panel">
          <h3>我的宠物({ownedPets.length})</h3>
          <div className="item-grid">
            {ownedPets.map((it) => (
              <button
                key={it.id}
                className={`item-card ${save.activePet === it.id ? 'active' : ''}`}
                onClick={() => setActivePet(it.id)}
              >
                <span className="item-emoji">{it.emoji}</span>
                <span className="item-name">{it.name}</span>
                {save.activePet === it.id && <span className="item-active">出战中</span>}
              </button>
            ))}
          </div>
          <h3>身上装备</h3>
          <div className="equip-row">
            {['hat', 'face'].map((slot) => {
              const equipped = save.equipment[slot] ? getItem(save.equipment[slot]) : null
              return (
                <button key={slot} className="equip-slot" onClick={() => equipped && unequipSlot(slot)}>
                  <span className="equip-label">{slot === 'hat' ? '头部' : '面部'}</span>
                  <span className="equip-value">{equipped ? `${equipped.emoji} ${equipped.name}` : '空(点背包装备)'}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'bag' && (
        <div className="tab-panel">
          {invItems.length === 0 ? (
            <p className="empty-tip">背包空空的…去闯关开宝箱、抽盲盒吧!🎁</p>
          ) : (
            <div className="item-grid">
              {invItems.map(({ item, n }) => (
                <div key={item.id} className="item-card">
                  <span className="item-emoji">{item.emoji}</span>
                  <span className="item-name">{item.name} {n > 1 && `×${n}`}</span>
                  <span className="item-rarity">{item.rarity} · {ITEM_TYPES[item.type]?.label}</span>
                  {item.type === 'equipment' && item.slot && (
                    <button className="btn btn-small btn-primary" onClick={() => equipItem(item.id)}>装备</button>
                  )}
                  {(item.type === 'furniture' || item.type === 'decoration') && (
                    <button
                      className="btn btn-small btn-primary"
                      disabled={save.roomItems.includes(item.id)}
                      onClick={() => placeRoomItem(item.id)}
                    >
                      {save.roomItems.includes(item.id) ? '已摆放' : '摆进小屋'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'room' && (
        <div className="tab-panel">
          <h3>房间主题</h3>
          <div className="theme-row">
            {ROOM_THEMES.map((t) => (
              <button
                key={t.id}
                className={`theme-card ${save.roomTheme === t.id ? 'active' : ''}`}
                style={{ background: t.wall }}
                onClick={() => setRoomTheme(t.id)}
              >
                <span className="theme-floor" style={{ background: t.floor }} />
                {t.name}
              </button>
            ))}
          </div>
          <h3>屋里摆放({save.roomItems.length})</h3>
          {save.roomItems.length === 0 ? (
            <p className="empty-tip">还没有家具,去背包里“摆进小屋”吧!</p>
          ) : (
            <div className="room-items">
              {save.roomItems.map((id) => {
                const it = getItem(id)
                if (!it) return null
                return (
                  <button key={id} className="room-item" onClick={() => removeRoomItem(id)}>
                    {it.emoji} {it.name} <small>点我收起</small>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'cloud' && (
        <div className="tab-panel cloud-panel">
          <p className={`cloud-state ${cloudStatus === 'cloud' ? 'ok' : 'warn'}`}>{syncText}</p>
          <p className="cloud-explain">
            游戏进度自动保存在这台设备和云端。换设备时,家长可以用“转移码”帮孩子找回进度。
          </p>
          <button className="btn btn-primary" onClick={doSync}>🔄 立即同步</button>
          <button className="btn btn-ghost" onClick={() => cloudStatus !== 'cloud' && retrySync()}>⛅ 重试云端连接</button>
          {syncMsg && <p className="cloud-msg">{syncMsg}</p>}

          <button className="btn btn-ghost btn-small parent-toggle" onClick={() => setShowParent(!showParent)}>
            👨‍👩‍👧 家长小助手(换设备恢复进度)
          </button>
          {showParent && (
            <div className="parent-box">
              <p>1️⃣ 复制转移码并保存(相当于存档密码,不要发给陌生人):</p>
              <button className="btn btn-small btn-primary" onClick={copyCode}>📋 复制转移码</button>
              <p>2️⃣ 在新设备上打开本页,粘贴转移码恢复:</p>
              <div className="code-row">
                <input
                  className="code-input"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="粘贴转移码…"
                />
                <button className="btn btn-small btn-primary" onClick={restore}>恢复</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
