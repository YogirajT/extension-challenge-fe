const SITE_CONFIG = {
  'www.skyscanner.com': {
    destinationInputSelector: '#destinationInput-input',
    rootSelector: "#pagewrap"
  },
  'www.kayak.com': {
    destinationInputSelector: '#destinationInput-input',
    rootSelector: "#pagewrap"
  },
};

export enum Hostnames {
  SKYSCANNER = 'www.skyscanner.com',
  KAYAK = 'www.kayak.com',
}

export type Config = {
  destinationInputSelector: string;
  rootSelector: string;
};

export class ConfigLoader {
  config: Config;

  constructor(hostname: Hostnames) {
    this.config = SITE_CONFIG[hostname];
  }
}