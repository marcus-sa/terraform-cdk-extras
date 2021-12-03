import { CliResource, CliResourceConfig, overrideLogicalId } from '@tfx/core';
import * as yaml from 'js-yaml';

import { File } from '../.gen/providers/local';
import { Kind } from './kind';
import {
  DataDockerNetwork,
  DataDockerNetworkIpamConfig,
} from './data-docker-network';

export interface KindClusterConfigSpecNetworking {
  readonly ipFamily?: 'ipv4' | 'ivp4' | 'dual';
  readonly apiServerAddress?: string;
  readonly apiServerPort?: number;
  readonly podSubnet?: string;
  readonly serviceSubnet?: string;
  readonly disableDefaultCNI?: boolean;
  readonly kubeProxyMode?: 'none' | 'ipvs';
}

export interface KindClusterConfigSpecNodeExtraPortMappings {
  readonly containerPort: number;
  readonly hostPort: number;
  readonly listenAddress?: string;
  readonly protocol?: 'TCP' | 'UDP' | 'SCTP';
}

export interface KindClusterConfigSpecNodeExtraMount {
  readonly hostPath: string;
  readonly containerPath: string;
  readonly readOnly?: boolean;
  readonly selinuxRelabel?: boolean;
  readonly propagation?: 'None' | 'HostToContainer' | 'Bidirectional';
}

export interface KindClusterConfigSpecNode {
  readonly role: 'control-plane' | 'worker';
  readonly image?: string;
  readonly extraMounts?: readonly KindClusterConfigSpecNodeExtraMount[];
  readonly extraPortMappings?: readonly KindClusterConfigSpecNodeExtraPortMappings[];
  readonly kubeadmConfigPatches?: readonly string[];
}

export interface KindClusterConfig extends CliResourceConfig {
  readonly kind?: 'Cluster';
  readonly apiVersion: string;
  readonly name: string;
  readonly featureGates?: Record<string, boolean>;
  readonly runtimeConfig?: Record<string, string>;
  readonly networking?: KindClusterConfigSpecNetworking;
  readonly nodes?: readonly KindClusterConfigSpecNode[];
}

export class KindCluster extends CliResource<KindClusterConfig> {
  readonly context: string;

  private _ipam?: DataDockerNetworkIpamConfig;
  private _network?: DataDockerNetwork;

  get network(): DataDockerNetwork {
    if (!this._network) {
      this._network = new DataDockerNetwork(this, `${this.node.id}-network`, {
        name: 'kind',
        dependsOn: this.dependsOn,
      });
      overrideLogicalId(this._network, this.node.id);
    }

    return this._network;
  }

  get ipam(): DataDockerNetworkIpamConfig {
    if (!this._ipam) {
      const controlPlaneIndex = this.options.nodes?.findIndex(
        node => node.role === 'control-plane',
      );

      this._ipam = this.network.ipamConfig(controlPlaneIndex);
    }

    return this._ipam;
  }

  get ip(): string {
    return this.ipam.gateway;
  }

  constructor(parent: Kind, { name, dependsOn, ...config }: KindClusterConfig) {
    const id = `kind-${name}-cluster`;
    super(parent, id, {
      dependsOn: [...parent.dependsOn, ...(dependsOn || [])],
      name,
      ...config,
    });
    this.context = `kind-${name}`;

    config = {
      kind: 'Cluster',
      name,
      ...config,
    } as KindClusterConfig;

    const configId = `${id}-config`;
    const configPath = `/tmp/${configId}.yaml`;
    const fileConfig = new File(this, configId, {
      filename: configPath,
      content: yaml.dump(config),
    });
    overrideLogicalId(fileConfig, configId);

    this.provision(`${id}-create`, {
      create: `${parent.binary} create cluster --config ${configPath}`,
      destroy: `${parent.binary} delete cluster --name ${name}`,
      dependsOn: [fileConfig],
    });
  }
}
