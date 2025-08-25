/**
 * 浏览器自动化相关类型定义
 */

import * as puppeteer from 'puppeteer';

export interface BrowserConfig {
  headless: boolean;
  devtools: boolean;
  slowMo: number;
  timeout: number;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
  args?: string[];
}

export interface BrowserInstance {
  id: string;
  browser: puppeteer.Browser;
  page: puppeteer.Page;
  createdAt: number;
  lastUsed: number;
  isActive: boolean;
  channelId?: string;
}

export interface PageSetupOptions {
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
  interceptRequests?: boolean;
  enableJavaScript?: boolean;
  enableImages?: boolean;
  enableCSS?: boolean;
}

export interface ElementLocatorConfig {
  timeout: number;
  retries: number;
  waitForVisible: boolean;
  waitForEnabled: boolean;
}

export interface SelectorStrategy {
  priority: number;
  selector: string;
  description: string;
  waitTime?: number;
}

export interface ElementLocation {
  selector: string;
  element: puppeteer.ElementHandle;
  strategy: string;
  foundAt: number;
}

export interface BrowserPoolConfig {
  maxSize: number;
  maxIdleTime: number;
  launchOptions: puppeteer.LaunchOptions;
  reuseInstances: boolean;
}

export interface PageInteractionOptions {
  typing: {
    delay: number;
    randomDelay: boolean;
    minDelay: number;
    maxDelay: number;
  };
  clicking: {
    delay: number;
    doubleClick: boolean;
  };
  waiting: {
    defaultTimeout: number;
    navigationTimeout: number;
    selectorTimeout: number;
  };
}

export interface ResponseCaptureConfig {
  enableNetworkMonitoring: boolean;
  enableDOMMonitoring: boolean;
  pollingInterval: number;
  maxPollingTime: number;
  completionIndicators: string[];
}

export interface CapturedResponse {
  content: string;
  isComplete: boolean;
  timestamp: number;
  source: 'dom' | 'network';
  metadata?: {
    elementSelector?: string;
    networkUrl?: string;
    contentLength?: number;
  };
}