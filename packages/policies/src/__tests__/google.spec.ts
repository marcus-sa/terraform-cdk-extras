import { Vpc } from '../../../.gen/modules/terraform-google-modules/google/network/modules/vpc';
import { ProjectFactory } from '../../../.gen/modules/terraform-google-modules/google/project-factory';
import { BetaPrivateCluster } from '../../../.gen/modules/terraform-google-modules/google/kubernetes-engine/modules/beta-private-cluster';

import {
  googlePolicyPack,
  recommendPreconfiguredInsteadOfGeneratedModulesPolicy,
} from '../google';

describe(googlePolicyPack.name, () => {
  test(recommendPreconfiguredInsteadOfGeneratedModulesPolicy.name, () => {
    expect(
      googlePolicyPack.test(
        recommendPreconfiguredInsteadOfGeneratedModulesPolicy,
        stack => {
          // @ts-expect-error
          new Vpc(stack, 'test-vpc', {});
          // @ts-expect-error
          new ProjectFactory(stack, 'test-project', {});
          // @ts-expect-error
          new BetaPrivateCluster(stack, 'test-cluster', {});
        },
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Encountered Annotations with level \\"ERROR\\":
      [test-google-policy-pack/test-vpc] PolicyViolation {
        \\"policyPack\\": \\"google\\",
        \\"name\\": \\"recommended-preconfigured-instead-of-generated-modules\\",
        \\"description\\": \\"It is recommended to use preconfigured modules instead of generated ones\\",
        \\"enforcementLevel\\": \\"mandatory\\",
        \\"violations\\": [
          \\"It is recommended to use the preconfigured GoogleNetworkVpc module instead of generated Vpc [terraform-google-modules/network/google//modules/vpc] module\\"
        ]
      }
      [test-google-policy-pack/test-project] PolicyViolation {
        \\"policyPack\\": \\"google\\",
        \\"name\\": \\"recommended-preconfigured-instead-of-generated-modules\\",
        \\"description\\": \\"It is recommended to use preconfigured modules instead of generated ones\\",
        \\"enforcementLevel\\": \\"mandatory\\",
        \\"violations\\": [
          \\"It is recommended to use the preconfigured GoogleProject module instead of generated ProjectFactory [terraform-google-modules/project-factory/google] module\\"
        ]
      }
      [test-google-policy-pack/test-cluster] PolicyViolation {
        \\"policyPack\\": \\"google\\",
        \\"name\\": \\"recommended-preconfigured-instead-of-generated-modules\\",
        \\"description\\": \\"It is recommended to use preconfigured modules instead of generated ones\\",
        \\"enforcementLevel\\": \\"mandatory\\",
        \\"violations\\": [
          \\"It is recommended to use the preconfigured GooglePrivateBetaCluster module instead of generated BetaPrivateCluster [terraform-google-modules/kubernetes-engine/google//modules/beta-private-cluster] module\\"
        ]
      }"
    `);
  });
});
