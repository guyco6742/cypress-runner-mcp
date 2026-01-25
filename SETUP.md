# 📖 Detailed Setup Guide

This guide provides step-by-step instructions for setting up the Cypress MCP Server in different environments.

---

## Table of Contents

- [Windows Setup](#windows-setup)
- [macOS/Linux Setup](#macoslinux-setup)
- [Cursor IDE Setup](#cursor-ide-setup)
- [Claude Desktop Setup](#claude-desktop-setup)
- [Nx Monorepo Setup](#nx-monorepo-setup)
- [Docker Setup](#docker-setup)
- [Verification](#verification)

---

## Windows Setup

### Step 1: Install Node.js

1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Install version 18 or higher
3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### Step 2: Clone and Build

```powershell
# Clone repository
git clone https://gitlab.com/guyco42-group/cypress-runner-mcp.git
cd cypress-runner-mcp

# Install dependencies
npm install

# Build project
npm run build
```

### Step 3: Get Absolute Paths

```powershell
# Get MCP server path
$mcpPath = (Get-Item .\dist\index.js).FullName
Write-Host "MCP Path: $mcpPath"

# Get your Cypress workspace path
$workspacePath = "C:\path\to\your\cypress\project"
Write-Host "Workspace Path: $workspacePath"
```

### Step 4: Configure MCP Client

Create or edit `.cursor\mcp.json` in your Cypress project:

```json
{
  "mcpServers": {
    "cypress-mcp": {
      "command": "node",
      "args": ["C:/path/to/cypress-mcp-server/dist/index.js"],
      "env": {
        "CYPRESS_WORKSPACE": "C:/path/to/your/cypress/project"
      }
    }
  }
}
```

⚠️ **Note:** Use forward slashes (`/`) in paths, even on Windows!

---

## macOS/Linux Setup

### Step 1: Install Node.js

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Or using Homebrew (macOS)
brew install node@18

# Verify
node --version
npm --version
```

### Step 2: Clone and Build

```bash
# Clone repository
git clone https://gitlab.com/guyco42-group/cypress-runner-mcp.git
cd cypress-runner-mcp

# Install dependencies
npm install

# Build project
npm run build

# Make executable
chmod +x dist/index.js
```

### Step 3: Get Absolute Paths

```bash
# Get MCP server path
MCP_PATH="$(pwd)/dist/index.js"
echo "MCP Path: $MCP_PATH"

# Get your Cypress workspace path
WORKSPACE_PATH="/path/to/your/cypress/project"
echo "Workspace Path: $WORKSPACE_PATH"
```

### Step 4: Configure MCP Client

Create or edit `.cursor/mcp.json` in your Cypress project:

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

---

## Cursor IDE Setup

### Step 1: Locate MCP Config File

The config file should be at:
- **Windows:** `<your-project>\.cursor\mcp.json`
- **macOS/Linux:** `<your-project>/.cursor/mcp.json`

### Step 2: Create or Edit Config

If the `.cursor` folder doesn't exist, create it:

```bash
mkdir .cursor
```

Create `mcp.json` with this content:

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

### Step 3: Restart Cursor

1. Close all Cursor windows
2. Reopen Cursor
3. Open your Cypress project

### Step 4: Verify MCP Connection

In Cursor, ask the AI:
```
List the available MCP tools
```

You should see the Cypress MCP tools listed.

---

## Claude Desktop Setup

### Step 1: Locate Claude Config File

The config file location varies by OS:

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Edit Config

Add or merge this configuration:

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

### Step 3: Restart Claude Desktop

Completely quit and restart Claude Desktop.

---

## Nx Monorepo Setup

If you're using Nx monorepo with multiple Cypress projects:

### Option 1: Separate MCP Instance per Project

Create multiple MCP server instances:

```json
{
  "mcpServers": {
    "cypress-mcp-app1": {
      "command": "node",
      "args": ["/path/to/cypress-mcp-server/dist/index.js"],
      "env": {
        "CYPRESS_WORKSPACE": "/path/to/monorepo/apps/app1-e2e"
      }
    },
    "cypress-mcp-app2": {
      "command": "node",
      "args": ["/path/to/cypress-mcp-server/dist/index.js"],
      "env": {
        "CYPRESS_WORKSPACE": "/path/to/monorepo/apps/app2-e2e"
      }
    }
  }
}
```

### Option 2: Root-Level MCP with Project Parameter

Set workspace to monorepo root:

```json
{
  "mcpServers": {
    "cypress-mcp": {
      "command": "node",
      "args": ["/path/to/cypress-mcp-server/dist/index.js"],
      "env": {
        "CYPRESS_WORKSPACE": "/path/to/monorepo"
      }
    }
  }
}
```

Then reference projects with paths like:
```
apps/app1-e2e/cypress/e2e/test.cy.ts
```

---

## Docker Setup

If you want to run the MCP server in Docker:

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose MCP server
CMD ["node", "dist/index.js"]
```

### Build and Run

```bash
# Build image
docker build -t cypress-mcp-server .

# Run container
docker run -it \
  -e CYPRESS_WORKSPACE=/workspace \
  -v /path/to/your/cypress/project:/workspace \
  cypress-mcp-server
```

---

## Verification

### Test 1: Check Server Logs

When you start your MCP client, you should see:
```
🚀 Cypress MCP Server started
📁 Workspace: /path/to/your/project
```

### Test 2: List Tools

Ask your AI assistant:
```
What Cypress MCP tools are available?
```

Expected response should list:
- `cypress_run_spec`
- `cypress_run_all`
- `cypress_stop`
- `cypress_status`
- `cypress_output`
- `cypress_list_specs`
- `cypress_screenshots`
- `cypress_clear_artifacts`

### Test 3: List Specs

Ask your AI assistant:
```
List all Cypress spec files
```

This should return a list of your test files.

### Test 4: Run a Test

Ask your AI assistant:
```
Run the [test-name] test
```

This should start a Cypress test and provide status updates.

---

## Troubleshooting Common Issues

### Issue: "Cannot find module '@modelcontextprotocol/sdk'"

**Solution:**
```bash
cd cypress-mcp-server
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### Issue: "CYPRESS_WORKSPACE not set"

**Solution:** Ensure the environment variable is set in your MCP config:
```json
"env": {
  "CYPRESS_WORKSPACE": "/absolute/path"
}
```

---

### Issue: "Command not found: node"

**Solution:** Install Node.js or add it to your PATH:
```bash
# macOS/Linux
export PATH="/usr/local/bin:$PATH"

# Windows (PowerShell)
$env:Path += ";C:\Program Files\nodejs"
```

---

### Issue: Tests not visible in list

**Solution:** Check that:
1. Your workspace path is correct
2. Cypress is installed in your project
3. Test files have `.cy.ts` or `.cy.js` extension
4. Test files are in the correct directory structure

---

## Next Steps

After successful setup:

1. Read the [README.md](README.md) for usage examples
2. Try running a simple test through the AI assistant
3. Explore advanced features like filtering and screenshots
4. Integrate into your CI/CD workflow

---

**Need more help?** Open an issue on GitLab!
