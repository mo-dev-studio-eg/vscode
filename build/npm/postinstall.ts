/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import path from 'path';
import * as os from 'os';
import * as child_process from 'child_process';
import { dirs } from './dirs.ts';
import { root, stateFile, stateContentsFile, computeState, computeContents, isUpToDate } from './installStateHash.ts';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const rootNpmrcConfigKeys = getNpmrcConfigKeys(path.join(root, '.npmrc'));

function log(dir: string, message: string) {
	if (process.stdout.isTTY) {
		console.log(`\x1b[34m[${dir}]\x1b[0m`, message);
	} else {
		console.log(`[${dir}]`, message);
	}
}

function run(command: string, args: string[], opts: child_process.SpawnSyncOptions) {
	log(opts.cwd as string || '.', '$ ' + command + ' ' + args.join(' '));

	const result = child_process.spawnSync(command, args, opts);

	if (result.error) {
		console.error(`ERR Failed to spawn process: ${result.error}`);
		process.exit(1);
	} else if (result.status !== 0) {
		console.error(`ERR Process exited with code: ${result.status}`);
		process.exit(result.status);
	}
}

function spawnAsync(command: string, args: string[], opts: child_process.SpawnOptions): Promise<string> {
	return new Promise((resolve, reject) => {
		const child = child_process.spawn(command, args, { ...opts, stdio: ['ignore', 'pipe', 'pipe'] });
		let output = '';
		child.stdout?.on('data', (data: Buffer) => { output += data.toString(); });
		child.stderr?.on('data', (data: Buffer) => { output += data.toString(); });
		child.on('error', reject);
		child.on('close', (code) => {
			if (code !== 0) {
				reject(new Error(`Process exited with code: ${code}\n${output}`));
			} else {
				resolve(output);
			}
		});
	});
}

// Retry a recursive delete on transient Windows file locks (EBUSY/EPERM).
// On non-Windows the first attempt is taken without sleeping.
function rmWithRetry(p: string, attempts = 5) {
	for (let i = 0; i < attempts; i++) {
		try {
			fs.rmSync(p, { recursive: true, force: true });
			return;
		} catch (err) {
			const code = (err as NodeJS.ErrnoException).code;
			if ((code !== 'EBUSY' && code !== 'EPERM') || i === attempts - 1) {
				throw err;
			}
			child_process.execSync(
				process.platform === 'win32' ? 'ping -n 2 127.0.0.1 >nul' : 'sleep 0.5',
				{ stdio: 'ignore', shell: true },
			);
		}
	}
}

async function npmInstallAsync(dir: string, opts?: child_process.SpawnOptions): Promise<void> {
	const finalOpts: child_process.SpawnOptions = {
		env: { ...process.env },
		...(opts ?? {}),
		cwd: path.join(root, dir),
		shell: true,
	};

	const command = process.env['npm_command'] || 'install';
	const commandArgs = command.split(' ');
	if (process.platform === 'win32') {
		const msvsVersion = process.env['VSCODE_MSVS_VERSION'] || '2022';
		if (!commandArgs.some(arg => arg.startsWith('--msvs_version='))) {
			commandArgs.push(`--msvs_version=${msvsVersion}`);
		}

		const bundledNodeGyp = path.join(import.meta.dirname, 'gyp', 'node_modules', '.bin', 'node-gyp.cmd');
		if (fs.existsSync(bundledNodeGyp) && !commandArgs.some(arg => arg.startsWith('--node_gyp='))) {
			commandArgs.push(`--node_gyp=${bundledNodeGyp}`);
		}
	}

	if (process.env['VSCODE_REMOTE_DEPENDENCIES_CONTAINER_NAME'] && /^(.build\/distro\/npm\/)?remote$/.test(dir)) {
		const syncOpts: child_process.SpawnSyncOptions = {
			env: finalOpts.env,
			cwd: root,
			stdio: 'inherit',
			shell: true,
		};
		const userinfo = os.userInfo();
		log(dir, `Installing dependencies inside container ${process.env['VSCODE_REMOTE_DEPENDENCIES_CONTAINER_NAME']}...`);

		if (process.env['npm_config_arch'] === 'arm64') {
			run('sudo', ['docker', 'run', '--rm', '--privileged', 'vscodehub.azurecr.io/multiarch/qemu-user-static@sha256:fe60359c92e86a43cc87b3d906006245f77bfc0565676b80004cc666e4feb9f0', '--reset', '-p', 'yes'], syncOpts);
		}
		run('sudo', [
			'docker', 'run',
			'-e', 'GITHUB_TOKEN',
			'-v', `${process.env['VSCODE_HOST_MOUNT']}:/root/vscode`,
			'-v', `${process.env['VSCODE_HOST_MOUNT']}/.build/.netrc:/root/.netrc`,
			'-v', `${process.env['VSCODE_NPMRC_PATH']}:/root/.npmrc`,
			'-w', path.resolve('/root/vscode', dir),
			process.env['VSCODE_REMOTE_DEPENDENCIES_CONTAINER_NAME'],
			'sh', '-c', `\"chown -R root:root ${path.resolve('/root/vscode', dir)} && export PATH="/root/vscode/.build/nodejs-musl/usr/local/bin:$PATH" && npm i -g node-gyp-build && npm ci\"`
		], syncOpts);
		run('sudo', ['chown', '-R', `${userinfo.uid}:${userinfo.gid}`, `${path.resolve(root, dir)}`], syncOpts);
	} else {
		log(dir, 'Installing dependencies...');
		const output = await spawnAsync(npm, commandArgs, finalOpts);
		if (output.trim()) {
			for (const line of output.trim().split('\n')) {
				log(dir, line);
			}
		}
	}
	removeParcelWatcherPrebuild(dir);
}

