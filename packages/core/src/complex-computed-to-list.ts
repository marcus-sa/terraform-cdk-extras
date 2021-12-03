import { ITerraformResource, Token } from 'cdktf';

// https://github.com/hashicorp/terraform-cdk/issues/424
export class ComplexComputedToList {
  /**
   * @experimental
   */
  constructor(
    readonly terraformResource: ITerraformResource,
    readonly terraformAttribute: string,
    readonly index: string,
  ) {}
  /**
   * @experimental
   */
  getStringAttribute(terraformAttribute: string) {
    return Token.asString(this.interpolationForAttribute(terraformAttribute));
  }
  /**
   * @experimental
   */
  getNumberAttribute(terraformAttribute: string) {
    return Token.asNumber(this.interpolationForAttribute(terraformAttribute));
  }
  /**
   * @experimental
   */
  getListAttribute(terraformAttribute: string) {
    return Token.asList(this.interpolationForAttribute(terraformAttribute));
  }
  /**
   * @experimental
   */
  getBooleanAttribute(terraformAttribute: string) {
    return Token.asString(this.interpolationForAttribute(terraformAttribute));
  }
  /**
   * @experimental
   */
  interpolationForAttribute(property: string) {
    return `\${tolist(${this.terraformResource.fqn}.${this.terraformAttribute})[${this.index}].${property}}`;
  }
}
