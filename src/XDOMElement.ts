import { getDestinationInfo, saveSearchData } from './Apis';
import { Config, ConfigLoader, Hostnames } from './ConfigLoader';
import { Destination, Stats } from './Types';
import { MutationSummary } from 'mutation-summary';
import cache from 'webext-storage-cache';

export enum StorageKeys {
  DESTINATION = 'ECOMIO_LOCAL_STORAGE_DESTINATION',
}

enum AVAILABLE_ELEMENTS {
  SPAN = 'span',
  DIV = 'div',
}

enum Classes {
  LEAF = 'leaf',
  TEXT_CONTAINER = 'text-container',
  TITLE = 'title',
  DESCRIPTION = 'description',
  BUTTON = 'button',
  DISMISS = 'dismiss',
  CONTAINER = 'eco-extension-container',
  LARGE = "large",
  KAYAK = "kayak",
  TOOLTIP_CONTAINER = "tooltip",
  TOOLTIP_ICON = "tooltip_icon"
}

function rng(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

enum LeafColorClasses {
  GOOD = 'good',
  ONE_LEAF = 'oneleaf',
  NO_LEAF = 'noleaf',
  BAD = 'bad',
}

function getLeafColor(score: Stats) {
  let average = (score.air_quality + score.energy_sources + score.water_quality) / 3;
  if (average >= 80) return LeafColorClasses.GOOD;
  if (average >= 60) return LeafColorClasses.ONE_LEAF;
  if (average >= 40) return LeafColorClasses.NO_LEAF;
  return LeafColorClasses.BAD;
}

export default class XDOMElement {
  parent: Element;
  element: Element;
  styles: string;

  constructor(parent: Element, stylesAppender: IClassAppender, textAppender?: ITextAppender) {
    this.parent = parent;
    this.element = document.createElement(AVAILABLE_ELEMENTS.DIV);
    stylesAppender.appendTo(this.element);
    this.styles = stylesAppender.getStyles();
    if (textAppender) textAppender.appendTo(this.element);
  }

  appendToDom(): Element {
    const elementAlreadyAppended = this.parent.querySelector(this.styles);
    if (!elementAlreadyAppended) this.parent.appendChild(this.element);
    return this.element;
  }

  prependToDom(): Element {
    this.parent.prepend(this.element);
    return this.element;
  }
  
  replaceOrPrependToDom(): Element {
    const existingElement = this.parent.querySelector(`:scope > ${this.styles}`);
    if (existingElement) {
      this.parent.removeChild(existingElement);
    }
    this.parent.prepend(this.element);
    return this.element;
  }

  addStyles(styles: IClassAppender): Element {
    styles.appendTo(this.element);
    return this.element;
  }

  async addText(textAppender: ITextAppender) {
    textAppender.appendTo(this.element);
    return this.element;
  }
}

interface IClassAppender {
  appendTo(elem: Element): void;
  getStyles(): string;
}

export class ClassAppender implements IClassAppender {
  style: string;

  constructor(style: string) {
    this.style = style;
  }

  getStyles(): string {
    return `.${this.style}`;
  }

  appendTo(element: Element): void {
    element.classList.add(this.style);
  }
}

export class ClassArrayAppender implements IClassAppender {
  styles: string[];

  constructor(styles: string[]) {
    this.styles = styles;
  }

  getStyles(): string {
    return `.${this.styles.join('.')}`;
  }

  appendTo(element: Element): void {
    this.styles.forEach((style) => {
      element.classList.add(style);
    });
  }
}

interface ITextAppender {
  appendTo(elem: Element): Promise<void>;
}

abstract class AbstractTextAppender implements ITextAppender {
  protected appendText(element: Element, text: string) {
    const textElem = document.createElement(AVAILABLE_ELEMENTS.SPAN);
    const textNode = document.createTextNode(text);
    textElem.appendChild(textNode);
    element.appendChild(textElem);
  }
  abstract appendTo(elem: Element): Promise<void>;
}

export class TextAppender extends AbstractTextAppender {
  text: Promise<string>;

  constructor(text: Promise<string>) {
    super();
    this.text = text;
  }

  async appendTo(element: Element): Promise<void> {
    let text = await this.text;
    this.appendText(element, text);
  }
}

export class TextArrayAppender extends AbstractTextAppender implements ITextAppender {
  text: Promise<string[]>;

  constructor(text: Promise<string[]>) {
    super();
    this.text = text;
  }

  async appendTo(element: Element): Promise<void> {
    let text = await this.text;
    text.forEach((t) => {
      this.appendText(element, t);
    });
  }
}

export const defaultDestination: Destination = {
  air_quality: 0,
  content:
    'It seems like the backend is not running on localhost:8080 or is unreachable please make sure that the backend is running',
  createdAt: '',
  energy_sources: 0,
  id: 0,
  water_quality: 0,
};

export interface Observer {
  observe(): void;
}

abstract class HomePageObserver implements Observer {
  abstract setDestination(location: string): Promise<string>

  abstract observe(): void;

  abstract setSearchButtonListener(element: Element): Promise<void>;
}

export class SkyscannerHomePageObserver extends HomePageObserver {
  observer?: MutationSummary;
  config: ConfigLoader;

  constructor(config: ConfigLoader) {
    super();
    this.config = config;
  }

  observe(): void {
    let pageRoot = document.querySelector(this.config.elementSelectors.rootSelector);

    if (!pageRoot) return;

    this.observer = new MutationSummary({
      rootNode: pageRoot,
      callback: (summaries: any) => {
        summaries.forEach((summary: any) => {
          summary.added.forEach((element: any) => {
            this.setSearchButtonListener(element);
          });
        });
      },
      queries: [{ element: this.config.elementSelectors.searchButtonSelector }],
    });
  }

  async setSearchButtonListener(element: Element): Promise<void> {
    const inputelemnt = document.querySelector(this.config.elementSelectors.destinationInputSelector);

    return new Promise((resolve) => {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        const value = inputelemnt?.getAttribute('value');
        if (value)
          this.setDestination(value).then(() => {
            resolve();
          });
        else resolve();
      });
      return element;
    });
  }

  async setDestination(location: string): Promise<string> {
    const url = await cache.set(`${Hostnames.SKYSCANNER}:${StorageKeys.DESTINATION}`, location);
    return url;
  }
}

