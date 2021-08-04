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

    /** @private {!Map<string, Object>} */
    this.resultEls_ = {};

    /** @private {?Element} */
    this.resultsContainer_ = null;

    /** @private {boolean} */
    this.usePercentage_ = false;
  }

  /** @override */
  buildCallback() {
    return super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildResultsDetailedTemplate(this.element);
    this.buildTop();
    this.resultsContainer_ = this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-detailed'
    );
    this.usePercentage_ = decideStrategy(this.options_) === 'percentage';
    return this.rootEl_;
  }

  /** @override */
  onInteractiveReactStateUpdate(interactiveState) {
    const components = Object.values(interactiveState);
    let updateLayout = false;

    components.forEach((e) => {
      if (
        (this.usePercentage_ && e.type === InteractiveType.QUIZ) ||
        (!this.usePercentage_ && e.type === InteractiveType.POLL)
      ) {
        if (!(e.interactiveId in this.resultEls_)) {
          updateLayout = true;
          this.initializeResult_(e);
        }
        this.updateSelectedResult_(e);
      }
    });

    if (updateLayout) {
      this.updateLayout_();
    }

    super.onInteractiveReactStateUpdate(interactiveState);
  }

  /**
   * Create and store elements that will show results
   * for each interactive component.
   *
   * @param {!Array<Object>} e
   * @private
   */
  initializeResult_(e) {
    const el = document.createElement('div');
    el.classList.add('i-amphtml-story-interactive-results-result');
    this.resultsContainer_.appendChild(el);
    this.resultEls_[e.interactiveId] = {
      el,
      updated: false,
    };
  }

  /**
   * Sets the background image or text content for an updated result.
   *
   * @param {!Object} e
   * @private
   */
  updateSelectedResult_(e) {
    if (e.option && !this.resultEls_[e.interactiveId].updated) {
      if (e.option.image) {
        setImportantStyles(this.resultEls_[e.interactiveId].el, {
          'background-image': 'url(' + e.option.image + ')',
        });
      } else {
        this.resultEls_[e.interactiveId].el.textContent = e.option.text;
      }
      this.resultEls_[e.interactiveId].updated = true;
    }
  }

  /**
   * Sets (or resets) the positioning and sizing of each result.
   *
   * @private
   */
  updateLayout_() {
    for (const id in this.resultEls_) {
      setImportantStyles(this.resultEls_[id].el, {
        'height': '5em',
        'width': '5em',
      });
    }
  }
}
