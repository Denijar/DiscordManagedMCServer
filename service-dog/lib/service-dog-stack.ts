import * as path from "path";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_lambda as lambda } from "aws-cdk-lib";

export class ServiceDogStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new lambda.Function(this, "appCommands", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(path.join("resources", "appCommands")),
      handler: "index.handler",
    });

    new lambda.Function(this, "minecraftServer", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(path.join("resources", "minecraftServer")),
      handler: "index.handler",
    });

    new lambda.Function(this, "postIpAddress", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(path.join("resources", "postIpAddress")),
      handler: "index.handler",
    });
  }
}
