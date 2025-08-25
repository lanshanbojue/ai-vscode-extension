/**
 * Jest测试设置文件
 */

// 全局测试设置
global.console = {
  ...console,
  // 静默某些日志
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// 模拟VSCode API
const mockVscode = {
  window: {
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    createStatusBarItem: jest.fn(() => ({
      text: '',
      tooltip: '',
      command: '',
      show: jest.fn(),
      hide: jest.fn(),
      dispose: jest.fn()
    })),
    createWebviewPanel: jest.fn(),
    registerWebviewViewProvider: jest.fn(),
    activeTextEditor: null,
    onDidChangeActiveTextEditor: jest.fn(),
    onDidChangeTextEditorSelection: jest.fn(),
    onDidChangeWindowState: jest.fn()
  },
  workspace: {
    getConfiguration: jest.fn(() => ({
      get: jest.fn(),
      update: jest.fn()
    })),
    onDidChangeConfiguration: jest.fn()
  },
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn()
  },
  env: {
    openExternal: jest.fn()
  },
  Uri: {
    parse: jest.fn(),
    file: jest.fn(),
    joinPath: jest.fn()
  },
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2
  },
  ViewColumn: {
    One: 1,
    Two: 2,
    Three: 3
  },
  ThemeColor: jest.fn()
};

// 模拟模块
jest.mock('vscode', () => mockVscode, { virtual: true });

// 模拟Puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn(),
  createBrowserFetcher: jest.fn()
}), { virtual: true });

// 设置测试超时
jest.setTimeout(30000);

// 测试环境清理
afterEach(() => {
  jest.clearAllMocks();
});

// 导出mock用于测试中使用
export { mockVscode };