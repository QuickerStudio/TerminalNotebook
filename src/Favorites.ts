import * as vscode from 'vscode';
import { TreeData } from './TreeData';
import { TerminalManager } from './Terminal';

const MAX_FAVORITES = 5;
const favoriteDisposables: vscode.Disposable[] = [];

export class Favorites {
  constructor(private context: vscode.ExtensionContext) {}

  getFavorites(): { label: string; id: string }[] {
    return this.context.globalState.get<{ label: string; id: string }[]>('terminalnotebook.favorites') || [];
  }

  setFavorites(favorites: { label: string; id: string }[], treeData?: TreeData): void {
    this.context.globalState.update('terminalnotebook.favorites', favorites);
    setTimeout(() => {
      vscode.commands.executeCommand('setContext', 'terminalnotebook.hasFavorites', favorites.length > 0);
      this.updateFavoriteCommands();
      if (treeData) {
        treeData.refresh();
      }
    }, 10);
  }

  updateFavoriteCommands(): void {
    while (favoriteDisposables.length) {
      const d = favoriteDisposables.pop();
      if (d) { d.dispose(); }
    }
    const favorites = this.getFavorites();
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

  addFavorite(item: vscode.TreeItem, treeData: TreeData): void {
    const favorites = this.getFavorites();
    if (favorites.length >= MAX_FAVORITES) {
      vscode.window.showWarningMessage(`Favorites can have up to ${MAX_FAVORITES} tabs only.`);
      return;
    }
    if (favorites.some(f => f.id === item.id)) {
      vscode.window.showInformationMessage('This tab is already in favorites.');
      return;
    }
    favorites.push({ label: item.label?.toString() || '', id: item.id || '' });
    this.setFavorites(favorites, treeData);
    vscode.window.showInformationMessage('Added to favorites');
  }

  async showFavorites(): Promise<void> {
    const favorites = this.getFavorites();
    if (favorites.length === 0) {
      vscode.window.showInformationMessage('Favorites is empty');
      return;
    }
    const pick = await vscode.window.showQuickPick(
      favorites.map(f => ({
        label: f.label,
        id: f.id,
        detail: f.label,
        alwaysShow: true,
        description: '⭐',
        tooltip: f.label
      })),
      { placeHolder: 'Select a favorite command to execute' }
    );
    if (pick) {
      TerminalManager.openAndRun(pick.id, pick.label);
    }
  }

  async manageFavorites(treeData: TreeData): Promise<void> {
    const favorites = this.getFavorites();
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
      this.setFavorites(newFavorites, treeData);
      this.updateFavoriteCommands();
      vscode.window.showInformationMessage(`Favorite deleted: ${selected.label}`);
    }
  }
}