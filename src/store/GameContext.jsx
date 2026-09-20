import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  BOSS_LEVELS,
  CHEST_LEVELS,
  CAMP_REWARD,
  REWARD,
  TOTAL_LEVELS,
  chapterStart,
  todayStr,
  yesterdayStr,
} from '../data/levels'
import { pullGacha, rollChestItem, getItem, GACHA_COST } from '../data/collection'
import {
  cloudInfo,
  exportTransferCode,
  importTransferCode,
  initStorage,
  loadLocal,
  pushCloud,
  retryCloudSync,
  saveLocal,
} from './storage'
const reinit = initStorage

const GameContext = createContext(null)

// 云同步防抖间隔(避免每次点击都打 Supabase)
const CLOUD_DEBOUNCE_MS = 900
// 初始化兜底超时:云端再慢也不能让游戏卡在 loading
const INIT_TIMEOUT_MS = 8000

function defaultSave() {
  return {
    nickname: '',
    xp: 0,
    coins: 30,
    unlocked: 1,
    completed: [],
    lessonsDone: [],
    streak: 0,
    lastDate: '',
    activePet: 'chick0',
    pets: ['chick0'],
    inventory: [],
    equipment: {},
    roomItems: [],
    roomTheme: 'cozy',
    gacha: { count: 0, history: [] },
    createdAt: Date.now(),
    updatedAt: 0,
  }
}

// 兼容旧存档/缺字段
function normalize(data) {
  const base = defaultSave()
  if (!data || typeof data !== 'object') return base
  const merged = { ...base, ...data }
  merged.completed = Array.isArray(data.completed) ? data.completed : []
  merged.lessonsDone = Array.isArray(data.lessonsDone) ? data.lessonsDone : []
  merged.pets = Array.isArray(data.pets) && data.pets.length ? data.pets : ['chick0']
  merged.inventory = Array.isArray(data.inventory) ? data.inventory : []
  merged.roomItems = Array.isArray(data.roomItems) ? data.roomItems : []
  merged.equipment =
    data.equipment && typeof data.equipment === 'object' ? data.equipment : {}
  merged.gacha =
    data.gacha && typeof data.gacha === 'object'
      ? { count: Number(data.gacha.count) || 0, history: Array.isArray(data.gacha.history) ? data.gacha.history.slice(0, 8) : [] }
      : { count: 0, history: [] }
  if (!merged.pets.includes('chick0')) merged.pets.push('chick0')
  if (!merged.pets.includes(merged.activePet)) merged.activePet = merged.pets[0]
  merged.xp = Math.max(0, Number(merged.xp) || 0)
  merged.coins = Math.max(0, Number(merged.coins) || 0)
  merged.unlocked = Math.min(TOTAL_LEVELS, Math.max(1, Number(merged.unlocked) || 1))
  merged.streak = Math.max(0, Number(merged.streak) || 0)
  return merged
}

