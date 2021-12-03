import type { IScopeCallback } from 'cdktf/lib/testing';
import { Aspects, TerraformStack, Testing } from 'cdktf';

import { PolicyAspect } from './policy-aspect';
import type { Policy } from './types';
import type { PolicyPack } from './policy-pack';

export class PolicyTesting {
  static test(
    policy: Policy,
    setup: IScopeCallback,
    policyPack?: PolicyPack,
  ): () => string {
    const app = Testing.app();
    const stack = new TerraformStack(
      app,
      policyPack ? `test-${policyPack.name}-policy-pack` : `test-policy`,
    );

    // We need it to be mandatory, otherwise we cannot assert the validation outcome
    policy = {
      ...policy,
      enforcementLevel: 'mandatory',
    };

    setup(stack);
    Aspects.of(stack).add(new PolicyAspect(policy, policyPack?.name));

    return () => Testing.fullSynth(stack);
  }
}
