import React, { useState, useEffect } from 'react';
import Tab from './Tab';
import './tabFolder.css';

const TabFolder: React.FC = () => {
  const [tabs, setTabs] = useState<{ label: string; id: string }[]>([]);

  // 监听来自扩展的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === 'updateTabs') {
        setTabs(message.data);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // 初始加载时请求标签数据
    vscode.postMessage({
      command: 'getTabs'
    });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="tab-folder">
      {tabs.map((tab) => (
        <Tab key={tab.id} label={tab.label} />
      ))}
    </div>
  );
};

// 声明 vscode API
declare const vscode: any;

export default TabFolder;
