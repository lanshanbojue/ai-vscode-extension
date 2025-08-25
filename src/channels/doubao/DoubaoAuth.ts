/**
 * 豆包认证管理器
 */

import { AuthState, AuthResult, CookieData } from '../../types';
import { Logger } from '../../utils/Logger';
import { BrowserManager } from '../../browser/BrowserManager';
import { Page } from 'puppeteer';

export class DoubaoAuth {
  private logger: Logger;
  private browserManager: BrowserManager;
  private authState: AuthState;

  constructor() {
    this.logger = Logger.getInstance();
    this.browserManager = BrowserManager.getInstance();
    this.authState = {
      isAuthenticated: false,
      channelId: 'doubao'
    };
  }

  async initialize(): Promise<void> {
    this.logger.info('初始化豆包认证管理器');
    
    // 检查已保存的认证状态
    await this.loadAuthState();
  }

  async checkAuthStatus(): Promise<AuthState> {
    try {
      const browser = await this.browserManager.getBrowser('doubao');
      const page = browser.page;
      
      // 访问豆包主页检查登录状态
      await page.goto('https://www.doubao.com', { waitUntil: 'networkidle0' });
      
      // 检查是否存在用户头像或登录状态标识
      const isLoggedIn = await this.checkLoginStatus(page);
      
      this.authState = {
        ...this.authState,
        isAuthenticated: isLoggedIn,
        lastCheck: Date.now()
      };
      
      if (isLoggedIn) {
        await this.saveAuthState();
      }
      
      return this.authState;
    } catch (error) {
      this.logger.error('检查豆包认证状态失败', error);
      return {
        ...this.authState,
        isAuthenticated: false,
        error: error.message
      };
    }
  }

  async authenticate(): Promise<AuthResult> {
    try {
      this.logger.info('开始豆包认证流程');
      
      const browser = await this.browserManager.getBrowser('doubao');
      const page = browser.page;
      
      // 访问豆包登录页面
      await page.goto('https://www.doubao.com/login', { waitUntil: 'networkidle0' });
      
      // 等待用户手动登录
      const loginResult = await this.waitForLogin(page);
      
      if (loginResult.success) {
        this.authState = {
          ...this.authState,
          isAuthenticated: true,
          loginTime: Date.now()
        };
        
        await this.saveAuthState();
      }
      
      return loginResult;
    } catch (error) {
      this.logger.error('豆包认证失败', error);
      return {
        success: false,
        error: error.message,
        needsManualLogin: true
      };
    }
  }

  async logout(): Promise<void> {
    try {
      this.logger.info('豆包登出');
      
      const browser = await this.browserManager.getBrowser('doubao');
      const page = browser.page;
      
      // 查找并点击登出按钮
      await this.performLogout(page);
      
      // 清除认证状态
      this.authState = {
        channelId: 'doubao',
        isAuthenticated: false
      };
      
      await this.clearAuthState();
      
      this.logger.info('豆包登出成功');
    } catch (error) {
      this.logger.error('豆包登出失败', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    this.logger.info('清理豆包认证管理器');
    // 执行清理操作
  }

  private async checkLoginStatus(page: Page): Promise<boolean> {
    try {
      // 豆包登录状态检查的选择器（需要根据实际页面调整）
      const loginSelectors = [
        '[data-testid="user-avatar"]',
        '.user-info',
        '.avatar',
        '[class*="avatar"]',
        '[class*="user"]'
      ];
      
      for (const selector of loginSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            this.logger.debug(`检测到豆包登录状态: ${selector}`);
            return true;
          }
        } catch {
          // 继续尝试下一个选择器
        }
      }
      
      // 检查登录按钮是否存在（如果存在说明未登录）
      const loginButton = await page.$('[href*="login"], [class*="login"], [data-testid*="login"]');
      return !loginButton;
    } catch (error) {
      this.logger.error('检查豆包登录状态时出错', error);
      return false;
    }
  }

  private async waitForLogin(page: Page): Promise<AuthResult> {
    return new Promise((resolve) => {
      const timeout = 300000; // 5分钟超时
      let checkInterval: NodeJS.Timeout;
      
      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        resolve({
          success: false,
          error: '登录超时，请重试',
          needsManualLogin: true
        });
      }, timeout);
      
      checkInterval = setInterval(async () => {
        try {
          const isLoggedIn = await this.checkLoginStatus(page);
          if (isLoggedIn) {
            clearTimeout(timeoutId);
            clearInterval(checkInterval);
            resolve({
              success: true,
              message: '豆包登录成功'
            });
          }
        } catch (error) {
          this.logger.error('检查登录状态时出错', error);
        }
      }, 2000);
    });
  }

  private async performLogout(page: Page): Promise<void> {
    try {
      // 豆包登出按钮的可能选择器
      const logoutSelectors = [
        '[data-testid="logout"]',
        '[href*="logout"]',
        '.logout',
        '[class*="logout"]',
        'button:has-text("登出")',
        'button:has-text("退出")'
      ];
      
      for (const selector of logoutSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.click();
            await page.waitForTimeout(2000);
            this.logger.debug(`点击登出按钮: ${selector}`);
            return;
          }
        } catch {
          // 继续尝试下一个选择器
        }
      }
      
      this.logger.warn('未找到豆包登出按钮');
    } catch (error) {
      this.logger.error('执行豆包登出操作失败', error);
      throw error;
    }
  }

  private async loadAuthState(): Promise<void> {
    // 从安全存储加载认证状态
    // 这里应该调用 SecureStorage
  }

  private async saveAuthState(): Promise<void> {
    // 保存认证状态到安全存储
    // 这里应该调用 SecureStorage
  }

  private async clearAuthState(): Promise<void> {
    // 清除保存的认证状态
    // 这里应该调用 SecureStorage
  }
}