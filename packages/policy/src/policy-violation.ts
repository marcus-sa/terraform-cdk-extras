import type { PolicyViolationDetails } from './types';

export class PolicyViolation extends Error {
  constructor({
    policyPack,
    violations,
    enforcementLevel,
    name,
    resource,
    stack,
    description,
  }: PolicyViolationDetails) {
    const message = JSON.stringify(
      {
        policyPack,
        name,
        description,
        enforcementLevel,
        stack,
        resource,
        violations,
      },
      null,
      2,
    );
    super(message);
    this.name = PolicyViolation.name;
    Error.captureStackTrace(this, PolicyViolation);
  }
}
