// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TreeData } from './TreeData';
import { TerminalManager } from './Terminal';

// For dynamic registration of favorite buttons
const favoriteDisposables: vscode.Disposable[] = [];
export function updateFavoriteCommands(context: vscode.ExtensionContext) {
  // Clean up old disposables first
  while (favoriteDisposables.length) {
    const d = favoriteDisposables.pop();
    if (d) { d.dispose(); }
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

// Maximum number of favorites displayed
const MAX_FAVORITES = 5;

function getFavorites(context: vscode.ExtensionContext): { label: string; id: string }[] {
  return context.globalState.get<{ label: string; id: string }[]>('terminalnotebook.favorites') || [];
}

function setFavorites(context: vscode.ExtensionContext, favorites: { label: string; id: string }[], treeData?: TreeData) {
  context.globalState.update('terminalnotebook.favorites', favorites);
  // setContext should be called after globalState update to ensure menu refresh
  setTimeout(() => {
    vscode.commands.executeCommand('setContext', 'terminalnotebook.hasFavorites', favorites.length > 0);
    updateFavoriteCommands(context);
    if (treeData) {
      treeData.refresh();
    }
  }, 10);
}

export function activate(context: vscode.ExtensionContext) {
  // Register copy command
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.copyTabLabel', (labelOrItem: string | vscode.TreeItem) => {
    let text = '';
    if (typeof labelOrItem === 'string') {
      text = labelOrItem;
    } else if (labelOrItem && labelOrItem.label) {
      text = labelOrItem.label.toString();
    }
    if (text) {
      vscode.env.clipboard.writeText(text);
      vscode.window.showInformationMessage(`Command copied: ${text}`);
    } else {
      vscode.window.showWarningMessage('No command found to copy');
    }
  }));
  // Initialize setContext to ensure menu displays correctly on first load
  vscode.commands.executeCommand('setContext', 'terminalnotebook.hasFavorites', getFavorites(context).length > 0);
  updateFavoriteCommands(context);
  // Create data provider instance
  const treeData: TreeData = new TreeData(context);
  // Create tree view
  const treeView = vscode.window.createTreeView('terminalnotebook.view', {
    treeDataProvider: treeData
  });

  // Add to favorites command
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.addFavorite', (item: vscode.TreeItem) => {
    const favorites = getFavorites(context);
    if (favorites.length >= MAX_FAVORITES) {
      vscode.window.showWarningMessage(`Favorites can have up to ${MAX_FAVORITES} tabs only.`);
      return;
    }
    // Avoid duplicate favorites
    if (favorites.some(f => f.id === item.id)) {
      vscode.window.showInformationMessage('This tab is already in favorites.');
      return;
    }
    favorites.push({ label: item.label?.toString() || '', id: item.id || '' });
    setFavorites(context, favorites, treeData);
    vscode.window.showInformationMessage('Added to favorites');
  }));

  // Favorite button command (show quick pick)
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.favoriteTabs', async () => {
    const favorites = getFavorites(context);
    if (favorites.length === 0) {
      vscode.window.showInformationMessage('Favorites is empty');
      return;
    }
    const pick = await vscode.window.showQuickPick(
      favorites.map(f => ({
        label: f.label,
        id: f.id,
        detail: f.label, // Show command line in detail as well
        alwaysShow: true,
        // VS Code QuickPick does not support custom icons, but emoji or special characters can be used
        description: '⭐',
        tooltip: f.label // Tooltip is kept for compatibility, though it does not take effect
      })),
      { placeHolder: 'Select a favorite command to execute' }
    );
    if (pick) {
      TerminalManager.openAndRun(pick.id, pick.label);
    }
    setFavorites(context, favorites, treeData);
    updateFavoriteCommands(context);
    vscode.window.showInformationMessage('Added to favorites');
  }));

  // Manage favorites command (delete)
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.manageFavorites', async () => {
    const favorites = getFavorites(context);
    if (favorites.length === 0) {
      vscode.window.showInformationMessage('Favorites is empty');
      return;
    }
    
    const items = favorites.map(f => ({
      label: f.label,
      description: 'Click to delete',
      favorite: f
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a favorite to delete'
    });

    if (selected) {
      const newFavorites = favorites.filter(f => f.id !== selected.favorite.id);
      setFavorites(context, newFavorites, treeData);
      updateFavoriteCommands(context);
      vscode.window.showInformationMessage(`Favorite deleted: ${selected.label}`);
    }
  }));
  // Register export tabs command
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.exportTabs', async () => {
    const tabs = treeData.getTabs();
    const exportData = {
      type: 'TerminalNotebookTabs',
      version: 1,
      tabs: tabs.map((tab: {label: string, id: string}) => ({ label: tab.label, id: tab.id }))
    };
    const uri = await vscode.window.showSaveDialog({
      filters: { 'TerminalNotebook Tabs': ['json'] },
      saveLabel: 'Export tab list as JSON file'
    });
    if (uri) {
      await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(exportData, null, 2), 'utf8'));
      vscode.window.showInformationMessage('Tab commands exported!');
    }
  }));
  // Initialize favorite buttons on activation
  updateFavoriteCommands(context);

  // Register import tabs command
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.importTabs', async () => {
    const uris = await vscode.window.showOpenDialog({
      canSelectMany: false,
      filters: { 'TerminalNotebook Tabs': ['json'] },
      openLabel: 'Import tab list JSON file'
    });
    if (uris && uris.length > 0) {
      try {
        const fileData = await vscode.workspace.fs.readFile(uris[0]);
        const json = JSON.parse(Buffer.from(fileData).toString('utf8'));
        if (json.type === 'TerminalNotebookTabs' && Array.isArray(json.tabs)) {
          // Merge imported tabs, avoid id conflicts
          const existing = treeData.getTabs();
          const newTabs = json.tabs.filter((t: { label: string }) => !existing.some((e: { label: string }) => e.label === t.label));
          existing.push(...newTabs.map((t: { label: string }) => ({ label: t.label, id: `terminal-${Date.now()}-${Math.random().toString(36).slice(2,8)}` })));
          treeData.refresh();
          vscode.window.showInformationMessage('Tab commands imported!');
        } else {
          vscode.window.showErrorMessage('File format incorrect, cannot import.');
        }
      } catch (e) {
        vscode.window.showErrorMessage('Import failed: ' + (e as Error).message);
      }
    }
  }));

  // Add tag button to toolbar
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.addTag', async () => {
    const newLabel = await vscode.window.showInputBox({
      prompt: 'Please enter a new tab name',
      validateInput: (input) => input.trim() === '' ? 'Tab name cannot be empty' : undefined
    });
    if (newLabel) {
      // Get current tab data
      const tabs = treeData.getTabs();
      // Generate unique id
      const id = Date.now().toString();
      // Add new tab
      tabs.push({ id, label: newLabel });
      treeData.refresh();
      vscode.window.showInformationMessage(`Tab added: ${newLabel}`);
    }
  }));

  // Add buttons to view title bar
  treeView.title = 'TerminalNotebook';
  treeView.description = 'Manage and quickly execute terminal commands';
  // Buttons are configured via package.json, commands already registered

  // Register rename command
  const renameTabCommand = vscode.commands.registerCommand('terminalnotebook.renameTab', async (item: vscode.TreeItem) => {
    const oldLabel = item.label?.toString() || '';
    const newLabel = await vscode.window.showInputBox({
      prompt: 'Update notebook',
      value: oldLabel,
      validateInput: (input) => input.trim() === '' ? 'Tab name cannot be empty' : undefined
    });
    if (newLabel && newLabel !== oldLabel) {
      // 修改数据
      const tabs = treeData.getTabs();
      const tab = tabs.find((t: { id: string }) => t.id === item.id);
      if (tab) {
        tab.label = newLabel;
        treeData.refresh();
      }
    }
  });
  context.subscriptions.push(renameTabCommand);

  // Register delete tab command
  const deleteTabCommand = vscode.commands.registerCommand('terminalnotebook.deleteTab', (item: vscode.TreeItem) => {
    const tabs = treeData.getTabs();
    const idx = tabs.findIndex((t: { id: string }) => t.id === item.id);
    if (idx !== -1) {
      tabs.splice(idx, 1);
      treeData.refresh();
      vscode.window.showInformationMessage('Tab deleted');
    }
  });
  context.subscriptions.push(deleteTabCommand);

  // Register data refresh command
  const refreshCommand = vscode.commands.registerCommand('terminalnotebook.refreshView', () => {
    vscode.window.showInformationMessage('Refreshing view data...');
    // Actual refresh logic will be handled in the Webview provider
  });
  context.subscriptions.push(refreshCommand);

  // Register command to execute when tab is clicked
  const openTerminalCommand = vscode.commands.registerCommand('terminalnotebook.openTerminal', (item: vscode.TreeItem) => {
    // item.id: unique tab id, item.label: tab title (command line)
    let cmd = '';
    if (item && item.label) {
      cmd = item.label.toString();
    }
    if (item && item.id && cmd) {
      TerminalManager.openAndRun(item.id.toString(), cmd);
    } else {
      vscode.window.showWarningMessage('Tab information is incomplete, cannot execute command');
    }
  });

  context.subscriptions.push(openTerminalCommand);
}

export function deactivate() {}
