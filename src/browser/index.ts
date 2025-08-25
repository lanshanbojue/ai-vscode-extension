/**
 * 浏览器模块索引文件
 */

// 导出所有模块
export * from './BrowserManager';
export * from './BrowserPool';
export * from './ElementLocator';
export * from './PageInteractor';
export * from './ResponseCapture';

// 默认导出
export { BrowserManager as default } from './BrowserManager';