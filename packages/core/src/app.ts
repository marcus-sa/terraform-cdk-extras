/*import { App, Aspects, IAspect, TerraformStack } from 'cdktf';
import type { AppOptions } from 'cdktf/lib/app';

import { PolicyAspect, PolicyPack } from '';

export interface TerraformAppOptions extends AppOptions {
  readonly policyPacks?: readonly PolicyPack[];
  readonly policies?: readonly PolicyAspect[];
  readonly aspects?: readonly IAspect[];
}

export class TerraformApp extends App {
  private readonly extraOptions: TerraformAppOptions;

  constructor({
    policyPacks,
    policies,
    aspects,
    ...options
  }: TerraformAppOptions) {
    super(options);

    this.extraOptions = { policies, policyPacks, aspects };
  }

  addStack(stack: TerraformStack) {
    const { policies = [], policyPacks = [], aspects = [] } = this.extraOptions;

    const policyPackAspects = policyPacks.flatMap(policyPack =>
      policyPack.createAspects(),
    );

    const aspectsFactory = Aspects.of(stack);

    [...aspects, ...policyPackAspects, ...policies].forEach(aspect =>
      aspectsFactory.add(aspect),
    );
  }
}*/
