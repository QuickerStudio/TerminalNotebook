// ...existing code...
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DataProvider } from './dataProvider';

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
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.addTag', () => {
    vscode.window.showInformationMessage('标签功能已触发');
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

  // 注册数据刷新命令
  const refreshCommand = vscode.commands.registerCommand('terminalnotebook.refreshView', () => {
    vscode.window.showInformationMessage('刷新视图数据...');
    // 实际刷新逻辑将在 Webview 提供程序中处理
  });
  context.subscriptions.push(refreshCommand);

  // 注册打开终端命令
  const openTerminalCommand = vscode.commands.registerCommand('terminalnotebook.openTerminal', (terminalId: string) => {
    const terminal = vscode.window.createTerminal(`TerminalNotebook-${terminalId}`);
    terminal.show();
  });
  context.subscriptions.push(openTerminalCommand);

  // 保留 helloWorld 命令
  const disposable = vscode.commands.registerCommand('terminalnotebook.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from TerminalNotebook!');
  });
  context.subscriptions.push(disposable);
}



// This method is called when your extension is deactivated
export function deactivate() {}

