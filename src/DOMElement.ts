export default class DOMElement {
  parent: HTMLElement;
  //|(or operators) are typescript hack we should avoid;
  styles: string | string[];
  element: HTMLElement;

  constructor(
    parent: HTMLElement,
    styles: string | string[],
    // type can be simplified and we can remove the | hacks.
    text?: Promise<string | string[]> | string | string[],
    // remove unused var
    link?: string,
  ) {
    this.parent = parent;
    this.styles = styles;
    this.element = document.createElement('div');
    this.element = this.addStyles(this.styles);
    if (text) this.addText(text);
  }

  appendToDom(): HTMLElement {
    // unnecessary null comparison can directly check !elementAlreadyAppended
    const elementAlreadyAppended = this.parent.querySelector(`.${this.styles}`) !== null;
    if (!elementAlreadyAppended) this.parent.appendChild(this.element);
    return this.element;
  }

  prependToDom(overwrite?: boolean): HTMLElement {
    const existedElement = this.parent.querySelector(`:scope > .${this.styles}`);
    // can be simplified. check implementation in XDOMElements.ts
    if (existedElement) {
      if (overwrite) this.parent.removeChild(existedElement);
      else return this.element;
    }
    this.parent.prepend(this.element);
    return this.element;
  }

  addStyles(styles: string | string[]): HTMLElement {
    this.style(this.element, styles);
    return this.element;
  }

  private async addText(text: Promise<string | string[]> | string | string[]) {
    // these if else conditions can be simplified by sprinkling a bit of polymorphism and some DI magic
    if (text instanceof Promise) text = await text;
    if (typeof text === 'string') {
      this.appendText(text);
    } else
      text.forEach((textElement) => {
        this.appendText(textElement);
      });
  }

  private appendText(text: string) {
    //avoid loose string in code this can be an enum or a factory if we needed more than
    // one type or a buider if we had to configure the element in different places.
    const textElem = document.createElement('span');
    const textNode = document.createTextNode(text);
    textElem.appendChild(textNode);
    this.element.appendChild(textElem);
  }

  private style(elem: HTMLElement, styles: string | string[]): HTMLElement {
    // these if else conditions can be simplified by sprinkling a bit of polymorphism and some DI magic
    if (typeof styles === 'string') {
      elem.classList.add(styles);
    } else {
      styles.forEach((style) => {
        elem.classList.add(style);
      });
    }
    return elem;
  }
}
