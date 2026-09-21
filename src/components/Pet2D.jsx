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

  // 点击宠物跳跃
  const handleClick = () => {
    if (jump) return

    setJump(true)

    setTimeout(() => {
      setJump(false)
    }, 650)
  }

  const hat = equipment?.hat
  const face = equipment?.face

  return (
    <div
      className={`pet2d pet-rarity-${rarity} ${jump ? 'pet-jump' : ''}`}
      onClick={handleClick}
    >
      {/* 稀有度光环 */}
      <div className="pet-aura" />

      {/* 稀有度粒子 */}
      <div className="pet-particles">
        ✦　✧　✦
      </div>

      {/* 帽子 */}
      {hat && (
        <div className="pet-hat">
          {hat.emoji}
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
          <div
            className={`pet-eye left ${blink ? 'blink' : ''}`}
          />

          <div
            className={`pet-eye right ${blink ? 'blink' : ''}`}
          />

          {/* 脸部装备 */}
          {face && (
            <div className="pet-face-equipment">
              {face.emoji}
            </div>
          )}

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
    </div>
  )
}
