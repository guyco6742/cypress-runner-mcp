#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ChildProcess, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

// ============================================
// TYPES
// ============================================

interface TestState {
  currentProcess: ChildProcess | null;
  isRunning: boolean;
  output: string[];
  lastExitCode: number | null;
  startTime: Date | null;
  currentSpec: string | null;
  screenshots: string[];
  videos: string[];
}

// Initialize state
const state: TestState = {
  currentProcess: null,
  isRunning: false,
  output: [],
  lastExitCode: null,
  startTime: null,
  currentSpec: null,
  screenshots: [],
  videos: [],
};

// Get workspace root (passed as env var or default to cwd)
const WORKSPACE_ROOT = process.env.CYPRESS_WORKSPACE || process.cwd();

// ============================================
// CREATE MCP SERVER
// ============================================

const server = new Server(
  {
    name: "cypress-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ============================================
// TOOLS DEFINITION
// ============================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "cypress_run_spec",
        description: "Run a specific Cypress test spec file. Returns immediately and runs in background.",
        inputSchema: {
          type: "object",
          properties: {
            spec: {
              type: "string",
              description: "Path to spec file relative to workspace (e.g., cypress/e2e/example.cy.ts)",
            },
            browser: {
              type: "string",
              enum: ["chrome", "firefox", "electron", "edge"],
              description: "Browser to use (default: chrome)",
            },
            headed: {
              type: "boolean",
              description: "Run with visible browser window (default: true for debugging)",
            },
            grep: {
              type: "string",
              description: "Run only tests matching this pattern (test title grep)",
            },
          },
          required: ["spec"],
        },
      },
      {
        name: "cypress_run_all",
        description: "Run all Cypress tests in a project",
        inputSchema: {
          type: "object",
          properties: {
            project: {
              type: "string",
              description: "Which e2e project to run (adjust based on your project structure)",
            },
            browser: {
              type: "string",
              enum: ["chrome", "firefox", "electron", "edge"],
              description: "Browser to use (default: chrome)",
            },
          },
          required: ["project"],
        },
      },
      {
        name: "cypress_stop",
        description: "Stop the currently running Cypress test",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "cypress_status",
        description: "Get current test execution status, including if tests are running and recent output",
        inputSchema: {
          type: "object",
          properties: {
            outputLines: {
              type: "number",
              description: "Number of recent output lines to include (default: 30)",
            },
          },
        },
      },
      {
        name: "cypress_output",
        description: "Get the full console output from the current or last test run",
        inputSchema: {
          type: "object",
          properties: {
            lines: {
              type: "number",
              description: "Number of lines to return from the end (default: 100)",
            },
            filter: {
              type: "string",
              description: "Filter output to lines containing this text",
            },
          },
        },
      },
      {
        name: "cypress_list_specs",
        description: "List all available Cypress spec files in a project",
        inputSchema: {
          type: "object",
          properties: {
            project: {
              type: "string",
              description: "Which e2e project to list specs from",
            },
            filter: {
              type: "string",
              description: "Filter specs by name pattern",
            },
          },
          required: ["project"],
        },
      },
      {
        name: "cypress_screenshots",
        description: "List or get screenshots from test failures",
        inputSchema: {
          type: "object",
          properties: {
            project: {
              type: "string",
              description: "E2E project name",
            },
            latest: {
              type: "boolean",
              description: "Get only the most recent screenshot",
            },
          },
        },
      },
      {
        name: "cypress_clear_artifacts",
        description: "Clear screenshots and videos from previous test runs",
        inputSchema: {
          type: "object",
          properties: {
            project: {
              type: "string",
              description: "Which e2e project to clear artifacts from",
            },
          },
          required: ["project"],
        },
      },
    ],
  };
});

