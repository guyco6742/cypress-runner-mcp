# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅        |

---

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Private Disclosure

**DO NOT** open a public issue for security vulnerabilities.

Instead, please email us at: **[guyco42@gmail.com]**

### What to Include

When reporting a vulnerability, please provide:

1. **Description** - Detailed description of the vulnerability
2. **Impact** - What could an attacker accomplish?
3. **Reproduction** - Step-by-step instructions to reproduce
4. **Environment** - OS, Node.js version, MCP client version
5. **Proof of Concept** - Code or screenshots demonstrating the issue (if applicable)
6. **Suggested Fix** - If you have ideas for how to fix it

### Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity
  - Critical: 1-3 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: Next scheduled release

---

## Security Best Practices

### For Users

When using Cypress MCP Server:

1. **Never commit sensitive data** to version control

   - API keys, tokens, passwords
   - User credentials
   - Private configuration files
2. **Use environment variables** for sensitive configuration

   ```json
   {
     "env": {
       "CYPRESS_WORKSPACE": "/path/to/project"
     }
   }
   ```
3. **Keep dependencies updated**

   ```bash
   npm audit
   npm update
   ```
4. **Review MCP server logs** for suspicious activity
5. **Limit file system access** - Only give MCP server access to necessary directories

### For Contributors

When contributing code:

1. **Validate all inputs** - Never trust user input
2. **Avoid command injection** - Use safe spawn methods
3. **Sanitize file paths** - Prevent directory traversal
4. **Handle errors securely** - Don't expose sensitive info in error messages
5. **Review dependencies** - Check for known vulnerabilities

---

## Known Security Considerations

### File System Access

This MCP server has file system access to:

- Read Cypress test files
- Execute Cypress processes
- Read test artifacts (screenshots, videos)

**Mitigation:** Users must explicitly configure the `CYPRESS_WORKSPACE` path.

### Process Execution

This server spawns Cypress processes using Node.js `child_process`.

**Mitigation:**

- Uses `spawn()` with argument arrays (not shell strings)
- Validates file paths before execution
- Limits process control to Cypress only

### Output Exposure

Test output may contain sensitive information.

**Mitigation:**

- Users should sanitize test data
- Avoid logging credentials in tests
- Review output before sharing

---

## Dependency Security

We use automated tools to monitor dependencies:

- **npm audit** - Built-in npm security auditing
- **Dependabot** - Automated dependency updates (if enabled)

To check for vulnerabilities:

```bash
npm audit
```

To fix vulnerabilities:

```bash
npm audit fix
```

---

## Changelog

### Version 1.0.0

- Initial release
- Basic security measures implemented
- Input validation for all tools
- Secure process spawning

---

## Contact

For security concerns, contact: **guyco42@gmail.com**

For general questions, open an issue on GitLab.

---

**Security is a shared responsibility. Thank you for helping keep this project secure!** 🔒
