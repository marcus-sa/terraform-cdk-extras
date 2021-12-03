import { Resource, TerraformElement } from 'cdktf';
import { Construct } from 'constructs';

import { getEnvVar, overrideLogicalId } from './utils';

export class CustomResource extends Resource {
  readonly friendlyUniqueId: string;

  static get prefix(): string {
    return getEnvVar('TF_RESOURCE_PREFIX');
  }

  static id(value: string): string {
    return `${CustomResource.prefix}-${value}`.toLowerCase();
  }

  constructor(scope: Construct, id: string) {
    id = `${CustomResource.prefix}-${id}`;
    super(scope, id);
    this.friendlyUniqueId = id;
  }

  protected overrideLogicalIdOf(
    scope: TerraformElement,
    value: string,
  ): string {
    return overrideLogicalId(scope, CustomResource.id(value));
  }
}
