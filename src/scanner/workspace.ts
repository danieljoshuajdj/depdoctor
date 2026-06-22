import { dirname, join, resolve } from 'node:path';
import fg from 'fast-glob';
import type { PackageManager, ProjectContext, RequiredDoctorConfig, WorkspaceProject } from '../types/index.js';
import { pathExists, readJson } from '../utils/fs.js';

type PackageJson = {
  name?: string;
  workspaces?: string[] | { packages?: string[] };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  optionalDependencies?: Record<string, string>;
};

export async function discoverProject(config: RequiredDoctorConfig): Promise<ProjectContext> {
  const root = resolve(config.root);
  const packageJsonPath = join(root, 'package.json');
  if (!(await pathExists(packageJsonPath))) {
    throw new Error(`No package.json found at ${packageJsonPath}`);
  }

  const rootPackage = await readProject(packageJsonPath, root);
  const lockfile = await detectLockfile(root);
  const packageManager = detectPackageManager(lockfile);
  const workspaceGlobs = await detectWorkspaceGlobs(root, rootPackage);
  const workspaces = await discoverWorkspaces(root, workspaceGlobs);

  return {
    root,
    packageManager,
    lockfile,
    isMonorepo: workspaces.length > 0,
    workspaceGlobs,
    workspaces,
    rootProject: rootPackage,
    config
  };
}

async function readProject(packageJsonPath: string, fallbackRoot: string): Promise<WorkspaceProject> {
  const json = await readJson<PackageJson>(packageJsonPath);
  return {
    name: json.name ?? dirname(packageJsonPath).split(/[\\/]/).pop() ?? 'root',
    path: dirname(packageJsonPath) || fallbackRoot,
    packageJsonPath,
    dependencies: json.dependencies ?? {},
    devDependencies: json.devDependencies ?? {},
    peerDependencies: json.peerDependencies ?? {},
    peerDependenciesMeta: json.peerDependenciesMeta,
    optionalDependencies: json.optionalDependencies ?? {}
  };
}

async function detectLockfile(root: string): Promise<string | undefined> {
  for (const file of ['pnpm-lock.yaml', 'yarn.lock', 'bun.lockb', 'bun.lock', 'package-lock.json', 'npm-shrinkwrap.json']) {
    const full = join(root, file);
    if (await pathExists(full)) return full;
  }
  return undefined;
}

function detectPackageManager(lockfile?: string): PackageManager {
  if (!lockfile) return 'unknown';
  if (lockfile.endsWith('pnpm-lock.yaml')) return 'pnpm';
  if (lockfile.endsWith('yarn.lock')) return 'yarn';
  if (lockfile.includes('bun.lock')) return 'bun';
  if (lockfile.endsWith('package-lock.json') || lockfile.endsWith('npm-shrinkwrap.json')) return 'npm';
  return 'unknown';
}

async function detectWorkspaceGlobs(root: string, rootProject: WorkspaceProject): Promise<string[]> {
  const raw = await readJson<PackageJson>(rootProject.packageJsonPath);
  const npmWorkspaces = Array.isArray(raw.workspaces) ? raw.workspaces : raw.workspaces?.packages;
  if (npmWorkspaces?.length) return npmWorkspaces;

  const pnpmWorkspace = join(root, 'pnpm-workspace.yaml');
  if (await pathExists(pnpmWorkspace)) return ['packages/*', 'apps/*'];

  if (await pathExists(join(root, 'lerna.json'))) return ['packages/*'];
  if (await pathExists(join(root, 'rush.json'))) return ['apps/*', 'packages/*', 'libraries/*'];
  if ((await pathExists(join(root, 'nx.json'))) || (await pathExists(join(root, 'turbo.json')))) {
    return ['apps/*', 'packages/*'];
  }

  return [];
}

async function discoverWorkspaces(root: string, globs: string[]): Promise<WorkspaceProject[]> {
  if (globs.length === 0) return [];
  const packageJsons = await fg(
    globs.map((pattern) => `${pattern.replace(/\/$/, '')}/package.json`),
    {
      cwd: root,
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**']
    }
  );
  return Promise.all(packageJsons.map((file) => readProject(file, root)));
}
