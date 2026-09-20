# Supabase 接入说明(English Adventure)

## 项目信息

| 项 | 值 |
| --- | --- |
| Project name | English Adventure |
| Project ID | `iiyonadrrxjeulaoygze` |
| Region | ap-northeast-1 |
| Project URL | `https://iiyonadrrxjeulaoygze.supabase.co` |

## 数据表

### `public.game_progress`

```sql
create table if not exists public.game_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  save_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.game_progress enable row level security;

-- 用户只能访问自己的数据(不要改成公开读!)
create policy "own progress select"  on public.game_progress for select to authenticated using (auth.uid() = user_id);
create policy "own progress insert"  on public.game_progress for insert to authenticated with check (auth.uid() = user_id);
create policy "own progress update"  on public.game_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on public.game_progress to authenticated;
```

当前阶段整包游戏状态存进 `save_data` JSONB(nickname、xp、coins、unlocked、completed、lessonsDone、streak、lastDate、pets、inventory、equipment、roomItems、gacha、roomTheme…),未来做教师端再考虑拆表。

## 必须开启:Anonymous Sign-Ins

**Supabase Dashboard → English Adventure 项目 → Authentication → Sign In / Up → Email → Anonymous sign-ins → 打开 → Save**

开启后前端无需任何注册流程,首次打开自动匿名登录;若未开启,网站会自动退回纯本地存档模式(不会报错、不会白屏)。

## 前端配置(仅公开配置,绝不使用 service_role)

前端只需要两个公开值,通过环境变量注入:

- `VITE_SUPABASE_URL` = Project URL
- `VITE_SUPABASE_ANON_KEY` = Project API Keys → publishable / anon

GitHub Pages 构建时从仓库 **Actions Variables**(非 Secrets,因为这是前端公开配置)读取:
**Repository → Settings → Secrets and variables → Actions → Variables** 里添加上面两个变量。

本地开发:`cp .env.example .env.local` 后填入两个值。

## 同步策略

1. 首次打开:`getSession()` → 无会话则 `signInAnonymously()` → 拉取云端存档
2. 云端有存档且较新 → 直接恢复;本地较新 → 上传本地
3. 游戏中:localStorage 立即写,云端 900ms 防抖合并写;`visibilitychange`/`beforeunload` 补推
4. 任何云端失败 → 自动退回本地模式,顶部徽章提示,可手动重试
5. Supabase 会话保存在 **IndexedDB**:清空 localStorage 后重新打开仍能恢复云端进度
6. 换设备:宠物小窝 → 云存档 → 家长小助手 → 复制/粘贴「转移码」

## 故障排查

- 顶部显示「📴 本地模式」:检查 Dashboard 是否开启 Anonymous sign-ins、两个 Variables 是否配置、Actions 是否重新部署
- 看不到新数据:确认 RLS 策略仍是 `auth.uid() = user_id`,没有额外的公开读策略
- 绝对不要把 `service_role` / secret key 放进任何前端代码、`.env`、GitHub 或 Actions 配置
