// Inspired by https://www.pulumi.com/docs/guides/crossguard/configuration/
import type { IAspect } from 'cdktf';
import type { IScopeCallback } from 'cdktf/lib/testing';

import type { Policy } from './types';
import { PolicyAspect } from './policy-aspect';
import { PolicyTesting } from './testing';

export class PolicyPack {
  constructor(readonly name: string, readonly policies: readonly Policy[]) {}

  test(policy: Policy, setup: IScopeCallback): () => string {
    return PolicyTesting.test(policy, setup, this);
  }

  /** @internal */
  createAspects(): readonly IAspect[] {
    return this.policies.map(policy => new PolicyAspect(policy, this.name));
  }
}
