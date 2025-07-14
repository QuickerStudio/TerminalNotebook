import * as vscode from 'vscode';

export class TreeData implements vscode.TreeDataProvider<vscode.TreeItem> {
  private tabs: { label: string; id: string }[] = [];
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private readonly storageKey = 'terminalnotebook.tabs';

  constructor(private readonly context: vscode.ExtensionContext) {
    this.loadTabs();
  }

  private loadTabs() {
    const saved = this.context.globalState.get<{ label: string; id: string }[]>(this.storageKey);
    if (saved && Array.isArray(saved)) {
      this.tabs = saved;
    } else {
      this.tabs = [
        { label: 'dir', id: 'terminal-1' },
        { label: 'node -v', id: 'terminal-2' },
        { label: 'code .', id: 'terminal-3' },
        { label: 'help', id: 'terminal-4' },
        { label: 'systeminfo', id: 'terminal-5' },
        { label: 'yo', id: 'terminal-6' },
        { label: 'npm install', id: 'terminal-7' },
        { label: 'npm update', id: 'terminal-8' },
        { label: 'git status', id: 'terminal-9' },
        { label: 'git pull', id: 'terminal-10' },
        { label: 'git push', id: 'terminal-11' },
        { label: 'npm run build', id: 'terminal-12' },
        { label: 'npm start', id: 'terminal-13' },
        { label: 'npm run test', id: 'terminal-14' },
        { label: 'npx create-react-app my-app', id: 'terminal-15' },
        { label: 'python --version', id: 'terminal-16' },
        { label: 'pip install package_name', id: 'terminal-17' },
        { label: 'explorer .', id: 'terminal-18' },
        { label: 'cls', id: 'terminal-19' },
        { label: 'clear', id: 'terminal-20' },
        { label: 'echo Hello World', id: 'terminal-21' }
      ];
      this.saveTabs();
    }
  }

  private saveTabs() {
    this.context.globalState.update(this.storageKey, this.tabs);
  }

  public getTabs(): { label: string; id: string }[] {
    return this.tabs;
  }

  public static copyToClipboard(text: string) {
    vscode.env.clipboard.writeText(text);
    vscode.window.showInformationMessage(`Command copied: ${text}`);
  }

  public addTab(label: string): void {
    const newTab = {
      label,
      id: `terminal-${Date.now()}`,
    };
    this.tabs.push(newTab);
    this.saveTabs();
    this.refresh();
  }

  public refresh(): void {
    this.saveTabs();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    return Promise.resolve(
      this.tabs.map(tab => {
        const item = new vscode.TreeItem(tab.label, vscode.TreeItemCollapsibleState.None);
        item.id = tab.id;
        item.contextValue = 'editableTab deletableTab copyableTab';
        item.description = '';
        item.tooltip = 'Click to execute command immediately';
        item.iconPath = this.context.asAbsolutePath('icons-terminal.png');
        item.command = {
          command: 'terminalnotebook.openTerminal',
          title: 'Run tab command in terminal',
          arguments: [item]
        };
        return item;
      })
    );
  }
}
