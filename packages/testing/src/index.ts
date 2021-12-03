/// <reference types="@types/jest" />
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

import { App, TerraformOutput, TerraformStack, Testing } from 'cdktf';
import { paramCase } from 'param-case';
import { $ } from 'zx';
import type { SetRequired } from 'type-fest';

import { TerraformPlan } from '@tfx/plan';
import { getEnvVar } from '@tfx/core';

export interface TerraformTestOptions {
  readonly id?: string;
  readonly plan?: boolean;
  readonly root?: boolean;
  pluginDir?: string;
  debug?: boolean;
}

export type TerraformTestingOutputs = Record<
  string,
  Pick<TerraformOutput, 'sensitive' | 'value' | 'description'>
>;

export class TerraformTesting {
  private app!: App;
  private stack!: TerraformStack;

  private applied = false;
  private initialized = false;
  private destroyed = false;
  private planned = false;
  private outDir!: string;
  private readonly options: TerraformTestOptions;

  plan: TerraformPlan | null = null;
  stackDir!: string;

  static synthScope: typeof Testing.synthScope = Testing.synthScope;

  static test(
    fn: (terraform: TerraformTesting) => Promise<void>,
    options: Partial<Omit<TerraformTestOptions, 'root'>> = {},
  ): () => Promise<void> {
    return async () => {
      const id = paramCase(expect.getState().currentTestName);
      const pluginDir = getEnvVar('TF_PLUGIN_CACHE_DIR');
      // TODO: Test framework agnostic
      expect((await fs.lstat(pluginDir)).isDirectory()).toBeTruthy();
      await new TerraformTesting({ pluginDir, id, ...options }).run(fn);
    };
  }

  static fullSynth(fn: (stack: TerraformStack) => void): string {
    const app = Testing.app();
    const stack = new TerraformStack(app, 'test');

    fn(stack);

    return Testing.fullSynth(stack);
  }

  constructor(options: SetRequired<TerraformTestOptions, 'id'>) {
    this.options = {
      ...options,
      pluginDir: options.pluginDir ? `-plugin-dir=${options.pluginDir}` : '',
      debug: getEnvVar<boolean>('DEBUG', options.debug ?? false),
    };

    if (options.root) {
      beforeAll(async () => {
        await this.before();
      });

      if (!options.debug) {
        afterAll(async () => {
          await this.after();
        });
      }
    }
  }

  private async before(): Promise<this> {
    this.outDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `${this.options.id}-cdktf.outdir.`),
    );
    this.app = new App({ outdir: this.outDir });
    this.stackDir = `${this.outDir}/stacks/${this.options.id}`;
    return this;
  }

  private async after(): Promise<void> {
    try {
      if (this.initialized) {
        await this.destroy();
      }
    } finally {
      if (!this.options.debug) {
        await fs.rm(this.app.outdir, { recursive: true });
      }
    }
  }

  private async run(fn: (terraform: this) => Promise<void>): Promise<void> {
    try {
      await this.before();
      await fn(this);
    } finally {
      await this.after();
    }
  }

  async destroy(): Promise<boolean> {
    if (this.applied && !this.destroyed) {
      await $`terraform -chdir=${this.stackDir} destroy -input=false -auto-approve -lock=false`;
      this.destroyed = true;
    }

    return this.destroyed;
  }

  async init(): Promise<void> {
    this.initialized = false;
    await $`terraform -chdir=${this.stackDir} init -backend=true -upgrade=false ${this.options.pluginDir}`;
    this.initialized = true;
  }

  async apply(): Promise<boolean> {
    if (this.initialized) {
      this.applied = false;
      await $`terraform -chdir=${this.stackDir} apply -input=false -auto-approve`;
      this.applied = true;
    }

    return this.applied;
  }

  async synth(fn: (stack: TerraformStack) => void): Promise<void> {
    this.stack = new TerraformStack(this.app, this.options.id!);
    fn(this.stack);
    this.app.synth();
  }

  async _plan(): Promise<TerraformPlan | null> {
    if (this.initialized) {
      const out = path.join(this.stackDir, 'plan.zip');

      this.plan = null;
      this.planned = false;
      await $`terraform -chdir=${this.stackDir} plan -out=${out}`;
      this.planned = true;

      // @NOTE: Don't log plan to console as it can contain sensitive values
      const _verbose = $.verbose;
      $.verbose = false;
      const { stdout: plan } =
        await $`terraform -chdir=${this.stackDir} show -json ${out}`;
      $.verbose = _verbose;

      this.plan = await TerraformPlan.create(JSON.parse(plan));
    }

    return this.plan;
  }

  async output(): Promise<TerraformTestingOutputs> {
    if (this.applied) {
      const _verbose = $.verbose;
      $.verbose = false;
      const { stdout } =
        await $`terraform -chdir=${this.stackDir} output -json`;
      $.verbose = _verbose;

      return JSON.parse(stdout) as TerraformTestingOutputs;
    }

    throw new Error('No outputs');
  }

  async synthInitApply(
    fn: (stack: TerraformStack) => void,
  ): Promise<TerraformTestingOutputs> {
    await this.synth(fn);
    await this.init();

    if (this.options.plan) {
      await this._plan();
    }

    await this.apply();

    return this.output();
  }
}
