import * as vscode from 'vscode';

/**
 * TerminalManager 用于根据标签点击自动执行标签标题对应的命令。
 */
export class TerminalManager {
  private static terminals: Map<string, vscode.Terminal> = new Map();

  /**
   * 打开终端并执行命令
   * @param id 标签唯一 id
   * @param label 标签标题（命令字符串）
   */
  static openAndRun(id: string, label: string) {
    // 如果已存在终端，先关闭
    if (TerminalManager.terminals.has(id)) {
      TerminalManager.terminals.get(id)?.dispose();
      TerminalManager.terminals.delete(id);
    }
    // 创建新终端
    const terminal = vscode.window.createTerminal({
      name: `TerminalNotebook-${label}`
    });
    TerminalManager.terminals.set(id, terminal);
    terminal.show();
    // 直接将标签标题作为命令执行
    if (label && label.trim() !== '') {
      terminal.sendText(label, true);
    }
  }

  /**
   * 关闭所有终端
   */
  static disposeAll() {
    for (const term of TerminalManager.terminals.values()) {
      term.dispose();
    }
    TerminalManager.terminals.clear();
  }
}
