/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */



import ngMock from 'ng_mock';
import expect from 'expect.js';
import sinon from 'sinon';

// Import this way to be able to stub/mock functions later on in the tests using sinon.
import * as newJobUtils from 'plugins/ml/jobs/new_job/utils/new_job_utils';
import * as indexUtils from 'plugins/ml/util/index_utils';

describe('ML - Job Type Controller', () => {
  beforeEach(() => {
    ngMock.module('kibana');
  });

  it('Initialize Job Type Controller', (done) => {
    const stub1 = sinon.stub(newJobUtils, 'createSearchItems').callsFake(() => ({
      indexPattern: {},
      savedSearch: {},
      combinedQuery: {}
    }));
    const stub2 = sinon.stub(indexUtils, 'timeBasedIndexCheck').callsFake(() => false);
    ngMock.inject(function ($rootScope, $controller) {
      const scope = $rootScope.$new();
      $controller('MlNewJobStepJobType', { $scope: scope });

      expect(scope.indexWarningTitle).to.eql('Index pattern undefined is not time based');
      stub1.restore();
      stub2.restore();
      done();
    });
  });
});
