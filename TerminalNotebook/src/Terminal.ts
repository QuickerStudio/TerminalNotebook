import * as vscode from 'vscode';

export class TerminalManager {
  private static terminals: Map<string, vscode.Terminal> = new Map();

  static openAndRun(id: string, label: string) {
    if (TerminalManager.terminals.has(id)) {
      TerminalManager.terminals.get(id)?.dispose();
      TerminalManager.terminals.delete(id);
    }
    const terminal = vscode.window.createTerminal({
      name: `TerminalNotebook-${label}`
    });
    TerminalManager.terminals.set(id, terminal);
    terminal.show();
    if (label && label.trim() !== '') {
      terminal.sendText(label, true);
    }
  }

  static disposeAll() {
    for (const term of TerminalManager.terminals.values()) {
      term.dispose();
    }
    TerminalManager.terminals.clear();
  }
}
