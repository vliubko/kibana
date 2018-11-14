/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
// @ts-ignore
import url from 'url';
import { ConditionalHeaders, KbnServer, ReportingJob } from '../../../types';
import { getAbsoluteUrlFactory } from './get_absolute_url';

function getSavedObjectAbsoluteUrl(job: ReportingJob, relativeUrl: string, server: KbnServer) {
  const getAbsoluteUrl: any = getAbsoluteUrlFactory(server);

  const { pathname: path, hash, search } = url.parse(relativeUrl);
  return getAbsoluteUrl({ basePath: job.basePath, path, hash, search });
}

export const addForceNowQuerystring = async ({
  job,
  conditionalHeaders,
  logo,
  server,
}: {
  job: ReportingJob;
  conditionalHeaders?: ConditionalHeaders;
  logo?: any;
  server: KbnServer;
}) => {
  // if no URLS then its from PNG which should only have one so put it in the array and process as PDF does
  if (!job.urls) {
    if (!job.relativeUrl) {
      throw new Error(`Unable to generate report. Url is not defined.`);
    }
    job.urls = [getSavedObjectAbsoluteUrl(job, job.relativeUrl, server)];
  }

  const urls = job.urls.map(jobUrl => {
    if (!job.forceNow) {
      return jobUrl;
    }

    const parsed: any = url.parse(jobUrl, true);
    const hash: any = url.parse(parsed.hash.replace(/^#/, ''), true);

    const transformedHash = url.format({
      pathname: hash.pathname,
      query: {
        ...hash.query,
        forceNow: job.forceNow,
      },
    });

    return url.format({
      ...parsed,
      hash: transformedHash,
    });
  });

  return { job, conditionalHeaders, logo, urls, server };
};
