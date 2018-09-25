/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectI18n, FormattedMessage } from '@kbn/i18n/react';

import {
  EuiButtonEmpty,
  EuiCallOut,
  EuiDescribedFormGroup,
  EuiFieldNumber,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiLink,
  EuiSpacer,
  EuiText,
  EuiTextColor,
  EuiTitle,
} from '@elastic/eui';

import { INDEX_PATTERN_ILLEGAL_CHARACTERS_VISIBLE } from 'ui/index_patterns';
import { INDEX_ILLEGAL_CHARACTERS_VISIBLE } from 'ui/indices';
import { logisticalDetailsUrl, cronUrl } from '../../../services';
import { CronEditor } from './components';

const indexPatternIllegalCharacters = INDEX_PATTERN_ILLEGAL_CHARACTERS_VISIBLE.join(' ');
const indexIllegalCharacters = INDEX_ILLEGAL_CHARACTERS_VISIBLE.join(' ');

export class StepLogisticsUi extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    onFieldsChange: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired,
    areStepErrorsVisible: PropTypes.bool.isRequired,
    isValidatingIndexPattern: PropTypes.bool.isRequired,
    hasMatchingIndices: PropTypes.bool.isRequired,
    indexPatternAsyncErrors: PropTypes.array,
  }

  constructor(props) {
    super(props);

    this.state = {
      simpleRollupCron: props.fields.rollupCron,
    };
  }

  showAdvancedCron = () => {
    const { onFieldsChange } = this.props;
    this.setState({
      simpleRollupCron: this.props.fields.rollupCron,
    });
    onFieldsChange({
      isAdvancedCronVisible: true,
    });
  };

  hideAdvancedCron = () => {
    const { onFieldsChange } = this.props;
    const { simpleRollupCron } = this.state;
    onFieldsChange({
      isAdvancedCronVisible: false,
      // Restore the last value of the simple cron editor.
      rollupCron: simpleRollupCron,
    });
  };

  renderIndexPatternHelpText() {
    const {
      isValidatingIndexPattern,
      hasMatchingIndices,
    } = this.props;

    if(!isValidatingIndexPattern && hasMatchingIndices) {
      return (
        <EuiTextColor color="secondary">
          <p>
            <FormattedMessage
              id="xpack.rollupJobs.create.stepLogistics.fieldIndexPattern.helpHasMatches.label"
              defaultMessage="Success! Index pattern has matching indices."
            />
          </p>
        </EuiTextColor>
      );
    }

    let indexPatternValidationStatus;

    if (isValidatingIndexPattern) {
      indexPatternValidationStatus = (
        <p>
          <FormattedMessage
            id="xpack.rollupJobs.create.stepLogistics.fieldIndexPattern.helpSearching.label"
            defaultMessage="Looking for matching indices..."
          />
        </p>
      );
    } else {
      indexPatternValidationStatus = (
        <p>
          <FormattedMessage
            id="xpack.rollupJobs.create.stepLogistics.fieldIndexPattern.helpMustMatch.label"
            defaultMessage="Index pattern must match at least one non-rollup index."
          />
        </p>
      );
    }

    return (
      <Fragment>
        {indexPatternValidationStatus}
        <p>
          <FormattedMessage
            id="xpack.rollupJobs.create.stepLogistics.fieldIndexPattern.helpAllow.label"
            defaultMessage="You can use a {asterisk} as a wildcard in your index pattern."
            values={{ asterisk: <strong>*</strong> }}
          />
        </p>
        <p>
          <FormattedMessage
            id="xpack.rollupJobs.create.stepLogistics.fieldIndexPattern.helpDisallow.label"
            defaultMessage="You can't use spaces or the characters {characterList}"
            values={{ characterList: <strong>{indexPatternIllegalCharacters}</strong> }}
          />
        </p>
      </Fragment>
    );
  }

  renderCronEditor() {
    const {
      fields,
      onFieldsChange,
      areStepErrorsVisible,
      fieldErrors,
    } = this.props;

    const {
      rollupCron,
      cronFrequency,
      isAdvancedCronVisible,
      fieldToPreferredValueMap,
    } = fields;

    const {
      rollupCron: errorRollupCron,
    } = fieldErrors;

    if (isAdvancedCronVisible) {
      return (
        <Fragment>
          <EuiFormRow
            label={(
              <FormattedMessage
                id="xpack.rollupJobs.create.stepLogistics.fieldCron.label"
                defaultMessage="Cron pattern"
              />
            )}
            error={errorRollupCron}
            isInvalid={Boolean(areStepErrorsVisible && errorRollupCron)}
            helpText={(
              <Fragment>
                <p>
                  <FormattedMessage
                    id="xpack.rollupJobs.create.stepLogistics.fieldCron.helpReference.label"
                    defaultMessage="{link}"
                    values={{ link: (
                      <EuiLink href={cronUrl} target="_blank">
                        <FormattedMessage
                          id="xpack.rollupJobs.create.stepLogistics.fieldCron.helpReference.link"
                          defaultMessage="Learn more about cron syntax"
                        />
                      </EuiLink>
                    ) }}
                  />
                </p>
              </Fragment>
            )}
            fullWidth
          >
            <EuiFieldText
              value={rollupCron}
              onChange={e => onFieldsChange({ rollupCron: e.target.value })}
              isInvalid={Boolean(areStepErrorsVisible && errorRollupCron)}
              fullWidth
            />
          </EuiFormRow>

          <EuiText size="s">
            <EuiLink onClick={this.hideAdvancedCron}>
              <FormattedMessage
                id="xpack.rollupJobs.create.stepLogistics.sectionSchedule.buttonAdvanced.label"
                defaultMessage="Create basic interval"
              />
            </EuiLink>
          </EuiText>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <CronEditor
          fieldToPreferredValueMap={fieldToPreferredValueMap}
          cronExpression={rollupCron}
          frequency={cronFrequency}
          onChange={({
            cronExpression,
            frequency,
            fieldToPreferredValueMap,
          }) => onFieldsChange({
            rollupCron: cronExpression,
            cronFrequency: frequency,
            fieldToPreferredValueMap,
          })}
        />

        <EuiText size="s">
          <EuiLink onClick={this.showAdvancedCron}>
            <FormattedMessage
              id="xpack.rollupJobs.create.stepLogistics.sectionSchedule.buttonAdvanced.label"
              defaultMessage="Create advanced cron expression"
            />
          </EuiLink>
        </EuiText >
      </Fragment>
    );
  }

  render() {
    const {
      fields,
      onFieldsChange,
      areStepErrorsVisible,
      fieldErrors,
      isValidatingIndexPattern,
      indexPatternAsyncErrors,
    } = this.props;

    const {
      id,
      indexPattern,
      rollupIndex,
      rollupPageSize,
      rollupDelay,
    } = fields;

    const {
      id: errorId,
      indexPattern: errorIndexPattern,
      rollupIndex: errorRollupIndex,
      rollupPageSize: errorRollupPageSize,
      rollupDelay: errorRollupDelay,
    } = fieldErrors;

    return (
      <Fragment>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiTitle>
              <h3>
                <FormattedMessage
                  id="xpack.rollupJobs.create.stepLogistics.title"
                  defaultMessage="Logistics"
                />
              </h3>
            </EuiTitle>

            <EuiSpacer size="s" />

            <EuiText>
              <p>
                <FormattedMessage
                  id="xpack.rollupJobs.create.stepLogistics.description"
                  defaultMessage="Define the manner in which data will be rolled up."
                />
              </p>
            </EuiText>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="s"
              flush="right"
              href={logisticalDetailsUrl}
              target="_blank"
              iconType="help"
            >
              <FormattedMessage
                id="xpack.rollupJobs.create.stepLogistics.readDocsButton.label"
                defaultMessage="Logistics docs"
              />
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="l" />

        <EuiForm>
          <EuiDescribedFormGroup
            title={(
              <EuiTitle size="s">
                <h4>
                  <FormattedMessage
                    id="xpack.rollupJobs.create.stepLogistics.sectionId.title"
                    defaultMessage="Name"
                  />
                </h4>
              </EuiTitle>
            )}
            description={(
              <FormattedMessage
                id="xpack.rollupJobs.create.stepLogistics.sectionId.description"
                defaultMessage="This name will be used as a unique identifier for this rollup job."
              />
            )}
            fullWidth
          >
            <EuiFormRow
              label={(
                <FormattedMessage
                  id="xpack.rollupJobs.create.stepLogistics.fieldId.label"
                  defaultMessage="Name"
                />
              )}
              error={errorId}
              isInvalid={Boolean(areStepErrorsVisible && errorId)}
              fullWidth
            >
              <EuiFieldText
                isInvalid={Boolean(areStepErrorsVisible && errorId)}
                value={id}
                onChange={e => onFieldsChange({ id: e.target.value })}
                fullWidth
              />
            </EuiFormRow>
          </EuiDescribedFormGroup>

          <EuiDescribedFormGroup
            title={(
              <EuiTitle size="s">
                <h4>
                  <FormattedMessage
                    id="xpack.rollupJobs.create.stepLogistics.sectionDataFlow.title"
                    defaultMessage="Data flow"
                  />
                </h4>
              </EuiTitle>
            )}
            description={(
              <FormattedMessage
                id="xpack.rollupJobs.create.stepLogistics.sectionDataFlow.description"
                defaultMessage="Which indices do you want to pull data from and which rollup index should store this data?"
              />
            )}
            fullWidth
          >
            <EuiFormRow
              label={(
                <FormattedMessage
                  id="xpack.rollupJobs.create.stepLogistics.fieldIndexPattern.label"
                  defaultMessage="Index pattern"
                />
              )}
              error={isValidatingIndexPattern ? undefined : (errorIndexPattern || indexPatternAsyncErrors)}
              isInvalid={Boolean((areStepErrorsVisible && errorIndexPattern)) || Boolean(indexPatternAsyncErrors)}
              helpText={this.renderIndexPatternHelpText()}
              fullWidth
            >
              <EuiFieldText
                value={indexPattern}
                onChange={e => onFieldsChange({ indexPattern: e.target.value })}
                isInvalid={Boolean(areStepErrorsVisible && errorIndexPattern) || Boolean(indexPatternAsyncErrors)}
                isLoading={isValidatingIndexPattern}
                fullWidth
              />
            </EuiFormRow>

            <EuiFormRow
              label={(
                <FormattedMessage
                  id="xpack.rollupJobs.create.stepLogistics.fieldRollupIndex.label"
                  defaultMessage="Rollup index name"
                />
              )}
              error={errorRollupIndex}
              isInvalid={Boolean(areStepErrorsVisible && errorRollupIndex)}
              helpText={(
                <FormattedMessage
                  id="xpack.rollupJobs.create.stepLogistics.fieldRollupIndex.helpDisallow.label"
                  defaultMessage="You can't use spaces, commas, or the characters {characterList}"
                  values={{ characterList: <strong>{indexIllegalCharacters}</strong> }}
                />
              )}
              fullWidth
            >
              <EuiFieldText
                value={rollupIndex}
                onChange={e => onFieldsChange({ rollupIndex: e.target.value })}
                isInvalid={Boolean(areStepErrorsVisible && errorRollupIndex)}
                fullWidth
              />
            </EuiFormRow>
          </EuiDescribedFormGroup>

          <EuiDescribedFormGroup
            title={(
              <EuiTitle size="s">
                <h4>
                  <FormattedMessage
                    id="xpack.rollupJobs.create.stepLogistics.sectionSchedule.title"
                    defaultMessage="Schedule"
                  />
                </h4>
              </EuiTitle>
            )}
            description={(
              <FormattedMessage
                id="xpack.rollupJobs.create.stepLogistics.sectionSchedule.description"
                defaultMessage={`
                  How often should data be rolled up?
                `}
              />
            )}
            fullWidth
          >
            {this.renderCronEditor()}
          </EuiDescribedFormGroup>

          <EuiDescribedFormGroup
            title={(
              <EuiTitle size="xs">
                <h5>
                  <FormattedMessage
                    id="xpack.rollupJobs.create.stepLogistics.sectionPageSize.title"
                    defaultMessage="How many documents should be rolled up at a time?"
                  />
                </h5>
              </EuiTitle>
            )}
            description={(
              <FormattedMessage
                id="xpack.rollupJobs.create.stepLogistics.sectionPageSize.description"
                defaultMessage={`
                  A larger page size
                  will roll up data more quickly, but will require more memory during processing.
                `}
              />
            )}
            fullWidth
          >
            <EuiFormRow
              label={(
                <FormattedMessage
                  id="xpack.rollupJobs.create.stepLogistics.fieldPageSize.label"
                  defaultMessage="Page size"
                />
              )}
              error={errorRollupPageSize}
              isInvalid={Boolean(areStepErrorsVisible && errorRollupPageSize)}
              fullWidth
            >
              <EuiFieldNumber
                value={rollupPageSize ? Number(rollupPageSize) : ''}
                onChange={e => onFieldsChange({ rollupPageSize: e.target.value })}
                isInvalid={Boolean(areStepErrorsVisible && errorRollupPageSize)}
                fullWidth
                min={0}
              />
            </EuiFormRow>
          </EuiDescribedFormGroup>

          <EuiDescribedFormGroup
            title={(
              <EuiTitle size="xs">
                <h5>
                  <FormattedMessage
                    id="xpack.rollupJobs.create.stepLogistics.sectionPageSize.title"
                    defaultMessage="How long should the rollup job wait before rolling up new data?"
                  />
                </h5>
              </EuiTitle>
            )}
            description={(
              <FormattedMessage
                id="xpack.rollupJobs.create.stepLogistics.sectionDelay.description"
                defaultMessage={`
                  Waiting will yield a higher-fidelity rollup by adjusting for variable ingest latency.
                  By default, the rollup job attempts to roll up all data that is available.
                `}
              />
            )}
            fullWidth
          >
            <EuiFormRow
              label={(
                <FormattedMessage
                  id="xpack.rollupJobs.create.stepDateHistogram.fieldDelay.label"
                  defaultMessage="Delay (optional)"
                />
              )}
              error={errorRollupDelay}
              isInvalid={Boolean(areStepErrorsVisible && errorRollupDelay)}
              helpText={(
                <Fragment>
                  <p>
                    <FormattedMessage
                      id="xpack.rollupJobs.create.stepDateHistogram.fieldDelay.helpExample.label"
                      defaultMessage="Example delay values: 30s, 20m, 24h, 2d, 1w, 1M"
                    />
                  </p>
                </Fragment>
              )}
              fullWidth
            >
              <EuiFieldText
                value={rollupDelay || ''}
                onChange={e => onFieldsChange({ rollupDelay: e.target.value })}
                isInvalid={Boolean(areStepErrorsVisible && errorRollupDelay)}
                fullWidth
              />
            </EuiFormRow>
          </EuiDescribedFormGroup>
        </EuiForm>

        {this.renderErrors()}
      </Fragment>
    );
  }

  renderErrors = () => {
    const { areStepErrorsVisible } = this.props;

    if (!areStepErrorsVisible) {
      return null;
    }

    return (
      <Fragment>
        <EuiSpacer size="m" />
        <EuiCallOut
          title={(
            <FormattedMessage
              id="xpack.rollupJobs.create.stepLogistics.stepError.title"
              defaultMessage="Fix errors before going to next step"
            />
          )}
          color="danger"
          iconType="cross"
        />
      </Fragment>
    );
  }
}

export const StepLogistics = injectI18n(StepLogisticsUi);