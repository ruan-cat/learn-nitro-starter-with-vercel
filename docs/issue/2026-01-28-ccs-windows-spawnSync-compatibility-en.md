# [Bug] WebSearch fails on Windows: spawnSync cannot execute pnpm-installed CLI tools (.CMD files)

## Description

On Windows, when using pnpm to globally install `@google/gemini-cli`, the CLI works correctly in the terminal, but fails when called via `spawnSync` in `lib/hooks/websearch-transformer.cjs`. The error reported is `ENOENT` (file not found), even though `isCliAvailable()` correctly detects the CLI as available.

## Environment

|      Item       |       Version/Info        |
| :-------------: | :-----------------------: |
|       OS        |  Windows 10 (10.0.19045)  |
|     Node.js     |           20.x            |
| Package Manager |           pnpm            |
|   CCS Version   |          Latest           |
|   Gemini CLI    | @google/gemini-cli@0.25.2 |

## Steps to Reproduce

1. Install Gemini CLI globally using pnpm:

   ```bash
   pnpm add -g @google/gemini-cli
   ```

2. Verify installation (works correctly in terminal):

   ```bash
   where gemini
   # Output: C:\Users\pc\AppData\Local\pnpm\gemini
   #         C:\Users\pc\AppData\Local\pnpm\gemini.CMD
   ```

3. Complete Gemini CLI authentication:

   ```bash
   gemini
   # Opens browser for Google OAuth
   ```

4. Launch Claude Code using a CCS third-party profile (e.g., Antigravity)

5. Trigger a WebSearch tool call

6. Receive error:

   ```plain
   [WebSearch - All Providers Failed]

   Tried all enabled CLI tools but all failed:
     - Gemini CLI: Gemini CLI not installed

   Query: "..."

   Troubleshooting:
     - Gemini: run `gemini` to authenticate (opens browser)
   ```

## Root Cause Analysis

### 1. How pnpm installs global packages on Windows

When pnpm installs a package globally on Windows, it creates:

- `C:\Users\pc\AppData\Local\pnpm\gemini` - A shim file (no extension)
- `C:\Users\pc\AppData\Local\pnpm\gemini.CMD` - Windows batch file

### 2. `isCliAvailable` works correctly

In `websearch-transformer.cjs` (lines 155-169), the `isCliAvailable` function uses `where.exe` to check if a command exists:

```javascript
function isCliAvailable(cmd) {
	try {
		const isWindows = process.platform === "win32";
		const whichCmd = isWindows ? "where.exe" : "which";

		const result = spawnSync(whichCmd, [cmd], {
			encoding: "utf8",
			timeout: 2000,
			stdio: ["pipe", "pipe", "pipe"],
		});
		return result.status === 0 && result.stdout.trim().length > 0;
	} catch {
		return false;
	}
}
```

This function correctly finds `gemini.CMD` and returns `true`.

### 3. `tryGeminiSearch` fails to execute

In lines 287-296, when actually executing the gemini command:

```javascript
const spawnResult = spawnSync("gemini", ["--model", model, "--yolo", "-p", prompt], {
	encoding: "utf8",
	timeout: timeoutMs,
	maxBuffer: 1024 * 1024 * 2,
	stdio: ["pipe", "pipe", "pipe"],
});
```

**The problem**: Node.js `spawnSync` without the `shell: true` option does NOT automatically resolve Windows `PATHEXT` extensions (`.CMD`, `.BAT`, `.EXE`, etc.). It only looks for an exact match of the command name.

### 4. Verification Test

Testing directly with Node.js:

```javascript
const { spawnSync } = require("child_process");

// Without shell option - FAILS
const r1 = spawnSync("gemini", ["--version"], { encoding: "utf8" });
console.log(r1.error);
// Error: spawnSync gemini ENOENT

// With shell option - WORKS
const r2 = spawnSync("gemini", ["--version"], { encoding: "utf8", shell: true });
// Process starts correctly
```

## Suggested Fix

Add `shell: true` option for Windows in all `spawnSync` calls:

```javascript
const spawnResult = spawnSync("gemini", ["--model", model, "--yolo", "-p", prompt], {
	encoding: "utf8",
	timeout: timeoutMs,
	maxBuffer: 1024 * 1024 * 2,
	stdio: ["pipe", "pipe", "pipe"],
	shell: process.platform === "win32", // Add this line
});
```

### Affected Functions

|      Function       | Approximate Line Number |
| :-----------------: | :---------------------: |
|  `tryGeminiSearch`  |         287-296         |
| `tryOpenCodeSearch` |         353-362         |
|   `tryGrokSearch`   |         415-420         |

## Why This Happens

- `where.exe` (used in `isCliAvailable`) is a Windows command that understands `PATHEXT` and can find `.CMD` files
- `spawnSync` without `shell: true` directly calls the OS to spawn a process, bypassing `PATHEXT` resolution
- This creates a discrepancy: the CLI is detected as available, but execution fails

## Additional Context

This is a Windows-specific compatibility issue. The current implementation works correctly on macOS/Linux where package managers typically create symlinks or executable files without extensions.

## References

- [Node.js child_process.spawnSync documentation](https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options)
- [Windows PATHEXT environment variable](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/path)
