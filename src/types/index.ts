/**
 * 类型定义统一导出
 */

// 渠道相关类型
export * from './channel';

// 消息相关类型
export * from './message';

// 浏览器相关类型
export * from './browser';

// 认证相关类型
export * from './auth';

// 配置相关类型
export * from './config';

// 常用的联合类型和工具类型
export type MessageType = 
  | 'user-message'
  | 'ai-response'
  | 'channel-switch'
  | 'auth-request'
  | 'config-update'
  | 'status-update'
  | 'error';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type ThemeType = 'auto' | 'light' | 'dark';

export type ChannelId = 'tongyi' | string;

// 工具类型
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// 事件相关类型
export interface EventEmitter<T = any> {
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): boolean;
  once(event: string, listener: (...args: any[]) => void): void;
  removeAllListeners(event?: string): void;
}

// 异步生成器类型
export type AsyncGenerator<T, TReturn = any, TNext = unknown> = {
  next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
  return(value: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>>;
  throw(e: any): Promise<IteratorResult<T, TReturn>>;
  [Symbol.asyncIterator](): AsyncGenerator<T, TReturn, TNext>;
};

// Promise相关类型
export type PromiseResolve<T = any> = (value: T | PromiseLike<T>) => void;
export type PromiseReject = (reason?: any) => void;

export interface Deferred<T = any> {
  promise: Promise<T>;
  resolve: PromiseResolve<T>;
  reject: PromiseReject;
}