import {
  NullProvider,
  Resource as NullResource,
} from '../../../../.gen/providers/null';
import { enforceLogicalIdOverridePolicy, tfPolicyPack } from '../terraform';

describe(tfPolicyPack.name, () => {
  test(enforceLogicalIdOverridePolicy.name, async () => {
    expect(
      tfPolicyPack.test(enforceLogicalIdOverridePolicy, stack => {
        new NullProvider(stack, 'null-provider');
        new NullResource(stack, 'null-resource');
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Encountered Annotations with level \\"ERROR\\":
      [test-terraform-policy-pack/null-provider] PolicyViolation {
        \\"policyPack\\": \\"terraform\\",
        \\"name\\": \\"enforce-logical-id-override\\",
        \\"description\\": \\"Elements should be easily distinguishable by their logical id\\",
        \\"enforcementLevel\\": \\"mandatory\\",
        \\"violations\\": [
          \\"You must explicitly override the logical id of NullProvider[null-provider]\\"
        ]
      }
      [test-terraform-policy-pack/null-resource] PolicyViolation {
        \\"policyPack\\": \\"terraform\\",
        \\"name\\": \\"enforce-logical-id-override\\",
        \\"description\\": \\"Elements should be easily distinguishable by their logical id\\",
        \\"enforcementLevel\\": \\"mandatory\\",
        \\"violations\\": [
          \\"You must explicitly override the logical id of Resource[null-resource]\\"
        ]
      }"
    `);
  });
});
