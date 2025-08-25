/**
 * 渠道相关类型定义
 */

export interface IChannelAdapter {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly website: string;

  // 生命周期
  initialize(): Promise<void>;
  destroy(): Promise<void>;

  // 认证相关
  isAuthenticated(): Promise<boolean>;
  authenticate(): Promise<AuthResult>;
  logout(): Promise<void>;

  // 聊天功能
  sendMessage(message: string, context?: ChatContext): Promise<string>;
  sendMessageStream(message: string, context?: ChatContext): AsyncGenerator<string>;

  // 状态管理
  getStatus(): ChannelStatus;
  on(event: ChannelEvent, listener: (...args: any[]) => void): void;
  off(event: ChannelEvent, listener: (...args: any[]) => void): void;
}

export interface ChannelConfig {
  id: string;
  name: string;
  enabled: boolean;
  timeout: number;
  retries: number;
  customUserAgent?: string;
  debugMode?: boolean;
}

export interface ChannelStatus {
  connected: boolean;
  authenticated: boolean;
  lastError?: string;
  lastActivity?: number;
  responseTime?: number;
}

export interface AuthResult {
  success: boolean;
  message?: string;
  error?: string;
  needsManualLogin?: boolean;
}

export interface ChatContext {
  selectedCode?: string;
  currentFile?: string;
  language?: string;
  cursor?: {
    line: number;
    character: number;
  };
  workspace?: string;
  projectType?: string;
}

export type ChannelEvent = 
  | 'connected'
  | 'disconnected'
  | 'authenticated'
  | 'unauthenticated'
  | 'message-sent'
  | 'message-received'
  | 'error'
  | 'status-changed';

export interface ChannelEventData {
  type: ChannelEvent;
  data?: any;
  timestamp: number;
  channelId: string;
}