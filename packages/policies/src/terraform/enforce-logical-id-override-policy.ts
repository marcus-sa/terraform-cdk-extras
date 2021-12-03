import { hasLogicalIdOverride, isTerraformElement } from '@tfx/core';
import type { Policy } from '@tfx/policy';

export const enforceLogicalIdOverridePolicy: Policy = {
  name: 'enforce-logical-id-override',
  description: `Elements should be easily distinguishable by their logical id`,
  enforcementLevel: 'mandatory',
  validate: (node, reportViolation) => {
    // Modules must have manual logical ids overridden
    if (isTerraformElement(node) && !hasLogicalIdOverride(node)) {
      reportViolation(
        `You must explicitly override the logical id of ${node.constructor.name}[${node.friendlyUniqueId}]`,
      );
    }
  },
};
