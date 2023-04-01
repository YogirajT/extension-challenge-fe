
export enum Hostnames {
  SKYSCANNER = 'www.skyscanner.com',
  KAYAK = 'www.kayak.com',
}

const SITE_CONFIG = {
  [Hostnames.SKYSCANNER]: {
    destinationInputSelector: '#destinationInput-input',
    rootSelector: ".keel",
    searchButtonSelector: '[data-testid="desktop-cta"]',
    individualFlightButtonSelectors: '[class*="TicketStub_ctaButton"]',
    // very bad idea with this randomly generated hash
    contentClass: ".UpperTicketBody_screenReaderOnly__YTY2Z"
  },
  [Hostnames.KAYAK]: {
    destinationInputSelector: '.zEiP-destination .vvTc-item',
    rootSelector: ".keel",
    searchButtonSelector: '.Iqt3-mod-size-large',
    individualFlightButtonSelectors: 'a.Iqt3',
    contentClass: ".nrc6-wrapper"
  },
};
"Iqt3 Iqt3-mod-bold Button-No-Standard-Style Iqt3-mod-variant-solid Iqt3-mod-theme-progress Iqt3-mod-shape-rounded-medium Iqt3-mod-shape-mod-default Iqt3-mod-spacing-default Iqt3-mod-size-large Iqt3-mod-animation-search"
export type Config = {
  destinationInputSelector: string;
  rootSelector: string;
  searchButtonSelector: string;
  individualFlightButtonSelectors: string;
  contentClass: string;
};

export class ConfigLoader {
  elementSelectors: Config;
  host: Hostnames;
  path: string;

  constructor(hostname: Hostnames, path: string) {
    this.elementSelectors = SITE_CONFIG[hostname];
    this.host = hostname;
    this.path = path;
  }
}
