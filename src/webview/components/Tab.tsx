import React from 'react';
import './tab.css';

const Tab: React.FC = () => {
  return (
    <div className="tab">
      <span className="drag-handle">☰</span>
      <input className="tab-input" placeholder="自定义信息" />
      <button className="exec-btn" title="执行终端命令">▶️</button>
      <button className="close-btn" title="删除">✖️</button>
    </div>
  );
};

export default Tab;
