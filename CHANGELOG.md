# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Component testing support
- CI/CD integration guides
- Video streaming capabilities
- Multi-workspace support

---

## [1.0.0] - 2025-01-25

### Added
- Initial release of Cypress MCP Server
- Core MCP tools:
  - `cypress_run_spec` - Run specific test files
  - `cypress_run_all` - Run all tests in a project
  - `cypress_stop` - Stop running tests
  - `cypress_status` - Get test execution status
  - `cypress_output` - Retrieve test output
  - `cypress_list_specs` - List available test files
  - `cypress_screenshots` - Access test screenshots
  - `cypress_clear_artifacts` - Clean up test artifacts
- MCP resources:
  - `cypress://output/live` - Real-time test output
  - `cypress://status` - Current execution status
- Multi-browser support (Chrome, Firefox, Edge, Electron)
- Headed/headless test execution modes
- Test filtering with grep patterns
- Background process management
- Comprehensive error handling
- TypeScript implementation with strict mode
- Documentation:
  - README with full feature documentation
  - SETUP guide for multiple platforms
  - QUICKSTART guide for rapid setup
  - CONTRIBUTING guidelines
  - SECURITY policy
- MIT License

### Technical Details
- Built with Model Context Protocol SDK 1.0.0
- Node.js 18+ requirement
- TypeScript 5.0+ compilation
- Modular architecture for easy extension

---

## Release Notes

### 1.0.0 - Initial Public Release

This is the first public release of Cypress MCP Server, enabling AI agents to interact with Cypress test runners through the Model Context Protocol.

**Key Features:**
- Complete test lifecycle management (run, monitor, stop)
- Real-time output streaming
- Artifact management (screenshots, videos)
- Cross-platform support (Windows, macOS, Linux)
- Integration with Cursor IDE and Claude Desktop

**Target Audience:**
- Teams using Cypress for E2E testing
- Developers leveraging AI assistants in their workflow
- Organizations adopting AI-powered testing practices

**Getting Started:**
See [QUICKSTART.md](QUICKSTART.md) for installation instructions.

**Migration Notes:**
This is the initial release, no migration needed.

---

## Upgrade Guide

### From Pre-release to 1.0.0

If you were using a pre-release or development version:

1. **Backup your configuration:**
   ```bash
   cp .cursor/mcp.json .cursor/mcp.json.backup
   ```

2. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Rebuild:**
   ```bash
   npm run build
   ```

5. **Update configuration:**
   - Review `mcp.json` format in README
   - Update paths if necessary

6. **Restart MCP client:**
   - Restart Cursor IDE or Claude Desktop

---

## Version History

- **1.0.0** (2025-01-25) - Initial public release

---

[Unreleased]: https://gitlab.com/guyco42-group/cypress-runner-mcp/compare/v1.0.0...HEAD
[1.0.0]: https://gitlab.com/guyco42-group/cypress-runner-mcp/releases/tag/v1.0.0
