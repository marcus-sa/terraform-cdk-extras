import { Testing } from 'cdktf';
import { Vpc } from '../../../../.gen/modules/terraform-google-modules/google/network/modules/vpc';

import { GoogleNetworkVpc } from '../../../custom/google';
import type { ReportViolation } from '../../../core';
import { RecommendPreconfiguredInsteadOfGeneratedModulesPolicy } from '../recommend-preconfigured-instead-of-generated-modules-policy';

describe('AdvisePreconfiguredInsteadOfGeneratedModulesPolicy', () => {
  it('should report violation', () => {
    const reportViolationStub = jest.fn<
      ReportViolation,
      Parameters<ReportViolation>
    >();

    Testing.synthScope(scope => {
      const policy = new RecommendPreconfiguredInsteadOfGeneratedModulesPolicy([
        [GoogleNetworkVpc, Vpc],
      ]);
      // @ts-expect
      const vpc = new Vpc(scope, 'test-vpc', {
        networkName: 'test',
        projectId: 'test',
      });
      policy.validate.validate(vpc, reportViolationStub);
    });

    expect(reportViolationStub).toHaveBeenCalledWith(
      `It is recommended to use the preconfigured GoogleNetworkVpc module instead of generated Vpc [terraform-google-modules/network/google//modules/vpc] module`,
    );
  });
});
