/**
 * 豆包适配器测试
 */

import { DoubaoAdapter } from '../../channels/doubao/DoubaoAdapter';
import { Logger } from '../../utils/Logger';

// Mock dependencies
jest.mock('../../utils/Logger');
jest.mock('../../browser/BrowserManager');
jest.mock('../../channels/doubao/DoubaoAuth');
jest.mock('../../channels/doubao/DoubaoParser');

describe('DoubaoAdapter', () => {
  let doubaoAdapter: DoubaoAdapter;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    // 初始化mock
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as any;

    (Logger.getInstance as jest.Mock).mockReturnValue(mockLogger);

    doubaoAdapter = new DoubaoAdapter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('基本属性', () => {
    test('应该有正确的基本信息', () => {
      expect(doubaoAdapter.id).toBe('doubao');
      expect(doubaoAdapter.name).toBe('豆包');
      expect(doubaoAdapter.description).toBe('字节跳动豆包AI助手');
      expect(doubaoAdapter.website).toBe('https://www.doubao.com');
    });
  });

  describe('initialize', () => {
    test('应该成功初始化', async () => {
      await doubaoAdapter.initialize();
      
      expect(mockLogger.info).toHaveBeenCalledWith('正在初始化豆包渠道适配器...');
      expect(mockLogger.info).toHaveBeenCalledWith('豆包渠道适配器初始化成功');
    });

    test('初始化失败时应该抛出错误', async () => {
      const error = new Error('初始化失败');
      // Mock BrowserManager.initialize 抛出错误
      
      await expect(doubaoAdapter.initialize()).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getStatus', () => {
    test('应该返回初始状态', () => {
      const status = doubaoAdapter.getStatus();
      
      expect(status).toEqual({
        connected: false,
        authenticated: false,
        lastActivity: expect.any(Number)
      });
    });
  });

  describe('isAuthenticated', () => {
    test('未初始化时应该返回false', async () => {
      const result = await doubaoAdapter.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('sendMessage', () => {
    test('未认证时应该抛出错误', async () => {
      await expect(
        doubaoAdapter.sendMessage('测试消息')
      ).rejects.toThrow('豆包渠道未认证，请先登录');
    });
  });

  describe('sendMessageStream', () => {
    test('未认证时应该抛出错误', async () => {
      const generator = doubaoAdapter.sendMessageStream('测试消息');
      
      await expect(generator.next()).rejects.toThrow('豆包渠道未认证，请先登录');
    });
  });

  describe('事件监听', () => {
    test('应该能够正确注册和触发事件', () => {
      const mockListener = jest.fn();
      
      doubaoAdapter.on('status-changed', mockListener);
      
      // 触发状态变化
      (doubaoAdapter as any).updateStatus({ connected: true });
      
      expect(mockListener).toHaveBeenCalledWith({
        channelId: 'doubao',
        status: expect.objectContaining({ connected: true })
      });
    });
  });

  describe('destroy', () => {
    test('应该正确清理资源', async () => {
      await doubaoAdapter.destroy();
      
      expect(mockLogger.info).toHaveBeenCalledWith('正在销毁豆包渠道适配器...');
      expect(mockLogger.info).toHaveBeenCalledWith('豆包渠道适配器已销毁');
      
      const status = doubaoAdapter.getStatus();
      expect(status.connected).toBe(false);
      expect(status.authenticated).toBe(false);
    });
  });
});