// ============================================
// RESOURCES DEFINITION
// ============================================

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "cypress://output/live",
        name: "Live Test Output",
        description: "Real-time console output from running Cypress tests",
        mimeType: "text/plain",
      },
      {
        uri: "cypress://status",
        name: "Test Status",
        description: "Current test execution status",
        mimeType: "application/json",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "cypress://output/live") {
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: state.output.slice(-100).join("\n") || "No output yet",
        },
      ],
    };
  }

  if (uri === "cypress://status") {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify({
            isRunning: state.isRunning,
            currentSpec: state.currentSpec,
            startTime: state.startTime,
            lastExitCode: state.lastExitCode,
            outputLines: state.output.length,
          }, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// ============================================
// TOOL HANDLERS
// ============================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const toolArgs = (args || {}) as Record<string, unknown>;

  try {
    switch (name) {
      case "cypress_run_spec":
        return await runSpec(toolArgs as unknown as RunSpecArgs);
      case "cypress_run_all":
        return await runAll(toolArgs as unknown as RunAllArgs);
      case "cypress_stop":
        return await stopTest();
      case "cypress_status":
        return await getStatus(toolArgs as unknown as StatusArgs);
      case "cypress_output":
        return await getOutput(toolArgs as unknown as OutputArgs);
      case "cypress_list_specs":
        return await listSpecs(toolArgs as unknown as ListSpecsArgs);
      case "cypress_screenshots":
        return await getScreenshots(toolArgs as unknown as ScreenshotsArgs);
      case "cypress_clear_artifacts":
        return await clearArtifacts(toolArgs as unknown as ClearArtifactsArgs);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// ============================================
// TOOL IMPLEMENTATIONS
// ============================================

interface RunSpecArgs {
  spec: string;
  browser?: string;
  headed?: boolean;
  grep?: string;
}

async function runSpec(args: RunSpecArgs) {
  if (state.isRunning) {
    return {
      content: [
        {
          type: "text",
          text: "⚠️ A test is already running. Use cypress_stop to stop it first, or cypress_status to check progress.",
        },
      ],
    };
  }

  // Reset state
  state.output = [];
  state.lastExitCode = null;
  state.startTime = new Date();
  state.currentSpec = args.spec;
  state.isRunning = true;

  // Build command
  const cypressArgs = [
    "cypress",
    "run",
    "--spec",
    args.spec,
    "--browser",
    args.browser || "chrome",
  ];

  if (args.headed !== false) {
    cypressArgs.push("--headed");
  }

  if (args.grep) {
    cypressArgs.push("--env", `grep="${args.grep}"`);
  }

  state.output.push(`🚀 Starting Cypress test...`);
  state.output.push(`📁 Spec: ${args.spec}`);
  state.output.push(`🌐 Browser: ${args.browser || "chrome"}`);
  state.output.push(`👁️ Headed: ${args.headed !== false}`);
  if (args.grep) {
    state.output.push(`🔍 Grep: ${args.grep}`);
  }
  state.output.push(`⏰ Started: ${state.startTime.toISOString()}`);
  state.output.push("─".repeat(50));

  // Spawn process
  state.currentProcess = spawn("npx", cypressArgs, {
    cwd: WORKSPACE_ROOT,
    shell: true,
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  state.currentProcess.stdout?.on("data", (data) => {
    const lines = data.toString().split("\n").filter((l: string) => l.trim());
    state.output.push(...lines);
  });

  state.currentProcess.stderr?.on("data", (data) => {
    const lines = data.toString().split("\n").filter((l: string) => l.trim());
    state.output.push(...lines.map((l: string) => `[stderr] ${l}`));
  });

  state.currentProcess.on("close", (code) => {
    state.lastExitCode = code;
    state.isRunning = false;
    state.currentProcess = null;
    
    const duration = state.startTime 
      ? Math.round((Date.now() - state.startTime.getTime()) / 1000) 
      : 0;
    
    state.output.push("─".repeat(50));
    state.output.push(`✅ Test completed with exit code: ${code}`);
    state.output.push(`⏱️ Duration: ${duration} seconds`);
    
    // Update artifacts
    updateArtifacts();
  });

  state.currentProcess.on("error", (error) => {
    state.output.push(`❌ Process error: ${error.message}`);
    state.isRunning = false;
    state.currentProcess = null;
  });

  return {
    content: [
      {
        type: "text",
        text: `🚀 **Cypress test started!**

📁 **Spec:** \`${args.spec}\`
🌐 **Browser:** ${args.browser || "chrome"}
👁️ **Headed:** ${args.headed !== false}
${args.grep ? `🔍 **Grep:** ${args.grep}` : ""}

Use \`cypress_status\` or \`cypress_output\` to monitor progress.
Use \`cypress_stop\` to stop the test if needed.`,
      },
    ],
  };
}

interface RunAllArgs {
  project: string;
  browser?: string;
}

async function runAll(args: RunAllArgs) {
  if (state.isRunning) {
    return {
      content: [
        {
          type: "text",
          text: "⚠️ A test is already running. Use cypress_stop to stop it first.",
        },
      ],
    };
  }

  const projectPath = args.project;
  
  // Reset state
  state.output = [];
  state.lastExitCode = null;
  state.startTime = new Date();
  state.currentSpec = `${projectPath}/**/*.cy.ts`;
  state.isRunning = true;

  // Adjust this command based on your project structure
  // Default: assumes standard Cypress setup
  const cypressArgs = [
    "cypress",
    "run",
    `--browser=${args.browser || "chrome"}`,
  ];

  state.output.push(`🚀 Starting all tests in ${args.project}...`);
  state.output.push(`⏰ Started: ${state.startTime.toISOString()}`);
  state.output.push("─".repeat(50));

  state.currentProcess = spawn("npx", cypressArgs, {
    cwd: WORKSPACE_ROOT,
    shell: true,
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  state.currentProcess.stdout?.on("data", (data) => {
    const lines = data.toString().split("\n").filter((l: string) => l.trim());
    state.output.push(...lines);
  });

  state.currentProcess.stderr?.on("data", (data) => {
    const lines = data.toString().split("\n").filter((l: string) => l.trim());
    state.output.push(...lines);
  });

  state.currentProcess.on("close", (code) => {
    state.lastExitCode = code;
    state.isRunning = false;
    state.currentProcess = null;
    state.output.push("─".repeat(50));
    state.output.push(`✅ All tests completed with exit code: ${code}`);
    updateArtifacts();
  });

  return {
    content: [
      {
        type: "text",
        text: `🚀 **Started all tests in ${args.project}**

Use \`cypress_status\` to monitor progress.`,
      },
    ],
  };
}

async function stopTest() {
  if (!state.currentProcess || !state.isRunning) {
    return {
      content: [
        {
          type: "text",
          text: "ℹ️ No test is currently running.",
        },
      ],
    };
  }

  state.currentProcess.kill("SIGTERM");
  state.output.push("⛔ Test stopped by user");
  state.isRunning = false;
  state.currentProcess = null;

  return {
    content: [
      {
        type: "text",
        text: "✅ Test stopped successfully.",
      },
    ],
  };
}

interface StatusArgs {
  outputLines?: number;
}

async function getStatus(args: StatusArgs) {
  const lines = args.outputLines || 30;
  const recentOutput = state.output.slice(-lines).join("\n");
  
  const duration = state.startTime && state.isRunning
    ? Math.round((Date.now() - state.startTime.getTime()) / 1000)
    : null;

  let statusEmoji = "⏸️";
  let statusText = "Idle";
  
  if (state.isRunning) {
    statusEmoji = "🔄";
    statusText = "Running";
  } else if (state.lastExitCode === 0) {
    statusEmoji = "✅";
    statusText = "Passed";
  } else if (state.lastExitCode !== null) {
    statusEmoji = "❌";
    statusText = "Failed";
  }

  return {
    content: [
      {
        type: "text",
        text: `## ${statusEmoji} Test Status: ${statusText}

| Property | Value |
|----------|-------|
| **Running** | ${state.isRunning ? "Yes" : "No"} |
| **Current Spec** | ${state.currentSpec || "None"} |
| **Duration** | ${duration ? `${duration}s` : "N/A"} |
| **Exit Code** | ${state.lastExitCode ?? "N/A"} |
| **Output Lines** | ${state.output.length} |

### Recent Output (last ${lines} lines):
\`\`\`
${recentOutput || "No output yet"}
\`\`\``,
      },
    ],
  };
}

interface OutputArgs {
  lines?: number;
  filter?: string;
}

async function getOutput(args: OutputArgs) {
  const lines = args.lines || 100;
  let output = state.output;
  
  if (args.filter) {
    output = output.filter(line => 
      line.toLowerCase().includes(args.filter!.toLowerCase())
    );
  }
  
  const result = output.slice(-lines).join("\n");

  return {
    content: [
      {
        type: "text",
        text: result || "No output available.",
      },
    ],
  };
}

interface ListSpecsArgs {
  project: string;
  filter?: string;
}

async function listSpecs(args: ListSpecsArgs) {
  // Adjust this path based on your project structure
  const e2eDir = path.join(WORKSPACE_ROOT, args.project, "cypress", "e2e");
  
  if (!fs.existsSync(e2eDir)) {
    return {
      content: [
        {
          type: "text",
          text: `❌ E2E directory not found: ${e2eDir}`,
        },
      ],
    };
  }

  const specs = findFiles(e2eDir, [".cy.ts", ".cy.js"]);
  
  let filteredSpecs = specs;
  if (args.filter) {
    const filterLower = args.filter.toLowerCase();
    filteredSpecs = specs.filter(s => 
      s.toLowerCase().includes(filterLower)
    );
  }

  const specList = filteredSpecs.map(s => {
    const relativePath = path.relative(WORKSPACE_ROOT, s);
    return `- \`${relativePath}\``;
  }).join("\n");

  return {
    content: [
      {
        type: "text",
        text: `## 📁 Spec Files in ${args.project}

Found **${filteredSpecs.length}** spec files${args.filter ? ` matching "${args.filter}"` : ""}:

${specList || "No specs found."}`,
      },
    ],
  };
}

interface ScreenshotsArgs {
  project?: string;
  latest?: boolean;
}

async function getScreenshots(args: ScreenshotsArgs) {
  const projects = args.project ? [args.project] : [];
  
  const allScreenshots: { project: string; path: string; modified: Date }[] = [];
  
  for (const project of projects) {
    const screenshotDir = path.join(WORKSPACE_ROOT, project, "cypress", "screenshots");
    
    if (fs.existsSync(screenshotDir)) {
      const screenshots = findFiles(screenshotDir, [".png"]);
      
      for (const screenshot of screenshots) {
        const stat = fs.statSync(screenshot);
        allScreenshots.push({
          project,
          path: path.relative(WORKSPACE_ROOT, screenshot),
          modified: stat.mtime,
        });
      }
    }
  }

  // Sort by modified date (newest first)
  allScreenshots.sort((a, b) => b.modified.getTime() - a.modified.getTime());

  if (args.latest && allScreenshots.length > 0) {
    const latest = allScreenshots[0];
    return {
      content: [
        {
          type: "text",
          text: `## 📸 Latest Screenshot

**Project:** ${latest.project}
**Path:** \`${latest.path}\`
**Modified:** ${latest.modified.toISOString()}`,
        },
      ],
    };
  }

  if (allScreenshots.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: "ℹ️ No screenshots found.",
        },
      ],
    };
  }

  const screenshotList = allScreenshots.slice(0, 20).map(s => 
    `- \`${s.path}\` (${s.modified.toLocaleString()})`
  ).join("\n");

  return {
    content: [
      {
        type: "text",
        text: `## 📸 Screenshots (${allScreenshots.length} total)

${screenshotList}${allScreenshots.length > 20 ? `\n\n... and ${allScreenshots.length - 20} more` : ""}`,
      },
    ],
  };
}

interface ClearArtifactsArgs {
  project: string;
}

async function clearArtifacts(args: ClearArtifactsArgs) {
  const screenshotDir = path.join(WORKSPACE_ROOT, args.project, "cypress", "screenshots");
  const videoDir = path.join(WORKSPACE_ROOT, args.project, "cypress", "videos");
  
  let cleared = 0;
  
  if (fs.existsSync(screenshotDir)) {
    fs.rmSync(screenshotDir, { recursive: true, force: true });
    cleared++;
  }
  
  if (fs.existsSync(videoDir)) {
    fs.rmSync(videoDir, { recursive: true, force: true });
    cleared++;
  }

  return {
    content: [
      {
        type: "text",
        text: cleared > 0 
          ? `✅ Cleared screenshots and videos for ${args.project}`
          : `ℹ️ No artifacts to clear for ${args.project}`,
      },
    ],
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function findFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  
  function walk(currentDir: string) {
    try {
      const files = fs.readdirSync(currentDir);
      
      for (const file of files) {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walk(filePath);
        } else if (extensions.some(ext => file.endsWith(ext))) {
          results.push(filePath);
        }
      }
    } catch {
      // Ignore permission errors
    }
  }
  
  walk(dir);
  return results;
}

function updateArtifacts() {
  state.screenshots = [];
  state.videos = [];
  
  // Adjust this based on your project structure
  // This is a generic implementation
  const screenshotDir = path.join(WORKSPACE_ROOT, "cypress", "screenshots");
  const videoDir = path.join(WORKSPACE_ROOT, "cypress", "videos");
  
  if (fs.existsSync(screenshotDir)) {
    state.screenshots.push(...findFiles(screenshotDir, [".png"]));
  }
  
  if (fs.existsSync(videoDir)) {
    state.videos.push(...findFiles(videoDir, [".mp4"]));
  }
}

// ============================================
// START SERVER
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 Cypress MCP Server started");
  console.error(`📁 Workspace: ${WORKSPACE_ROOT}`);
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
