import { useEffect, useState } from 'react'

export default function Pet2D({
  pet,
  rarity = 'B',
  equipment = {},
}) {
  const [blink, setBlink] = useState(false)
  const [jump, setJump] = useState(false)

  // 自动眨眼：只有原生 emoji 宠物需要“眨眼”时使用；角色图案本身不再强行画统一眼睛。
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
      {/* 稀有度光环 */}
      <div className="pet-aura" />

      {/* 稀有度粒子 */}
      <div className="pet-particles">✦　✧　✦</div>

      {/* 宠物本体：直接显示抽到的对应图案，不再统一画圆头 */}
      <div className={`pet-emoji ${blink ? 'pet-emoji-blink' : ''}`}>
        {emoji}
      </div>

      {/* 帽子装备 */}
      {hat && <div className="pet-hat">{hat.emoji}</div>}

      {/* 脸部装备 */}
      {face && <div className="pet-face-equipment">{face.emoji}</div>}

      {/* 宠物名称 */}
      <div className="pet-name-tag">{pet?.name || '小伙伴'}</div>
    </div>
  )
}
