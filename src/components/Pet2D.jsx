import { useEffect, useState } from 'react'

export default function Pet2D({
  pet,
  rarity = 'B',
  equipment = {},
}) {
  const [blink, setBlink] = useState(false)
  const [jump, setJump] = useState(false)

  // 自动眨眼：通过轻微缩放模拟活力，不再强行给所有宠物画同一双眼睛。
  useEffect(() => {
    let timer
    const blinkLoop = () => {
      timer = setTimeout(() => {
        setBlink(true)
        setTimeout(() => {
          setBlink(false)
          blinkLoop()
        }, 150)
      }, 3000 + Math.random() * 2500)
    }
    blinkLoop()
    return () => clearTimeout(timer)
  }, [])

  const handleClick = () => {
    if (jump) return
    setJump(true)
    setTimeout(() => setJump(false), 650)
  }

  const hat = equipment?.hat
  const face = equipment?.face
  const emoji = pet?.emoji || '🐥'

  return (
    <div
      className={`pet2d pet-rarity-${rarity} ${jump ? 'pet-jump' : ''}`}
      style={{ '--pet-color': pet?.petColor || '#FFD54F' }}
      onClick={handleClick}
      title={`${pet?.name || '宠物'}，点击它会跳跃`}
    >
      <div className="pet-aura" />
      <div className="pet-particles">✦　✧　✦</div>

      {/* 直接显示抽到的对应宠物图案：乌龟就是乌龟，企鹅就是企鹅 */}
      <div
        className="pet-emoji"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50px',
          transform: `translateX(-50%) scale(${blink ? 0.94 : 1})`,
          transformOrigin: 'center bottom',
          zIndex: 3,
          fontSize: '112px',
          lineHeight: 1,
          filter: 'drop-shadow(0 7px 4px rgba(0,0,0,0.16))',
          transition: 'transform 0.12s ease',
          whiteSpace: 'nowrap',
        }}
      >
        {emoji}
      </div>

      {/* 帽子装备 */}
      {hat && (
        <div className="pet-hat" style={{ zIndex: 10 }}>
          {hat.emoji}
        </div>
      )}

      {/* 脸部装备：emoji 宠物上只做装饰叠加，不再画统一的脸 */}
      {face && (
        <div className="pet-face-equipment" style={{ zIndex: 10, top: '105px' }}>
          {face.emoji}
        </div>
      )}

      <div
        className="pet-name-tag"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '2px',
          transform: 'translateX(-50%)',
          zIndex: 12,
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '999px',
          padding: '4px 10px',
          fontSize: '13px',
          fontWeight: 800,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 7px rgba(0,0,0,0.12)',
        }}
      >
        {pet?.name || '小伙伴'}
      </div>
    </div>
  )
}
