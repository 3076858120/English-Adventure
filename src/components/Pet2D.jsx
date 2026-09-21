import { useEffect, useState } from 'react'

export default function Pet2D({
  pet,
  rarity = 'B',
  equipment = {},
}) {
  const [blink, setBlink] = useState(false)
  const [jump, setJump] = useState(false)

  // 自动眨眼
  useEffect(() => {
    const timer = setInterval(() => {
      setBlink(true)

      setTimeout(() => {
        setBlink(false)
      }, 150)
    }, 3500 + Math.random() * 2000)

    return () => clearInterval(timer)
  }, [])

  // 点击跳跃
  const handleClick = () => {
    if (jump) return

    setJump(true)

    setTimeout(() => {
      setJump(false)
    }, 650)
  }

  return (
    <div
      className={`pet2d pet-rarity-${rarity} ${jump ? 'pet-jump' : ''}`}
      onClick={handleClick}
    >

      {/* 稀有度光效 */}
      <div className="pet-aura" />

      {/* 翅膀 */}
      {equipment.wings && (
        <div className="pet-wings">
          🪽
        </div>
      )}

      {/* 帽子 */}
      {equipment.hat && (
        <div className="pet-hat">
          🎩
        </div>
      )}

      {/* 宠物身体 */}
      <div className="pet-body">

        {/* 耳朵 */}
        <div className="pet-ear pet-ear-left" />
        <div className="pet-ear pet-ear-right" />

        {/* 头 */}
        <div className="pet-head">

          {/* 眼睛 */}
          <div className={`pet-eye left ${blink ? 'blink' : ''}`} />
          <div className={`pet-eye right ${blink ? 'blink' : ''}`} />

          {/* 嘴巴 */}
          <div className="pet-mouth">
            ◡
          </div>

          {/* 腮红 */}
          <div className="pet-cheek left" />
          <div className="pet-cheek right" />

        </div>

        {/* 身体 */}
        <div className="pet-belly" />

        {/* 脚 */}
        <div className="pet-foot left" />
        <div className="pet-foot right" />

      </div>

      {/* 武器 */}
      {equipment.weapon && (
        <div className="pet-weapon">
          ⚔️
        </div>
      )}

      {/* 稀有度粒子 */}
      <div className="pet-particles">
        ✦　✧　✦
      </div>

    </div>
  )
}
