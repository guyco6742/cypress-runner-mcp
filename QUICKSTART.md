# 🎯 Quick Start Guide

Get up and running with Cypress MCP Server in 5 minutes!

---

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm/pnpm/yarn installed  
- ✅ Cypress project already set up
- ✅ MCP-compatible client (Cursor IDE or Claude Desktop)

---

## 1️⃣ Install

```bash
git clone https://gitlab.com/guyco42-group/cypress-runner-mcp.git
cd cypress-runner-mcp
npm install
npm run build
```

---

## 2️⃣ Configure

### For Cursor IDE

Create `.cursor/mcp.json` in your Cypress project:

```json
{
  "mcpServers": {
    "cypress-mcp": {
      "command": "node",
      "args": ["/path/to/cypress-mcp-server/dist/index.js"],
      "env": {
        "CYPRESS_WORKSPACE": "/path/to/your/cypress/project"
      }
    }
  }
}
```

Replace paths with your actual absolute paths!

---

## 3️⃣ Restart

Restart Cursor IDE or Claude Desktop.

---

## 4️⃣ Test

Ask your AI assistant:

```
List all Cypress tests
```

If it works, you're all set! 🎉

---

## 📚 Learn More

- [Full README](README.md) - Complete documentation
- [Setup Guide](SETUP.md) - Platform-specific setup
- [Examples](#usage-examples) - Common usage patterns

---

## 🆘 Issues?

Check the [Troubleshooting](SETUP.md#troubleshooting-common-issues) section or [open an issue](https://gitlab.com/guyco42-group/cypress-runner-mcp/-/issues).