export function GameProvider({ children }) {
  const [save, setSave] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cloudStatus, setCloudStatus] = useState('loading') // loading|cloud|local|disabled
  const [lastSyncAt, setLastSyncAt] = useState(null)
  const [cloudError, setCloudError] = useState(null)

  const cloudTimer = useRef(null)
  const latestRef = useRef(null)

  // ---- 云端推送(防抖) ----
  const flushCloud = useCallback(async () => {
    const data = latestRef.current
    if (!data) return
    const ok = await pushCloud(data)
    if (ok) {
      setCloudStatus('cloud')
      setLastSyncAt(Date.now())
      setCloudError(null)
    } else {
      setCloudStatus('local')
      setCloudError(cloudInfo().lastError || '同步失败,稍后会自动重试')
    }
  }, [])

  const scheduleCloudPush = useCallback(() => {
    if (cloudTimer.current) clearTimeout(cloudTimer.current)
    cloudTimer.current = setTimeout(flushCloud, CLOUD_DEBOUNCE_MS)
  }, [flushCloud])

  // 页面隐藏/关闭时立即补推一次,避免丢进度
  useEffect(() => {
    const flush = () => {
      if (cloudTimer.current) clearTimeout(cloudTimer.current)
      flushCloud()
    }
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('beforeunload', flush)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [flushCloud])

  // ---- 初始化:云 → 本地,永不白屏 ----
  useEffect(() => {
    let cancelled = false
    const timeout = new Promise((resolve) =>
      setTimeout(() => resolve({ mode: 'local', saveData: loadLocal(), reason: 'timeout' }), INIT_TIMEOUT_MS),
    )
    Promise.race([initStorage(), timeout])
      .then((res) => {
        if (cancelled) return
        const merged = normalize(res.saveData)
        setSave(merged)
        latestRef.current = merged
        if (res.mode === 'cloud') setCloudStatus('cloud')
        else if (res.mode === 'disabled') setCloudStatus('disabled')
        else {
          setCloudStatus('local')
          setCloudError(res.cloudError || cloudInfo().lastError || null)
        }
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        const merged = normalize(loadLocal())
        setSave(merged)
        latestRef.current = merged
        setCloudStatus('local')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // ---- 统一更新入口:立即写本地,防抖写云端 ----
  const update = useCallback(
    (fn) => {
      setSave((prev) => {
        if (!prev) return prev
        const next = fn(normalize(prev))
        next.updatedAt = Date.now()
        next.xp = Math.max(0, Math.round(Number(next.xp) || 0))
        next.coins = Math.max(0, Math.round(Number(next.coins) || 0))
        latestRef.current = next
        saveLocal(next)
        scheduleCloudPush()
        return next
      })
    },
    [scheduleCloudPush],
  )

  // ---- 连续学习天数 ----
  const touchActivity = useCallback(
    (s) => {
      const today = todayStr()
      if (s.lastDate === today) return
      s.streak = s.lastDate === yesterdayStr() ? (s.streak || 0) + 1 : 1
      s.lastDate = today
    },
    [],
  )

  // ================= 动作 =================
  const setName = useCallback(
    (name) => update((s) => ({ ...s, nickname: String(name || '').trim().slice(0, 12) || '小冒险家' })),
    [update],
  )

  const completeLesson = useCallback(
    (chapterId) => {
      let done = false
      update((s) => {
        if (s.lessonsDone.includes(chapterId)) return s
        done = true
        return {
          ...s,
          lessonsDone: [...s.lessonsDone, chapterId],
          xp: s.xp + CAMP_REWARD.xp,
          coins: s.coins + CAMP_REWARD.coins,
        }
      })
      update((s) => {
        touchActivity(s)
        return { ...s }
      })
      return done
    },
    [update, touchActivity],
  )

  // 通关第 n 关:发奖励、解锁下一关,返回宝箱掉落(供 Reward 页展示)
  const completeLevel = useCallback(
    (levelId) => {
      let chestItem = null
      let firstTime = false
      update((s) => {
        firstTime = !s.completed.includes(levelId)
        const completed = firstTime ? [...s.completed, levelId] : s.completed
        const unlocked = Math.max(s.unlocked, Math.min(TOTAL_LEVELS, levelId + 1))
        let xp = s.xp + REWARD.xp
        let coins = s.coins + REWARD.coins
        let inventory = s.inventory
        let pets = s.pets
        if (firstTime && CHEST_LEVELS.includes(levelId)) {
          chestItem = rollChestItem()
          if (chestItem) {
            if (chestItem.type === 'pet') {
              pets = pets.includes(chestItem.id) ? pets : [...pets, chestItem.id]
            } else {
              inventory = [...inventory, chestItem.id]
            }
          }
        }
        touchActivity(s)
        return { ...s, completed, unlocked, xp, coins, inventory, pets }
      })
      return { chestItem, firstTime }
    },
    [update, touchActivity],
  )

  // 抽盲盒:扣 60 金币,返回结果(供动画展示)
  const doGacha = useCallback(() => {
    let result = null
    update((s) => {
      if (s.coins < GACHA_COST) return s
      const pull = pullGacha()
      result = pull
      let coins = s.coins - GACHA_COST
      let pets = s.pets
      let inventory = s.inventory
      let activePet = s.activePet
      if (pull.kind === 'item') {
        const it = pull.item
        if (it.type === 'coin') {
          coins += it.coins || 0
        } else if (it.type === 'pet') {
          if (!pets.includes(it.id)) {
            pets = [...pets, it.id]
            // 第一次抽到新宠物时自动切换,给孩子惊喜
            activePet = it.id
          }
        } else {
          inventory = [...inventory, it.id]
        }
      }
      const history = [{ ...result, at: Date.now() }, ...(s.gacha.history || [])].slice(0, 8)
      return { ...s, coins, pets, inventory, activePet, gacha: { count: (s.gacha.count || 0) + 1, history } }
    })
    return result
  }, [update])

  const addItem = useCallback(
    (itemId) => {
      const it = getItem(itemId)
      if (!it) return
      update((s) => {
        if (it.type === 'pet') {
          return s.pets.includes(it.id) ? s : { ...s, pets: [...s.pets, it.id] }
        }
        return { ...s, inventory: [...s.inventory, it.id] }
      })
    },
    [update],
  )

  const setActivePet = useCallback((id) => update((s) => (s.pets.includes(id) ? { ...s, activePet: id } : s)), [update])

  const equipItem = useCallback(
    (itemId) => {
      const it = getItem(itemId)
      if (!it || it.type !== 'equipment' || !it.slot) return
      update((s) => ({ ...s, equipment: { ...s.equipment, [it.slot]: itemId } }))
    },
    [update],
  )

  const unequipSlot = useCallback(
    (slot) => update((s) => {
      const equipment = { ...s.equipment }
      delete equipment[slot]
      return { ...s, equipment }
    }),
    [update],
  )

  const placeRoomItem = useCallback(
    (itemId) => update((s) => (s.roomItems.includes(itemId) ? s : { ...s, roomItems: [...s.roomItems, itemId] })),
    [update],
  )

  const removeRoomItem = useCallback(
    (itemId) => update((s) => ({ ...s, roomItems: s.roomItems.filter((i) => i !== itemId) })),
    [update],
  )

  const setRoomTheme = useCallback((themeId) => update((s) => ({ ...s, roomTheme: themeId })), [update])

  // 手动同步按钮
  const syncNow = useCallback(async () => {
    await flushCloud()
    return cloudInfo()
  }, [flushCloud])

  const retrySync = useCallback(async () => {
    const data = latestRef.current
    if (!data) return false
    const ok = await retryCloudSync(data)
    if (ok) {
      setCloudStatus('cloud')
      setLastSyncAt(Date.now())
      setCloudError(null)
    }
    return ok
  }, [])

  // 家长转移码
  const getTransferCode = useCallback(async () => exportTransferCode(), [])
  const restoreByTransferCode = useCallback(
    async (code) => {
      const ok = await importTransferCode(code)
      if (!ok) return false
      try {
        const res = await reinit()
        const merged = normalize(res.saveData)
        latestRef.current = merged
        saveLocal(merged)
        setSave(merged)
        setCloudStatus('cloud')
        setLastSyncAt(Date.now())
        setCloudError(null)
      } catch {
        return false
      }
      return true
    },
    [],
  )

  // ---- 派生状态 ----
  const derived = useMemo(() => {
    if (!save) return null
    const completed = save.completed
    const isLevelUnlocked = (n) => n <= save.unlocked
    const isBoss = (n) => BOSS_LEVELS.includes(n)
    // 章节学习营是否完成(每章第一关之前必须学习营)
    const campDone = (chapterId) => save.lessonsDone.includes(chapterId)
    const levelNeedsCamp = (n) => {
      const start = chapterStart(Math.floor((n - 1) / 4) + 1)
      return n === start && !campDone(Math.floor((n - 1) / 4) + 1)
    }
    // “开始今日冒险”要去的下一站
    let nextRoute = '#map'
    for (let n = 1; n <= TOTAL_LEVELS; n++) {
      if (!completed.includes(n)) {
        const chapterId = Math.floor((n - 1) / 4) + 1
        nextRoute = n === chapterStart(chapterId) && !campDone(chapterId) ? `#lesson-${chapterId}` : `#level-${n}`
        break
      }
    }
    return {
      completedCount: completed.length,
      isLevelUnlocked,
      isBoss,
      campDone,
      levelNeedsCamp,
      nextRoute,
      activePetItem: getItem(save.activePet),
    }
  }, [save])

  const value = useMemo(
    () => ({
      save: save || defaultSave(),
      loading,
      cloudStatus,
      cloudError,
      lastSyncAt,
      ...(derived || {}),
      setName,
      completeLesson,
      completeLevel,
      doGacha,
      addItem,
      setActivePet,
      equipItem,
      unequipSlot,
      placeRoomItem,
      removeRoomItem,
      setRoomTheme,
      syncNow,
      retrySync,
      getTransferCode,
      restoreByTransferCode,
    }),
    [
      save,
      loading,
      cloudStatus,
      cloudError,
      lastSyncAt,
      derived,
      setName,
      completeLesson,
      completeLevel,
      doGacha,
      addItem,
      setActivePet,
      equipItem,
      unequipSlot,
      placeRoomItem,
      removeRoomItem,
      setRoomTheme,
      syncNow,
      retrySync,
      getTransferCode,
      restoreByTransferCode,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}
