/**
 * 主应用组件
 */

import React, { useState, useEffect } from 'react';
import { ChatInterface } from './ChatInterface';
import { ChannelSelector } from './ChannelSelector';
import { StatusBar } from './StatusBar';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';
import { useCommunication } from '../hooks/useCommunication';
import { useChannels } from '../hooks/useChannels';

interface AppState {
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  activeChannelId: string | null;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isLoading: true,
    isConnected: false,
    error: null,
    activeChannelId: null
  });

  const { sendMessage, sendNotification, isConnected } = useCommunication();
  const { channels, activeChannel, setActiveChannel, refreshChannels } = useChannels();

  // 初始化应用
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // 通知扩展UI已准备就绪
        sendNotification('ui-ready', { timestamp: Date.now() });

        // 获取渠道列表
        await refreshChannels();

        // 设置默认渠道
        if (channels.length > 0 && !activeChannel) {
          await setActiveChannel(channels[0].id);
        }

        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isConnected: true,
          activeChannelId: activeChannel?.id || null
        }));

      } catch (error) {
        console.error('App initialization failed:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message 
        }));
      }
    };

    initializeApp();
  }, []);

  // 监听连接状态变化
  useEffect(() => {
    setState(prev => ({ ...prev, isConnected }));
  }, [isConnected]);

  // 监听活动渠道变化
  useEffect(() => {
    setState(prev => ({ ...prev, activeChannelId: activeChannel?.id || null }));
  }, [activeChannel]);

  // 处理渠道切换
  const handleChannelChange = async (channelId: string) => {
    try {
      await setActiveChannel(channelId);
      sendNotification('channel-switched', { channelId });
    } catch (error) {
      console.error('Channel switch failed:', error);
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  // 处理错误重试
  const handleRetry = () => {
    setState(prev => ({ ...prev, error: null }));
    window.location.reload();
  };

  // 渲染加载状态
  if (state.isLoading) {
    return (
      <div className="app-loading">
        <LoadingSpinner message="正在初始化AI编码助手..." />
      </div>
    );
  }

  // 渲染错误状态
  if (state.error) {
    return (
      <div className="app-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>初始化失败</h3>
          <p>{state.error}</p>
          <div className="error-actions">
            <button onClick={handleRetry} className="retry-button">
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 渲染主界面
  return (
    <ErrorBoundary>
      <div className="app">
        <div className="app-header">
          <ChannelSelector
            channels={channels}
            activeChannelId={state.activeChannelId}
            onChannelChange={handleChannelChange}
            isConnected={state.isConnected}
          />
        </div>

        <div className="app-main">
          <ChatInterface
            activeChannel={activeChannel}
            isConnected={state.isConnected}
          />
        </div>

        <div className="app-footer">
          <StatusBar
            isConnected={state.isConnected}
            activeChannel={activeChannel}
            channelCount={channels.length}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;