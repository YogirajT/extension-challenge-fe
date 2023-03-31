import { Destination } from "./Types";

enum AVAILABLE_ELEMENTS {
  SPAN = 'span',
  DIV = 'div'
}

export default class XDOMElement {
  parent: Element;
  element: Element;
  styles: string;

  constructor(
    parent: Element,
    stylesAppender: IClassAppender,
    textAppender?: ITextAppender,
  ) {
    this.parent = parent;
    this.element = document.createElement(AVAILABLE_ELEMENTS.DIV);
    stylesAppender.appendTo(this.element);
    this.styles = stylesAppender.getStyles();
    if (textAppender) textAppender.appendTo(this.element);
  }

  appendToDom(): Element {
    const elementAlreadyAppended = this.parent.querySelector(this.styles);
    if (!elementAlreadyAppended) 
      this.parent.appendChild(this.element);
    return this.element;
  }

  prependToDom(overwrite?: boolean): Element {
    const existedElement = this.parent.querySelector(`:scope > ${this.styles}`);
    if (existedElement && overwrite) {
      this.parent.removeChild(existedElement);
    }
    this.parent.prepend(this.element);
    return this.element;
  }

  addStyles(styles: IClassAppender): Element {
    styles.appendTo(this.element);
    return this.element;
  }

  async addText(textAppender: ITextAppender) {
    textAppender.appendTo(this.element)
    return this.element;
  }
}


interface IClassAppender {
  appendTo(elem: Element): void;
  getStyles(): string;
} 

export class ClassAppender implements IClassAppender {
  style: string

  constructor(style: string) {
    this.style = style
  }

  getStyles(): string {
    return `.${this.style}`;
  }

  appendTo(element: Element): void {
    element.classList.add(this.style);
  }
}

export class ClassArrayAppender implements IClassAppender {
  styles: string[]

  constructor(styles: string[]) {
    this.styles = styles
  }

  getStyles(): string {
    return `.${this.styles.join(" .")}`;
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
  abstract appendTo(elem: Element): Promise<void>
}

export class TextAppender extends AbstractTextAppender {
  text: Promise<string>

  constructor(text: Promise<string>) {
    super()
    this.text = text
  }

  async appendTo(element: Element): Promise<void> {
    let text = await this.text;
    this.appendText(element, text);
  }
}

export class TextArrayAppender extends AbstractTextAppender implements ITextAppender {
  text: Promise<string[]>

  constructor(text: Promise<string[]>) {
    super()
    this.text = text
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
  content: "It seems like the backend is not running on localhost:8080 or is unreachable please make sure that the backend is running",
  createdAt: "",
  energy_sources: 0,
  id: 0,
  water_quality: 0
}