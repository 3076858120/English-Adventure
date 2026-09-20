# 🎮 English Adventure｜英语小冒险

帮助小学孩子以游戏闯关形式学习英语 —— 轻 RPG 游戏 + 英语学习。

线上地址:**https://3076858120.github.io/English-Adventure/**

## ✨ 玩法:学习 → 练习 → 战斗

- 第一次进入输入游戏昵称(不收集任何个人信息)
- **10 个章节 × 4 关 = 40 关**:新手村 → 字母森林 → 魔法发音森林 → Phonics Valley → 单词草原 → 家庭城堡 → 学校城堡 → 快乐商店 → 自然公园 → 英语王国
- 每章开始前必须先过 **学习营(Learning Camp)**:认单词、听发音、做小练习
- **战斗系统**:听音选词 / 看图选词 / 中译英 / 拼字母,Boss 关混合题型
  - 答错 ≠ Game Over:轻微扣血、自动给提示、可以一直重试
  - 答对:角色冲向怪物攻击 → 命中掉血动画
- **奖励**:每关 +50 XP +20 金币,宝箱关卡掉落装备/家具/宠物
- **盲盒**:60 游戏金币抽一次,SSR/SR/S/A/B 稀有度,概率公开,纯游戏内货币,无任何真实付费
- **宠物小窝**:3D 宠物(可拖动旋转)、宠物装备、背包、家具与装饰、云存档面板
- 直接路由:`#home` `#map` `#pets` `#gacha` `#lesson-3` `#level-23` `#reward-23`

## ☁️ 存档

- Supabase 云端存档(`public.game_progress`,JSONB 整包)+ localStorage 本地缓存
- Supabase **Anonymous Sign-In** 匿名登录,孩子无感,不收集姓名/手机号
- 写入策略:本地立即写,云端防抖 900ms 合并写;页面隐藏/关闭时补推
- 云端任何失败都自动退回本地模式,游戏绝不白屏;会话保存在 IndexedDB,清空 localStorage 后仍能从云端恢复
- 换设备:家长在「宠物小窝 → 云存档 → 家长小助手」用转移码恢复

## 🛠 技术栈

React 19 · Vite 8 · Three.js · 原生 CSS · JavaScript · @supabase/supabase-js

## 🚀 本地开发

```bash
cp .env.example .env.local   # 填入 Supabase URL / anon key(可选,不填则为纯本地模式)
npm install
npm run dev
```

## 📦 部署

push 到 `main` 后 GitHub Actions 自动构建并发布到 GitHub Pages。
Supabase 配置通过仓库 **Actions Variables** 注入(见 [SUPABASE_HANDOFF.md](./SUPABASE_HANDOFF.md))。
