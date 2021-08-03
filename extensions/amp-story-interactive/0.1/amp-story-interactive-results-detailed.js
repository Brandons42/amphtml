/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {InteractiveType} from './amp-story-interactive-abstract';
import {
  AmpStoryInteractiveResults,
  decideStrategy,
} from './amp-story-interactive-results';
import {CSS} from '../../../build/amp-story-interactive-results-detailed-0.1.css';
import {htmlFor} from '#core/dom/static-template';
import {setImportantStyles} from '#core/dom/style';

/** @const {number} */
const CENTER = 9;

/** @const {number} */
const MIN_SIZE = 5;

/** @const {number} */
const MAX_SIZE = 6;

/** @const {number} */
const MIN_DIST = 5;

/** @const {number} */
const MAX_DIST = 6;

/**
 * Generates the template for the detailed results component.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildResultsDetailedTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-results-container">
      <div class="i-amphtml-story-interactive-results-prompt"></div>
      <div class="i-amphtml-story-interactive-results-title"></div>
      <div class="i-amphtml-story-interactive-results-detailed">
        <div class="i-amphtml-story-interactive-results-image"></div>
      </div>
      <div class="i-amphtml-story-interactive-results-description"></div>
    </div>
  `;
};

export class AmpStoryInteractiveResultsDetailed extends AmpStoryInteractiveResults {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {?Map<string, Object>} */
    this.selectedResultEls_ = null;

    /** @private {number} */
    this.componentCount_ = 0;
  }

  /** @override */
  buildCallback() {
    return super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildResultsDetailedTemplate(this.element);
    this.buildTop();
    return this.rootEl_;
  }

  /** @override */
  onInteractiveReactStateUpdate(interactiveState) {
    const components = Object.values(interactiveState);
    if (components.length === this.componentCount_) {
      // Function not passed in directly to ensure "this" works correctly
      components.forEach((e) => this.updateSelectedResult_(e));
    } else {
      this.initializeSelectedResultContainers_(components);
    }

    super.onInteractiveReactStateUpdate(interactiveState);
  }

  /**
   * Create and store elements that will show results
   * for each interactive component.
   *
   * @param {!Array<Object>} components
   * @private
   */
  initializeSelectedResultContainers_(components) {
    this.selectedResultEls_ = {};
    this.componentCount_ = components.length;
    const detailedResultsContainer = this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-detailed'
    );

    const slice = (2 * Math.PI) / components.length;
    const offset = Math.random() * slice;

    const usePercentage = decideStrategy(this.options_) === 'percentage';

    components.forEach((e, index) => {
      if (
        (usePercentage && e.type === InteractiveType.QUIZ) ||
        (!usePercentage && e.type === InteractiveType.POLL)
      ) {
        const container = document.createElement('div');
        container.classList.add(
          'i-amphtml-story-interactive-results-selected-result'
        );

        const angleBuffer = slice / 4;
        const size = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE;
        const angle =
          Math.random() * (slice - 2 * angleBuffer) +
          slice * index +
          angleBuffer +
          offset;
        const dist = Math.random() * (MAX_DIST - MIN_DIST) + MIN_DIST;
        const top = CENTER + Math.cos(angle) * dist - size / 2;
        const left = CENTER + Math.sin(angle) * dist - size / 2;

        setImportantStyles(container, {
          'height': size + 'em',
          'width': size + 'em',
          'top': top + 'em',
          'left': left + 'em',
        });
        detailedResultsContainer.prepend(container);
        this.selectedResultEls_[e.interactiveId] = {
          el: container,
          updated: false,
        };
        this.updateSelectedResult_(e);
      }
    });
  }

  /**
   * Sets the background image or text content for an updated result.
   *
   * @param {!Object} e
   * @private
   */
  updateSelectedResult_(e) {
    if (
      e.option &&
      e.interactiveId in this.selectedResultEls_ &&
      !this.selectedResultEls_[e.interactiveId].updated
    ) {
      if (e.option.image) {
        setImportantStyles(this.selectedResultEls_[e.interactiveId].el, {
          'background-image': 'url(' + e.option.image + ')',
        });
      } else {
        const textEl = document.createElement('span');
        textEl.textContent = e.option.text;
        this.selectedResultEls_[e.interactiveId].el.appendChild(textEl);
      }
      this.selectedResultEls_[e.interactiveId].updated = true;
    }
  }
}
