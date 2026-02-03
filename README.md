# 扫雷游戏 (Minesweeper)

一个基于 Tauri + Vue 3 + TypeScript 开发的现代扫雷游戏，支持多平台运行，具有美观的界面和丰富的功能。

## 功能特点

- 🎮 **经典扫雷玩法**：保留了传统扫雷的核心玩法
- 🌍 **多语言支持**：内置中英文界面切换
- 🎯 **多难度级别**：初级、中级、高级和自定义难度
- 🏆 **游戏统计**：记录游戏次数、胜率、最佳时间等数据
- 🔊 **音效系统**：内置游戏音效，支持静音功能
- 🎨 **现代界面**：使用 Vue 3 和 CSS3 打造的美观界面
- 💾 **本地存储**：游戏数据和统计信息自动保存
- 📱 **响应式设计**：适配不同屏幕尺寸

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **桌面应用**：Tauri
- **样式**：原生 CSS3
- **测试**：Vitest
- **代码质量**：ESLint

## 安装和运行

### 前置要求

- Node.js 18+
- Rust 1.75+
- Tauri 开发环境

### 开发环境运行

1. **克隆项目**
   ```bash
   git clone <项目地址>
   cd saolei
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **运行桌面应用**
   ```bash
   .\run_tauri.ps1
   ```

### 构建生产版本

```bash
.\build_tauri.ps1
```

构建后的应用将位于 `src-tauri/target/release` 目录。

## 项目结构

```
saolei/
├── src/               # 前端源代码
│   ├── assets/        # 静态资源
│   ├── components/    # Vue 组件
│   ├── composables/   # Vue 组合式函数
│   ├── types/         # TypeScript 类型定义
│   ├── utils/         # 工具函数
│   ├── App.vue        # 根组件
│   └── main.ts        # 入口文件
├── src-tauri/         # Tauri 桌面应用代码
│   ├── icons/         # 应用图标
│   ├── src/           # Rust 源代码
│   └── tauri.conf.json # Tauri 配置文件
├── package.json       # npm 配置文件
└── vite.config.ts     # Vite 配置文件
```

## 游戏操作说明

- **左键点击**：揭开格子
- **右键点击**：标记地雷（插上红旗）
- **左右键同时点击**：和弦操作（快速揭开周围格子）
- **顶部按钮**：切换难度、开始新游戏
- **右上角**：切换语言、静音/取消静音
- **左侧按钮**：查看游戏统计数据

## 游戏难度

| 难度 | 格子尺寸 | 地雷数量 |
|------|---------|----------|
| 初级 | 9×9     | 10       |
| 中级 | 16×16   | 40       |
| 高级 | 16×30   | 99       |
| 自定义 | 5-30×5-30 | 1-85% 格子数 |

## 贡献指南

1. **Fork 项目**
2. **创建特性分支** (`git checkout -b feature/amazing-feature`)
3. **提交更改** (`git commit -m 'Add some amazing feature'`)
4. **推送到分支** (`git push origin feature/amazing-feature`)
5. **打开 Pull Request**

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，欢迎通过以下方式联系：

- GitHub Issues：提交问题和建议
- Pull Request：贡献代码改进

---

感谢使用扫雷游戏！希望你玩得开心 🎉