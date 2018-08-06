import { FrameworkConfiguration } from 'aurelia-framework';
import { ModelWatchConfiguration } from './model-watch-configuration';

export function configure(
  frameworkConfig: FrameworkConfiguration,
  callback?: (config: ModelWatchConfiguration) => void): void {
  let applyConfig: () => void = null as any;
  const config = new ModelWatchConfiguration(frameworkConfig, (apply: () => void) => { applyConfig = apply; });
  if (typeof callback === 'function') {
    callback(config);
  } else {
    config.useDefaults();
  }
  applyConfig();
}

export * from './model-watch';
export * from './model-watch-settings';
export * from './model-watch-configuration';
