// 浏览器语音合成封装(健壮版):
//  - 中文 Windows 常常没有英语语音包 → 自动降级到任何可用语音(保证出声)
//  - 处理 Chrome cancel/speak 竞态、paused 卡死、语音包异步加载
//  - 首次用户手势解锁音频(iOS/部分安卓 WebView 必须)
//  - ttsInfo() 供页面做"没声音自检"

let cachedVoice = null
let listenersBound = false

function isSpeechAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function getVoices() {
  if (!isSpeechAvailable()) return []
  try {
    return window.speechSynthesis.getVoices() || []
  } catch {
    return []
  }
}

function pickVoice() {
  const voices = getVoices()
  if (!voices.length) return null
  if (cachedVoice && voices.includes(cachedVoice)) return cachedVoice
  cachedVoice =
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => /^en[-_]/i.test(v.lang)) ||
    voices.find((v) => /^en$/i.test(v.lang)) ||
    // 没有英语语音包 → 用系统默认语音读英文(带口音但能出声,好过安静)
    voices.find((v) => v.default) ||
    voices[0]
  return cachedVoice
}

function bindVoicesChanged() {
  if (listenersBound || !isSpeechAvailable()) return
  listenersBound = true
  try {
    window.speechSynthesis.addEventListener?.('voiceschanged', () => {
      cachedVoice = null
      pickVoice()
    })
  } catch {
    /* 老浏览器忽略 */
  }
}

export function isSpeechAvailablePub() {
  return isSpeechAvailable()
}

// 自检信息:页面据此提示家长
export function ttsInfo() {
  const voices = getVoices()
  const english = voices.find((v) => v.lang === 'en-US' || /^en[-_]/i.test(v.lang))
  return {
    supported: isSpeechAvailable(),
    voiceCount: voices.length,
    hasEnglish: Boolean(english),
    englishName: english ? english.name : '',
    usingFallback: !english && voices.length > 0,
    fallbackName: voices.length ? (voices.find((v) => v.default) || voices[0]).name : '',
  }
}

let unlocked = false

// iOS / 部分安卓 WebView 需要用户手势后才能发声;在第一次点击时调用一次
export function unlockAudio() {
  if (unlocked || !isSpeechAvailable()) return
  unlocked = true
  try {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}

export function speak(text, { rate = 0.8, onEnd } = {}) {
  if (!isSpeechAvailable() || !text) {
    onEnd && onEnd()
    return false
  }
  const synth = window.speechSynthesis
  try {
    bindVoicesChanged()
    synth.cancel()
    if (synth.paused) synth.resume()
    const u = new SpeechSynthesisUtterance(String(text))
    const voice = pickVoice()
    if (voice) {
      u.voice = voice
      u.lang = voice.lang
    } else {
      u.lang = 'en-US'
    }
    u.rate = rate
    u.volume = 1
    if (onEnd) {
      u.onend = onEnd
      u.onerror = onEnd
    }
    u.onerror = (e) => {
      try {
        console.warn('[TTS]', e?.error || e)
      } catch {
        /* ignore */
      }
      onEnd && onEnd()
    }
    // Chrome: cancel 后立刻 speak 偶发丢音,稍微延后
    setTimeout(() => {
      try {
        synth.speak(u)
      } catch {
        onEnd && onEnd()
      }
    }, 30)
    return true
  } catch {
    onEnd && onEnd()
    return false
  }
}

export function stopSpeak() {
  try {
    if (isSpeechAvailable()) window.speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
}
