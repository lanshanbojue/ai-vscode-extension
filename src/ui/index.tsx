/**
 * React应用主入口
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles/index.css';

// 确保DOM已加载
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (!container) {
    console.error('Root container not found');
    return;
  }

  // 移除加载状态
  container.innerHTML = '';

  // 创建React根实例
  const root = createRoot(container);
  
  // 渲染应用
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('AI编码助手UI已启动');
});