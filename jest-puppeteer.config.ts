/* eslint-disable @typescript-eslint/no-var-requires */
import { BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions } from 'puppeteer';

export const launchOptions: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions = {
  dumpio: false,
  headless: false,
  product: 'chrome',
  args: [
    `--disable-extensions-except=${require('path').resolve('./dist')}`,
    `--load-extension=${require('path').resolve('./dist')}`,
    '--window-size=1344,1080',
    '--force-device-scale-factor=0.8',
  ],
  slowMo: 10,
  defaultViewport: null,
};
