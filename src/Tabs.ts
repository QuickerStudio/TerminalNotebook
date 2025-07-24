import * as vscode from 'vscode';
import { TreeData } from './TreeData';

export class Tabs {
  constructor(private context: vscode.ExtensionContext) {}

  async exportTabs(treeData: TreeData): Promise<void> {
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
  }

  async importTabs(treeData: TreeData): Promise<void> {
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
  }

  async addTab(treeData: TreeData): Promise<void> {
    const newLabel = await vscode.window.showInputBox({
      prompt: 'Please enter a new tab name',
      validateInput: (input: string) => input.trim() === '' ? 'Tab name cannot be empty' : undefined
    });
    if (newLabel) {
      const tabs = treeData.getTabs();
      const id = Date.now().toString();
      tabs.push({ id, label: newLabel });
      treeData.refresh();
      vscode.window.showInformationMessage(`Tab added: ${newLabel}`);
    }
  }

  async renameTab(item: vscode.TreeItem, treeData: TreeData): Promise<void> {
    const oldLabel = item.label?.toString() || '';
    const newLabel = await vscode.window.showInputBox({
      prompt: 'Update notebook',
      value: oldLabel,
      validateInput: (input: string) => input.trim() === '' ? 'Tab name cannot be empty' : undefined
    });
    if (newLabel && newLabel !== oldLabel) {
      const tabs = treeData.getTabs();
      const tab = tabs.find((t: { id: string }) => t.id === item.id);
      if (tab) {
        tab.label = newLabel;
        treeData.refresh();
      }
    }
  }

  deleteTab(item: vscode.TreeItem, treeData: TreeData): void {
    const tabs = treeData.getTabs();
    const idx = tabs.findIndex((t: { id: string }) => t.id === item.id);
    if (idx !== -1) {
      tabs.splice(idx, 1);
      treeData.refresh();
      vscode.window.showInformationMessage('Tab deleted');
    }
  }

  copyTabLabel(labelOrItem: string | vscode.TreeItem): void {
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
  }
}