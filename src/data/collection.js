// 盲盒奖品与稀有度 —— 纯游戏内金币抽取,绝对没有真实货币
export const GACHA_COST = 60

export const RARITIES = [
  { id: 'SSR', label: 'SSR 传说', color: '#FF6B9D', weight: 3 },
  { id: 'SR', label: 'SR 史诗', color: '#B388FF', weight: 7 },
  { id: 'S', label: 'S 稀有', color: '#4FC3F7', weight: 15 },
  { id: 'A', label: 'A 优秀', color: '#81C784', weight: 25 },
  { id: 'B', label: 'B 普通', color: '#A1887F', weight: 30 },
  { id: 'NONE', label: '谢谢参与', color: '#90A4AE', weight: 20 },
]

export const ITEM_TYPES = {
  pet: { label: '宠物', emoji: '🐾' },
  equipment: { label: '装备', emoji: '🎩' },
  furniture: { label: '家具', emoji: '🛏️' },
  decoration: { label: '装饰', emoji: '🎈' },
  coin: { label: '金币', emoji: '🪙' },
}

// 宠物现在直接使用自己的 emoji 图案，不再统一套用“圆头宠物身体”。
// 后续如果加入正式 2D 图片，只需要给宠物增加 image 字段即可。
export const ITEMS = [
  // 初始宠物(免费拥有)
  { id: 'chick0', name: '小黄鸡·萌新', emoji: '🐥', rarity: 'A', type: 'pet', petColor: '#FFD54F', pool: false },

  // 原有宠物
  { id: 'corgi', name: '柯基骑士', emoji: '🐶', rarity: 'SSR', type: 'pet', petColor: '#FFB74D' },
  { id: 'magiccat', name: '魔法猫', emoji: '🐱', rarity: 'SSR', type: 'pet', petColor: '#9575CD' },
  { id: 'fox', name: '火焰狐', emoji: '🦊', rarity: 'SR', type: 'pet', petColor: '#FF7043' },
  { id: 'moonrabbit', name: '月光兔', emoji: '🐰', rarity: 'SR', type: 'pet', petColor: '#E1BEE7' },
  { id: 'panda', name: '团子熊猫', emoji: '🐼', rarity: 'S', type: 'pet', petColor: '#90A4AE' },
  { id: 'penguin', name: '溜冰企鹅', emoji: '🐧', rarity: 'S', type: 'pet', petColor: '#4FC3F7' },
  { id: 'frog', name: '跳跳蛙', emoji: '🐸', rarity: 'A', type: 'pet', petColor: '#66BB6A' },
  { id: 'turtle', name: '稳重龟', emoji: '🐢', rarity: 'B', type: 'pet', petColor: '#8D6E63' },

  // 新增热门/儿童熟悉的角色主题：先使用对应图案占位，后续可替换为正式授权 2D 素材
  { id: 'nailong', name: '奶龙', emoji: '🐉', rarity: 'SSR', type: 'pet', petColor: '#FFD54F' },
  { id: 'labubu', name: 'LABUBU', emoji: '👹', rarity: 'SSR', type: 'pet', petColor: '#8D6E63' },
  { id: 'molly', name: 'MOLLY', emoji: '🧸', rarity: 'SR', type: 'pet', petColor: '#81D4FA' },
  { id: 'crybaby', name: 'CRYBABY', emoji: '🥹', rarity: 'SR', type: 'pet', petColor: '#B3E5FC' },
  { id: 'dimoo', name: 'DIMOO', emoji: '👦', rarity: 'S', type: 'pet', petColor: '#90CAF9' },
  { id: 'skullpanda', name: 'SKULLPANDA', emoji: '🐼', rarity: 'S', type: 'pet', petColor: '#424242' },
  { id: 'ultraman', name: '奥特曼', emoji: '🦸', rarity: 'SSR', type: 'pet', petColor: '#EF5350' },

  // 宠物装备
  { id: 'crown', name: '国王皇冠', emoji: '👑', rarity: 'SSR', type: 'equipment', slot: 'hat' },
  { id: 'wizardhat', name: '魔法尖帽', emoji: '🎩', rarity: 'SR', type: 'equipment', slot: 'hat' },
  { id: 'bow', name: '粉粉蝴蝶结', emoji: '🎀', rarity: 'S', type: 'equipment', slot: 'hat' },
  { id: 'cap', name: '棒球帽', emoji: '🧢', rarity: 'A', type: 'equipment', slot: 'hat' },
  { id: 'glasses', name: '酷酷墨镜', emoji: '🕶️', rarity: 'A', type: 'equipment', slot: 'face' },
  { id: 'scarf', name: '暖暖围巾', emoji: '🧣', rarity: 'B', type: 'equipment', slot: 'face' },

  // 家具
  { id: 'cloudbed', name: '云朵软床', emoji: '🛏️', rarity: 'SR', type: 'furniture' },
  { id: 'bookshelf', name: '魔法书架', emoji: '📚', rarity: 'S', type: 'furniture' },
  { id: 'cookiejar', name: '饼干罐', emoji: '🍪', rarity: 'A', type: 'furniture' },
  { id: 'chair', name: '软垫小椅', emoji: '🪑', rarity: 'B', type: 'furniture' },

  // 装饰
  { id: 'painting', name: '风景画', emoji: '🖼️', rarity: 'SR', type: 'decoration' },
  { id: 'rainbow', name: '彩虹墙纸', emoji: '🌈', rarity: 'S', type: 'decoration' },
  { id: 'starlamp', name: '星星灯', emoji: '💡', rarity: 'A', type: 'decoration' },
  { id: 'balloon', name: '气球', emoji: '🎈', rarity: 'A', type: 'decoration' },
  { id: 'plant', name: '小绿萝', emoji: '🪴', rarity: 'B', type: 'decoration' },
  { id: 'sticker', name: '星星贴纸', emoji: '⭐', rarity: 'B', type: 'decoration' },

  // 金币袋(抽到立刻变成金币)
  { id: 'coinbag', name: '金币袋 +30', emoji: '💰', rarity: 'A', type: 'coin', coins: 30 },
]

