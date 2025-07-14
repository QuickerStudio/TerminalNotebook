import React from 'react';
import './floatingButtons.css';

const FloatingButtons: React.FC = () => {
  return (
    <div className="floating-buttons">
      <button title="新建标签" className="float-btn">➕</button>
      <button title="群组" className="float-btn">👥</button>
      <button title="展开/折叠" className="float-btn">⏷</button>
    </div>
  );
};

export default FloatingButtons;
