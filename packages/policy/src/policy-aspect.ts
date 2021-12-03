import { Annotations, IAspect } from 'cdktf';
import type { IConstruct } from 'constructs';

import { PolicyViolation } from './policy-violation';
import { PolicyTypeValidator } from './validators';
import type { Policy, ReportViolation } from './types';

export class PolicyAspect implements IAspect {
  constructor(
    private readonly policy: Policy,
    private readonly belongsToPolicyPack?: string,
  ) {}

  static createViolationReporter(
    node: IConstruct,
    enforcementLevel: Policy['enforcementLevel'],
  ): ReportViolation {
    const annotation = Annotations.of(node);

    switch (enforcementLevel) {
      case 'advisory':
        return annotation.addWarning.bind(annotation);

      case 'mandatory':
        return annotation.addError.bind(annotation);

      default:
      case 'disabled':
        return () => {}; //annotation.addInfo.bind(annotation);
    }
  }

  private getTypeValidator(): PolicyTypeValidator<any> {
    return this.policy.validate instanceof PolicyTypeValidator
      ? this.policy.validate
      : new PolicyTypeValidator(this.policy.validate!);
  }

  // Will be called once per node for each policy
  visit(node: IConstruct) {
    const policyValidator = this.getTypeValidator();

    if (policyValidator.shouldValidate(node)) {
      const reportViolation = PolicyAspect.createViolationReporter(
        node,
        this.policy.enforcementLevel,
      );
      const violations: string[] = [];

      policyValidator.validate?.(node, violation => violations.push(violation));

      if (violations.length) {
        reportViolation(
          `PolicyViolation ${
            new PolicyViolation({
              policyPack: this.belongsToPolicyPack,
              violations,
              ...this.policy,
            }).message
          }`,
        );
      }
    }
  }
}
