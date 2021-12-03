import { PolicyPack } from '@tfx/policy';

import { enforceLogicalIdOverridePolicy } from './enforce-logical-id-override-policy';

export const tfPolicyPack = new PolicyPack('terraform', [
  enforceLogicalIdOverridePolicy,
]);

export { enforceLogicalIdOverridePolicy };

export * from './recommend-preconfigured-instead-of-generated-modules-policy';
export * from './recommend-preconfigured-instead-of-generated-resources-policy';
