import type { IConstruct } from 'constructs';

import type {
  ValidateModules,
  ValidateModulesOfType,
  ValidateResources,
  ValidateResourcesOfType,
} from './validators';

export type ValidatePolicyResource<
  N extends IConstruct,
  A extends any[] = [],
> = (
  node: N,
  reportViolation: ReportViolation,
  ...args: A
) => Promise<void> | void;

export interface PolicyViolationDetails
  extends Omit<Policy, 'validate' | 'validatePlan'> {
  readonly policyPack?: string;
  readonly resource?: string;
  readonly stack?: string;
  readonly violations: readonly string[];
}

export interface Policy {
  readonly name: string;
  readonly description: string;
  readonly enforcementLevel: EnforcementLevel;
  readonly validate:
    | ValidateResources
    | ValidateModules
    | ValidateResourcesOfType<any>
    | ValidateModulesOfType<any>
    | ValidatePolicyResource<IConstruct>;
}

export type EnforcementLevel = 'advisory' | 'mandatory' | 'disabled';

export type ReportViolation = (
  message: string,
  urn?: undefined | string,
) => void;
