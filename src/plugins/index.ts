import { pathToFileURL } from 'node:url';
import type { DoctorPlugin, PluginApi, Reporter, Rule } from '../types/index.js';

export class PluginHost implements PluginApi {
  readonly rules: Rule[] = [];
  readonly reporters = new Map<string, Reporter>();

  addRule(rule: Rule): void {
    this.rules.push(rule);
  }

  addReporter(name: string, reporter: Reporter): void {
    this.reporters.set(name, reporter);
  }
}

export async function loadPlugins(pluginNames: string[]): Promise<PluginHost> {
  const host = new PluginHost();
  for (const pluginName of pluginNames) {
    const mod = (await import(resolvePlugin(pluginName))) as { default?: DoctorPlugin; plugin?: DoctorPlugin };
    const plugin = mod.default ?? mod.plugin;
    if (!plugin) throw new Error(`Plugin ${pluginName} did not export a plugin.`);
    await plugin.setup(host);
  }
  return host;
}

function resolvePlugin(pluginName: string): string {
  if (pluginName.startsWith('.') || pluginName.startsWith('/') || /^[A-Za-z]:[\\/]/.test(pluginName)) {
    return pathToFileURL(pluginName).href;
  }
  return pluginName;
}
