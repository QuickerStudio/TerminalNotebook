import React from 'react';
import './floatingButtons.css';

const FloatingButtons: React.FC = () => {
  const handleAddTab = () => {
    vscode.postMessage({
      command: 'addTab',
      label: `终端会话 ${Math.floor(Math.random() * 1000)}`
    });
  };

  return (
    <div className="floating-buttons">
      <button 
        title="新建标签" 
        className="float-btn"
        onClick={handleAddTab}
      >➕</button>
      <button title="群组" className="float-btn">👥</button>
      <button title="展开/折叠" className="float-btn">⏷</button>
    </div>
  );
};

declare const vscode: any;

export default FloatingButtons;
