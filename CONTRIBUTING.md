# 🤝 Contributing to Cypress MCP Server

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

---

## Code of Conduct

This project follows a Code of Conduct to ensure a welcoming environment for all contributors:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Accept differing viewpoints
- Show empathy towards others

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before submitting a bug report:
1. Check existing issues to avoid duplicates
2. Gather relevant information (OS, Node version, error messages)

When submitting a bug report, include:
- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Environment details (OS, Node.js version, etc.)
- Error logs or screenshots if applicable

### 💡 Suggesting Features

Feature suggestions are welcome! Please:
1. Check if the feature already exists or is planned
2. Provide a clear use case
3. Explain how it would benefit users
4. Consider implementation complexity

### 📝 Documentation Improvements

Documentation is just as important as code! You can:
- Fix typos or unclear explanations
- Add missing examples
- Improve setup instructions
- Translate documentation

### 🔧 Code Contributions

We welcome code contributions! See the sections below for guidelines.

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitLab
# Then clone your fork
git clone https://gitlab.com/guyco42-group/cypress-runner-mcp.git
cd cypress-runner-mcp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 4. Make Changes

Edit the code in `src/` directory.

### 5. Build and Test

```bash
# Build TypeScript
npm run build

# Test your changes
npm start
```

### 6. Commit and Push

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

### 7. Create Pull Request

Go to GitLab and create a Pull Request from your fork.

---

## Coding Standards

### TypeScript

- Use **TypeScript strict mode**
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Export types when they might be reused

### Code Style

- **Indentation:** 2 spaces
- **Quotes:** Double quotes for strings
- **Semicolons:** Required
- **Line length:** Max 100 characters (where reasonable)

### Naming Conventions

- **Variables/Functions:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Interfaces/Types:** `PascalCase`
- **Files:** `kebab-case.ts`

### Examples

**Good:**
```typescript
interface RunSpecArgs {
  spec: string;
  browser?: string;
  headed?: boolean;
}

const DEFAULT_BROWSER = "chrome";

async function runSpec(args: RunSpecArgs): Promise<ToolResult> {
  // Implementation
}
```

**Bad:**
```typescript
interface runspecargs {
  spec: any;
  browser: any;
}

const default_browser = 'chrome';

async function RunSpec(Args: any) {
  // Implementation
}
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build config)

### Examples

**Feature:**
```
feat(tools): add support for custom Cypress config path

Allow users to specify a custom path to cypress.config.ts
instead of using the default location.
```

**Bug Fix:**
```
fix(execution): handle SIGTERM correctly on Windows

Windows doesn't support SIGTERM signals. Changed to use
process.kill() with appropriate signal handling.
```

**Documentation:**
```
docs(readme): add troubleshooting section for Docker setup
```

**Refactor:**
```
refactor(utils): extract file finding logic into separate function
```

---

## Pull Request Process

### Before Submitting

1. ✅ Run `npm run build` successfully
2. ✅ Test your changes thoroughly
3. ✅ Update documentation if needed
4. ✅ Add comments for complex logic
5. ✅ Ensure no sensitive data is included

### PR Title

Use the same format as commit messages:
```
feat: add custom config path support
```

### PR Description

Include:
- **What** changes were made
- **Why** the changes were necessary
- **How** to test the changes
- **Related issues** (if any)

### Example PR Description

```markdown
## Changes
- Added support for custom Cypress config paths
- Updated documentation with new configuration option

## Motivation
Users requested the ability to use non-standard Cypress config locations.

## Testing
1. Set `CYPRESS_CONFIG_PATH` environment variable
2. Run `cypress_run_spec` tool
3. Verify it uses custom config

## Related Issues
Closes #42
```

### Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR

---

## Testing

### Manual Testing

When making changes, test:

1. **Build succeeds:**
   ```bash
   npm run build
   ```

2. **Server starts:**
   ```bash
   npm start
   ```

3. **Tools work correctly:**
   - Configure MCP client
   - Test each tool you modified
   - Verify output is correct

### Test Checklist

- [ ] Tested on your primary OS
- [ ] Tested with actual Cypress project
- [ ] Verified error handling
- [ ] Checked edge cases
- [ ] Reviewed logs for warnings/errors

---

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search closed issues for similar questions
3. Open a new issue with the "question" label

---

## Recognition

Contributors will be:
- Listed in project documentation
- Credited in release notes
- Appreciated by the community! 🎉

---

**Thank you for contributing!** 🙏
