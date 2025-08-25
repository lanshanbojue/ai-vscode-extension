/**
 * 渠道注册表 - 新增豆包渠道支持
 */

import { IChannelAdapter, ChannelConfig } from '../types';
import { Logger } from '../utils/Logger';
import { TongyiAdapter } from './tongyi/TongyiAdapter';
import { DoubaoAdapter } from './doubao/DoubaoAdapter';

export class ChannelRegistry {
  private static instance: ChannelRegistry;
  private adapters: Map<string, IChannelAdapter> = new Map();
  private configs: Map<string, ChannelConfig> = new Map();
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
  }

  static getInstance(): ChannelRegistry {
    if (!ChannelRegistry.instance) {
      ChannelRegistry.instance = new ChannelRegistry();
    }
    return ChannelRegistry.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('初始化渠道注册表...');
      
      // 注册默认渠道配置
      this.registerDefaultConfigs();
      
      // 注册所有渠道适配器
      await this.registerAdapters();
      
      this.logger.info(`渠道注册表初始化完成，共注册 ${this.adapters.size} 个渠道`);
    } catch (error) {
      this.logger.error('渠道注册表初始化失败', error);
      throw error;
    }
  }

  private registerDefaultConfigs(): void {
    // 通义千问配置
    this.configs.set('tongyi', {
      id: 'tongyi',
      name: '通义千问',
      enabled: true,
      timeout: 30000,
      retries: 3,
      debugMode: false
    });

    // 豆包配置
    this.configs.set('doubao', {
      id: 'doubao',
      name: '豆包',
      enabled: true,
      timeout: 30000,
      retries: 3,
      debugMode: false
    });
  }

  private async registerAdapters(): Promise<void> {
    try {
      // 注册通义千问适配器
      const tongyiAdapter = new TongyiAdapter();
      await tongyiAdapter.initialize();
      this.adapters.set('tongyi', tongyiAdapter);
      this.logger.debug('通义千问适配器注册成功');

      // 注册豆包适配器
      const doubaoAdapter = new DoubaoAdapter();
      await doubaoAdapter.initialize();
      this.adapters.set('doubao', doubaoAdapter);
      this.logger.debug('豆包适配器注册成功');

    } catch (error) {
      this.logger.error('注册适配器失败', error);
      throw error;
    }
  }

  getAdapter(channelId: string): IChannelAdapter | undefined {
    return this.adapters.get(channelId);
  }

  getAvailableAdapters(): IChannelAdapter[] {
    return Array.from(this.adapters.values());
  }

  getChannelConfig(channelId: string): ChannelConfig | undefined {
    return this.configs.get(channelId);
  }

  getAllChannelConfigs(): ChannelConfig[] {
    return Array.from(this.configs.values());
  }

  isChannelAvailable(channelId: string): boolean {
    const config = this.configs.get(channelId);
    return config ? config.enabled : false;
  }

  async switchChannel(fromChannelId: string, toChannelId: string): Promise<void> {
    this.logger.info(`切换渠道: ${fromChannelId} -> ${toChannelId}`);
    
    const toAdapter = this.getAdapter(toChannelId);
    if (!toAdapter) {
      throw new Error(`渠道 ${toChannelId} 不存在`);
    }

    if (!this.isChannelAvailable(toChannelId)) {
      throw new Error(`渠道 ${toChannelId} 已禁用`);
    }

    // 检查目标渠道是否已认证
    const isAuthenticated = await toAdapter.isAuthenticated();
    if (!isAuthenticated) {
      this.logger.warn(`渠道 ${toChannelId} 未认证，需要先登录`);
      throw new Error(`渠道 ${toChannelId} 未认证，请先登录`);
    }

    this.logger.info(`成功切换到渠道 ${toChannelId}`);
  }

  updateChannelConfig(channelId: string, config: Partial<ChannelConfig>): void {
    const currentConfig = this.configs.get(channelId);
    if (currentConfig) {
      this.configs.set(channelId, { ...currentConfig, ...config });
      this.logger.debug(`更新渠道配置: ${channelId}`, config);
    }
  }

  async dispose(): Promise<void> {
    this.logger.info('正在销毁渠道注册表...');
    
    for (const [channelId, adapter] of this.adapters) {
      try {
        await adapter.destroy();
        this.logger.debug(`渠道 ${channelId} 适配器已销毁`);
      } catch (error) {
        this.logger.error(`销毁渠道 ${channelId} 适配器失败`, error);
      }
    }
    
    this.adapters.clear();
    this.configs.clear();
    
    this.logger.info('渠道注册表销毁完成');
  }
}