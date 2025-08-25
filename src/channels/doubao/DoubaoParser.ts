/**
 * 豆包消息解析器
 */

import { ChatContext } from '../../types';
import { Logger } from '../../utils/Logger';
import { Page } from 'puppeteer';

export class DoubaoParser {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * 在豆包页面输入消息
   */
  async inputMessage(page: Page, message: string, context?: ChatContext): Promise<void> {
    try {
      this.logger.debug('在豆包页面输入消息', { messageLength: message.length });
      
      // 豆包输入框的可能选择器
      const inputSelectors = [
        'textarea[placeholder*="请输入"]',
        'textarea[placeholder*="问问"]',
        'input[type="text"]',
        'textarea',
        '[contenteditable="true"]',
        '[data-testid="chat-input"]',
        '[class*="input"]',
        '[class*="textarea"]'
      ];
      
      let inputElement = null;
      for (const selector of inputSelectors) {
        try {
          inputElement = await page.$(selector);
          if (inputElement) {
            this.logger.debug(`找到输入框: ${selector}`);
            break;
          }
        } catch {
          // 继续尝试下一个选择器
        }
      }
      
      if (!inputElement) {
        throw new Error('未找到豆包输入框');
      }
      
      // 清空输入框并输入消息
      await inputElement.click();
      await page.keyboard.down('Control');
      await page.keyboard.press('a');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      
      // 模拟人类打字行为
      await this.typeWithRandomDelay(page, message);
      
      // 如果有上下文信息，添加到消息中
      if (context?.selectedCode) {
        const contextMessage = `\n\n代码上下文:\n\`\`\`${context.language || ''}\n${context.selectedCode}\n\`\`\``;
        await this.typeWithRandomDelay(page, contextMessage);
      }
      
      // 查找并点击发送按钮
      await this.clickSendButton(page);
      
    } catch (error) {
      this.logger.error('豆包消息输入失败', error);
      throw error;
    }
  }

  /**
   * 等待豆包回复
   */
  async waitForResponse(page: Page): Promise<string> {
    try {
      this.logger.debug('等待豆包回复');
      
      // 等待回复元素出现
      const responseSelectors = [
        '[data-testid="message-content"]',
        '.message-content',
        '.response-content',
        '[class*="message"]',
        '[class*="response"]',
        '[class*="reply"]'
      ];
      
      // 等待回复元素出现（最多等待30秒）
      let responseElement = null;
      const timeout = 30000;
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        for (const selector of responseSelectors) {
          try {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
              // 获取最后一个回复元素
              responseElement = elements[elements.length - 1];
              break;
            }
          } catch {
            // 继续尝试
          }
        }
        
        if (responseElement) break;
        await page.waitForTimeout(1000);
      }
      
      if (!responseElement) {
        throw new Error('豆包回复超时');
      }
      
      // 等待回复完成
      await this.waitForResponseComplete(page, responseElement);
      
      // 获取回复内容
      const responseText = await responseElement.evaluate(el => {
        return el.textContent || el.innerText || '';
      });
      
      this.logger.debug('豆包回复接收完成', { responseLength: responseText.length });
      return responseText.trim();
      
    } catch (error) {
      this.logger.error('等待豆包回复失败', error);
      throw error;
    }
  }

  /**
   * 流式获取豆包回复
   */
  async *streamResponse(page: Page): AsyncGenerator<string> {
    try {
      this.logger.debug('开始流式获取豆包回复');
      
      // 查找回复元素
      const responseSelectors = [
        '[data-testid="message-content"]',
        '.message-content',
        '.response-content',
        '[class*="message"]',
        '[class*="response"]'
      ];
      
      let responseElement = null;
      const timeout = 30000;
      const startTime = Date.now();
      
      // 等待回复元素出现
      while (Date.now() - startTime < timeout && !responseElement) {
        for (const selector of responseSelectors) {
          try {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
              responseElement = elements[elements.length - 1];
              break;
            }
          } catch {
            // 继续尝试
          }
        }
        
        if (!responseElement) {
          await page.waitForTimeout(500);
        }
      }
      
      if (!responseElement) {
        throw new Error('豆包回复元素未出现');
      }
      
      // 流式读取内容
      let lastContent = '';
      let stableCount = 0;
      const maxStableCount = 5; // 连续5次内容不变则认为完成
      
      while (stableCount < maxStableCount) {
        try {
          const currentContent = await responseElement.evaluate(el => {
            return el.textContent || el.innerText || '';
          });
          
          if (currentContent !== lastContent) {
            const newContent = currentContent.slice(lastContent.length);
            if (newContent.trim()) {
              yield newContent;
            }
            lastContent = currentContent;
            stableCount = 0;
          } else {
            stableCount++;
          }
          
          await page.waitForTimeout(200);
        } catch (error) {
          this.logger.error('流式读取内容出错', error);
          break;
        }
      }
      
      this.logger.debug('豆包流式回复完成');
      
    } catch (error) {
      this.logger.error('豆包流式回复失败', error);
      throw error;
    }
  }

  /**
   * 模拟人类打字行为
   */
  private async typeWithRandomDelay(page: Page, text: string): Promise<void> {
    for (const char of text) {
      await page.keyboard.type(char);
      // 随机延迟 50-150ms
      const delay = Math.random() * 100 + 50;
      await page.waitForTimeout(delay);
    }
  }

  /**
   * 点击发送按钮
   */
  private async clickSendButton(page: Page): Promise<void> {
    const sendSelectors = [
      '[data-testid="send-button"]',
      'button[type="submit"]',
      '.send-button',
      '[class*="send"]',
      'button:has-text("发送")',
      'button:has-text("提交")',
      '[aria-label*="发送"]'
    ];
    
    for (const selector of sendSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          this.logger.debug(`点击发送按钮: ${selector}`);
          return;
        }
      } catch {
        // 继续尝试下一个选择器
      }
    }
    
    // 如果找不到发送按钮，尝试使用Enter键
    this.logger.debug('未找到发送按钮，使用Enter键发送');
    await page.keyboard.press('Enter');
  }

  /**
   * 等待回复完成
   */
  private async waitForResponseComplete(page: Page, responseElement: any): Promise<void> {
    // 检查是否有加载指示器
    const loadingSelectors = [
      '.loading',
      '.typing',
      '[class*="loading"]',
      '[class*="typing"]',
      '[data-testid*="loading"]'
    ];
    
    let isLoading = true;
    while (isLoading) {
      isLoading = false;
      
      for (const selector of loadingSelectors) {
        try {
          const loadingElement = await page.$(selector);
          if (loadingElement) {
            const isVisible = await loadingElement.isIntersectingViewport();
            if (isVisible) {
              isLoading = true;
              break;
            }
          }
        } catch {
          // 继续检查
        }
      }
      
      if (isLoading) {
        await page.waitForTimeout(500);
      }
    }
    
    // 额外等待一下确保内容稳定
    await page.waitForTimeout(1000);
  }
}