/**
 * VSCode扩展主入口文件
 */

import * as vscode from 'vscode';
import { WebviewProvider, MessageManager, ApiService } from './communication';
import { ChannelRegistry } from './channels/ChannelRegistry';
import { AuthManager } from './auth/AuthManager';
import { ConfigManager } from './utils/ConfigManager';
import { Logger } from './utils/Logger';
import { CommandManager } from './commands/CommandManager';

export class Extension {
  private webviewProvider: WebviewProvider | null = null;
  private messageManager: MessageManager | null = null;
  private apiService: ApiService | null = null;
  private channelRegistry: ChannelRegistry | null = null;
  private authManager: AuthManager | null = null;
  private configManager: ConfigManager | null = null;
  private commandManager: CommandManager | null = null;
  private logger: Logger;
  private disposables: vscode.Disposable[] = [];

  constructor(private context: vscode.ExtensionContext) {
    this.logger = Logger.getInstance();
    this.logger.info('AI编码助手扩展正在初始化...');
  }

  async activate(): Promise<void> {
    try {
      // 初始化配置管理器
      this.configManager = ConfigManager.getInstance();
      await this.configManager.initialize();

      // 初始化渠道注册表
      this.channelRegistry = ChannelRegistry.getInstance();
      await this.channelRegistry.initialize();

      // 初始化认证管理器
      this.authManager = AuthManager.getInstance();
      await this.authManager.initialize(this.context);

      // 创建Webview提供者
      this.webviewProvider = new WebviewProvider(
        this.context.extensionUri,
        this.context
      );

      // 注册Webview提供者
      this.disposables.push(
        vscode.window.registerWebviewViewProvider(
          WebviewProvider.viewType,
          this.webviewProvider
        )
      );

      // 获取消息管理器
      this.messageManager = this.webviewProvider.getMessageManager();

      // 初始化API服务
      this.apiService = new ApiService(this.messageManager);

      // 初始化命令管理器
      this.commandManager = new CommandManager(
        this.webviewProvider,
        this.channelRegistry,
        this.authManager
      );
      await this.commandManager.initialize();

      // 注册命令
      this.registerCommands();

      // 注册事件监听器
      this.registerEventListeners();

      // 设置状态栏
      this.setupStatusBar();

      this.logger.info('AI编码助手扩展激活成功');

      // 显示欢迎消息
      this.showWelcomeMessage();

    } catch (error) {
      this.logger.error('扩展激活失败', error);
      vscode.window.showErrorMessage(`AI编码助手激活失败: ${error.message}`);
      throw error;
    }
  }

  deactivate(): void {
    this.logger.info('AI编码助手扩展正在停用...');

    // 清理资源
    this.disposables.forEach(disposable => disposable.dispose());
    this.disposables = [];

    // 清理各个管理器
    if (this.apiService) {
      this.apiService.dispose();
    }

    if (this.webviewProvider) {
      this.webviewProvider.dispose();
    }

    if (this.commandManager) {
      this.commandManager.dispose();
    }

    if (this.channelRegistry) {
      this.channelRegistry.dispose();
    }

    if (this.authManager) {
      this.authManager.dispose();
    }

    this.logger.info('AI编码助手扩展已停用');
  }

  private registerCommands(): void {
    if (!this.commandManager) return;

    const commands = [
      {
        id: 'aiCoding.openChat',
        handler: () => this.commandManager!.openChat()
      },
      {
        id: 'aiCoding.explainCode',
        handler: () => this.commandManager!.explainCode()
      },
      {
        id: 'aiCoding.optimizeCode',
        handler: () => this.commandManager!.optimizeCode()
      },
      {
        id: 'aiCoding.debugCode',
        handler: () => this.commandManager!.debugCode()
      }
    ];

    // 注册所有命令
    commands.forEach(({ id, handler }) => {
      const disposable = vscode.commands.registerCommand(id, handler);
      this.disposables.push(disposable);
      this.logger.debug(`命令已注册: ${id}`);
    });
  }

  private registerEventListeners(): void {
    // 监听配置变化
    const configDisposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('aiCoding')) {
        this.handleConfigurationChange();
      }
    });
    this.disposables.push(configDisposable);
  }

  private setupStatusBar(): void {
    const statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );

    statusBarItem.text = '$(robot) AI助手';
    statusBarItem.tooltip = 'AI编码助手';
    statusBarItem.command = 'aiCoding.openChat';
    statusBarItem.show();

    this.disposables.push(statusBarItem);
  }

  private showWelcomeMessage(): void {
    const config = vscode.workspace.getConfiguration('aiCoding');
    const showWelcome = config.get('showWelcomeMessage', true);

    if (showWelcome) {
      vscode.window.showInformationMessage(
        '欢迎使用AI编码助手！',
        '打开聊天',
        '不再显示'
      ).then(selection => {
        if (selection === '打开聊天') {
          vscode.commands.executeCommand('aiCoding.openChat');
        } else if (selection === '不再显示') {
          config.update('showWelcomeMessage', false, vscode.ConfigurationTarget.Global);
        }
      });
    }
  }

  private handleConfigurationChange(): void {
    this.logger.info('配置已变化，正在更新...');
    
    if (this.configManager) {
      this.configManager.reloadConfiguration();
    }

    // 通知UI配置已变化
    if (this.webviewProvider) {
      this.webviewProvider.sendNotification('config-changed', {
        timestamp: Date.now()
      });
    }
  }

  getExtensionInfo() {
    return {
      version: this.context.extension.packageJSON.version,
      name: this.context.extension.packageJSON.displayName,
      id: this.context.extension.id,
      isActive: true,
      channels: this.channelRegistry?.getAvailableAdapters().length || 0
    };
  }
}

// 扩展实例
let extensionInstance: Extension | null = null;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  try {
    extensionInstance = new Extension(context);
    await extensionInstance.activate();
  } catch (error) {
    console.error('Extension activation failed:', error);
    throw error;
  }
}

export function deactivate(): void {
  if (extensionInstance) {
    extensionInstance.deactivate();
    extensionInstance = null;
  }
}

export function getExtensionInstance(): Extension | null {
  return extensionInstance;
}