function setNpmrcConfig(dir: string, env: NodeJS.ProcessEnv) {
	const npmrcPath = path.join(root, dir, '.npmrc');
	const lines = fs.readFileSync(npmrcPath, 'utf8').split('\n');

	for (const line of lines) {
		const trimmedLine = line.trim();
		if (trimmedLine && !trimmedLine.startsWith('#')) {
			const [key, value] = trimmedLine.split('=');
			env[`npm_config_${key}`] = value.replace(/^"(.*)"$/, '$1');
		}
	}

	// Use our bundled node-gyp version. The bin dir is created at the start of
	// main(); if for some reason it isn't there (e.g. an interrupted install),
	// fall back to whatever `node-gyp` is on PATH so the call below still works.
	const bundledNodeGypBin = path.join(import.meta.dirname, 'gyp', 'node_modules', '.bin');
	const hasBundledNodeGyp =
		fs.existsSync(path.join(bundledNodeGypBin, process.platform === 'win32' ? 'node-gyp.cmd' : 'node-gyp'));
	if (hasBundledNodeGyp) {
		env['npm_config_node_gyp'] =
			process.platform === 'win32'
				? path.join(bundledNodeGypBin, 'node-gyp.cmd')
				: path.join(bundledNodeGypBin, 'node-gyp');
	} else {
		env['npm_config_node_gyp'] = 'node-gyp';
	}

	// Install scripts (e.g. sqlite3's `prebuild-install || node-gyp rebuild`) invoke
	// `node-gyp` as a bare command, which the shell resolves from PATH or the local
	// `node_modules/.bin/`. The locally installed copy is usually an older release
	// (10.3.x for sqlite3) that mis-detects the unreleased "Visual Studio 18" as
	// version `undefined`. Prepending the bundled .bin directory forces those
	// scripts to pick up our 12.x node-gyp instead.
	if (hasBundledNodeGyp) {
		const pathSep = process.platform === 'win32' ? ';' : ':';
		if (!(env['PATH'] ?? '').includes(bundledNodeGypBin)) {
			env['PATH'] = `${bundledNodeGypBin}${pathSep}${env['PATH'] ?? ''}`;
		}
	}

	// node-gyp can misread the unreleased "Visual Studio 18" (Enterprise
	// preview) as version "undefined" and bail with
	// "Could not find any Visual Studio installation to use". On Windows, pin
	// the MSVS version the runner should look for first. Override with the
	// VSCODE_MSVS_VERSION env var when a different toolchain is available.
	if (process.platform === 'win32') {
		const msvsVersion = process.env['VSCODE_MSVS_VERSION'] || '2022';
		if (!env['GYP_MSVS_VERSION']) {
			env['GYP_MSVS_VERSION'] = msvsVersion;
		}
		if (!env['npm_config_msvs_version']) {
			env['npm_config_msvs_version'] = msvsVersion;
		}
	}

	// cl.exe defaults to a 1 MB stack reserve, which is too small for the
	// binding code in some of our native modules (most recently @vscode/deviceid
	// against Electron 42.3.0 headers, which crashes with 0xC0000409
	// STATUS_STACK_BUFFER_OVERRUN). Bump the stack to 100 MB on Windows unless
	// the caller pinned a value. /GS- is also added so that buffer overruns
	// surface as a normal compiler error rather than a /GS cookie check abort.
	const winClFlags = process.env['VSCODE_WIN_CL_FLAGS'] ?? '/F 100000000 /GS-';
	if (process.platform === 'win32' && !env['CL']) {
		env['CL'] = winClFlags;
	}

	// Force node-gyp to use process.config on macOS
	// which defines clang variable as expected. Otherwise we
	// run into compilation errors due to incorrect compiler
	// configuration.
	// NOTE: This means the process.config should contain
	// the correct clang variable. So keep the version check
	// in preinstall sync with this logic.
	// Change was first introduced in https://github.com/nodejs/node/commit/6e0a2bb54c5bbeff0e9e33e1a0c683ed980a8a0f
	if ((dir === 'remote' || dir === 'build') && process.platform === 'darwin') {
		env['npm_config_force_process_config'] = 'true';
	} else {
		delete env['npm_config_force_process_config'];
	}

	if (dir === 'build') {
		// Temporarily lock the target version.
		// Node 24 V8 headers require C++20, but tree-sitter hard-pin "c++17" in their binding.gyp.
		// This is fixed in v0.25.1 however the version is not published to npm, refs
		// https://github.com/tree-sitter/node-tree-sitter/issues/268.
		// env['npm_config_target'] = process.versions.node;
		env['npm_config_arch'] = process.arch;
	}
}

