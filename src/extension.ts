import * as vscode from 'vscode';
import { TreeData } from './TreeData';
import { TerminalManager } from './Terminal';
import { Favorites } from './Favorites';
import { Tabs } from './Tabs';

export function activate(context: vscode.ExtensionContext) {
  const treeData: TreeData = new TreeData(context);
  const favorites = new Favorites(context);
  const tabs = new Tabs(context);

  // 安全锁状态初始化
  const LOCK_KEY = 'terminalnotebook.locked';
  function isLocked() {
    return context.globalState.get(LOCK_KEY, false);
  }
  function setLocked(val: boolean) {
    context.globalState.update(LOCK_KEY, val);
    vscode.commands.executeCommand('setContext', 'terminalnotebook.locked', val);
  }

  // 注册切换安全锁命令
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.toggleLock', () => {
    const locked = isLocked();
    setLocked(!locked);
    vscode.window.showInformationMessage(!locked ? '已锁定，禁止执行命令' : '已解锁，可以执行命令');
  }));

  const treeView = vscode.window.createTreeView('terminalnotebook.view', {
    treeDataProvider: treeData
   , toolbar: [
     {
       command: 'terminalnotebook.exportTabs',
       tooltip: '导出标签',
       icon: 'cloud-upload',
     },
     {
       command: 'terminalnotebook.importTabs',
       tooltip: '导入标签',
       icon: 'cloud-download',
     },
     {
       command: 'terminalnotebook.toggleLock',
       tooltip: () => isLocked() ? '解锁，允许执行命令' : '锁定，禁止执行命令',
       icon: () => {
         // 优先使用 VS Code 内置图标
         if (isLocked()) {
           return 'lock'; // VS Code 内置锁定图标
         } else {
           return 'unlock'; // VS Code 内置开锁图标
         }
       },
     }
   ]
  });

  // Initialize favorites
  vscode.commands.executeCommand('setContext', 'terminalnotebook.hasFavorites', favorites.getFavorites().length > 0);
  favorites.updateFavoriteCommands();

  // Register commands
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.copyTabLabel', (labelOrItem: string | vscode.TreeItem) => {
    tabs.copyTabLabel(labelOrItem);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.addFavorite', (item: vscode.TreeItem) => {
    favorites.addFavorite(item, treeData);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.favoriteTabs', async () => {
    await favorites.showFavorites();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.manageFavorites', async () => {
    await favorites.manageFavorites(treeData);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.exportTabs', async () => {
    await tabs.exportTabs(treeData);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.importTabs', async () => {
    await tabs.importTabs(treeData);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.addTag', async () => {
    await tabs.addTab(treeData);
  }));

  treeView.title = 'TerminalNotebook';
  treeView.description = 'Manage and quickly execute terminal commands';

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.renameTab', async (item: vscode.TreeItem) => {
    await tabs.renameTab(item, treeData);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.deleteTab', (item: vscode.TreeItem) => {
    tabs.deleteTab(item, treeData);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.refreshView', () => {
    vscode.window.showInformationMessage('Refreshing view data...');
    treeData.refresh();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.openTerminal', (item: vscode.TreeItem) => {
    let cmd = '';
    if (isLocked()) {
      vscode.window.showWarningMessage('安全锁已开启，禁止执行命令');
      return;
    }
    if (item && item.label) {
      cmd = item.label.toString();
    }
    if (item && item.id && cmd) {
      TerminalManager.openAndRun(item.id.toString(), cmd);
    } else {
      vscode.window.showWarningMessage('Tab information is incomplete, cannot execute command');
    }
  }));
}

export function deactivate() {}
