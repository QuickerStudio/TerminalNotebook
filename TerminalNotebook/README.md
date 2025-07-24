

# TerminalNotebook 🚀

![TerminalNotebook Demo](https://github.com/QuickerStudio/TerminalNotebook/blob/main/Main.png)

**VS Code Terminal Command Notebook**  
Manage and quickly execute terminal commands to boost your development efficiency.

[![VS Code Version](https://img.shields.io/badge/VS%20Code-1.80%2B-blue?logo=visualstudiocode)](https://code.visualstudio.com/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)  
[![GitHub Stars](https://img.shields.io/github/stars/QuickerStudio/TerminalNotebook?style=social)](https://github.com/QuickerStudio/TerminalNotebook/stargazers)

> Manage terminal commands like Jupyter Notebook in VS Code, mixing commands, outputs, and documentation.

---

## ✨ Core Features

- **Notebook-style management**: Group, rename, and favorite frequently used commands
- **One-click execution**: Quickly run preset or custom commands
- **Mixed documentation**: Add Markdown notes and explanations between commands
- **Multi-session management**: Manage multiple terminal sessions with tabs
- **Import/Export**: Easily share command notebooks
- **History**: View and reuse previously executed commands

---

## 🚀 Quick Start

### 1. Install Extension

- Search for `TerminalNotebook` in the VS Code Extension Marketplace
- Or install via command line:
  ```sh
  ext install quickerstudio.terminalnotebook
  ```
- Or manual installation:
  1. Download the `.vsix` file
  2. Run:
     ```sh
     code --install-extension TerminalNotebook-X.X.X.vsix
     ```

### 2. Basic Usage

1. Click the TerminalNotebook icon in the Activity Bar
2. Create a new notebook or open a sample notebook
3. Add a command cell:
   - `Cmd+Shift+P` > `TerminalNotebook: Add Command Cell`
4. Execute a command: Click the ▶️ button on the left of the cell

### 3. Advanced Tips

- Add a Markdown cell:
  - `Cmd+Shift+P` > `Add Markdown Cell`
- Export notebook:
  - Right-click notebook > `Export as HTML/PDF`
- Set frequently used commands:
  - Configure in settings: `terminalnotebook.presets`

---

## 🌟 Usage Scenarios

### 🚀 Project Startup Workflow

```sh
npm install
npm run build
npm start
```

**Note**  
This workflow helps reduce repetitive typing and improve efficiency.

---

### 📦 Common Environment Setup Commands

```sh
# Node.js Environment
nvm install --lts         # Install latest LTS version of Node.js
nvm use --lts             # Switch to latest LTS version
node -v                   # Check Node.js version
npm -v                    # Check npm version

# Python Environment
python --version          # Check Python version
pip install -r requirements.txt   # Install dependencies
python -m venv venv       # Create virtual environment
source venv/bin/activate  # Activate virtual environment (Linux/macOS)
venv\Scripts\activate     # Activate virtual environment (Windows)

# Git Commands
git clone <repo-url>      # Clone repository
git status                # Check status
git pull                  # Pull latest code
git checkout -b <branch>  # Create and switch branch

# Docker Commands
docker build -t myapp .   # Build image
docker run -d -p 8080:80 myapp  # Run container
docker ps                 # List running containers
docker-compose up -d      # Start services in background
```

---

## 🤝 Contributing

We welcome contributions via Issues and PRs!
Please read the Contribution Guide for details and standards.


### 📌 High Priority Contributions

- Unit test coverage
- CI/CD pipeline optimization
- Documentation temporary storage
- TODO list support
- Work notes
- Terminal error log saving
- Terminal output syntax highlighting support

---

## 📜 License

MIT License © 2023 QuickerStudio

Maintained by the QuickerStudio Team

---

📮 [Issue Feedback](#) ｜ 💡 [Feature Request](#) ｜ 👥 [Join Discord](#)
