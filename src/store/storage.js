import { createClient } from '@supabase/supabase-js'

// ============================================================
// 存档策略:Supabase 云端存档 + localStorage 本地缓存
//  - 云端:public.game_progress (user_id uuid PK, save_data jsonb)
//  - 玩家昵称:public.player_profiles (nickname 唯一)
//  - 登录:Supabase Anonymous Sign-In(儿童无感登录,不收集个人信息)
// ============================================================

const LS_KEY = 'english-adventure-save-v3'
const TABLE = 'game_progress'
const PROFILE_TABLE = 'player_profiles'

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

let supabase = null
let userId = null
let cloudAvailable = false
let lastError = null

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

async function ensureSession() {
  const sb = getSupabase()
  const { data } = await sb.auth.getSession()
  if (data?.session?.user) return data.session.user

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

// 检查当前匿名账号是否已经拥有合法的唯一昵称
export async function fetchPlayerProfile() {
  const sb = getSupabase()
  if (!sb || !userId) return null
  const { data, error } = await sb
    .from(PROFILE_TABLE)
    .select('user_id, nickname')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data || null
}

// 首次取名时调用数据库 RPC,由数据库的 UNIQUE 约束最终保证昵称不会重复
export async function claimPlayerName(name) {
  const sb = getSupabase()
  if (!sb || !userId) return { ok: false, reason: 'cloud_unavailable' }
  try {
    const { data, error } = await sb.rpc('claim_player_name', { p_nickname: String(name || '') })
    if (error) throw error
    if (data?.ok) return data
    return data || { ok: false, reason: 'name_taken' }
  } catch (e) {
    lastError = e?.message || String(e)
    return { ok: false, reason: 'cloud_error', message: lastError }
  }
}

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
    const { data, error } = await sb.auth.setSession({ access_token: json.a || '', refresh_token: json.r })
    if (error || !data?.session?.user) return false
    const { data: refreshed, error: refreshErr } = await sb.auth.refreshSession({ refresh_token: json.r })
    if (refreshErr || !refreshed?.session?.user) return false
    userId = refreshed.session.user.id
    cloudAvailable = true
    return true
  } catch {
    return false
  }
}

// 初始化:登录 → 检查昵称身份 → 拉取云端存档
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

    const profile = await fetchPlayerProfile()
    const cloud = await fetchCloudSave()
    cloudAvailable = true
    lastError = null

    // 这个匿名账号已经拥有唯一昵称:正常恢复自己的云端存档
    if (profile?.nickname) {
      if (cloud && (!local || (cloud.updatedAt || 0) >= (local.updatedAt || 0))) {
        saveLocal(cloud)
        return { mode: 'cloud', saveData: cloud, reason: 'cloud-restored' }
      }
      if (local) {
        pushCloud(local)
        return { mode: 'cloud', saveData: local, reason: 'local-newer' }
      }
      return { mode: 'cloud', saveData: cloud || { nickname: profile.nickname }, reason: 'profile-restored' }
    }

    // 新匿名账号没有昵称。若本地缓存里有一个已存在的旧昵称,不要让旧重复账号重新占用它。
    if (local?.nickname) {
      const claim = await claimPlayerName(local.nickname)
      if (!claim.ok && claim.reason === 'name_taken') {
        const safeLocal = { ...local, nickname: '' }
        saveLocal(safeLocal)
        return { mode: 'cloud', saveData: safeLocal, reason: 'name-taken-reset' }
      }
      if (!claim.ok && claim.reason !== 'cloud_unavailable') {
        return { mode: 'local', saveData: local, reason: 'name-check-failed', cloudError: claim.message || '昵称检查失败' }
      }
    }

    if (cloud && (!local || (cloud.updatedAt || 0) >= (local.updatedAt || 0))) {
      saveLocal(cloud)
      return { mode: 'cloud', saveData: cloud, reason: 'cloud-restored' }
    }
    if (local) {
      pushCloud(local)
      return { mode: 'cloud', saveData: local, reason: 'local-uploaded' }
    }
    return { mode: 'cloud', saveData: null, reason: 'fresh' }
  } catch (e) {
    cloudAvailable = false
    lastError = e?.message || String(e)
    return { mode: 'local', saveData: local, reason: 'cloud-failed', cloudError: lastError }
  }
}

export async function retryCloudSync(saveData) {
  if (!cloudAvailable) {
    const sb = getSupabase()
    if (!sb) return false
  }
  return pushCloud(saveData)
}
