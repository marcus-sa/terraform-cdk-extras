declare namespace jest {
  interface It {
    // This is used to only run tests during CI
    ci: (name: string, fn?: jest.ProvidesCallback, timeout?: number) => void;
    // Run tests when provided a `TF_PLAN` environment variable
    plan: (name: string, fn?: jest.ProvidesCallback, timeout?: number) => void;
    // Run tests when provided a `INFRACOST_BREAKDOWN` environment variable
    infracost: (
      name: string,
      fn?: jest.ProvidesCallback,
      timeout?: number,
    ) => void;
    // Run tests when in a *unix environment
    linux: (name: string, fn?: jest.ProvidesCallback, timeout?: number) => void;
  }
}
