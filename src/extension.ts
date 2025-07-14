// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('TerminalNotebook extension is now active!');

  // 注册侧边栏视图
  context.subscriptions.push(
	vscode.window.registerWebviewViewProvider('terminalnotebook.sidebar', new TerminalNotebookSidebarProvider(context))
  );

  // 保留 helloWorld 命令
  const disposable = vscode.commands.registerCommand('terminalnotebook.helloWorld', () => {
	vscode.window.showInformationMessage('Hello World from TerminalNotebook!');
  });
  context.subscriptions.push(disposable);
}

class TerminalNotebookSidebarProvider implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
	webviewView.webview.options = {
	  enableScripts: true,
	  localResourceRoots: [
		vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
		vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview')
	  ]
	};
	webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

	// 监听前端消息
	webviewView.webview.onDidReceiveMessage(msg => {
	  // 这里可根据 msg.command 处理前端请求
	  if (msg.command === 'runTerminalCommand') {
		const terminal = vscode.window.createTerminal('TerminalNotebook');
		terminal.sendText(msg.text || 'echo Hello from TerminalNotebook');
		terminal.show();
	  }
	});
  }

  getHtmlForWebview(webview: vscode.Webview): string {
	const scriptUri = webview.asWebviewUri(
	  vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.js')
	);
	const styleUri = webview.asWebviewUri(
	  vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview', 'app.css')
	);
	return `<!DOCTYPE html>
	  <html lang="zh-cn">
	  <head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" href="${styleUri}">
		<title>TerminalNotebook</title>
	  </head>
	  <body>
		<div id="root"></div>
		<script src="${scriptUri}"></script>
	  </body>
	  </html>`;
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
