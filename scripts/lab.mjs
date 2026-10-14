#!/usr/bin/env node
// Starts the SPHERE × SPACE × TomatoMeter lab in one of its modes.
//
//   node scripts/lab.mjs demo   TomatoMeter fully integrated with SPACE (demo/)
//   node scripts/lab.mjs 1      Tutorial checkpoint 1: empty SPHERE and SPACE
//   node scripts/lab.mjs 2      Tutorial checkpoint 2: pricing published in SPHERE
//   node scripts/lab.mjs 3      Tutorial checkpoint 3: SPACE linked to that pricing
//   node scripts/lab.mjs down   Stop everything and delete the lab data
//
// Every start resets SPHERE and SPACE, but never touches tutorial/tomatometer:
// attendees keep their code when they jump to another checkpoint.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const project = 'tomatometer-lab';
const files = ['compose.base.yml', 'compose.demo.yml', 'compose.tutorial.yml'];
// Lab state that must start from scratch. Dependency caches survive resets.
const dataVolumes = ['sphere-data', 'sphere-pricings', 'space-data', 'lab-config'];

const MODES = {
  demo: { stage: 'demo', overlay: 'compose.demo.yml', title: 'Demo' },
  1: { stage: 'empty', overlay: 'compose.tutorial.yml', title: 'Tutorial · checkpoint 1 (pricing from scratch)' },
  2: { stage: 'pricing', overlay: 'compose.tutorial.yml', title: 'Tutorial · checkpoint 2 (pricing published in SPHERE)' },
  3: { stage: 'linked', overlay: 'compose.tutorial.yml', title: 'Tutorial · checkpoint 3 (SPACE linked to SPHERE)' },
};

function compose(composeFiles, args, env = {}) {
  const fileArgs = composeFiles.flatMap(file => ['-f', join(root, 'infra', file)]);
  const result = spawnSync('docker', ['compose', '-p', project, ...fileArgs, ...args], {
    stdio: 'inherit',
    env: { ...process.env, LAB_STAGE: 'demo', ...env },
  });
  if (result.error) {
    console.error('Unable to run Docker. Is Docker installed and running?');
    process.exit(1);
  }
  return result.status ?? 1;
}

// `docker compose wait` ignores containers that already exited, so poll instead.
function waitForBootstrap(composeFiles) {
  const fileArgs = composeFiles.flatMap(file => ['-f', join(root, 'infra', file)]);
  for (;;) {
    const result = spawnSync(
      'docker',
      ['compose', '-p', project, ...fileArgs, 'ps', '--all', '--format', '{{.State}} {{.ExitCode}}', 'lab-bootstrap'],
      { encoding: 'utf8' }
    );
    const [state, exitCode] = result.stdout.trim().split(' ');
    if (state === 'exited') return Number(exitCode);
    if (!state && result.status !== 0) return 1;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
  }
}

function down() {
  compose(files, ['down', '--remove-orphans']);
  spawnSync('docker', ['volume', 'rm', '-f', ...dataVolumes.map(volume => `${project}_${volume}`)], { stdio: 'ignore' });
}

const arg = process.argv[2];
if (arg === 'down') {
  down();
  process.exit(0);
}

const mode = MODES[arg];
if (!mode) {
  console.error('Usage: node scripts/lab.mjs <demo|1|2|3|down>');
  process.exit(1);
}

const tutorial = mode.overlay === 'compose.tutorial.yml';
const envFile = join(root, 'tutorial', 'tomatometer', '.env');
// Create .env from the host so that attendees own the file they edit.
if (tutorial && !existsSync(envFile)) copyFileSync(join(root, 'tutorial', 'tomatometer', '.env.example'), envFile);

console.log(`\n▶ ${mode.title}: resetting SPHERE and SPACE…\n`);
down();

const stack = ['compose.base.yml', mode.overlay];
if (compose(stack, ['up', '--build', '--detach'], { LAB_STAGE: mode.stage }) !== 0) process.exit(1);
console.log('\nWaiting for the lab bootstrap to provision SPHERE and SPACE…\n');
if (waitForBootstrap(stack) !== 0) {
  compose(stack, ['logs', 'lab-bootstrap']);
  console.error('\nThe lab bootstrap failed (see its logs above).');
  process.exit(1);
}
compose(stack, ['logs', '--no-log-prefix', 'lab-bootstrap']);

console.log(`
  TomatoMeter  http://localhost:5401${tutorial ? '  (dev mode: edits in tutorial/tomatometer reload automatically)' : ''}
  SPHERE       http://localhost:5402
  SPACE        http://localhost:5403
  Credentials  tomato_demo / tomato-demo  (SPHERE and SPACE)

  Stop everything with: npm run down
`);

if (tutorial) {
  console.log('Following the TomatoMeter logs (Ctrl+C stops following; the lab keeps running).\n');
  compose(stack, ['logs', '--follow', '--no-log-prefix', 'tomatometer'], { LAB_STAGE: mode.stage });
}
