import type { IAspect } from 'cdktf';
import type { IConstruct } from 'constructs';

import {
  hasLogicalIdOverride,
  isTerraformElement,
  isTerraformModule,
  overrideLogicalId,
} from '@tfx/core';

export class OverrideLogicalIdAspect implements IAspect {
  visit(node: IConstruct) {
    // Modules must be manually overridden
    if (
      isTerraformElement(node) &&
      !isTerraformModule(node) &&
      !hasLogicalIdOverride(node)
    ) {
      overrideLogicalId(node, node.node.id);
    }
  }
}
