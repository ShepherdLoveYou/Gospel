# 高级主题自动应用方案

## 工作原理

所有的高级视觉效果（毛玻璃、渐变背景、指针跟随光晕等）已通过以下方式**自动应用**到所有页面：

### 1. **CSS 文件** (`docs/theme-enhanced.css`)
  - 包含毛玻璃卡片、渐变背景、网格纹理、动效等所有新样式
  - 使用 CSS 变量，自动适配亮/暗主题

### 2. **自动注入** (在 `blogBase.json` 中配置)
  - Gmeek 生成每个页面时，都会自动在 `<head>` 中加入：
    - CSS 文件的 `<link>` 标签
    - 指针跟随光晕的 JavaScript 脚本
  - 无需手工修改任何生成的 HTML

## 后续工作流

### 当你添加新文章时：
1. 在 GitHub Issues 中创建新 issue（包含 Markdown 内容）
2. Gmeek 自动编译生成 HTML
3. ✅ **新页面自动获得高级效果**（无需额外操作）

### 完全自动化：
```
GitHub Issue → Gmeek 编译 → blogBase.json 注入 → 高级效果自动应用
```

## 文件说明

| 文件 | 功能 |
|------|------|
| `docs/theme-enhanced.css` | 所有新样式（毛玻璃、背景、卡片等） |
| `blogBase.json` | Gmeek 配置，包含 CSS 和脚本的自动注入 |
| `docs/index.html` | 主页（已包含新样式）|
| `docs/tag.html` | 标签页（已包含新样式）|
| `docs/post/*.html` | 文章页（Gmeek 生成时自动应用新样式） |

## 浏览器兼容性

- ✅ Chrome 80+ / Edge 80+
- ✅ Safari 12+ / iOS 12+
- ✅ Firefox 60+
- ⚠️ 较旧浏览器：样式优雅降级（无毛玻璃但仍可读）

## 如需修改效果

编辑 `docs/theme-enhanced.css`，改动会**自动应用到所有页面**（包括未来生成的页面）。
