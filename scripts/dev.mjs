#!/usr/bin/env node
import { spawn } from 'node:child_process';

const procs = [
  { name: 'astro', cmd: 'npx', args: ['astro', 'dev'] },
  { name: 'dungeon', cmd: 'node', args: ['dungeon/dungeon/server/server.js'] },
];

const pad = (s, n) => s.padEnd(n, ' ');
const nameWidth = Math.max(...procs.map((p) => p.name.length));
const tag = (name) => `[${pad(name, nameWidth)}]`;

const children = procs.map(({ name, cmd, args }) => {
  console.log(`${tag(name)} starting: ${cmd} ${args.join(' ')}`);
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    console.log(`${tag(name)} exited (code=${code} signal=${signal})`);
    for (const c of children) {
      if (c !== child && c.exitCode === null) {
        try {
          c.kill('SIGTERM');
        } catch {
          /* noop */
        }
      }
    }
    process.exit(code ?? 1);
  });

  child.on('error', (err) => {
    console.error(`${tag(name)} failed to start: ${err.message}`);
  });

  return child;
});

const forward = (sig) => () => {
  for (const c of children) {
    try {
      c.kill(sig);
    } catch {
      /* noop */
    }
  }
};
process.on('SIGINT', forward('SIGINT'));
process.on('SIGTERM', forward('SIGTERM'));
