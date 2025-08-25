/**
 * 认证相关类型定义
 */

export interface AuthConfig {
  channelId: string;
  loginUrl: string;
  loginTimeout: number;
  sessionTimeout: number;
  autoRefresh: boolean;
  cookieDomain?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  channelId: string;
  loginTime?: number;
  lastCheck?: number;
  expiresAt?: number;
  needsReauth?: boolean;
  error?: string;
}

export interface CookieData {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface StoredAuthData {
  channelId: string;
  cookies: CookieData[];
  timestamp: number;
  userAgent?: string;
  sessionId?: string;
}

export interface LoginFlowConfig {
  steps: LoginStep[];
  timeout: number;
  retries: number;
  verificationSelectors: string[];
  successIndicators: string[];
  errorIndicators: string[];
}

export interface LoginStep {
  type: 'navigate' | 'wait' | 'input' | 'click' | 'verify';
  target?: string;
  value?: string;
  timeout?: number;
  optional?: boolean;
  description: string;
}

export interface AuthProvider {
  channelId: string;
  
  // 认证检查
  checkAuthStatus(): Promise<AuthState>;
  
  // 登录流程
  initiateLogin(): Promise<string>; // 返回登录URL
  waitForLogin(): Promise<AuthState>;
  
  // Cookie管理
  saveCookies(cookies: CookieData[]): Promise<void>;
  loadCookies(): Promise<CookieData[]>;
  clearCookies(): Promise<void>;
  
  // 会话管理
  refreshSession(): Promise<AuthState>;
  logout(): Promise<void>;
}