#!/usr/bin/env node


const { execFileSync } = require('child_process');
const path = require('path');

const DEV_PORTS = [4200, 4201, 4202, 4203, 4204, 4205, 4206, 4207];
const repoRoot = path.resolve(__dirname, '../..').toLowerCase();
const nxExecutorPathWindows = 'node_modules\\nx\\bin\\run-executor.js';
const nxExecutorPathPosix = 'node_modules/nx/bin/run-executor.js';

/**
 * Execute a command and return trimmed stdout.
 * Throws when the command itself fails unexpectedly.
 *
 * @param {string} command Executable to invoke.
 * @param {string[]} args Command arguments.
 * @returns {string} Trimmed stdout text.
 */
function readCommandOutput(command, args) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

/**
 * Read listening process IDs for a TCP port.
 * Supports Windows via netstat and Unix-like systems via lsof.
 *
 * @param {number} port TCP port to inspect.
 * @returns {number[]} Unique process IDs listening on the port.
 */
function getListeningPids(port) {
  if (process.platform === 'win32') {
    const output = readCommandOutput('netstat', ['-ano', '-p', 'tcp']);
    const pids = new Set();

    for (const line of output.split(/\r?\n/)) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 5 || parts[3] !== 'LISTENING') {
        continue;
      }

      if (parts[1].endsWith(`:${port}`)) {
        pids.add(Number(parts[4]));
      }
    }

    return [...pids].filter(Number.isInteger);
  }

  try {
    const output = readCommandOutput('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t']);
    return output
      .split(/\r?\n/)
      .map((value) => Number(value.trim()))
      .filter(Number.isInteger);
  } catch {
    return [];
  }
}

/**
 * Read a process command line for ownership checks.
 *
 * @param {number} pid Process ID to inspect.
 * @returns {string} The process command line, or an empty string if unavailable.
 */
function getProcessCommandLine(pid) {
  try {
    if (process.platform === 'win32') {
      return readCommandOutput('powershell', [
        '-NoProfile',
        '-Command',
        `$process = Get-CimInstance Win32_Process -Filter "ProcessId = ${pid}"; if ($process) { $process.CommandLine }`,
      ]);
    }

    return readCommandOutput('ps', ['-p', String(pid), '-o', 'command=']);
  } catch {
    return '';
  }
}

/**
 * Decide whether a listening process is a stale Nx dev server owned by this repo.
 *
 * @param {string} commandLine Process command line text.
 * @returns {boolean} True when the process is safe to terminate automatically.
 */
function isRepoNxServeProcess(commandLine) {
  const normalized = commandLine.toLowerCase();
  return (
    normalized.includes(repoRoot) &&
    (normalized.includes(nxExecutorPathWindows) || normalized.includes(nxExecutorPathPosix))
  );
}

/**
 * Pause briefly to let the OS release terminated listeners.
 *
 * @param {number} milliseconds Delay duration.
 * @returns {Promise<void>} Resolves after the requested delay.
 */
function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Check whether a process is still alive.
 *
 * @param {number} pid Process ID to inspect.
 * @returns {boolean} True when the process is still running.
 */
function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Force-stop a process that owns a dev listener.
 * Uses direct PID termination first and only falls back to taskkill on Windows.
 *
 * @param {number} pid Process ID to terminate.
 * @returns {Promise<void>} Resolves when the process is no longer running.
 */
async function terminateProcess(pid) {
  try {
    process.kill(pid);
  } catch (error) {
    if (error && error.code === 'ESRCH') {
      return;
    }

    throw error;
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (!isProcessRunning(pid)) {
      return;
    }

    await sleep(200);
  }

  if (process.platform === 'win32' && isProcessRunning(pid)) {
    execFileSync('taskkill', ['/PID', String(pid), '/F'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }
}

/**
 * Find stale repo-owned dev listeners and free their ports.
 * Exits with a helpful error if a conflicting non-repo process is found.
 *
 * @returns {Promise<void>} Resolves after stale listeners are cleared.
 */
async function main() {
  const listenersByPid = new Map();

  for (const port of DEV_PORTS) {
    for (const pid of getListeningPids(port)) {
      if (!listenersByPid.has(pid)) {
        listenersByPid.set(pid, []);
      }

      listenersByPid.get(pid).push(port);
    }
  }

  if (listenersByPid.size === 0) {
    console.log('Dev ports are already free.');
    return;
  }

  for (const [pid, ports] of listenersByPid.entries()) {
    const commandLine = getProcessCommandLine(pid);

    if (!isRepoNxServeProcess(commandLine)) {
      console.error(
        `Refusing to stop PID ${pid} on port(s) ${ports.join(', ')} because it is not a repo-owned Nx dev server.`
      );

      if (commandLine) {
        console.error(commandLine);
      }

      process.exit(1);
    }
  }

  for (const [pid, ports] of listenersByPid.entries()) {
    console.log(`Stopping stale Nx dev server PID ${pid} on port(s) ${ports.join(', ')}.`);
    await terminateProcess(pid);
  }

  await sleep(300);
  console.log('Dev ports are ready.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
