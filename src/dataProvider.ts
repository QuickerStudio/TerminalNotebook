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
      // 首次使用时可初始化常用命令示例标签
      this.tabs = [
        { label: 'dir', id: 'terminal-1' }, // 查看当前目录（Windows）
        { label: 'node -v', id: 'terminal-2' }, // 查看 Node 版本
        { label: 'code .', id: 'terminal-3' }, // 用 VS Code 打开当前目录
        { label: 'help', id: 'terminal-4' }, // CMD 帮助
        { label: 'systeminfo', id: 'terminal-5' }, // 查看系统信息
        { label: 'yo', id: 'terminal-6' }, // 运行 yeoman 脚手架
        { label: 'npm install', id: 'terminal-7' }, // 安装 npm 依赖
        { label: 'npm update', id: 'terminal-8' }, // 更新 npm 依赖
        { label: 'git status', id: 'terminal-9' }, // 查看 Git 状态
        { label: 'git pull', id: 'terminal-10' }, // 拉取远程代码
        { label: 'git push', id: 'terminal-11' }, // 推送代码到远程
        { label: 'npm run build', id: 'terminal-12' }, // 构建项目
        { label: 'npm start', id: 'terminal-13' }, // 启动项目
        { label: 'npm run test', id: 'terminal-14' }, // 运行测试
        { label: 'npx create-react-app my-app', id: 'terminal-15' }, // 创建 React 项目
        { label: 'python --version', id: 'terminal-16' }, // 查看 Python 版本
        { label: 'pip install 包名', id: 'terminal-17' }, // 安装 Python 包
        { label: 'explorer .', id: 'terminal-18' }, // 打开资源管理器
        { label: 'cls', id: 'terminal-19' }, // 清屏（Windows）
        { label: 'clear', id: 'terminal-20' }, // 清屏（Linux/macOS）
        { label: 'echo Hello World', id: 'terminal-21' } // 输出文本
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