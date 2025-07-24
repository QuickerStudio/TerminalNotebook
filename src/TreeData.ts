import * as vscode from 'vscode';
import { Memory } from './Memory';
import { DEFAULT_TABS } from './Default';

export class TreeData implements vscode.TreeDataProvider<vscode.TreeItem> {
  private tabs: { label: string; id: string }[] = [];
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private memory: Memory;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.memory = new Memory(context);
    this.loadTabs();
  }

  private loadTabs() {
    const saved = this.memory.loadTabs();
    if (saved && Array.isArray(saved)) {
      this.tabs = saved;
    } else {
      this.tabs = [...DEFAULT_TABS];
      this.saveTabs();
    }
  }

  private saveTabs() {
    this.memory.saveTabs(this.tabs);
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