function removeParcelWatcherPrebuild(dir: string) {
	const parcelModuleFolder = path.join(root, dir, 'node_modules', '@parcel');
	if (!fs.existsSync(parcelModuleFolder)) {
		return;
	}

	const parcelModules = fs.readdirSync(parcelModuleFolder);
	for (const moduleName of parcelModules) {
		if (moduleName.startsWith('watcher-')) {
			const modulePath = path.join(parcelModuleFolder, moduleName);
			try {
				rmWithRetry(modulePath);
			} catch (err) {
				const code = (err as NodeJS.ErrnoException).code;
				if (code === 'EBUSY' || code === 'EPERM') {
					log(dir, `EBUSY/EPERM removing ${modulePath} (will be retried on next install)`);
					continue;
				}
				throw err;
			}
			log(dir, `Removed @parcel/watcher prebuilt module ${modulePath}`);
		}
	}
}

function getNpmrcConfigKeys(npmrcPath: string): string[] {
	if (!fs.existsSync(npmrcPath)) {
		return [];
	}
	const lines = fs.readFileSync(npmrcPath, 'utf8').split('\n');
	const keys: string[] = [];
	for (const line of lines) {
		const trimmedLine = line.trim();
		if (trimmedLine && !trimmedLine.startsWith('#')) {
			const eqIndex = trimmedLine.indexOf('=');
			if (eqIndex > 0) {
				keys.push(trimmedLine.substring(0, eqIndex).trim());
			}
		}
	}
	return keys;
}

function clearInheritedNpmrcConfig(dir: string, env: NodeJS.ProcessEnv): void {
	const dirNpmrcPath = path.join(root, dir, '.npmrc');
	if (fs.existsSync(dirNpmrcPath)) {
		return;
	}

	for (const key of rootNpmrcConfigKeys) {
		const envKey = `npm_config_${key.replace(/-/g, '_')}`;
		delete env[envKey];
	}
}

function ensureAgentHarnessLink(sourceRelativePath: string, linkPath: string): 'existing' | 'junction' | 'symlink' | 'hard link' {
	if (fs.existsSync(linkPath)) {
		return 'existing';
	}

	const sourcePath = path.resolve(path.dirname(linkPath), sourceRelativePath);
	const isDirectory = fs.statSync(sourcePath).isDirectory();

	try {
		if (process.platform === 'win32' && isDirectory) {
			fs.symlinkSync(sourcePath, linkPath, 'junction');
			return 'junction';
		}

		fs.symlinkSync(sourceRelativePath, linkPath, isDirectory ? 'dir' : 'file');
		return 'symlink';
	} catch (error) {
		if (process.platform === 'win32' && !isDirectory && (error as NodeJS.ErrnoException).code === 'EPERM') {
			fs.linkSync(sourcePath, linkPath);
			return 'hard link';
		}

		throw error;
	}
}

