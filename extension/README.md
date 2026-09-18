# Animate Bot — Chrome 浏览器宠物

在任意网页上漂浮的 SVG 互动机器人：可自定义形状、颜色和表情，眼睛会跟随光标，点击眨眼，滚轮切换心情。

## 构建

```bash
pnpm install
pnpm build:extension
```

产物在 `dist-extension/`。

## 安装（开发者模式）

1. 打开 Chrome → `chrome://extensions`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择 `dist-extension` 文件夹

## 使用

| 操作 | 效果 |
|------|------|
| 移动鼠标 | 眼睛跟随光标 |
| 点击宠物 | 眨眼动画 |
| 滚轮 | 短暂切换表情（惊讶/警惕等） |
| 拖动宠物 | 移动到任意位置（位置会保存） |
| 点击扩展图标 | 打开设置面板：形状 / 表情 / 颜色 / 大小 / 开关 |

## 架构

```
extension/
  content.ts      → 注入 Shadow DOM + PetShell
  PetShell.vue    → 漂浮宠物（复用 BloubBot + 互动逻辑）
  PopupApp.vue    → 扩展弹窗设置
  background.ts   → 安装时初始化 storage
  storage.ts      → chrome.storage.local
```

引擎代码复用 `src/bot/` 和 `src/components/BloubBot.vue`，不打包导出/视频相关模块。
