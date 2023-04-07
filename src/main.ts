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
    return this;
  }
}

const hostname = window.location.hostname as Hostnames;
const path = window.location.pathname as Hostnames;

const configLoader = new ConfigLoader(hostname, path);

const isHomepage = configLoader.path.length <= 1;

let observer;

switch (configLoader.host) {
  case Hostnames.SKYSCANNER:
    observer = isHomepage ? new SkyscannerHomePageObserver(configLoader) : new SkyscannerResultsPageObserver(configLoader);
    break;
  case Hostnames.KAYAK:
    observer = isHomepage ? new KayakHomePageObserver(configLoader) : new KayakResultsPageObserver(configLoader);
    break;
  default:
    // handle other hosts or throw an error if necessary
}

if (observer) {
  new BootstrapPlugin(configLoader).init(observer).observe();
}

