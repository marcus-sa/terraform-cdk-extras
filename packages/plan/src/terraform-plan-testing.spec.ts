import { ActionsSecret } from '../../../.gen/providers/github';
import { TerraformPlanTesting } from './terraform-plan-testing';
import { PlannedResourceAction } from './terraform-plan';
import {
  ValidatePlanResourceOfTypeArgs,
  validatePlanResourcesOfType,
} from './policy';

test('validate github actions secret post plan', () =>
  TerraformPlanTesting.validateChanges({
    name: 'validate-github-membership-post-plan',
    description: '',
    enforcementLevel: 'mandatory',
    validate: validatePlanResourcesOfType(
      ActionsSecret,
      {
        actions: [PlannedResourceAction.CREATE, PlannedResourceAction.UPDATE],
      },
      ({
        before,
        after,
        reportViolation,
        change,
      }: ValidatePlanResourceOfTypeArgs<ActionsSecret>) => {
        // Do something with plan changes
      },
    ),
  }));
