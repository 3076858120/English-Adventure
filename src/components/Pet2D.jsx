import { useEffect, useState } from 'react'

export default function Pet2D({
  pet,
  rarity = 'B',
  equipment = {},
}) {
  const [blink, setBlink] = useState(false)
  const [jump, setJump] = useState(false)

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
      style={{
        '--pet-color': pet?.petColor || '#FFD54F',
        position: 'relative',
        zIndex: 20,
        isolation: 'isolate',
        overflow: 'visible',
        background: 'transparent',
      }}
      onClick={handleClick}
      title={`${pet?.name || '宠物'}，点击它会跳跃`}
    >
      <div className="pet-aura" style={{ zIndex: 0, pointerEvents: 'none', background: 'transparent' }} />
      <div className="pet-particles" style={{ zIndex: 6, pointerEvents: 'none' }}>✦　✧　✦</div>

      {/* 宠物主体：直接显示抽到的对应图案 */}
      <div
        className="pet-emoji"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50px',
          transform: `translateX(-50%) scale(${blink ? 0.94 : 1})`,
          transformOrigin: 'center bottom',
          zIndex: 50,
          fontSize: '112px',
          lineHeight: 1,
          display: 'block',
          width: 'max-content',
          height: '112px',
          minWidth: 0,
          minHeight: 0,
          padding: 0,
          margin: 0,
          background: 'transparent',
          border: 0,
          boxShadow: 'none',
          filter: 'drop-shadow(0 7px 4px rgba(0,0,0,0.16))',
          transition: 'transform 0.12s ease',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {emoji}
      </div>

      {hat && (
        <div className="pet-hat" style={{ zIndex: 60, background: 'transparent', pointerEvents: 'none' }}>
          {hat.emoji}
        </div>
      )}

      {face && (
        <div className="pet-face-equipment" style={{ zIndex: 60, top: '105px', background: 'transparent', pointerEvents: 'none' }}>
          {face.emoji}
        </div>
      )}
    </div>
  )
}
