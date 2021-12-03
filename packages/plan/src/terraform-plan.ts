import { promises as fs } from 'fs';
import { Delta, diff } from '@n1ru4l/json-patch-plus';
import { TerraformResource } from 'cdktf';
import is from '@sindresorhus/is';
import {
  PlannedResourceAction,
  AbstractTerraformPlan,
  PlannedResource,
  ResourceChanges,
} from 'cdktf-cli/bin/cmds/ui/models/terraform';

const camelCaseObjectDeep = require('camelcase-object-deep');

export interface PlanFile {
  readonly resource_changes: ResourceChanges[];
}

export { PlannedResourceAction };

export interface TerraformPlanResourceChange<R extends TerraformResource>
  extends ResourceChanges,
    PlannedResource {
  readonly difference: Delta;
}

export class TerraformPlan extends AbstractTerraformPlan {
  readonly #resourceChanges: readonly ResourceChanges[];

  static async create(planFile: string | PlanFile): Promise<TerraformPlan> {
    const plan = is.string(planFile)
      ? (JSON.parse(await fs.readFile(planFile, 'utf8')) as PlanFile)
      : planFile;
    return new TerraformPlan(plan);
  }

  constructor(plan: PlanFile) {
    super('', plan.resource_changes as ResourceChanges[], {});
    this.#resourceChanges = plan.resource_changes;
  }

  getApplicableResource(id: string): PlannedResource | undefined {
    return this.applyableResources.find(r => r.id === id);
  }

  hasApplicableResource(id: string): boolean {
    return this.applyableResources.some(r => r.id === id);
  }

  getResourceChanges(): readonly TerraformPlanResourceChange<any>[] {
    return this.#resourceChanges
      .filter(({ address }) => this.hasApplicableResource(address))
      .map(resource => {
        const before = camelCaseObjectDeep(resource.change.before);
        const after = camelCaseObjectDeep(resource.change.after);

        return {
          ...resource,
          difference: diff(
            { left: before, right: after },
            { includePreviousValue: true },
          ),
          change: {
            ...resource.change,
            before,
            after,
          },
          ...this.getApplicableResource(resource.address)!,
        };
      });
  }
}
