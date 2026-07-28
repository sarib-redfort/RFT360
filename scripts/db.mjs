#!/usr/bin/env node
/**
 * Start/stop a local PostgreSQL cluster for development.
 *
 * Docker is the preferred path (`npm run docker:up`) — this exists only for
 * machines without Docker, where a native PostgreSQL install is used instead.
 * Paths are configurable via .env so this stays portable:
 *
 *   PG_BIN    directory containing pg_ctl        (default: auto-detected)
 *   PG_DATA   cluster data directory             (default: ~/rft360-data/pgdata)
 *   PG_PORT   port to listen on                  (default: 5433)
 *
 * Usage:  node scripts/db.mjs up | down | status
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createConnection } from 'node:net';

const PORT = process.env.PG_PORT ?? '5433';
const DATA = process.env.PG_DATA ?? join(homedir(), 'rft360-data', 'pgdata');
const LOG = join(homedir(), 'rft360-data', 'pg.log');

/** Locates pg_ctl: explicit PG_BIN, then PATH, then common install roots. */
function findPgCtl() {
  const exe = process.platform === 'win32' ? 'pg_ctl.exe' : 'pg_ctl';
  if (process.env.PG_BIN) return join(process.env.PG_BIN, exe);

  // Already on PATH? (shell:false — avoids the arg-escaping deprecation)
  const probe = spawnSync(exe, ['--version'], { shell: false });
  if (!probe.error && probe.status === 0) return exe;

  const roots =
    process.platform === 'win32'
      ? ['C:/Program Files/PostgreSQL']
      : ['/usr/lib/postgresql', '/opt/homebrew/opt', '/usr/local/opt'];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    // Prefer the highest installed major version.
    const versions = readdirSync(root).sort((a, b) => parseInt(b) - parseInt(a));
    for (const v of versions) {
      const candidate = join(root, v, 'bin', exe);
      if (existsSync(candidate)) return candidate;
    }
  }
  return null;
}

function isListening(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ port: Number(port), host: '127.0.0.1' });
    socket.on('connect', () => (socket.end(), resolve(true)));
    socket.on('error', () => resolve(false));
    socket.setTimeout(800, () => (socket.destroy(), resolve(false)));
  });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function up() {
  if (await isListening(PORT)) {
    console.log(`PostgreSQL already listening on :${PORT}`);
    return;
  }
  const pgCtl = findPgCtl();
  if (!pgCtl) {
    console.error(
      'Could not find pg_ctl. Install PostgreSQL, set PG_BIN in .env, or use `npm run docker:up`.',
    );
    process.exit(1);
  }
  if (!existsSync(DATA)) {
    console.error(`No cluster at ${DATA}. Set PG_DATA in .env, or initialise one with initdb.`);
    process.exit(1);
  }

  // A stale pid file (hard shutdown / moved data dir) makes pg_ctl block.
  const pidFile = join(DATA, 'postmaster.pid');
  if (existsSync(pidFile)) rmSync(pidFile, { force: true });

  console.log(`Starting PostgreSQL on :${PORT} ...`);
  spawnSync(pgCtl, ['-D', DATA, '-o', `-p ${PORT}`, '-l', LOG, 'start'], {
    stdio: 'ignore',
    shell: false,
  });

  for (let i = 0; i < 30; i++) {
    if (await isListening(PORT)) {
      console.log(`  PostgreSQL up on :${PORT}`);
      return;
    }
    await wait(1000);
  }
  console.error(`PostgreSQL did not start. See ${LOG}`);
  process.exit(1);
}

async function down() {
  if (!(await isListening(PORT))) {
    console.log('PostgreSQL is not running.');
    return;
  }
  const pgCtl = findPgCtl();
  if (!pgCtl) process.exit(1);
  spawnSync(pgCtl, ['-D', DATA, '-m', 'fast', 'stop'], { stdio: 'ignore' });
  console.log('PostgreSQL stopped.');
}

async function status() {
  const running = await isListening(PORT);
  console.log(`PostgreSQL :${PORT} — ${running ? 'running' : 'stopped'}  (data: ${DATA})`);
}

const cmd = process.argv[2];
if (cmd === 'up') await up();
else if (cmd === 'down') await down();
else if (cmd === 'status') await status();
else {
  console.error('Usage: node scripts/db.mjs up|down|status');
  process.exit(1);
}
