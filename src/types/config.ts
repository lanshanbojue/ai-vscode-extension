/**
 * 配置相关类型定义
 */

export interface ExtensionConfig {
  channels: Record<string, ChannelConfig>;
  ui: UIConfig;
  performance: PerformanceConfig;
  security: SecurityConfig;
  logging: LoggingConfig;
}

export interface ChannelConfig {
  id: string;
  name: string;
  enabled: boolean;
  timeout: number;
  retries: number;
  customUserAgent?: string;
  debugMode?: boolean;
  loginConfig?: LoginConfig;
}

export interface LoginConfig {
  url: string;
  timeout: number;
  autoLogin: boolean;
  selectors: {
    loginButton?: string;
    usernameInput?: string;
    passwordInput?: string;
    submitButton?: string;
    successIndicator?: string;
  };
}

export interface UIConfig {
  theme: 'auto' | 'light' | 'dark';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  showTimestamp: boolean;
  showWordCount: boolean;
  codeHighlight: boolean;
  maxDisplayLength: number;
}

export interface PerformanceConfig {
  browserPoolSize: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  requestTimeout: number;
  maxConcurrentRequests: number;
  enableCompression: boolean;
  preloadPages: boolean;
}

export interface SecurityConfig {
  allowedDomains: string[];
  blockTrackers: boolean;
  disableJavaScript: boolean;
  enableSandbox: boolean;
  maxFileSize: number;
  validateCertificates: boolean;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableFile: boolean;
  maxLogSize: number;
  retentionDays: number;
  categories: string[];
}

export interface WorkspaceConfig {
  rootPath?: string;
  projectType?: string;
  language?: string;
  framework?: string;
  preferences: {
    codeStyle: string;
    maxLineLength: number;
    includeComments: boolean;
    includeTypes: boolean;
  };
}

export interface UserPreferences {
  defaultChannel: string;
  autoSave: boolean;
  maxHistory: number;
  streamResponse: boolean;
  notifications: boolean;
  shortcuts: Record<string, string>;
  customPrompts: CustomPrompt[];
}

export interface CustomPrompt {
  id: string;
  name: string;
  description: string;
  template: string;
  category: string;
  variables: PromptVariable[];
}

export interface PromptVariable {
  name: string;
  type: 'text' | 'code' | 'file' | 'selection';
  required: boolean;
  defaultValue?: string;
  description?: string;
}