/**
 * 消息相关类型定义
 */

export interface BaseMessage {
  id: string;
  timestamp: number;
  version: string;
}

export interface FrontendMessage extends BaseMessage {
  type: 'user-message' | 'channel-switch' | 'auth-request' | 'config-update' | 'get-status';
  payload: {
    // 用户消息
    message?: string;
    context?: ChatContext;
    
    // 渠道切换
    channelId?: string;
    
    // 认证请求
    authType?: 'login' | 'logout' | 'refresh';
    
    // 配置更新
    config?: Partial<UserConfig>;
  };
}

export interface ExtensionMessage extends BaseMessage {
  type: 'ai-response' | 'status-update' | 'error' | 'config-sync' | 'auth-status';
  payload: {
    // AI响应
    content?: string;
    isStreaming?: boolean;
    isComplete?: boolean;
    
    // 状态更新
    status?: ChannelStatus;
    
    // 错误信息
    error?: ErrorInfo;
    
    // 配置同步
    config?: UserConfig;
    
    // 认证状态
    authenticated?: boolean;
    needsLogin?: boolean;
  };
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
  context?: ChatContext;
  channelId?: string;
  isStreaming?: boolean;
  metadata?: {
    responseTime?: number;
    tokens?: number;
    model?: string;
  };
}

export interface ChatHistory {
  messages: ChatMessage[];
  totalMessages: number;
  channelId: string;
  createdAt: number;
  updatedAt: number;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: number;
  recoverable?: boolean;
}

export interface UserConfig {
  defaultChannel: string;
  autoSave: boolean;
  maxHistory: number;
  streamResponse: boolean;
  debug: boolean;
  theme: 'auto' | 'light' | 'dark';
  fontSize: number;
  showTimestamp: boolean;
  performance: {
    browserPoolSize: number;
    cacheEnabled: boolean;
    cacheTTL: number;
    requestTimeout: number;
  };
}

// 从其他文件导入的类型
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

export interface ChannelStatus {
  connected: boolean;
  authenticated: boolean;
  lastError?: string;
  lastActivity?: number;
  responseTime?: number;
}