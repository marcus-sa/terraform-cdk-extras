import { Vpc } from '../../../.gen/modules/terraform-google-modules/google/network/modules/vpc';
import { ProjectFactory } from '../../../.gen/modules/terraform-google-modules/google/project-factory';
import { BetaPrivateCluster } from '../../../.gen/modules/terraform-google-modules/google/kubernetes-engine/modules/beta-private-cluster';

import { GoogleNetworkVpc, GoogleProject } from '../../custom/google';
import { GooglePrivateBetaCluster } from '../../custom/google/cluster';
import { PolicyPack } from '../../core';
import {
  RecommendPreconfiguredInsteadOfGeneratedResourcesPolicy,
  RecommendPreconfiguredInsteadOfGeneratedModulesPolicy,
} from '../terraform';

export const recommendPreconfiguredInsteadOfGeneratedModulesPolicy =
  new RecommendPreconfiguredInsteadOfGeneratedModulesPolicy([
    [GoogleNetworkVpc, Vpc],
    [GoogleProject, ProjectFactory],
    [GooglePrivateBetaCluster, BetaPrivateCluster],
  ]);

export const googlePolicyPack = new PolicyPack('google', [
  recommendPreconfiguredInsteadOfGeneratedModulesPolicy,
  new RecommendPreconfiguredInsteadOfGeneratedResourcesPolicy(),
]);
