import { createClient } from '@supabase/supabase-js'

// ============================================================
// 存档策略:Supabase 云端存档 + localStorage 本地缓存
//  - 云端:public.game_progress (user_id uuid PK, save_data jsonb)
//  - 登录:Supabase Anonymous Sign-In(儿童无感登录,不收集个人信息)
//  - Supabase 会话保存在 IndexedDB,即使 localStorage 被清空也能恢复云端进度
//  - 任何云端失败都不影响游戏:自动退回纯 localStorage 模式
// ============================================================

const LS_KEY = 'english-adventure-save-v3'
const TABLE = 'game_progress'

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

let supabase = null
let userId = null
let cloudAvailable = false
let lastError = null

// ---- 极小的 IndexedDB KV,用来保存 Supabase 会话(比 localStorage 更耐清理) ----
function openIdb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no idb'))
    const req = indexedDB.open('english-adventure', 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('kv')) req.result.createObjectStore('kv')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

const idbStorage = {
  async getItem(key) {
    const db = await openIdb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('kv', 'readonly')
      const req = tx.objectStore('kv').get(key)
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => reject(req.error)
    })
  },
  async setItem(key, value) {
    const db = await openIdb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('kv', 'readwrite')
      tx.objectStore('kv').put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },
  async removeItem(key) {
    const db = await openIdb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('kv', 'readwrite')
      tx.objectStore('kv').delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },
}

export function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  if (!supabase) {
    try {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: idbStorage,
          storageKey: 'english-adventure-auth',
        },
      })
    } catch {
      return null
    }
  }
  return supabase
}

export function cloudInfo() {
  return {
    configured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
    available: cloudAvailable,
    userId,
    lastError,
  }
}

// ---- localStorage(本地缓存,永远先写这里) ----
export function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : null
  } catch {
    return null
  }
}

export function saveLocal(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

// ---- 云端 ----
async function ensureSession() {
  const sb = getSupabase()
  const { data } = await sb.auth.getSession()
  if (data?.session?.user) return data.session.user

  // 没有会话 → 匿名登录(需要 Supabase 开启 Anonymous Sign-Ins)
  const { data: res, error } = await sb.auth.signInAnonymously()
  if (error) throw error
  if (!res?.session?.user) throw new Error('anonymous sign-in returned no user')
  return res.session.user
}

export async function fetchCloudSave() {
  const sb = getSupabase()
  const { data, error } = await sb
    .from(TABLE)
    .select('save_data, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  const save = data?.save_data
  return save && typeof save === 'object' && Object.keys(save).length ? save : null
}

// 把本地/当前存档推到云端
export async function pushCloud(saveData) {
  const sb = getSupabase()
  if (!sb || !userId) return false
  try {
    const { error } = await sb.from(TABLE).upsert({
      user_id: userId,
      save_data: saveData,
      updated_at: new Date().toISOString(),
    })
    if (error) throw error
    lastError = null
    return true
  } catch (e) {
    lastError = e?.message || String(e)
    return false
  }
}

// ---- 家长转移码:把会话令牌粘贴到新浏览器,即可接管同一个匿名账号 ----
export async function exportTransferCode() {
  const sb = getSupabase()
  if (!sb) return ''
  const { data } = await sb.auth.getSession()
  const t = data?.session
  if (!t?.refresh_token) return ''
  return btoa(unescape(encodeURIComponent(JSON.stringify({ u: userId, r: t.refresh_token }))))
}

export async function importTransferCode(code) {
  const sb = getSupabase()
  if (!sb) return false
  try {
    const json = JSON.parse(decodeURIComponent(escape(atob(code.trim()))))
    if (!json?.r) return false
    const { data, error } = await sb.auth.setSession({
      access_token: json.a || '',
      refresh_token: json.r,
    })
    if (error || !data?.session?.user) return false
    // access_token 可能已过期,立即刷新一次
    const { data: refreshed, error: refreshErr } = await sb.auth.refreshSession({
      refresh_token: json.r,
    })
    if (refreshErr || !refreshed?.session?.user) return false
    userId = refreshed.session.user.id
    cloudAvailable = true
    return true
  } catch {
    return false
  }
}

// ---- 初始化:登录 → 拉云端 → 决定用哪份数据 ----
// 返回 { mode: 'cloud'|'local'|'disabled', saveData, reason, cloudError }
export async function initStorage() {
  const local = loadLocal()
  const sb = getSupabase()
  if (!sb) {
    cloudAvailable = false
    lastError = null
    return { mode: 'disabled', saveData: local, reason: 'no-config' }
  }
  try {
    const user = await ensureSession()
    userId = user.id
    const cloud = await fetchCloudSave()
    cloudAvailable = true
    lastError = null

    if (cloud && (!local || (cloud.updatedAt || 0) >= (local.updatedAt || 0))) {
      // 云端更新 → 用云端,并缓存到本地
      saveLocal(cloud)
      return { mode: 'cloud', saveData: cloud, reason: local ? 'cloud-newer' : 'cloud-restored' }
    }
    if (local) {
      // 本地更新(或云端为空)→ 上传本地这份
      pushCloud(local)
      return { mode: 'cloud', saveData: local, reason: cloud ? 'local-newer' : 'local-uploaded' }
    }
    return { mode: 'cloud', saveData: null, reason: 'fresh' }
  } catch (e) {
    cloudAvailable = false
    lastError = e?.message || String(e)
    // 云端失败:游戏继续,退回本地模式
    return { mode: 'local', saveData: local, reason: 'cloud-failed', cloudError: lastError }
  }
}

// 用最新的本地缓存重试一次云端同步(网络恢复场景)
export async function retryCloudSync(saveData) {
  if (!cloudAvailable) {
    const sb = getSupabase()
    if (!sb) return false
  }
  return pushCloud(saveData)
}
