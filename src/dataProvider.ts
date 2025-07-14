import * as vscode from 'vscode';

export class DataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private tabs: { label: string; id: string }[] = [];
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.initializeSampleData();
  }

  // 初始化示例数据
  private initializeSampleData() {
    this.tabs = [
      { label: '终端会话 1', id: 'terminal-1' },
      { label: '终端会话 2', id: 'terminal-2' },
    ];
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
    this.refresh();
  }

  // 刷新视图
  public refresh(): void {
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
        // 使标签可编辑
        item.contextValue = 'editableTab';
        item.description = '';
        item.tooltip = '右键重命名标签';
        // 设置自定义图标
        item.iconPath = this.context.asAbsolutePath('src/icons-terminal.png');
        // 不再设置 command，禁用单击/双击重命名
        return item;
      })
    );
  }
}