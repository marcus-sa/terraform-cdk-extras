import { ComplexComputedToList } from '@tfx/core';

import { DataDockerNetwork as _DataDockerNetwork } from '../.gen/providers/docker';

// https://github.com/hashicorp/terraform-cdk/issues/424
export class DataDockerNetworkIpamConfig extends ComplexComputedToList {
  // aux_address - computed: true, optional: false, required: false
  public get auxAddress() {
    // Getting the computed value is not yet implemented
    return this.interpolationForAttribute('aux_address') as any;
  }

  // gateway - computed: true, optional: false, required: false
  public get gateway() {
    return this.getStringAttribute('gateway');
  }

  // ip_range - computed: true, optional: false, required: false
  public get ipRange() {
    return this.getStringAttribute('ip_range');
  }

  // subnet - computed: true, optional: false, required: false
  public get subnet() {
    return this.getStringAttribute('subnet');
  }
}

// https://github.com/hashicorp/terraform-cdk/issues/424
export class DataDockerNetwork extends _DataDockerNetwork {
  // @ts-ignore
  ipamConfig(index = 0): DataDockerNetworkIpamConfig {
    return new DataDockerNetworkIpamConfig(
      this,
      'ipam_config',
      index.toString(),
    );
  }
}
