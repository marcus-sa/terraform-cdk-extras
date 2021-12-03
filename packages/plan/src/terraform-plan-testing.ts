import { TerraformResource, Testing } from 'cdktf';
import AggregateError = require('aggregate-error');

import { getEnvVar } from '@tfx/core';
import type { Policy } from '@tfx/policy';

import { TerraformPlan } from './terraform-plan';
import { ValidatePlanResourceOfType } from './policy';
import { PolicyViolation } from '@tfx/policy';

export interface PolicyPlan<R extends TerraformResource>
  extends Omit<Policy, 'validate'> {
  readonly validate: ValidatePlanResourceOfType<R>;
}

export class TerraformPlanTesting {
  static async validateChanges<R extends TerraformResource>(
    policy: PolicyPlan<R>,
  ): Promise<void> {
    const { resourceType } = policy.validate;

    const plan = await TerraformPlan.create(getEnvVar('TF_PLAN'));
    const resourceChanges = plan
      .getResourceChanges()
      .filter(rc => rc.type === resourceType.tfResourceType);

    if (resourceChanges.length) {
      const policyViolations = resourceChanges.reduce(
        (allPolicyViolations, rc) => {
          const violations: string[] = [];

          Testing.synthScope(stack => {
            const reportViolation = (violation: string) =>
              violations.push(violation);

            const before = rc.change.before
              ? new resourceType(stack, `${rc.id}-before`, rc.change.before)
              : null;
            const after = rc.change.after
              ? new resourceType(stack, `${rc.id}-after`, rc.change.after)
              : null;

            policy.validate.validate({
              change: rc,
              reportViolation,
              before,
              after,
              plan,
            });
          });

          if (violations.length) {
            return [
              ...allPolicyViolations,
              new PolicyViolation({
                ...policy,
                resource: rc.id,
                violations,
              }),
            ];
          }

          return allPolicyViolations;
        },
        [] as readonly PolicyViolation[],
      );

      if (policyViolations.length) {
        throw new AggregateError(policyViolations);
      }
    }
  }
}