async function runWithConcurrency(tasks: (() => Promise<void>)[], concurrency: number): Promise<void> {
	const errors: Error[] = [];
	let index = 0;

	async function worker() {
		while (index < tasks.length) {
			const i = index++;
			try {
				await tasks[i]();
			} catch (err) {
				errors.push(err as Error);
			}
		}
	}

	await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));

	if (errors.length > 0) {
		for (const err of errors) {
			console.error(err.message);
		}
		process.exit(1);
	}
}

async function main() {
	if (!process.env['VSCODE_FORCE_INSTALL'] && isUpToDate()) {
		log('.', 'All dependencies up to date, skipping postinstall.');
		child_process.execSync('git config pull.rebase merges');
		child_process.execSync('git config blame.ignoreRevsFile .git-blame-ignore-revs');
		return;
	}

	// Eagerly install the bundled node-gyp at build/npm/gyp so the bin dir
	// exists by the time we prepend it to PATH below. The bundled copy is
	// what we want `node-gyp` to resolve to inside subdir install scripts
	// (e.g. `extensions/copilot/node_modules/sqlite3` runs
	// `prebuild-install -r napi || node-gyp rebuild` and ships with its own
	// 10.3.1 node-gyp that mis-detects the unreleased "Visual Studio 18" as
	// version `undefined` on Windows runners).
	const gypDir = path.join(import.meta.dirname, 'gyp');
	if (fs.existsSync(path.join(gypDir, 'package.json'))) {
		const gypBin = path.join(gypDir, 'node_modules', '.bin');
		if (!fs.existsSync(gypBin)) {
			log('build/npm/gyp', 'Installing bundled node-gyp...');
			const result = child_process.spawnSync(npm, ['ci', '--no-audit', '--no-fund'], {
				cwd: gypDir,
				env: { ...process.env },
				stdio: 'inherit',
				shell: true,
			});
			if (result.status !== 0) {
				console.error(`ERR Bundled node-gyp install exited with code: ${result.status}`);
				process.exit(result.status ?? 1);
			}
		}
	}

	// Set MSVS-related env vars on the parent process so they are inherited by
	// every descendant, including install scripts that npm spawns via cmd.exe
	// with a sanitized env (the per-dir env passed to npmInstallAsync does not
	// always reach the deeply-nested `node-gyp` invocation that runs from
	// `prebuild-install || node-gyp rebuild`).
	if (process.platform === 'win32') {
		if (!process.env['GYP_MSVS_VERSION']) {
			process.env['GYP_MSVS_VERSION'] = process.env['VSCODE_MSVS_VERSION'] || '2022';
		}
		if (!process.env['npm_config_msvs_version']) {
			process.env['npm_config_msvs_version'] = process.env['VSCODE_MSVS_VERSION'] || '2022';
		}
		if (!process.env['CL']) {
			process.env['CL'] = process.env['VSCODE_WIN_CL_FLAGS'] ?? '/F 100000000 /GS-';
		}
		const bundledNodeGypBin = path.join(import.meta.dirname, 'gyp', 'node_modules', '.bin');
		const pathSep = ';';
		if (fs.existsSync(bundledNodeGypBin) && !(process.env['PATH'] ?? '').includes(bundledNodeGypBin)) {
			process.env['PATH'] = `${bundledNodeGypBin}${pathSep}${process.env['PATH'] ?? ''}`;
		}
	}

	const _state = computeState();

	const nativeTasks: (() => Promise<void>)[] = [];
	const parallelTasks: (() => Promise<void>)[] = [];

	for (const dir of dirs) {
		if (dir === '') {
			removeParcelWatcherPrebuild(dir);
			continue; // already executed in root
		}

		if (dir === 'build') {
			nativeTasks.push(() => {
				const env: NodeJS.ProcessEnv = { ...process.env };
				if (process.env['CC']) { env['CC'] = 'gcc'; }
				if (process.env['CXX']) { env['CXX'] = 'g++'; }
				if (process.env['CXXFLAGS']) { env['CXXFLAGS'] = ''; }
				if (process.env['LDFLAGS']) { env['LDFLAGS'] = ''; }
				setNpmrcConfig('build', env);
				return npmInstallAsync('build', { env });
			});
			continue;
		}

		if (/^(.build\/distro\/npm\/)?remote$/.test(dir)) {
			const remoteDir = dir;
			nativeTasks.push(() => {
				const env: NodeJS.ProcessEnv = { ...process.env };
				if (process.env['VSCODE_REMOTE_CC']) {
					env['CC'] = process.env['VSCODE_REMOTE_CC'];
				} else {
					delete env['CC'];
				}
				if (process.env['VSCODE_REMOTE_CXX']) {
					env['CXX'] = process.env['VSCODE_REMOTE_CXX'];
				} else {
					delete env['CXX'];
				}
				if (process.env['CXXFLAGS']) { delete env['CXXFLAGS']; }
				if (process.env['CFLAGS']) { delete env['CFLAGS']; }
				if (process.env['LDFLAGS']) { delete env['LDFLAGS']; }
				if (process.env['VSCODE_REMOTE_CXXFLAGS']) { env['CXXFLAGS'] = process.env['VSCODE_REMOTE_CXXFLAGS']; }
				if (process.env['VSCODE_REMOTE_LDFLAGS']) { env['LDFLAGS'] = process.env['VSCODE_REMOTE_LDFLAGS']; }
				if (process.env['VSCODE_REMOTE_NODE_GYP']) { env['npm_config_node_gyp'] = process.env['VSCODE_REMOTE_NODE_GYP']; }
				setNpmrcConfig('remote', env);
				return npmInstallAsync(remoteDir, { env });
			});
			continue;
		}

		const taskDir = dir;
		parallelTasks.push(() => {
			const env = { ...process.env };
			clearInheritedNpmrcConfig(taskDir, env);
			return npmInstallAsync(taskDir, { env });
		});
	}

	// Native dirs (build, remote) run sequentially to avoid node-gyp conflicts
	for (const task of nativeTasks) {
		await task();
	}

	// JS-only dirs run in parallel
	const concurrency = Math.min(os.cpus().length, 8);
	log('.', `Running ${parallelTasks.length} npm installs with concurrency ${concurrency}...`);
	await runWithConcurrency(parallelTasks, concurrency);

	child_process.execSync('git config pull.rebase merges');
	child_process.execSync('git config blame.ignoreRevsFile .git-blame-ignore-revs');

	fs.writeFileSync(stateFile, JSON.stringify(_state));
	fs.writeFileSync(stateContentsFile, JSON.stringify(computeContents()));

	// Symlink .claude/ files to their canonical locations to test Claude agent harness
	const claudeDir = path.join(root, '.claude');
	fs.mkdirSync(claudeDir, { recursive: true });

	const claudeMdLink = path.join(claudeDir, 'CLAUDE.md');
	const claudeMdLinkType = ensureAgentHarnessLink(path.join('..', '.github', 'copilot-instructions.md'), claudeMdLink);
	if (claudeMdLinkType !== 'existing') {
		log('.', `Created ${claudeMdLinkType} .claude/CLAUDE.md -> .github/copilot-instructions.md`);
	}

	const claudeSkillsLink = path.join(claudeDir, 'skills');
	const claudeSkillsLinkType = ensureAgentHarnessLink(path.join('..', '.agents', 'skills'), claudeSkillsLink);
	if (claudeSkillsLinkType !== 'existing') {
		log('.', `Created ${claudeSkillsLinkType} .claude/skills -> .agents/skills`);
	}

	// Temporary: patch @github/copilot-sdk session.js to fix ESM import
	// (missing .js extension on vscode-jsonrpc/node). Fixed upstream in v0.1.32.
	// TODO: Remove once @github/copilot-sdk is updated to >=0.1.32
	for (const dir of ['', 'remote']) {
		const sessionFile = path.join(root, dir, 'node_modules', '@github', 'copilot-sdk', 'dist', 'session.js');
		if (fs.existsSync(sessionFile)) {
			const content = fs.readFileSync(sessionFile, 'utf8');
			const patched = content.replace(/from "vscode-jsonrpc\/node"/g, 'from "vscode-jsonrpc/node.js"');
			if (content !== patched) {
				fs.writeFileSync(sessionFile, patched);
				log(dir || '.', 'Patched @github/copilot-sdk session.js (vscode-jsonrpc ESM import fix)');
			}
		}
	}
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
