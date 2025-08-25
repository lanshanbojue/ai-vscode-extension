/**
 * 豆包渠道适配器
 */

import { IChannelAdapter, ChannelStatus, AuthResult, ChatContext, ChannelEvent } from '../../types';
import { Logger } from '../../utils/Logger';
import { DoubaoAuth } from './DoubaoAuth';
import { DoubaoParser } from './DoubaoParser';
import { BrowserManager } from '../../browser/BrowserManager';
import { EventEmitter } from 'events';

export class DoubaoAdapter extends EventEmitter implements IChannelAdapter {
  readonly id = 'doubao';
  readonly name = '豆包';
  readonly description = '字节跳动豆包AI助手';
  readonly website = 'https://www.doubao.com';

  private logger: Logger;
  private auth: DoubaoAuth;
  private parser: DoubaoParser;
  private browserManager: BrowserManager;
  private status: ChannelStatus;
  private isInitialized = false;

  constructor() {
    super();
    this.logger = Logger.getInstance();
    this.auth = new DoubaoAuth();
    this.parser = new DoubaoParser();
    this.browserManager = BrowserManager.getInstance();
    
    this.status = {
      connected: false,
      authenticated: false,
      lastActivity: Date.now()
    };
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('正在初始化豆包渠道适配器...');
      
      await this.browserManager.initialize();
      await this.auth.initialize();
      
      this.isInitialized = true;
      this.updateStatus({ connected: true });
      
      this.logger.info('豆包渠道适配器初始化成功');
    } catch (error) {
      this.logger.error('豆包渠道适配器初始化失败', error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      this.logger.info('正在销毁豆包渠道适配器...');
      
      await this.auth.cleanup();
      this.isInitialized = false;
      this.updateStatus({ connected: false, authenticated: false });
      
      this.logger.info('豆包渠道适配器已销毁');
    } catch (error) {
      this.logger.error('销毁豆包渠道适配器失败', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }
    
    try {
      const authStatus = await this.auth.checkAuthStatus();
      this.updateStatus({ authenticated: authStatus.isAuthenticated });
      return authStatus.isAuthenticated;
    } catch (error) {
      this.logger.error('检查豆包认证状态失败', error);
      return false;
    }
  }

  async authenticate(): Promise<AuthResult> {
    try {
      this.logger.info('开始豆包认证流程...');
      
      const result = await this.auth.authenticate();
      this.updateStatus({ authenticated: result.success });
      
      if (result.success) {
        this.logger.info('豆包认证成功');
        this.emit('authenticated', { channelId: this.id });
      } else {
        this.logger.warn('豆包认证失败', result.error);
        this.emit('unauthenticated', { channelId: this.id, error: result.error });
      }
      
      return result;
    } catch (error) {
      this.logger.error('豆包认证过程发生错误', error);
      return {
        success: false,
        error: error.message,
        needsManualLogin: true
      };
    }
  }

  async logout(): Promise<void> {
    try {
      this.logger.info('豆包登出...');
      
      await this.auth.logout();
      this.updateStatus({ authenticated: false });
      
      this.emit('unauthenticated', { channelId: this.id });
      this.logger.info('豆包登出成功');
    } catch (error) {
      this.logger.error('豆包登出失败', error);
      throw error;
    }
  }

  async sendMessage(message: string, context?: ChatContext): Promise<string> {
    if (!await this.isAuthenticated()) {
      throw new Error('豆包渠道未认证，请先登录');
    }

    try {
      this.logger.info('发送消息到豆包', { messageLength: message.length });
      this.emit('message-sent', { channelId: this.id, message });
      
      const browser = await this.browserManager.getBrowser(this.id);
      const page = browser.page;
      
      // 导航到豆包聊天页面
      await page.goto('https://www.doubao.com/chat', { waitUntil: 'networkidle0' });
      
      // 输入消息
      await this.parser.inputMessage(page, message, context);
      
      // 等待并获取回复
      const response = await this.parser.waitForResponse(page);
      
      this.updateStatus({ lastActivity: Date.now() });
      this.emit('message-received', { channelId: this.id, response });
      
      this.logger.info('豆包回复接收成功', { responseLength: response.length });
      return response;
    } catch (error) {
      this.logger.error('发送消息到豆包失败', error);
      this.emit('error', { channelId: this.id, error: error.message });
      throw error;
    }
  }

  async *sendMessageStream(message: string, context?: ChatContext): AsyncGenerator<string> {
    if (!await this.isAuthenticated()) {
      throw new Error('豆包渠道未认证，请先登录');
    }

    try {
      this.logger.info('开始流式发送消息到豆包', { messageLength: message.length });
      this.emit('message-sent', { channelId: this.id, message });
      
      const browser = await this.browserManager.getBrowser(this.id);
      const page = browser.page;
      
      // 导航到豆包聊天页面
      await page.goto('https://www.doubao.com/chat', { waitUntil: 'networkidle0' });
      
      // 输入消息
      await this.parser.inputMessage(page, message, context);
      
      // 流式获取回复
      yield* this.parser.streamResponse(page);
      
      this.updateStatus({ lastActivity: Date.now() });
      this.logger.info('豆包流式回复完成');
    } catch (error) {
      this.logger.error('豆包流式消息发送失败', error);
      this.emit('error', { channelId: this.id, error: error.message });
      throw error;
    }
  }

  getStatus(): ChannelStatus {
    return { ...this.status };
  }

  private updateStatus(updates: Partial<ChannelStatus>): void {
    this.status = { ...this.status, ...updates };
    this.emit('status-changed', { channelId: this.id, status: this.status });
  }
}