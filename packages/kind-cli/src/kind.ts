import { Construct } from 'constructs';

import { CliResource } from '@tfx/core';
import type { CliResourceConfig } from '@tfx/core';

import { KindCluster } from './kind-cluster';
import type { KindClusterConfig } from './kind-cluster';

export interface KindDownloadBinaryConfig {
  readonly version: string;
  readonly platform?: 'linux' | 'darwin';
  readonly arch?: 'amd64' | 'arm64';
  readonly output?: string;
}
export class Kind extends CliResource {
  binary = 'kind';

  constructor(scope: Construct, config: CliResourceConfig = {}) {
    super(scope, 'kind', config);
  }

  downloadBinary(options: KindDownloadBinaryConfig): this {
    const { platform, arch, version, output } = {
      platform: 'linux',
      arch: 'amd64',
      output: '/tmp/kind',
      ...options,
    } as Required<KindDownloadBinaryConfig>;
    if (!['linux', 'darwin'].includes(platform)) {
      throw new Error(`Platform is not supported`);
    }
    if (!['amd64', 'arm64'].includes(arch)) {
      throw new Error(`Architecture is not supported`);
    }

    this.binary = output;

    const id = `kind-download-binary`;
    this.provision(id, {
      create: `
        curl -Lo ${this.binary} https://kind.sigs.k8s.io/dl/v${version}/kind-${platform}-${arch}
        chmod +x ${this.binary}
        ${this.binary} version
      `,
      destroy: `rm ${this.binary}`,
      triggers: {
        version,
      },
    });

    return this;
  }

  createCluster(config: KindClusterConfig): KindCluster {
    return new KindCluster(this, config);
  }
}
