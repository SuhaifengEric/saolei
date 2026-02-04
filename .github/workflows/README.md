# GitHub Actions 工作流说明

本目录包含项目的自动化工作流配置文件。

## 工作流列表

### 1. release.yml - 自动发布工作流

**触发条件：**
- 推送版本标签（如 `v1.0.0`）
- 手动触发

**功能：**
- 在多个平台并行构建应用
  - Windows (x86_64)
  - macOS Intel (x86_64)
  - macOS Apple Silicon (aarch64)
  - Linux (x86_64)
- 自动创建 GitHub Release
- 上传构建产物到 Release

**使用方法：**
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. test.yml - 测试工作流

**触发条件：**
- 推送到 main/master/develop 分支
- 创建 Pull Request

**功能：**
- 运行 ESLint 代码检查
- 运行单元测试
- 构建前端代码
- 类型检查

### 3. build-dev.yml - 开发构建工作流

**触发条件：**
- 仅手动触发

**功能：**
- 构建指定平台的开发版本
- 上传构建产物到 Artifacts

**使用方法：**
1. 进入 GitHub 仓库的 Actions 页面
2. 选择 "Build Dev Version"
3. 点击 "Run workflow"
4. 选择目标平台
5. 等待构建完成，下载 Artifacts

## 工作流配置说明

### 环境变量

所有工作流都使用以下环境：
- **Node.js**: 20.x
- **Rust**: stable

### 权限设置

- `contents: write` - 允许创建 Release 和上传产物
- `actions: read` - 允许读取工作流信息

### 密钥和令牌

- `GITHUB_TOKEN` - 自动提供，用于访问 GitHub API

## 故障排除

### 构建超时

如果构建超时，可以：
1. 重新运行失败的任务
2. 检查网络连接
3. 减少并行构建数量

### 依赖安装失败

如果依赖安装失败：
1. 检查 `package.json` 是否正确
2. 清除缓存后重试
3. 检查网络连接

### 上传失败

如果上传产物失败：
1. 检查文件大小是否超过限制
2. 检查权限设置
3. 重新运行工作流

## 自定义配置

### 添加新的构建目标

在 `release.yml` 的 `matrix` 部分添加：

```yaml
- platform: 'ubuntu-22.04'
  args: '--target aarch64-unknown-linux-gnu'
  name: 'Linux ARM64'
```

### 修改触发条件

在工作流的 `on` 部分修改：

```yaml
on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 0'  # 每周日运行
```

### 添加环境变量

在工作流的 `env` 部分添加：

```yaml
env:
  TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
  TAURI_KEY_PASSWORD: ${{ secrets.TAURI_KEY_PASSWORD }}
```

## 参考文档

- [GitHub Actions 文档](https://docs.github.com/cn/actions)
- [Tauri 发布指南](https://tauri.app/v1/guides/building/cross-platform/)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
