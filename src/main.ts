import { ConfigLoader, Hostnames } from './ConfigLoader';
import { KayakHomePageObserver, KayakResultsPageObserver, Observer, ResultsPageObserver, SkyscannerHomePageObserver, SkyscannerResultsPageObserver } from './XDOMElement';

class BootstrapPlugin {
  configLoader: ConfigLoader;
  observer?: Observer;

  constructor(configLoader: ConfigLoader) {
    this.configLoader = configLoader;
  }

  init(observer: Observer) {
    if (document.readyState === 'loading') {
      document.addEventListener(
        'DOMContentLoaded',
        () => {
          this.observer = observer
        },
        false,
      );
    } else {
      this.observer = observer
    }
    return this;
  }

  observe() {
    this.observer?.observe();
  }
}

const hostname = window.location.hostname as Hostnames;
const path = window.location.pathname as Hostnames;

const configLoader = new ConfigLoader(hostname, path);

const isHomepage = configLoader.path.length <= 1;

let observer;


if (configLoader.host === Hostnames.SKYSCANNER) {

  if (isHomepage) {
    observer = new SkyscannerHomePageObserver(configLoader);
  } else {
    observer = new SkyscannerResultsPageObserver(configLoader);
  }

} else if (configLoader.host === Hostnames.KAYAK) {

  if (isHomepage) {
    observer = new KayakHomePageObserver(configLoader);
  } else {
    observer = new KayakResultsPageObserver(configLoader);
  }

}

if (observer) {
  new BootstrapPlugin(configLoader).init(observer).observe();
}

