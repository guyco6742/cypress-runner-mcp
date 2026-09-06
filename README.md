# 🧪 Cypress MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0-green.svg)](https://modelcontextprotocol.io/)

A **Model Context Protocol (MCP)** server that enables AI agents (like Claude, GPT, etc.) to interact with and control Cypress test runners. This allows AI assistants to run tests, monitor execution, retrieve results, and manage test artifacts directly.

---

## 🚀 Features

- ✅ **Run Cypress tests** via AI commands
- 📊 **Real-time test monitoring** with live output
- 🎯 **Flexible test execution** (single spec, filtered tests, or entire suites)
- 📸 **Screenshot and video management** for test failures
- 🔍 **Test discovery** - automatically list all available spec files
- ⏹️ **Process control** - start, stop, and monitor test runs
- 🌐 **Multi-browser support** (Chrome, Firefox, Edge, Electron)
- 🔄 **Background execution** - tests run asynchronously
- 📝 **Detailed status reporting** with exit codes and duration

---

## 📋 Table of Contents

- [Installation](#-installation)
- [Configuration](#-configuration)
- [Available Tools](#-available-tools)
- [Usage Examples](#-usage-examples)
- [Resources](#-resources)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📦 Installation

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **pnpm** or **yarn**
- **Cypress** installed in your project
- An MCP-compatible client (e.g., Cursor IDE, Claude Desktop)

### Install Dependencies

```bash
# Clone the repository
git clone https://github.com/guyco6742/cypress-runner-mcp.git
cd cypress-runner-mcp

# Install dependencies (choose one)
npm install
# or
pnpm install
# or
yarn install
```

### Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

---

## ⚙️ Configuration

### For Cursor IDE

Add this configuration to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "cypress-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/cypress-mcp-server/dist/index.js"],
      "env": {
        "CYPRESS_WORKSPACE": "/absolute/path/to/your/cypress/project"
      }
    }
  }
}
```

### For Claude Desktop

Add this to your Claude Desktop MCP config file:

**macOS/Linux:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cypress-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/cypress-mcp-server/dist/index.js"],
      "env": {
        "CYPRESS_WORKSPACE": "/absolute/path/to/your/cypress/project"
      }
    }
  }
}
```

### Environment Variables

- `CYPRESS_WORKSPACE`: (Required) Absolute path to your Cypress project root directory

### Restart Your Client

After configuration, restart Cursor IDE or Claude Desktop for changes to take effect.

---

## 🔧 Available Tools

### `cypress_run_spec`

Run a specific Cypress test spec file.

**Parameters:**
- `spec` (required): Path to spec file relative to workspace (e.g., `cypress/e2e/login.cy.ts`)
- `browser` (optional): Browser to use (`chrome`, `firefox`, `electron`, `edge`) - default: `chrome`
- `headed` (optional): Run with visible browser window - default: `true`
- `grep` (optional): Run only tests matching this pattern (test title filter)

**Example:**
```
Run the login test in Chrome with headed mode
```

---

### `cypress_run_all`

Run all Cypress tests in a project.

**Parameters:**
- `project` (required): Project name or path
- `browser` (optional): Browser to use - default: `chrome`

**Example:**
```
Run all tests in the e2e project
```

---

### `cypress_stop`

Stop the currently running Cypress test.

**Example:**
```
Stop the current test
```

---

### `cypress_status`

Get current test execution status with recent output.

**Parameters:**
- `outputLines` (optional): Number of recent output lines to include - default: `30`

**Example:**
```
What's the status of the running test?
```

---

### `cypress_output`

Get the full console output from the current or last test run.

**Parameters:**
- `lines` (optional): Number of lines to return from the end - default: `100`
- `filter` (optional): Filter output to lines containing this text

**Example:**
```
Show me the test output filtered for "error"
```

---

### `cypress_list_specs`

List all available Cypress spec files in a project.

**Parameters:**
- `project` (required): Project name or path
- `filter` (optional): Filter specs by name pattern

**Example:**
```
List all spec files in the e2e project containing "login"
```

---

### `cypress_screenshots`

List or get screenshots from test failures.

**Parameters:**
- `project` (optional): E2E project name
- `latest` (optional): Get only the most recent screenshot

**Example:**
```
Show me the latest screenshot from test failures
```

---

### `cypress_clear_artifacts`

Clear screenshots and videos from previous test runs.

**Parameters:**
- `project` (required): Project name to clear artifacts from

**Example:**
```
Clear all test artifacts from the e2e project
```

---

## 📚 Resources

The server exposes these resources that can be read by AI agents:

### `cypress://output/live`

Real-time console output from running Cypress tests.

**MIME Type:** `text/plain`

### `cypress://status`

Current test execution status (JSON format).

**MIME Type:** `application/json`

**Response Structure:**
```json
{
  "isRunning": true,
  "currentSpec": "cypress/e2e/login.cy.ts",
  "startTime": "2024-01-25T10:30:00.000Z",
  "lastExitCode": null,
  "outputLines": 42
}
```

---

## 💡 Usage Examples

### Example 1: Run a Specific Test

**User:** "Run the login test in Chrome"

**AI Agent:**
1. Calls `cypress_list_specs` to find available tests
2. Calls `cypress_run_spec` with `spec: "cypress/e2e/login.cy.ts"`
3. Reports test has started

---

### Example 2: Monitor Test Progress

**User:** "Check the status of the current test"

**AI Agent:**
1. Calls `cypress_status`
2. Returns formatted status with recent output

---

### Example 3: Debug Failed Test

**User:** "Show me why the test failed"

**AI Agent:**
1. Calls `cypress_output` with `filter: "error"`
2. Calls `cypress_screenshots` with `latest: true`
3. Provides error output and screenshot location

---

### Example 4: Run Tests with Filtering

**User:** "Run only the authentication tests in Firefox"

**AI Agent:**
1. Calls `cypress_run_spec` with:
   - `spec: "cypress/e2e/auth.cy.ts"`
   - `browser: "firefox"`
   - `grep: "authentication"`

---

## 📁 Project Structure

```
cypress-mcp-server/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript (generated)
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── README.md             # This file
├── LICENSE               # MIT License
└── SETUP.md              # Detailed setup guide
```

---

## 🛠️ Development

### Run in Development Mode

```bash
npm run dev
```

This uses `ts-node` to run TypeScript directly without compilation.

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Run Tests (if you add them)

```bash
npm test
```

---

## 🐛 Troubleshooting

### Issue: "Cypress not found"

**Solution:** Ensure Cypress is installed in your workspace:
```bash
cd /path/to/your/cypress/project
npm install cypress --save-dev
```

---

### Issue: "Permission denied" when running tests

**Solution:** On Unix systems, make sure the script is executable:
```bash
chmod +x dist/index.js
```

---

### Issue: Tests not starting

**Solution:** Check the following:
1. Verify `CYPRESS_WORKSPACE` environment variable is set correctly
2. Ensure the workspace path exists and contains Cypress config
3. Check that Node.js version is >= 18.0.0
4. Review server logs in your MCP client

---

### Issue: "Cannot find module '@modelcontextprotocol/sdk'"

**Solution:** Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow existing code formatting
- Add comments for complex logic
- Update documentation for new features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Designed for [Cypress](https://www.cypress.io/) test automation
- Inspired by the need for AI-assisted testing workflows

---

## 📞 Support

If you encounter issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search [existing issues](https://gitlab.com/guyco42-group/cypress-runner-mcp/-/issues)
3. Create a [new issue](https://gitlab.com/guyco42-group/cypress-runner-mcp/-/issues/new) with details

---

## 🗺️ Roadmap

- [ ] Support for Cypress component testing
- [ ] Integration with CI/CD pipelines
- [ ] Test report generation
- [ ] Custom assertion helpers
- [ ] Multi-project support
- [ ] Video streaming for live test viewing
- [ ] Test code generation from natural language

---

**Made with ❤️ for the testing community**