export class KayakHomePageObserver extends HomePageObserver {
  observer?: MutationSummary;
  config: ConfigLoader;

  constructor(config: ConfigLoader) {
    super();
    this.config = config;
  }

  observe(): void {
    let pageRoot = document.querySelector(this.config.elementSelectors.rootSelector);
    if (!pageRoot) return;

    const element = document.querySelector(this.config.elementSelectors.searchButtonSelector);

    if (element)
      this.setSearchButtonListener(element);
  }

  async setSearchButtonListener(element: Element): Promise<void> {
    const inputElement = document.querySelector(this.config.elementSelectors.destinationInputSelector);
    return new Promise((resolve) => {
      element.addEventListener('click', (e) => {
        e.preventDefault()
        const value = inputElement?.textContent;
        if (value)
          this.setDestination(value).then(() => {
            resolve();
          });
        else resolve();
      });
      return element;
    });
  }

  async setDestination(location: string): Promise<string> {
    const url = await cache.set(`${Hostnames.KAYAK}:${StorageKeys.DESTINATION}`, location);
    console.log(url, location)
    return url;
  }
}

export abstract class ResultsPageObserver implements Observer {
  pageRoot?: Element;
  button?: Element;
  ecoMioContainer?: Element;
  observer?: MutationSummary;
  configLoader: ConfigLoader

  constructor(configLoader: ConfigLoader) {
    let pageRoot = document.querySelector(configLoader.elementSelectors.rootSelector);
    this.configLoader = configLoader;
    if (pageRoot)
      this.pageRoot = pageRoot;
  }

  abstract getDestination(): Promise<string | undefined>

  abstract getMainContainerClasses(destinationInfo: Destination): string[]

  abstract getToolipContainerClasses(): string[]

  observe(): void {

    this.observer = new MutationSummary({
      rootNode: this.pageRoot,
      callback: (summaries: any) => {
        summaries.forEach((summary: any) => {
          summary.added.forEach((element: Element) => {
            //save the data as it arrives
            saveSearchData({
              url: window.location.toString(),
              data: element.textContent || ""
            })
            this.setupTooltips();
          });
        });
      },
      queries: [{ element: this.configLoader.elementSelectors.contentClass  }],
    });

    this.getDestination().then((destination) => {
      if (destination) {
        let destinationInfo = defaultDestination;
        getDestinationInfo()
          .then((results) => {
            // choose a random description coz we don't have a mapping
            const len = results.destinations.length;
            destinationInfo = results.destinations[rng(0, len - 1)];
          })
          .finally(() => {
            this.createPopup(destinationInfo, destination);
          });
      }
    });
  }

