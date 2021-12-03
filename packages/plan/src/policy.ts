import { TerraformResource } from 'cdktf';
import { PlannedResourceAction } from 'cdktf-cli/bin/cmds/ui/models/terraform';

import { getEnvVar } from '@tfx/core';
import type { ReportViolation } from '@tfx/policy';
import type { TfResourceType } from '@tfx/core';

import { TerraformPlan, TerraformPlanResourceChange } from './terraform-plan';

export interface ValidatePlanResourceOfTypeArgs<R extends TerraformResource> {
  readonly before: R | null;
  readonly after: R | null;
  readonly change: TerraformPlanResourceChange<R>;
  readonly plan: TerraformPlan;
  readonly reportViolation: ReportViolation;
}

export interface ValidatePlanResourceOfTypeOptions {
  readonly stack?: string;
  readonly actions: readonly PlannedResourceAction[];
}

export class ValidatePlanResourceOfType<R extends TerraformResource> {
  constructor(
    readonly resourceType: TfResourceType<R>,
    readonly validate: (args: ValidatePlanResourceOfTypeArgs<R>) => void,
    readonly options: ValidatePlanResourceOfTypeOptions,
  ) {}
}

export function validatePlanResourcesOfType<R extends TerraformResource>(
  resource: TfResourceType<R>,
  options: ValidatePlanResourceOfTypeOptions,
  validate: (args: ValidatePlanResourceOfTypeArgs<R>) => void,
): ValidatePlanResourceOfType<R> {
  getEnvVar('TF_PLAN');
  return new ValidatePlanResourceOfType(resource, validate, options);
}