export const ITEM_MAP = Object.fromEntries(ITEMS.map((it) => [it.id, it]))

export function getItem(id) {
  return ITEM_MAP[id] || null
}

function weightedPickRarity() {
  const total = RARITIES.reduce((s, r) => s + r.weight, 0)
  let roll = Math.random() * total
  for (const r of RARITIES) {
    roll -= r.weight
    if (roll < 0) return r.id
  }
  return 'B'
}

// 抽一次盲盒:返回 { kind:'item'|'none', item?, message }
export function pullGacha() {
  const rarity = weightedPickRarity()
  if (rarity === 'NONE') {
    return { kind: 'none', rarity, message: '谢谢参与!差一点点,再去冒险吧!' }
  }
  const pool = ITEMS.filter((it) => it.pool !== false && it.rarity === rarity)
  if (!pool.length) {
    return { kind: 'none', rarity, message: '谢谢参与!差一点点,再去冒险吧!' }
  }
  const item = pool[Math.floor(Math.random() * pool.length)]
  return { kind: 'item', rarity, item }
}

// 宝箱掉落:偏向 A/B,有小概率出宠物
export function rollChestItem() {
  const roll = Math.random()
  let pool
  if (roll < 0.15) {
    pool = ITEMS.filter((it) => it.type === 'pet' && it.pool !== false)
  } else if (roll < 0.45) {
    pool = ITEMS.filter((it) => ['S', 'SR'].includes(it.rarity) && it.type !== 'pet')
  } else {
    pool = ITEMS.filter((it) => ['A', 'B'].includes(it.rarity) && it.type !== 'pet')
  }
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export const ROOM_THEMES = [
  { id: 'cozy', name: '暖暖小窝', wall: '#FFF3E0', floor: '#FFCC80' },
  { id: 'forest', name: '森林小屋', wall: '#E8F5E9', floor: '#A5D6A7' },
  { id: 'sky', name: '天空之城', wall: '#E3F2FD', floor: '#90CAF9' },
  { id: 'candy', name: '糖果屋', wall: '#FCE4EC', floor: '#F8BBD0' },
]