  async createPopup(destinationInfo: Destination, destinationName: string) {
    // remove previous container
    await this.onDismiss();

    const styleAppender = new ClassArrayAppender(this.getMainContainerClasses(destinationInfo));
    const containerElement = new XDOMElement(this.pageRoot!, styleAppender);
    const container = containerElement.appendToDom();

    this.ecoMioContainer = container;

    const styleAppenderLeaf = new ClassAppender(Classes.LEAF);
    const leafElement = new XDOMElement(container, styleAppenderLeaf);
    leafElement.appendToDom();

    const styleAppenderTextContainer = new ClassAppender(Classes.TEXT_CONTAINER);
    const textContainerElement = new XDOMElement(container, styleAppenderTextContainer);
    const textContainer = textContainerElement.appendToDom();

    const styleAppenderTitle = new ClassAppender(Classes.TITLE);
    const titleTextAppender = new TextAppender(Promise.resolve(destinationName));
    const titleElement = new XDOMElement(textContainer, styleAppenderTitle, titleTextAppender);
    titleElement.appendToDom();

    const styleAppenderDescription = new ClassAppender(Classes.DESCRIPTION);
    const descriptionTextAppender = new TextAppender(Promise.resolve(destinationInfo.content));
    const descriptionElement = new XDOMElement(textContainer, styleAppenderDescription, descriptionTextAppender);
    descriptionElement.appendToDom();

    const styleAppenderButton = new ClassAppender(Classes.BUTTON);
    const buttonTextAppender = new TextAppender(Promise.resolve('Dismiss'));
    const buttonElement = new XDOMElement(container, styleAppenderButton, buttonTextAppender);
    const button = buttonElement.appendToDom();

    this.button = button;
    this.setupDismissListener();
  }

  async createTooltipIcon(elementToAttachTo: Element) {
    const styleAppender = new ClassArrayAppender(this.getToolipContainerClasses());
    const containerElement = new XDOMElement(elementToAttachTo, styleAppender);
    const container = containerElement.replaceOrPrependToDom();

    const styleAppenderLeaf = new ClassAppender(Classes.TOOLTIP_ICON);
    const leafElement = new XDOMElement(container, styleAppenderLeaf);
    leafElement.appendToDom();
  }

  setupDismissListener() {
    if (this.button) this.button.addEventListener('click', this.onDismiss.bind(this));
  }

  async onDismiss(): Promise<void> {
    if (this.ecoMioContainer) this.ecoMioContainer.classList.add(Classes.DISMISS);

    // Remove the component after animation finishes
    return new Promise((resolve) =>
      setTimeout(() => {
        this.cleanup();
        resolve();
      }, 800),
    );
  }

  setupTooltips(): Promise<void> {
    return new Promise((resolve) => {
      //dirty solution for now. this should be an observer as well.
      setTimeout(() => {
        const all_search_buttons = document.querySelectorAll(this.configLoader.elementSelectors.individualFlightButtonSelectors);

        all_search_buttons.forEach((button) => {
          this.createTooltipIcon(button)
        });

        resolve();
      }, 2000);
    });
  }

  cleanup() {
    if (this.ecoMioContainer) this.ecoMioContainer.remove();
  }
}


export class KayakResultsPageObserver extends ResultsPageObserver implements Observer {
  getToolipContainerClasses(): string[] {
    return [Classes.TOOLTIP_CONTAINER, Classes.KAYAK]
  }

  async getDestination() {
    const url = await cache.get<string>(`${Hostnames.KAYAK}:${StorageKeys.DESTINATION}`);
    return url;
  }

  getMainContainerClasses(destinationInfo: Destination): string[] {
    return [Classes.CONTAINER, getLeafColor(destinationInfo), Classes.KAYAK]
  }

}



export class SkyscannerResultsPageObserver extends ResultsPageObserver implements Observer {
  getToolipContainerClasses(): string[] {
    return [Classes.TOOLTIP_CONTAINER]
  }

  async getDestination() {
    const url = await cache.get<string>(`${Hostnames.SKYSCANNER}:${StorageKeys.DESTINATION}`);
    return url;
  }

  getMainContainerClasses(destinationInfo: Destination): string[] {
    return [Classes.CONTAINER, getLeafColor(destinationInfo)]
  }
}