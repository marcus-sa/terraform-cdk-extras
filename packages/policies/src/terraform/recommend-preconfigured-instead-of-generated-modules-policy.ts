import { TerraformModule } from 'cdktf';
import { ClassType, isType } from '@tfx/core';
import { validateModules, Policy } from '@tfx/policy';

export class RecommendPreconfiguredInsteadOfGeneratedModulesPolicy
  implements Policy
{
  readonly name = 'recommended-preconfigured-instead-of-generated-modules';
  readonly description = `It is recommended to use preconfigured modules instead of generated ones`;
  readonly enforcementLevel = 'advisory';

  constructor(
    private readonly recommendPreconfiguredInsteadOfGenerated: ReadonlyArray<
      readonly [
        recommendPreconfigured: ClassType<TerraformModule>,
        insteadOfGenerated: ClassType<TerraformModule>,
      ]
    > = [],
  ) {}

  readonly validate: ReturnType<typeof validateModules> = validateModules(
    (module, reportViolation) => {
      const reportViolationOfType = (
        preconfigured: ClassType<TerraformModule>,
        generated: ClassType<TerraformModule>,
      ) => {
        if (isType(module, generated)) {
          reportViolation(
            `It is recommended to use the preconfigured ${preconfigured.name} module instead of generated ${generated.name} [${module.source}] module`,
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
