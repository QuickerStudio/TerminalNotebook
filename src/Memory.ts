import * as vscode from 'vscode';

export class Memory {
  private static readonly STORAGE_KEY = 'terminalnotebook.tabs';
  private static readonly FAVORITES_KEY = 'terminalnotebook.favorites';

  constructor(private context: vscode.ExtensionContext) {}

  saveTabs(tabs: { label: string; id: string }[]): void {
    this.context.globalState.update(Memory.STORAGE_KEY, tabs);
  }

  loadTabs(): { label: string; id: string }[] | null {
    return this.context.globalState.get<{ label: string; id: string }[]>(Memory.STORAGE_KEY) || null;
  }

  saveFavorites(favorites: { label: string; id: string }[]): void {
    this.context.globalState.update(Memory.FAVORITES_KEY, favorites);
  }

  loadFavorites(): { label: string; id: string }[] {
    return this.context.globalState.get<{ label: string; id: string }[]>(Memory.FAVORITES_KEY) || [];
  }

  clearAllData(): void {
    this.context.globalState.update(Memory.STORAGE_KEY, undefined);
    this.context.globalState.update(Memory.FAVORITES_KEY, undefined);
  }

  exportData(): any {
    return {
      tabs: this.loadTabs(),
      favorites: this.loadFavorites()
    };
  }

  importData(data: any): void {
    if (data.tabs) {
      this.saveTabs(data.tabs);
    }
    if (data.favorites) {
      this.saveFavorites(data.favorites);
    }
  }
}