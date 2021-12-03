import { ITerraformDependable, Resource } from 'cdktf';
import { Construct } from 'constructs';

import {
  ResourceConfig,
  Resource as NullResource,
} from '../.gen/providers/null';
import { overrideLogicalId } from './utils';

type CliResourceDependable = CliResource | ITerraformDependable;

export interface CliResourceConfig {
  readonly dependsOn?: CliResourceDependable[];
}

interface Provision extends ResourceConfig {
  readonly create: string;
  readonly destroy?: string;
}

const convertCliDeps = (
  deps: readonly CliResourceDependable[] = [],
): ITerraformDependable[] =>
  deps.flatMap(dep =>
    dep instanceof CliResource ? dep.dependsOn.flat() : [dep],
  );

export class CliResource<C extends {} = {}> extends Resource {
  protected readonly options: Omit<C, 'dependsOn'>;
  readonly dependsOn: ITerraformDependable[];

  constructor(
    scope: Construct,
    id: string,
    { dependsOn, ...options }: C & CliResourceConfig,
  ) {
    super(scope, id);

    this.dependsOn = convertCliDeps(dependsOn);
    this.options = options;
  }

  protected provision(
    id: string,
    { create, destroy, triggers, dependsOn = [] }: Provision,
  ): NullResource {
    const provisioner = new NullResource(this, id, {
      dependsOn: [...this.dependsOn, ...dependsOn],
      triggers,
    });
    overrideLogicalId(provisioner, id);

    provisioner.addOverride('provisioner', [
      create && {
        'local-exec': {
          when: 'create',
          command: create,
        },
      },
      destroy && {
        'local-exec': {
          when: 'destroy',
          command: destroy,
        },
      },
    ]);

    this.dependsOn.push(provisioner);

    return provisioner;
  }
}
