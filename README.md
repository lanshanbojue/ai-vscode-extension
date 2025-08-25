# AI编码助手 - VSCode扩展

<p align="center">
  <img src="media/icons/logo.png" alt="AI编码助手" width="128" height="128">
</p>

<p align="center">
  <strong>基于渠道化设计的AI编程助手</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=ai-coding-assistant">
    <img src="https://img.shields.io/visual-studio-marketplace/v/ai-coding-assistant" alt="VSCode Marketplace">
  </a>
  <a href="https://github.com/your-org/ai-coding-assistant/actions">
    <img src="https://github.com/your-org/ai-coding-assistant/workflows/CI/badge.svg" alt="CI Status">
  </a>
  <a href="https://codecov.io/gh/your-org/ai-coding-assistant">
    <img src="https://codecov.io/gh/your-org/ai-coding-assistant/branch/main/graph/badge.svg" alt="Coverage">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/your-org/ai-coding-assistant" alt="License">
  </a>
</p>

## 📖 简介

AI编码助手是一款创新的VSCode扩展，采用独特的渠道化设计理念，通过浏览器自动化技术直接对接主流AI服务平台。与传统的API调用方式不同，我们让用户选择AI服务渠道而非具体模型，提供更简洁、更经济的AI编程体验。

### ✨ 核心特色

- 🎯 **渠道化设计**: 选择服务商而非模型，简化用户决策
- 🌐 **网页版对接**: 直接使用免费网页版，无API费用
- 🔄 **流式响应**: 实时显示AI回复过程，提升交互体验
- 🛡️ **零配置使用**: 无需API Key，浏览器登录即可使用
- 🔌 **深度集成**: 与VSCode编辑器无缝结合

### 🎯 首期支持

- **通义千问**: 阿里云大语言模型服务
- **后续计划**: 百度文心一言、讯飞星火、OpenAI等

## 🚀 快速开始

### 安装
1. 打开VSCode
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索"AI编码助手"
4. 点击安装并重启VSCode

### 首次使用
1. 点击左侧"AI助手"图标
2. 选择"通义千问"渠道
3. 在弹出的浏览器中完成登录
4. 返回VSCode开始使用

### 基本操作
```typescript
// 选中代码后右键选择"AI: 解释代码"
function fibonacci(n: number): number {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 或在聊天面板中直接提问
// "请优化这个斐波那契函数的性能"
```

## 📋 功能特性

### 智能聊天
- 🤖 自然语言对话，获取编程帮助
- 💬 支持代码解释、生成、优化、调试
- 📝 自动保存聊天历史，支持回溯查看
- 🎨 代码语法高亮，支持多种编程语言

### 代码集成
- 🔍 **代码解释**: 选中代码直接获取详细解释
- ⚡ **代码生成**: 描述需求自动生成代码片段
- 🔧 **代码优化**: 获取性能和结构改进建议
- 🐛 **错误调试**: 分析错误信息提供解决方案

### 智能辅助
- 🧠 上下文感知，理解文件和项目结构
- 📚 代码片段管理，保存常用代码模板
- 🔄 多轮对话，支持深入讨论技术问题
- ⚙️ 个性化设置，定制专属编程助手

## 🛠️ 技术架构

### 核心技术
- **前端**: TypeScript + React + Vite
- **后端**: Node.js + Express
- **自动化**: Puppeteer + Chrome
- **构建**: Webpack + VSCE

### 架构设计
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   VSCode UI     │◄──►│   Extension     │◄──►│   Channel       │
│   (Webview)     │    │   Backend       │    │   Adapters      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Chat UI       │    │   Auth Manager  │    │   Tongyi API    │
│   Components    │    │   Config Store  │    │   Web Interface │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📚 文档

完整的项目文档位于 `docs/` 目录：

- [产品设计文档](docs/01_产品设计文档.md) - 产品概述、功能设计、用户体验
- [技术架构文档](docs/02_技术架构文档.md) - 系统架构、技术栈、模块设计
- [技术方案文档](docs/03_技术方案文档.md) - 核心技术实现方案
- [部署文档](docs/04_部署文档.md) - 环境搭建、构建、发布
- [使用文档](docs/05_使用文档.md) - 安装指南、功能使用
- [开发文档](docs/06_开发文档.md) - 开发规范、调试指南

## 🔧 开发指南

### 环境要求
- Node.js 18.0+
- VSCode 1.80.0+
- Chrome/Chromium 115.0+

### 本地开发
```bash
# 克隆项目
git clone https://github.com/lanshanbojue/ai-vscode-extension.git
cd ai-vscode-extension

# 安装依赖
npm install

# 启动开发模式
npm run dev

# 在VSCode中按F5启动调试
```

### 构建发布
```bash
# 构建生产版本
npm run build

# 运行测试
npm test

# 打包扩展
npm run package
```

## 🤝 贡献

我们欢迎各种形式的贡献！

### 贡献方式
- 🐛 报告Bug和问题
- 💡 提出新功能建议
- 📖 改进项目文档
- 💻 提交代码改进

### 开发流程
1. Fork项目到你的GitHub账户
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建Pull Request

### 代码规范
- 遵循TypeScript编码规范
- 编写单元测试
- 确保代码通过ESLint检查
- 提交前运行 `npm run format`

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=ai-coding-assistant)
- [GitHub Repository](https://github.com/lanshanbojue/ai-vscode-extension)
- [问题反馈](https://github.com/lanshanbojue/ai-vscode-extension/issues)
- [功能建议](https://github.com/lanshanbojue/ai-vscode-extension/discussions)

## 📞 支持

如果您在使用过程中遇到问题：

1. 查看[使用文档](docs/05_使用文档.md)中的故障排除部分
2. 搜索[已知问题](https://github.com/lanshanbojue/ai-vscode-extension/issues)
3. 在GitHub上[创建新问题](https://github.com/lanshanbojue/ai-vscode-extension/issues/new)
4. 发送邮件至: support@ai-coding-assistant.com

## 🎉 致谢

感谢所有为项目作出贡献的开发者和用户！