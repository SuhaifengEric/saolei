# 发布指南

本文档说明如何使用 GitHub Actions 自动构建和发布扫雷游戏。

## 自动发布流程

### 1. 准备发布

确保代码已经准备好发布：
- 所有功能已完成并测试通过
- 版本号已更新（`package.json` 和 `src-tauri/tauri.conf.json`）
- README.md 已更新（如有必要）
- 所有更改已提交并推送到 GitHub

### 2. 创建版本标签

```bash
# 创建标签（版本号格式：v主版本.次版本.修订版本）
git tag v1.0.0

# 推送标签到 GitHub
git push origin v1.0.0
```

### 3. 自动构建和发布

推送标签后，GitHub Actions 会自动：
1. 在 Windows、macOS 和 Linux 上并行构建应用
2. 为每个平台生成安装包
3. 创建 GitHub Release
4. 上传所有安装包到 Release

### 4. 查看和编辑 Release

1. 进入 GitHub 仓库页面
2. 点击右侧的 "Releases"
3. 找到新创建的 Release（标记为草稿状态）
4. 编辑 Release 说明（如有需要）
5. 点击 "Publish release" 发布

## 手动构建

### 通过 GitHub Actions 手动构建

如果不想创建正式版本，可以手动触发构建：

1. 进入 GitHub 仓库的 Actions 页面
2. 选择 "Build Dev Version" 工作流
3. 点击 "Run workflow"
4. 选择目标平台：
   - `all` - 构建所有平台
   - `windows` - 仅构建 Windows 版本
   - `macos` - 仅构建 macOS 版本（Intel 和 Apple Silicon）
   - `linux` - 仅构建 Linux 版本
5. 点击 "Run workflow" 开始构建
6. 构建完成后，在 Artifacts 中下载安装包

### 本地构建

在本地构建特定平台版本：

```bash
# Windows
npm run tauri build -- --target x86_64-pc-windows-msvc

# macOS Intel
npm run tauri build -- --target x86_64-apple-darwin

# macOS Apple Silicon
npm run tauri build -- --target aarch64-apple-darwin

# Linux
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

## 构建产物说明

### Windows
- `.msi` - Windows 安装程序（推荐）
- `.exe` - 便携版可执行文件

### macOS
- `.dmg` - macOS 磁盘映像（推荐）
- `.app` - 应用程序包

### Linux
- `.AppImage` - 便携版应用（推荐）
- `.deb` - Debian/Ubuntu 安装包
- `.rpm` - Red Hat/Fedora 安装包

## 故障排除

### 构建失败

1. 检查 GitHub Actions 日志，查看具体错误信息
2. 确保所有依赖都已正确安装
3. 如果是网络问题，可以重新运行工作流

### 签名问题

macOS 和 Windows 应用可能需要代码签名：
- **macOS**: 需要 Apple Developer 证书
- **Windows**: 需要代码签名证书

未签名的应用在某些系统上可能会显示安全警告，但仍然可以正常运行。

## 版本号规范

使用语义化版本号（Semantic Versioning）：

- **主版本号（Major）**: 不兼容的 API 更改
- **次版本号（Minor）**: 向后兼容的功能添加
- **修订号（Patch）**: 向后兼容的问题修复

示例：
- `v1.0.0` - 初始发布
- `v1.1.0` - 添加新功能
- `v1.1.1` - 修复 bug
- `v2.0.0` - 重大更新

## 联系支持

如果在发布过程中遇到问题，请：
1. 查看 GitHub Actions 日志获取详细错误信息
2. 在 GitHub Issues 中创建问题报告
3. 描述问题并提供相关日志
