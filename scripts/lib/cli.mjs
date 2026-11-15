// What the scripts' command lines share: whether a file was run directly, argument parsing, exit codes, and the
// exact commands to print when the packages or the browser are missing.
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// One code per kind of outcome, so an agent can tell "fix the command" from "install" from "read the message".
export const EXIT = { ok: 0, failed: 1, usage: 2, setup: 3, contrast: 4 };

// The skill's own folder as a real path, for the commands printed to the person.
export const SKILL_DIR = realpathSync(fileURLToPath(new URL('../..', import.meta.url)));
const PLAYWRIGHT_CLI = path.join(SKILL_DIR, 'node_modules', 'playwright', 'cli.js');
export const INSTALL_PACKAGES = `npm --prefix "${SKILL_DIR}" install`;
export const INSTALL_CHROMIUM = `node "${PLAYWRIGHT_CLI}" install chromium`;

export class UsageError extends Error {}
export class SetupError extends Error {
  constructor(message, commands) { super(message); this.commands = commands; }
}

// True when the module at metaUrl is the script node was asked to run, also when it was reached through a symlink or
// a junction (a skill folder linked into ~/.claude/skills): node loads the module from its real path, while
// process.argv[1] keeps the path as typed.
export function isMain(metaUrl) {
  if (!process.argv[1]) return false;
  try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(metaUrl)); } catch { return false; }
}

// `<positional> --flag value --switch`, against the flags a script knows; anything else is a usage error, so a typo
// is reported instead of silently ignored.
export function parseArgs(argv, { values = [], switches = [] } = {}) {
  const out = { _: [], help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (values.includes(a)) {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) throw new UsageError(`${a} needs a value`);
      out[a] = v;
      i++;
    } else if (switches.includes(a)) out[a] = true;
    else if (a.startsWith('--')) throw new UsageError(`unknown option ${a}`);
    else out._.push(a);
  }
  return out;
}

// Prints the error in plain words with what to do as the last line, and exits with the error's code.
export function exitWith(e, script) {
  if (e instanceof UsageError) {
    console.error(`${script}: ${e.message}`);
    console.error(`Run node "${path.join(SKILL_DIR, 'scripts', script)}" --help to see the options.`);
    process.exit(EXIT.usage);
  }
  if (e instanceof SetupError) {
    console.error(`${script}: ${e.message}. Run:`);
    for (const c of e.commands) console.error(`  ${c}`);
    process.exit(EXIT.setup);
  }
  console.error(`${script} failed: ${String(e?.message ?? e).split('\n')[0]}`);
  console.error(`If the message names no fix, this is a bug in ${script}: report the message.`);
  process.exit(EXIT.failed);
}
