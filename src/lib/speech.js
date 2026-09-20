// 浏览器语音合成封装:让孩子听到英语单词
let cachedVoice = null

function pickVoice() {
  if (!('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices() || []
  if (!voices.length) return null
  if (cachedVoice) return cachedVoice
  cachedVoice =
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null
  return cachedVoice
}

export function isSpeechAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text, { rate = 0.8, onEnd } = {}) {
  if (!isSpeechAvailable() || !text) {
    onEnd && onEnd()
    return
  }
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(String(text))
    u.lang = 'en-US'
    u.rate = rate
    const voice = pickVoice()
    if (voice) u.voice = voice
    if (onEnd) u.onend = onEnd
    window.speechSynthesis.speak(u)
  } catch {
    onEnd && onEnd()
  }
}

export function stopSpeak() {
  try {
    if (isSpeechAvailable()) window.speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
}
