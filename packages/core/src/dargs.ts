// https://github.com/sindresorhus/dargs

export interface Options {
  /**
   Keys or regex of keys to exclude. Takes precedence over `includes`.
   */
  readonly excludes?: ReadonlyArray<string | RegExp>;

  /**
   Keys or regex of keys to include.
   */
  readonly includes?: ReadonlyArray<string | RegExp>;

  /**
   Maps keys in `input` to an aliased name. Matching keys are converted to arguments with a single dash (`-`) in front of the aliased key and the value in a separate array item. Keys are still affected by `includes` and `excludes`.
   */
  readonly aliases?: Record<string, string>;

  /**
   Setting this to `false` makes it return the key and value as separate array items instead of using a `=` separator in one item. This can be useful for tools that doesn't support `--foo=bar` style flags.

   @default true

   @example
   ```
   import dargs from 'dargs';

   console.log(dargs({foo: 'bar'}, {useEquals: false}));
   // [
   // 	'--foo', 'bar'
   // ]
   ```
   */
  readonly useEquals?: boolean;

  /**
   Make a single character option key `{a: true}` become a short flag `-a` instead of `--a`.

   @default true

   @example
   ```
   import dargs from 'dargs';

   console.log(dargs({a: true}));
   //=> ['-a']

   console.log(dargs({a: true}, {shortFlag: false}));
   //=> ['--a']
   ```
   */
  readonly shortFlag?: boolean;

  /**
   Exclude `true` values. Can be useful when dealing with argument parsers that only expect negated arguments like `--no-foo`.

   @default false
   */
  readonly ignoreTrue?: boolean;

  /**
   Exclude `false` values. Can be useful when dealing with strict argument parsers that throw on unknown arguments like `--no-foo`.

   @default false
   */
  readonly ignoreFalse?: boolean;

  /**
   By default, camel-cased keys will be hyphenated. Enabling this will bypass the conversion process.

   @default false

   @example
   ```
   import dargs from 'dargs';

   console.log(dargs({fooBar: 'baz'}));
   //=> ['--foo-bar', 'baz']

   console.log(dargs({fooBar: 'baz'}, {allowCamelCase: true}));
   //=> ['--fooBar', 'baz']
   ```
   */
  readonly allowCamelCase?: boolean;
}

const match = (array: any[], value: any) =>
  array.some((element: { test: (arg0: any) => any }) =>
    element instanceof RegExp ? element.test(value) : element === value,
  );

export function dargs<
  O extends Record<
    string,
    string | boolean | number | readonly string[] | undefined
  >,
>(object: O, options: Options = {}) {
  const arguments_ = [];
  let extraArguments = [];
  let separatedArguments = [];

  options = {
    useEquals: true,
    shortFlag: true,
    ...options,
  };

  const makeArguments = (key: string, value?: any) => {
    const prefix = options.shortFlag && key.length === 1 ? '-' : '--';
    const theKey = options.allowCamelCase
      ? key
      : key.replace(/[A-Z]/g, '-$&').toLowerCase();

    key = prefix + theKey;

    if (options.useEquals) {
      arguments_.push(key + (value ? `=${value}` : ''));
    } else {
      arguments_.push(key);

      if (value) {
        arguments_.push(value);
      }
    }
  };

  const makeAliasArg = (key: any, value: any) => {
    arguments_.push(`-${key}`);

    if (value) {
      arguments_.push(value);
    }
  };

  for (let [key, value] of Object.entries(object)) {
    let pushArguments = makeArguments;

    if (Array.isArray(options.excludes) && match(options.excludes, key)) {
      continue;
    }

    if (Array.isArray(options.includes) && !match(options.includes, key)) {
      continue;
    }

    if (typeof options.aliases === 'object' && options.aliases[key]) {
      key = options.aliases[key];
      pushArguments = makeAliasArg;
    }

    if (key === '--') {
      if (!Array.isArray(value)) {
        throw new TypeError(
          `Expected key \`--\` to be Array, got ${typeof value}`,
        );
      }

      separatedArguments = value;
      continue;
    }

    if (key === '_') {
      if (!Array.isArray(value)) {
        throw new TypeError(
          `Expected key \`_\` to be Array, got ${typeof value}`,
        );
      }

      extraArguments = value;
      continue;
    }

    if (value === true && !options.ignoreTrue) {
      pushArguments(key, '');
    }

    if (value === false && !options.ignoreFalse) {
      pushArguments(`no-${key}`);
    }

    if (typeof value === 'string') {
      pushArguments(key, value);
    }

    if (typeof value === 'number' && !Number.isNaN(value)) {
      pushArguments(key, String(value));
    }

    if (Array.isArray(value)) {
      for (const arrayValue of value) {
        pushArguments(key, arrayValue);
      }
    }
  }

  for (const argument of extraArguments) {
    arguments_.push(String(argument));
  }

  if (separatedArguments.length > 0) {
    arguments_.push('--');
  }

  for (const argument of separatedArguments) {
    arguments_.push(String(argument));
  }

  return arguments_;
}
