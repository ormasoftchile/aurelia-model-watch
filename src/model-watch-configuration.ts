import { FrameworkConfiguration } from 'aurelia-framework';
import { ModelWatchSettings, DefaultModelWatchSettings } from './model-watch-settings';
import { PLATFORM } from 'aurelia-pal';

const resources: { [key: string]: string } = {
  'model-watch': PLATFORM.moduleName('./model-watch'),
};

// tslint:disable-next-line:max-line-length
export type ModelWatchResourceName = 'model-watch';

/**
 * A configuration builder for the dialog plugin.
 */
export class ModelWatchConfiguration {
  private fwConfig: FrameworkConfiguration;
  private resources: string[] = [];

  /**
   * The global configuration settings.
   */
  public settings: ModelWatchSettings;

  constructor(frameworkConfiguration: FrameworkConfiguration, applySetter: (apply: () => void) => void) {
    this.fwConfig = frameworkConfiguration;
    this.settings = this.fwConfig.container.get(DefaultModelWatchSettings);
    applySetter(() => this._apply());
  }

  private _apply(): void {
    this.resources.forEach(resourceName => this.fwConfig.globalResources(resources[resourceName]));
  }

  /**
   * Selects the Aurelia conventional defaults for the dialog plugin.
   * @return This instance.
   */
  public useDefaults(): this {
    return this
      .useStandardResources();
  }

  /**
   * Exports the standard set of dialog behaviors to Aurelia's global resources.
   * @return This instance.
   */
  public useStandardResources(): this {
    return this.useResource('model-watch');
  }

  /**
   * Exports the chosen dialog element or view to Aurelia's global resources.
   * @param resourceName The name of the dialog resource to export.
   * @return This instance.
   */
  public useResource(resourceName: ModelWatchResourceName): this {
    this.resources.push(resourceName);
    return this;
  }
}
