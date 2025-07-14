// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DataProvider } from './dataProvider';
import { TerminalManager } from './Terminal';

// 收藏夹最多显示数量
const MAX_FAVORITES = 5;

function getFavorites(context: vscode.ExtensionContext): { label: string; id: string }[] {
  return context.globalState.get<{ label: string; id: string }[]>('terminalnotebook.favorites') || [];
}

function setFavorites(context: vscode.ExtensionContext, favorites: { label: string; id: string }[], dataProvider?: DataProvider) {
  context.globalState.update('terminalnotebook.favorites', favorites);
  // setContext 需等待 globalState 更新后再调用，确保菜单刷新
  setTimeout(() => {
    vscode.commands.executeCommand('setContext', 'terminalnotebook.hasFavorites', favorites.length > 0);
    if (dataProvider) {
      dataProvider.refresh();
    }
  }, 10);
}

export function activate(context: vscode.ExtensionContext) {
  // 初始化 setContext，确保菜单首次显示正确
  vscode.commands.executeCommand('setContext', 'terminalnotebook.hasFavorites', getFavorites(context).length > 0);
  // 创建数据提供程序实例
  const dataProvider = new DataProvider(context);
  // 创建树视图
  const treeView = vscode.window.createTreeView('terminalnotebook.view', {
    treeDataProvider: dataProvider
  });

  // 添加到收藏夹命令
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.addFavorite', (item: vscode.TreeItem) => {
    const favorites = getFavorites(context);
    if (favorites.length >= MAX_FAVORITES) {
      vscode.window.showWarningMessage(`收藏夹最多只能有${MAX_FAVORITES}个标签。`);
      return;
    }
    // 避免重复收藏
    if (favorites.some(f => f.id === item.id)) {
      vscode.window.showInformationMessage('该标签已在收藏夹中。');
      return;
    }
    favorites.push({ label: item.label?.toString() || '', id: item.id || '' });
    setFavorites(context, favorites, dataProvider);
    vscode.window.showInformationMessage('已添加到收藏夹');
  }));

  // 收藏夹按钮命令（弹出快速选择）
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.favoriteTabs', async () => {
    const favorites = getFavorites(context);
    if (favorites.length === 0) {
      vscode.window.showInformationMessage('收藏夹为空');
      return;
    }
    const pick = await vscode.window.showQuickPick(
      favorites.map(f => ({
        label: f.label,
        id: f.id,
        detail: f.label, // 让 detail 也显示命令行
        alwaysShow: true,
        // VS Code QuickPick 不支持自定义图标，但可以用 emoji 或特殊字符
        description: '⭐',
        tooltip: f.label // 虽然 tooltip 不生效，但保留字段
      })),
      { placeHolder: '选择要执行的收藏命令' }
    );
    if (pick) {
      TerminalManager.openAndRun(pick.id, pick.label);
    }
    setFavorites(context, favorites, dataProvider);
    updateFavoriteCommands();
    vscode.window.showInformationMessage('已添加到收藏夹');
  }));

  // 管理收藏夹命令（删除）
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.manageFavorites', async () => {
    const favorites = getFavorites(context);
    if (favorites.length === 0) {
      vscode.window.showInformationMessage('收藏夹为空');
      return;
    }
    
    const items = favorites.map(f => ({
      label: f.label,
      description: '点击删除',
      favorite: f
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: '选择要删除的收藏项'
    });

    if (selected) {
      const newFavorites = favorites.filter(f => f.id !== selected.favorite.id);
      setFavorites(context, newFavorites, dataProvider);
      updateFavoriteCommands();
      vscode.window.showInformationMessage(`已删除收藏: ${selected.label}`);
    }
  }));

  // 动态注册/更新收藏夹按钮命令
  const favoriteDisposables: vscode.Disposable[] = [];
  function updateFavoriteCommands() {
    // 先清理旧的 disposable
    while (favoriteDisposables.length) {
      const d = favoriteDisposables.pop();
      if (d) d.dispose();
    }
    const favorites = getFavorites(context);
    for (let i = 0; i < 5; i++) {
      const fav = favorites[i];
      const visible = !!fav;
      vscode.commands.executeCommand('setContext', `terminalnotebook.favorite${i}Visible`, visible);
      if (visible) {
        const cmd = `terminalnotebook.favorite${i}`;
        favoriteDisposables.push(vscode.commands.registerCommand(cmd, () => {
          TerminalManager.openAndRun(fav.id, fav.label);
        }));
      }
    }
  }

  // 树视图工具栏

  // 注册导出标签命令
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.exportTabs', async () => {
    const tabs = dataProvider.getTabs();
    const exportData = {
      type: 'TerminalNotebookTabs',
      version: 1,
      tabs: tabs.map(tab => ({ label: tab.label, id: tab.id }))
    };
    const uri = await vscode.window.showSaveDialog({
      filters: { 'TerminalNotebook Tabs': ['json'] },
      saveLabel: '导出标签列表为 JSON 文件'
    });
    if (uri) {
      await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(exportData, null, 2), 'utf8'));
      vscode.window.showInformationMessage('标签命令已导出！');
    }
  }));
  // 激活时初始化收藏按钮
  updateFavoriteCommands();

  // 注册导入标签命令
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.importTabs', async () => {
    const uris = await vscode.window.showOpenDialog({
      canSelectMany: false,
      filters: { 'TerminalNotebook Tabs': ['json'] },
      openLabel: '导入标签列表 JSON 文件'
    });
    if (uris && uris.length > 0) {
      try {
        const fileData = await vscode.workspace.fs.readFile(uris[0]);
        const json = JSON.parse(Buffer.from(fileData).toString('utf8'));
        if (json.type === 'TerminalNotebookTabs' && Array.isArray(json.tabs)) {
          // 合并导入的标签，避免 id 冲突
          const existing = dataProvider.getTabs();
          const newTabs = json.tabs.filter((t: { label: string }) => !existing.some((e: { label: string }) => e.label === t.label));
          existing.push(...newTabs.map((t: { label: string }) => ({ label: t.label, id: `terminal-${Date.now()}-${Math.random().toString(36).slice(2,8)}` })));
          dataProvider.refresh();
          vscode.window.showInformationMessage('标签命令已导入！');
        } else {
          vscode.window.showErrorMessage('文件格式不正确，无法导入。');
        }
      } catch (e) {
        vscode.window.showErrorMessage('导入失败：' + (e as Error).message);
      }
    }
  }));

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
  // 通过 package.json 配置按钮，命令已注册

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
