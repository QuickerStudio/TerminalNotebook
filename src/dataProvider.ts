import * as vscode from 'vscode';

export class DataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private tabs: { label: string; id: string }[] = [];
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private readonly storageKey = 'terminalnotebook.tabs';

  constructor(private readonly context: vscode.ExtensionContext) {
    this.loadTabs();
  }

  // 加载本地持久化标签
  private loadTabs() {
    const saved = this.context.globalState.get<{ label: string; id: string }[]>(this.storageKey);
    if (saved && Array.isArray(saved)) {
      this.tabs = saved;
    } else {
      // 首次使用时可初始化示例数据
      this.tabs = [
        { label: '终端会话 1', id: 'terminal-1' },
        { label: '终端会话 2', id: 'terminal-2' },
      ];
      this.saveTabs();
    }
  }

  // 保存标签到本地
  private saveTabs() {
    this.context.globalState.update(this.storageKey, this.tabs);
  }

  // 获取所有标签页数据
  public getTabs(): { label: string; id: string }[] {
    return this.tabs;
  }

  // 添加新标签页
  public addTab(label: string): void {
    const newTab = {
      label,
      id: `terminal-${Date.now()}`,
    };
    this.tabs.push(newTab);
    this.saveTabs();
    this.refresh();
  }

  // 刷新视图
  public refresh(): void {
    this.saveTabs();
    this._onDidChangeTreeData.fire();
  }

  // 实现 TreeDataProvider 接口
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
        // 使标签可编辑和可删除
        item.contextValue = 'editableTab deletableTab';
        item.description = '';
        item.tooltip = '右键重命名标签';
        // 设置自定义图标
        item.iconPath = this.context.asAbsolutePath('src/icons-terminal.png');
        // 设置 command，点击标签自动执行命令
        item.command = {
          command: 'terminalnotebook.openTerminal',
          title: '在终端执行标签命令',
          arguments: [item]
        };
        return item;
      })
    );
  }
}