import * as path from 'path'
import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'

export class ServiceDogStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        new NodejsFunction(this, 'appCommands', {
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: path.join('resources', 'appCommands', 'index.ts'),
        })

        new NodejsFunction(this, 'minecraftServer', {
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: path.join('resources', 'minecraftServer', 'index.ts'),
        })

        new NodejsFunction(this, 'postIpAddress', {
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: path.join('resources', 'postIpAddress', 'index.ts'),
        })
    }
}
