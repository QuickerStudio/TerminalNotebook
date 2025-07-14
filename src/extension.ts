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
