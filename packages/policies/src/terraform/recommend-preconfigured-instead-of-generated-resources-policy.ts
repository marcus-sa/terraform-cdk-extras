import { TerraformResource } from 'cdktf';
import { ClassType, isType } from '@tfx/core';
import { validateResources, Policy } from '@tfx/policy';

export class RecommendPreconfiguredInsteadOfGeneratedResourcesPolicy
  implements Policy
{
  readonly name = 'recommended-preconfigured-instead-of-generated-resources';
  readonly description = `It is recommended to use preconfigured resources instead of generated ones`;
  readonly enforcementLevel = 'advisory';

  constructor(
    private readonly recommendPreconfiguredInsteadOfGenerated: ReadonlyArray<
      readonly [
        recommendPreconfigured: ClassType<TerraformResource>,
        insteadOfGenerated: ClassType<TerraformResource>,
      ]
    > = [],
  ) {}

  readonly validate: ReturnType<typeof validateResources> = validateResources(
    (resource, reportViolation) => {
      const reportViolationOfType = (
        preconfigured: ClassType<TerraformResource>,
        generated: ClassType<TerraformResource>,
      ) => {
        if (isType(resource, generated)) {
          reportViolation(
            `It is recommended to use the preconfigured ${preconfigured.name} resource instead of generated ${generated.name} resource`,
          );
        }
      };

      this.recommendPreconfiguredInsteadOfGenerated.forEach(
        ([preconfigured, generated]) =>
          reportViolationOfType(preconfigured, generated),
      );
    },
  );
}
