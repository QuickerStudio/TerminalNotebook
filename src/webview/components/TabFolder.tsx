import React from 'react';
import Tab from './Tab';
import './tabFolder.css';

const TabFolder: React.FC = () => {
  // 这里后续可用 useState 管理标签列表
  return (
    <div className="tab-folder">
      {/* 示例标签，后续可用 map 渲染 */}
      <Tab />
      <Tab />
    </div>
  );
};

export default TabFolder;
