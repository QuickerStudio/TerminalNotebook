// ...existing code...
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DataProvider } from './dataProvider';
import { TerminalManager } from './Terminal';

export function activate(context: vscode.ExtensionContext) {
  console.log('TerminalNotebook extension is now active!');

  // 创建数据提供程序实例
  const dataProvider = new DataProvider(context);

  // 注册树视图数据提供程序
  vscode.window.registerTreeDataProvider('terminalnotebook.view', dataProvider);

  // 创建树视图并添加工具栏
  const treeView = vscode.window.createTreeView('terminalnotebook.view', {
    treeDataProvider: dataProvider
  });

  // 添加标签按钮到工具栏
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.addTag', async () => {
    const newLabel = await vscode.window.showInputBox({
      prompt: '请输入新标签名',
      validateInput: (input) => input.trim() === '' ? '标签不能为空' : undefined
    });
    if (newLabel) {
      // 获取当前标签数据
      const tabs = dataProvider.getTabs();
      // 生成唯一 id
      const id = Date.now().toString();
      // 添加新标签
      tabs.push({ id, label: newLabel });
      dataProvider.refresh();
      vscode.window.showInformationMessage(`已添加标签：${newLabel}`);
    }
  }));

  // 在视图标题栏添加按钮
  treeView.title = 'TerminalNotebook';
  treeView.description = '标签管理';

  // 注册重命名命令
  const renameTabCommand = vscode.commands.registerCommand('terminalnotebook.renameTab', async (item: vscode.TreeItem) => {
    const oldLabel = item.label?.toString() || '';
    const newLabel = await vscode.window.showInputBox({
      prompt: '重命名标签',
      value: oldLabel,
      validateInput: (input) => input.trim() === '' ? '标签不能为空' : undefined
    });
    if (newLabel && newLabel !== oldLabel) {
      // 修改数据
      const tabs = dataProvider.getTabs();
      const tab = tabs.find((t: { id: string }) => t.id === item.id);
      if (tab) {
        tab.label = newLabel;
        dataProvider.refresh();
      }
    }
  });
  context.subscriptions.push(renameTabCommand);

  // 注册删除标签命令
  const deleteTabCommand = vscode.commands.registerCommand('terminalnotebook.deleteTab', (item: vscode.TreeItem) => {
    const tabs = dataProvider.getTabs();
    const idx = tabs.findIndex((t: { id: string }) => t.id === item.id);
    if (idx !== -1) {
      tabs.splice(idx, 1);
      dataProvider.refresh();
      vscode.window.showInformationMessage('标签已删除');
    }
  });
  context.subscriptions.push(deleteTabCommand);

  // 注册数据刷新命令
  const refreshCommand = vscode.commands.registerCommand('terminalnotebook.refreshView', () => {
    vscode.window.showInformationMessage('刷新视图数据...');
    // 实际刷新逻辑将在 Webview 提供程序中处理
  });
  context.subscriptions.push(refreshCommand);

  // 注册点击标签后自动执行命令
  const openTerminalCommand = vscode.commands.registerCommand('terminalnotebook.openTerminal', (item: vscode.TreeItem) => {
    // item.id: 标签唯一 id，item.label: 标签标题（命令行）
    let cmd = '';
    if (item && item.label) {
      cmd = item.label.toString();
    }
    if (item && item.id && cmd) {
      TerminalManager.openAndRun(item.id.toString(), cmd);
    } else {
      vscode.window.showWarningMessage('标签信息不完整，无法执行命令');
    }
  });
  context.subscriptions.push(openTerminalCommand);

}



// This method is called when your extension is deactivated
export function deactivate() {}

