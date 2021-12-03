/*
import type { IScopeCallback } from 'cdktf/lib/testing';
import type { IAspect } from 'cdktf';
import { PlannedResourceAction } from 'cdktf-cli/bin/cmds/ui/models/terraform';
import type { IConstruct } from 'constructs';
import {
  Annotations,
  Aspects,
  TerraformModule,
  TerraformResource,
  TerraformStack,
  Testing,
} from 'cdktf';

import { getEnvVar } from './utils';
import type { Infracost, Project, Resource } from '../testing/infracost';
import { TerraformPlan, TerraformPlanResourceChange } from './terraform-plan';
import type { ClassType, ReportViolation, TfResourceType } from './types';

export interface ValidateInfracostResourceOfTypeArgsBreakdown {
  readonly before?: Resource;
  readonly after?: Resource;
}

export interface ValidateInfracostResourceOfTypeArgs {
  readonly infracost: Omit<Infracost, 'projects'>;
  readonly project: Project;
  readonly breakdown: ValidateInfracostResourceOfTypeArgsBreakdown;
  readonly reportViolation: ReportViolation;
}

export interface ValidateInfracostResourceOfTypeOptions {
  readonly stack: string;
}

export class ValidateInfracostResourceOfType<R extends TerraformResource> {
  constructor(
    readonly resourceType: TfResourceType<R>,
    readonly validate: (args: ValidateInfracostResourceOfTypeArgs) => void,
    readonly options: ValidateInfracostResourceOfTypeOptions,
  ) {}
}

export function validateInfracostResourcesOfType<R extends TerraformResource>(
  resource: TfResourceType<R>,
  options: ValidateInfracostResourceOfTypeOptions,
  validate: (args: ValidateInfracostResourceOfTypeArgs) => void,
): ValidateInfracostResourceOfType<R> {
  getEnvVar('INFRACOST_BREAKDOWN');
  return new ValidateInfracostResourceOfType(resource, validate, options);
}
*/
