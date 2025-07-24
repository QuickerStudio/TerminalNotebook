import * as vscode from 'vscode';

export class TerminalManager {
  private static terminals: Map<string, vscode.Terminal> = new Map();
  private static lockChecker: (() => boolean) | null = null;

  static setLockChecker(checker: () => boolean) {
    TerminalManager.lockChecker = checker;
  }

  static openAndRun(id: string, label: string) {
    // 检查安全锁状态
    if (TerminalManager.lockChecker && TerminalManager.lockChecker()) {
      vscode.window.showWarningMessage('安全锁已开启，禁止执行命令');
      return;
    }

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
