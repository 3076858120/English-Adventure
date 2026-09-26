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

游戏状态仍然保存在 `save_data` JSONB 中；`user_id` 是 Supabase 匿名账号 UUID。

### `public.player_profiles`

现在增加玩家身份表：

- `user_id`: 唯一 Supabase 用户 UUID
- `nickname`: 游戏昵称
- `nickname_key`: 自动生成的 `lower(trim(nickname))`，有 UNIQUE 约束

因此 `小明`、` 小明 `、`小明` 会被视为同一个昵称，不能重复注册。

## 唯一昵称流程

1. 首次进入自动匿名登录。
2. 输入游戏昵称。
3. 前端调用 `claim_player_name` 数据库函数。
4. 数据库使用 UNIQUE 约束进行最终判定。
5. 名字已被使用时，页面提示“这个冒险家名字已经被使用啦，请换一个名字！”。
6. 名字可用时才写入游戏存档。

数据库函数使用 `SECURITY DEFINER` + `search_path = ''`，只暴露“这个名字能否被当前账号认领”的结果，不直接公开其他玩家的存档。

## 同名历史数据

旧版本曾经允许匿名 UUID 各自保存相同昵称，因此数据库里可能存在同名旧存档。现在的迁移会将同名旧存档按昵称合并：

- 完成关卡、课程、宠物、背包、家具、学校任务：取去重并集
- XP、金币、解锁关卡、连续天数：取最大值
- 最后更新的账号作为合并后的主账号
- 之后昵称通过 `player_profiles.nickname_key` 唯一约束锁定

## 安全说明

目前这个项目使用的是匿名登录。**昵称只是游戏身份，不是安全凭证**；不要把真实姓名、手机号等个人信息作为昵称。跨设备恢复仍建议使用宠物小窝里的“转移码”，而不是只凭昵称登录。

Supabase 官方建议使用 RLS 保护客户端可访问的数据，并谨慎限制 `SECURITY DEFINER` 函数的权限。citeturn0search0turn0search1

## 前端配置

- `VITE_SUPABASE_URL` = Project URL
- `VITE_SUPABASE_ANON_KEY` = Project API Keys → publishable / anon

GitHub Pages 构建时从仓库 Actions Variables 读取。

## 必须开启

Supabase Dashboard → Authentication → Sign In / Up → Anonymous Sign-Ins → 开启。

## 同步策略

- localStorage 立即缓存
- 云端 900ms 防抖同步
- 页面隐藏/关闭时补推
- 云端不可用时自动退回本地模式
- IndexedDB 保存 Supabase 会话
- 宠物小窝的转移码仍然可用于跨设备恢复同一个匿名账号
