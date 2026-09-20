// 40 个关卡、10 个章节的世界结构
export const TOTAL_LEVELS = 40

// Boss 关卡(按需求固定)
export const BOSS_LEVELS = [5, 10, 15, 20, 25, 28, 31, 34, 37, 40]

// 有宝箱奖励的关卡(部分关卡)
export const CHEST_LEVELS = [3, 8, 12, 18, 22, 27, 30, 35, 38, 40]

export const REWARD = { xp: 50, coins: 20 }        // 普通关卡奖励
export const CAMP_REWARD = { xp: 10, coins: 5 }    // 学习营奖励

export const CHAPTERS = [
  { id: 1,  name: '新手村',       icon: '🏡', color: '#4CAF50', desc: '学会打招呼,认识第一个单词朋友!' },
  { id: 2,  name: '字母森林',     icon: '🌲', color: '#2E7D32', desc: 'A B C D 树精灵们在等你' },
  { id: 3,  name: '魔法发音森林', icon: '🧚', color: '#AB47BC', desc: '魔法字母 e 会让单词大变身' },
  { id: 4,  name: 'Phonics Valley', icon: '📣', color: '#F4511E', desc: '拼读山谷,听见声音就会拼!' },
  { id: 5,  name: '单词草原',     icon: '🦁', color: '#F9A825', desc: '动物朋友们在草原上奔跑' },
  { id: 6,  name: '家庭城堡',     icon: '🏰', color: '#EC407A', desc: '一家人住在温暖的城堡里' },
  { id: 7,  name: '学校城堡',     icon: '🎒', color: '#5C6BC0', desc: '背上书包,学习用品大集合' },
  { id: 8,  name: '快乐商店',     icon: '🏪', color: '#FF7043', desc: '买面包买果汁,英语来帮忙' },
  { id: 9,  name: '自然公园',     icon: '🌳', color: '#26A69A', desc: '太阳、月亮和星空都在这里' },
  { id: 10, name: '英语王国',     icon: '👑', color: '#FFB300', desc: '终极挑战!证明你是英语小英雄' },
]

export const MONSTERS = {
  1:  { name: '咕噜蜗牛',   emoji: '🐌' },
  2:  { name: '野猪邦邦',   emoji: '🐗' },
  3:  { name: '音素蝙蝠',   emoji: '🦇' },
  4:  { name: '拼读鳄鱼',   emoji: '🐊' },
  5:  { name: '单词狼王',   emoji: '🐺' },
  6:  { name: '家庭巫师',   emoji: '🧙' },
  7:  { name: '作业机器人', emoji: '🤖' },
  8:  { name: '收银小怪兽', emoji: '👾' },
  9:  { name: '风暴元素',   emoji: '🌪️' },
  10: { name: '英语巨龙',   emoji: '🐲' },
}

// 生成 40 关
export const LEVELS = Array.from({ length: TOTAL_LEVELS }, (_, i) => {
  const id = i + 1
  const chapterId = Math.floor(i / 4) + 1
  const idxInChapter = (i % 4) + 1
  const isBoss = BOSS_LEVELS.includes(id)
  return {
    id,
    chapterId,
    idxInChapter,
    name: isBoss ? `BOSS·${MONSTERS[chapterId].name}` : `${CHAPTERS[chapterId - 1].name} 第${idxInChapter}关`,
    isBoss,
    questions: isBoss ? 8 : 6,
    monster: MONSTERS[chapterId],
    chapter: CHAPTERS[chapterId - 1],
  }
})

export function getLevel(id) {
  return LEVELS[id - 1] || null
}

export function chapterOf(levelId) {
  return getLevel(levelId)?.chapterId || 1
}

// 每章第一关(需要先完成学习营)
export function chapterStart(chapterId) {
  return (chapterId - 1) * 4 + 1
}

export function todayStr(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return todayStr(d)
}
