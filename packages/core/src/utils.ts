import * as path from 'path';
import { createHash } from 'crypto';
import { paramCase } from 'param-case';
import { Construct } from 'constructs';
import {
  DataTerraformRemoteStateLocal,
  TerraformElement,
  TerraformModule,
  TerraformResource,
  TerraformStack,
} from 'cdktf';

import type { ClassType } from './types';

export async function delay(ms = 0): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export function isTesting(): boolean {
  return process.env.NODE_ENV === 'test';
}

export function sha1(data: string): string {
  return createHash('sha1').update(data).digest('base64');
}

export async function promiseRetryDelay<T>(
  fn: () => Promise<T>,
  retries = 5,
  delay = 1000,
  err?: any,
): Promise<T> {
  const retryWithDelay = () =>
    new Promise<T>(resolve => setTimeout(() => fn().then(resolve), delay));

  return !retries
    ? Promise.reject(err)
    : fn().catch(error =>
        promiseRetryDelay(retryWithDelay, retries - 1, error),
      );
}

export function getLocalStateForStack(
  scope: Construct,
  stackType: ClassType<TerraformStack>,
): DataTerraformRemoteStateLocal {
  const stack = paramCase(stackType.name.replace('Stack', ''));

  return new DataTerraformRemoteStateLocal(scope, stack, {
    path: path.join(process.cwd(), `terraform.${stack}.tfstate`),
  });
}

export function getEnvVar<V = string>(name: string, defaultValue?: V): V {
  const value = process.env[name] ?? defaultValue;
  if (value == null) {
    throw new Error(`Missing required environment variable "${name}"`);
  }
  return value as V;
}

export function hasLogicalIdOverride(scope: TerraformElement): boolean {
  return '_logicalIdOverride' in scope;
}

export function getLogicalIdOverride(scope: TerraformElement): string {
  // TODO: Maybe just return friendlyUniqueId then ?
  if (!hasLogicalIdOverride(scope)) {
    throw new Error(`No logical id override for ${scope.friendlyUniqueId}`);
  }
  return (scope as any)._logicalIdOverride;
}

export function isType<T>(node: any, type: ClassType<T>): node is T {
  return node.constructor === type;
}

export function isTerraformModule(scope: any): scope is TerraformModule {
  return scope instanceof TerraformModule;
}

export function isTerraformResource(scope: any): scope is TerraformResource {
  return scope instanceof TerraformResource;
}

export function isTerraformElement(scope: any): scope is TerraformElement {
  return scope instanceof TerraformElement;
}

export function overrideLogicalId(
  scope: TerraformElement,
  ...values: ReadonlyArray<TerraformElement | string>
): string {
  const id = values
    .map(value =>
      isTerraformElement(value)
        ? getLogicalIdOverride(value)
        : paramCase(value),
    )
    .join('-')
    .toLowerCase();

  scope.overrideLogicalId(id);

  return id;
}
