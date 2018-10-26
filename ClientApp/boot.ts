import 'isomorphic-fetch';
import { Aurelia, PLATFORM } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';
declare const IS_DEV_BUILD: boolean; // The value is supplied by Webpack during the build

export function configure(aurelia: Aurelia) {
  aurelia.use.standardConfiguration()
    .globalResources([
      PLATFORM.moduleName("resources/converters/glyphs/glyph-context"),
      PLATFORM.moduleName("resources/converters/dates/datetime-value-converter"),
      PLATFORM.moduleName("resources/grid/grid"),
      PLATFORM.moduleName("resources/modern-dialog/modern-dialog"),
    ]);

  if (IS_DEV_BUILD) {
    aurelia.use.developmentLogging();
  }

  new HttpClient().configure(config => {
    const baseUrl = document.getElementsByTagName('base')[0].href;
    config.withBaseUrl(baseUrl);
  });

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app/components/app/app')));
}
