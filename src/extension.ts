import * as vscode from 'vscode';
import { TreeData } from './TreeData';
import { TerminalManager } from './Terminal';
import { Favorites } from './Favorites';
import { Tabs } from './Tabs';

export function activate(context: vscode.ExtensionContext) {
  const treeData: TreeData = new TreeData(context);
  const favorites = new Favorites(context);
  const tabs = new Tabs(context);

  const treeView = vscode.window.createTreeView('terminalnotebook.view', {
    treeDataProvider: treeData
  });

  // Initialize favorites
  vscode.commands.executeCommand('setContext', 'terminalnotebook.hasFavorites', favorites.getFavorites().length > 0);
  favorites.updateFavoriteCommands();

  // Register commands
  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.copyTabLabel', (labelOrItem: string | vscode.TreeItem) => {
    tabs.copyTabLabel(labelOrItem);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.addFavorite', (item: vscode.TreeItem) => {
    favorites.addFavorite(item, treeData);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.favoriteTabs', async () => {
    await favorites.showFavorites();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.manageFavorites', async () => {
    await favorites.manageFavorites(treeData);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.exportTabs', async () => {
    await tabs.exportTabs(treeData);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.importTabs', async () => {
    await tabs.importTabs(treeData);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.addTag', async () => {
    await tabs.addTab(treeData);
  }));

  treeView.title = 'TerminalNotebook';
  treeView.description = 'Manage and quickly execute terminal commands';

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.renameTab', async (item: vscode.TreeItem) => {
    await tabs.renameTab(item, treeData);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.deleteTab', (item: vscode.TreeItem) => {
    tabs.deleteTab(item, treeData);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.refreshView', () => {
    vscode.window.showInformationMessage('Refreshing view data...');
    treeData.refresh();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('terminalnotebook.openTerminal', (item: vscode.TreeItem) => {
    let cmd = '';
    if (item && item.label) {
      cmd = item.label.toString();
    }
    if (item && item.id && cmd) {
      TerminalManager.openAndRun(item.id.toString(), cmd);
    } else {
      vscode.window.showWarningMessage('Tab information is incomplete, cannot execute command');
    }
  }));
}

export function deactivate() {}
