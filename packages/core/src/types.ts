import { TerraformResource } from 'cdktf';
import type { Primitive } from 'type-fest';

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface ClassType<T = any> {
  new (...args: any[]): T;
}

export interface TfResourceType<R extends TerraformResource>
  extends ClassType<R> {
  readonly tfResourceType: string;
}

export type YamlObjectConfig = {
  readonly [key: string]:
    | Primitive
    | YamlObjectConfig
    | readonly Primitive[]
    | readonly YamlObjectConfig[];
};
