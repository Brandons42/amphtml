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

import {
  Action,
  AmpStoryStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {AmpStoryInteractiveResultsDetailed} from '../amp-story-interactive-results-detailed';
import {InteractiveType} from '../amp-story-interactive-abstract';
import {LocalizationService} from '#service/localization';
import {Services} from '#service';
import {addConfigToInteractive} from './helpers';
import {addThresholdsToInteractive} from './test-amp-story-interactive-results';
import {registerServiceBuilder} from '../../../../src/service-helpers';

describes.realWin(
  'amp-story-interactive-results-detailed',
  {
    amp: true,
  },
  (env) => {
    let win;
    let ampStoryResultsDetailed;
    let storyEl;
    let storeService;

    beforeEach(() => {
      win = env.win;

      const ampStoryResultsDetailedEl = win.document.createElement(
        'amp-story-interactive-results-detailed'
      );
      ampStoryResultsDetailedEl.getResources = () =>
        win.__AMP_SERVICES.resources.obj;

      storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      const localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationServiceForOrNull')
        .returns(Promise.resolve(localizationService));

      storyEl = win.document.createElement('amp-story');
      const storyPage = win.document.createElement('amp-story-page');
      const gridLayer = win.document.createElement('amp-story-grid-layer');
      gridLayer.appendChild(ampStoryResultsDetailedEl);
      storyPage.appendChild(gridLayer);
      storyEl.appendChild(storyPage);

      win.document.body.appendChild(storyEl);
      ampStoryResultsDetailed = new AmpStoryInteractiveResultsDetailed(
        ampStoryResultsDetailedEl
      );
      env.sandbox
        .stub(ampStoryResultsDetailed, 'mutateElement')
        .callsFake((fn) => fn());
    });

    it('should throw an error with fewer than two options', () => {
      addConfigToInteractive(ampStoryResultsDetailed, 1);
      allowConsoleError(() => {
        expect(() => {
          ampStoryResultsDetailed.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should not throw an error with two-four options', () => {
      addConfigToInteractive(ampStoryResultsDetailed, 3);
      expect(() => ampStoryResultsDetailed.buildCallback()).to.not.throw();
    });

    it('should throw an error with more than four options', () => {
      addConfigToInteractive(ampStoryResultsDetailed, 5);
      allowConsoleError(() => {
        expect(() => {
          ampStoryResultsDetailed.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should set the text for the category on update', async () => {
      addConfigToInteractive(ampStoryResultsDetailed, 3);
      await ampStoryResultsDetailed.buildCallback();
      await ampStoryResultsDetailed.layoutCallback();
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {'resultscategory': 'results-category 2'},
        'type': InteractiveType.POLL,
      });
      expect(
        ampStoryResultsDetailed.rootEl_.querySelector(
          '.i-amphtml-story-interactive-results-title'
        ).textContent
      ).to.equal('results-category 2');
    });

    it('should set the text for the percentage category on update', async () => {
      addThresholdsToInteractive(ampStoryResultsDetailed, [80, 20, 50]);
      await ampStoryResultsDetailed.buildCallback();
      await ampStoryResultsDetailed.layoutCallback();
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {correct: 'correct'},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'j',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      expect(
        ampStoryResultsDetailed.rootEl_.querySelector(
          '.i-amphtml-story-interactive-results-title'
        ).textContent
      ).to.equal('results-category 3');
    });

    it('should set the percentage for the percentage category on update', async () => {
      addThresholdsToInteractive(ampStoryResultsDetailed, [80, 20, 50]);
      await ampStoryResultsDetailed.buildCallback();
      await ampStoryResultsDetailed.layoutCallback();
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {correct: 'correct'},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'j',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'k',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      expect(
        ampStoryResultsDetailed.rootEl_.querySelector(
          '.i-amphtml-story-interactive-results-top-value-number'
        ).textContent
      ).to.equal('33');
    });

    it('should correctly create elements corresponding to the number of interactive components', async () => {
      addThresholdsToInteractive(ampStoryResultsDetailed, [80, 20, 50]);
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {correct: 'correct'},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'j',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'k',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      await ampStoryResultsDetailed.buildCallback();
      await ampStoryResultsDetailed.layoutCallback();
      expect(
        ampStoryResultsDetailed.rootEl_.querySelector(
          '.i-amphtml-story-interactive-results-detailed'
        ).children.length
      ).to.equal(4);
    });
  }
);
