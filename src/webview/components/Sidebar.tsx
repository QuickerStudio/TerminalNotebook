import React from 'react';
import FloatingButtons from './FloatingButtons';
import TabFolder from './TabFolder';
import './sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar-root">
      <FloatingButtons />
      <TabFolder />
    </div>
  );
};

export default Sidebar;
