import { promises as fs } from 'fs';
import { TerraformOutput } from 'cdktf';
import { isIP } from 'net';

import { TerraformTesting } from '@tfx/testing';
import { getEnvVar, overrideLogicalId } from '@tfx/core';

import { NullProvider } from '../../../.gen/providers/null';
import { DockerProvider } from '../.gen/providers/docker';
import { LocalProvider } from '../.gen/providers/local';
import { KindCluster } from './kind-cluster';
import { Kind } from './kind';
import { DataDockerNetworkIpamConfig } from './data-docker-network';

// 3 minutes
const timeout = 3 * 60_000;

describe('Kind', () => {
  if (process.platform === 'linux') {
    it(
      'should download binary',
      TerraformTesting.test(async terraform => {
        const binaryPath = `/tmp/kind`;

        await terraform.synthInitApply(stack => {
          new NullProvider(stack, 'null-provider');

          const version = getEnvVar('KIND_CLI_VERSION', '0.11.1');
          new Kind(stack).downloadBinary({
            version,
          });
        });

        const binaryStat = await fs.stat(binaryPath);
        expect(binaryStat.isFile()).toBeTruthy();
        // chmod +x
        expect(binaryStat.mode).toEqual(33261);
      }),
      timeout,
    );
  }

  it('should match snapshot', () => {
    const synth = TerraformTesting.synthScope(scope => {
      const cluster = new Kind(scope).createCluster({
        name: 'test',
        apiVersion: 'kind.x-k8s.io/v1alpha4',
        nodes: [
          {
            role: 'control-plane',
            image: 'kindest/node:v1.19.1',
          },
          {
            role: 'worker',
            image: 'kindest/node:v1.19.1',
          },
        ],
      });

      {
        cluster.ipam;
      }
    });

    expect(synth).toMatchInlineSnapshot(`
      "{
        \\"data\\": {
          \\"docker_network\\": {
            \\"kind-test-cluster\\": {
              \\"depends_on\\": [
                \\"null_resource.kind-test-cluster-create\\"
              ],
              \\"name\\": \\"kind\\"
            }
          }
        },
        \\"resource\\": {
          \\"local_file\\": {
            \\"kind-test-cluster-config\\": {
              \\"content\\": \\"kind: Cluster\\\\nname: test\\\\napiVersion: kind.x-k8s.io/v1alpha4\\\\nnodes:\\\\n  - role: control-plane\\\\n    image: kindest/node:v1.19.1\\\\n  - role: worker\\\\n    image: kindest/node:v1.19.1\\\\n\\",
              \\"filename\\": \\"/tmp/kind-test-cluster-config.yaml\\"
            }
          },
          \\"null_resource\\": {
            \\"kind-test-cluster-create\\": {
              \\"depends_on\\": [
                \\"local_file.kind-test-cluster-config\\"
              ],
              \\"provisioner\\": [
                {
                  \\"local-exec\\": {
                    \\"command\\": \\"kind create cluster --config /tmp/kind-test-cluster-config.yaml\\",
                    \\"when\\": \\"create\\"
                  }
                },
                {
                  \\"local-exec\\": {
                    \\"command\\": \\"kind delete cluster --name test\\",
                    \\"when\\": \\"destroy\\"
                  }
                }
              ]
            }
          }
        }
      }"
    `);
  });

  it(
    'should create cluster and output ipam',
    TerraformTesting.test(async terraform => {
      const output = await terraform.synthInitApply(stack => {
        new NullProvider(stack, 'null-provider');
        new LocalProvider(stack, 'local-provider');
        new DockerProvider(stack, 'docker-provider');

        const cluster = new Kind(stack).createCluster({
          name: 'test',
          apiVersion: 'kind.x-k8s.io/v1alpha4',
          nodes: [
            {
              role: 'control-plane',
              image: 'kindest/node:v1.19.1',
            },
            {
              role: 'worker',
              image: 'kindest/node:v1.19.1',
            },
          ],
        });

        expect(cluster).toBeInstanceOf(KindCluster);

        const ipamOutputId = `${cluster.node.id}-ipam`;
        const ipamOutput = new TerraformOutput(stack, ipamOutputId, {
          value: {
            gateway: cluster.ipam.gateway,
            subnet: cluster.ipam.subnet,
          },
          description: 'Kind Cluster IP Address Management',
        });
        overrideLogicalId(ipamOutput, ipamOutputId);
      });

      const configFilePath = '/tmp/kind-test-cluster-config.yaml';
      const config = await fs.readFile(configFilePath, 'utf8');

      expect(config).toMatchInlineSnapshot(`
        "kind: Cluster
        name: test
        apiVersion: kind.x-k8s.io/v1alpha4
        nodes:
          - role: control-plane
            image: kindest/node:v1.19.1
          - role: worker
            image: kindest/node:v1.19.1
        "
      `);

      const key = 'kind-test-cluster-ipam';
      expect(output).toHaveProperty([key, 'value']);

      const ipam = output[key].value as DataDockerNetworkIpamConfig;
      expect(isIP(ipam.gateway)).toBe(4);
      // expect(isIP(ipam.subnet)).toBe(4);
    }),
    timeout,
  );
});
