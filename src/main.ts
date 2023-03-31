import { getDestinationInfo } from './Apis';
import { ConfigLoader, Hostnames } from './ConfigLoader';
import { MutationSummary } from 'mutation-summary';
import XDOMElement, { ClassAppender, ClassArrayAppender, TextAppender, defaultDestination } from './XDOMElement';
import { Destination, Stats } from './Types';

function rng(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

enum LeafColorClasses {
  GOOD = "good",
  ONE_LEAF = "oneleaf",
  NO_LEAF = "noleaf",
  BAD = "bad"
}

enum Classes {
  LEAF = "leaf",
  TEXT_CONTAINER = "text-container",
  TITLE = "title",
  DESCRIPTION = "description",
  BUTTON = "button",
  DISMISS = "dismiss",
  CONTAINER = "eco-extension-container"
}


function getLeafColor(score: Stats) {
  let average = (score.air_quality + score.energy_sources + score.water_quality) / 3
  if (average >= 80) return LeafColorClasses.GOOD
  if (average >= 60) return LeafColorClasses.ONE_LEAF
  if (average >= 40) return LeafColorClasses.NO_LEAF
  return LeafColorClasses.BAD
}

class BootstrapPLugin {
  observer?: MutationSummary;

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener(
        'DOMContentLoaded',
        () => {
          this.setupListeners();
        },
        false,
      );
    } else {
      this.setupListeners();
    }
  }

  setupListeners() {
    const hostname = window.location.hostname as Hostnames;

    const { config } = new ConfigLoader(hostname);

    let pagewrap = document.querySelector(config.rootSelector);

    this.observer = new MutationSummary({
      rootNode: pagewrap!,
      callback: (summaries: any) => {
        summaries.forEach((summary: any) => {
          summary.added.forEach((idElement: any) => {
            idElement.addEventListener('change', (event: any) => {
              const destination = event?.target?.value;
              let destinationInfo = defaultDestination;
              getDestinationInfo()
                .then((results) => {
                  // choose a random description coz we don't have a mapping
                  const len = results.destinations.length;
                  destinationInfo = results.destinations[rng(0, len - 1)];
                })
                .finally(() => {
                  const styleAppender = new ClassArrayAppender([Classes.CONTAINER, getLeafColor(destinationInfo)]);
                  const containerElement = new XDOMElement(pagewrap!, styleAppender);
                  const container = containerElement.appendToDom();

                  const styleAppenderLeaf = new ClassAppender(Classes.LEAF);
                  const leafElement = new XDOMElement(container, styleAppenderLeaf);
                  const leaf = leafElement.appendToDom();

                  const styleAppenderTextContainer = new ClassAppender(Classes.TEXT_CONTAINER);
                  const textContainerElement = new XDOMElement(container, styleAppenderTextContainer);
                  const textContainer = textContainerElement.appendToDom();

                  const styleAppenderTitle = new ClassAppender(Classes.TITLE);
                  const titleTextAppender = new TextAppender(Promise.resolve(destination));
                  const titleElement = new XDOMElement(textContainer, styleAppenderTitle, titleTextAppender);
                  const title = titleElement.appendToDom();

                  const styleAppenderDescription = new ClassAppender(Classes.DESCRIPTION);
                  const descriptionTextAppender = new TextAppender(Promise.resolve(destinationInfo.content));
                  const descriptionElement = new XDOMElement(textContainer, styleAppenderDescription, descriptionTextAppender);
                  const description = descriptionElement.appendToDom();

                  const styleAppenderButton = new ClassAppender(Classes.BUTTON);
                  const buttonTextAppender = new TextAppender(Promise.resolve("Dismiss"));
                  const buttonElement = new XDOMElement(container, styleAppenderButton, buttonTextAppender);
                  const button = buttonElement.appendToDom();
                  button.addEventListener('click', () => {
                    container.classList.add(Classes.DISMISS)
                  })
                });
            });
          });
        });
      },
      queries: [{ element: config.destinationInputSelector }],
    });
  }

  gc() {
    if (this.observer) this.observer.disconnect();
  }
}

new BootstrapPLugin().init();
