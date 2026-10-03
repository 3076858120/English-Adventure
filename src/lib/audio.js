// WebAudio 提示音:不依赖系统语音包,任何设备都能出声
// 答对 = 上行叮咚;答错 = 轻柔低响(不吓人);胜利 = 小旋律
let ctx = null

function ac() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) {
    try {
      ctx = new AC()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') {
    try {
      ctx.resume()
    } catch {
      /* ignore */
    }
  }
  return ctx
}

function tone(freq, start, dur, { type = 'sine', gain = 0.16 } = {}) {
  const c = ac()
  if (!c) return
  const t = c.currentTime + start
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g)
  g.connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

export function sfxCorrect() {
  tone(660, 0, 0.2)
  tone(880, 0.09, 0.24)
}

export function sfxWrong() {
  tone(220, 0, 0.14, { type: 'triangle', gain: 0.1 })
  tone(160, 0.1, 0.16, { type: 'triangle', gain: 0.08 })
}

export function sfxWin() {
  tone(523, 0, 0.16)
  tone(659, 0.12, 0.16)
  tone(784, 0.24, 0.16)
  tone(1047, 0.36, 0.34)
}

export function sfxTap() {
  tone(500, 0, 0.07, { type: 'triangle', gain: 0.06 })
}
