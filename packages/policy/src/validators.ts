import type { IConstruct } from 'constructs';
import { TerraformModule, TerraformResource } from 'cdktf';

import type { ClassType } from '@tfx/core';

import type { ValidatePolicyResource } from './types';

export class PolicyTypeValidator<N extends IConstruct, A extends any[] = []> {
  constructor(public validate: ValidatePolicyResource<N, A>) {}

  shouldValidate(node: IConstruct): boolean {
    return true;
  }
}
export class ValidateModules<
  M extends TerraformModule = TerraformModule,
> extends PolicyTypeValidator<M> {
  constructor(fn: ValidatePolicyResource<M>) {
    super(fn);
  }

  shouldValidate(node: IConstruct): boolean {
    return node instanceof TerraformModule;
  }
}

export class ValidateModulesOfType<
  M extends TerraformModule,
> extends ValidateModules<M> {
  constructor(
    private readonly module: ClassType<M>,
    fn: ValidatePolicyResource<M>,
  ) {
    super(fn);
  }

  shouldValidate(node: IConstruct): boolean {
    return super.shouldValidate(node) && node instanceof this.module;
  }
}

export class ValidateResources<
  R extends TerraformResource = TerraformResource,
  A extends any[] = [],
> extends PolicyTypeValidator<R, A> {
  constructor(fn: ValidatePolicyResource<R, A>) {
    super(fn);
  }

  shouldValidate(node: IConstruct): boolean {
    return node instanceof TerraformResource;
  }
}

export class ValidateResourcesOfType<
  R extends TerraformResource,
  A extends any[] = [],
> extends ValidateResources<R, A> {
  constructor(
    private readonly resource: ClassType<R>,
    fn: ValidatePolicyResource<R, A>,
  ) {
    super(fn);
  }

  shouldValidate(node: IConstruct): boolean {
    return super.shouldValidate(node) && node instanceof this.resource;
  }
}

export function validateModules(
  validate: ValidatePolicyResource<TerraformModule>,
): ValidateModules {
  return new ValidateModules(validate);
}

export function validateModulesOfType<M extends TerraformModule>(
  module: ClassType<M>,
  validate: ValidatePolicyResource<M>,
): ValidateModulesOfType<M> {
  return new ValidateModulesOfType<M>(module, validate);
}

export function validateResources(
  validate: ValidatePolicyResource<TerraformResource>,
): ValidateResources {
  return new ValidateResources(validate);
}

export function validateResourcesOfType<R extends TerraformResource>(
  resource: ClassType<R>,
  validate: ValidatePolicyResource<R>,
): ValidateResourcesOfType<R> {
  return new ValidateResourcesOfType<R>(resource, validate);
}
