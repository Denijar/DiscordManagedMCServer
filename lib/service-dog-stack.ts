import 'dotenv/config';
import { join } from 'path';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class ServiceDogStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const appCommandsFunction = new NodejsFunction(this, 'appCommands', {
            functionName: 'appCommands',
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: join('resources', 'appCommands', 'index.ts'),
            environment: {
                DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY || '',
            },
        });

        const minecraftServerFunction = new NodejsFunction(
            this,
            'minecraftServer',
            {
                functionName: 'minecraftServer',
                runtime: lambda.Runtime.NODEJS_16_X,
                entry: join('resources', 'minecraftServer', 'index.ts'),
                environment: {
                    INSTANCE_ID: process.env.INSTANCE_ID || '',
                },
            }
        );

        new NodejsFunction(this, 'postIpAddress', {
            functionName: 'postIpAddress',
            runtime: lambda.Runtime.NODEJS_16_X,
            entry: join('resources', 'postIpAddress', 'index.ts'),
            environment: {
                BARKING_CHANNEL_ID: process.env.BARKING_CHANNEL_ID || '',
                DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
            },
        });

        appCommandsFunction.addToRolePolicy(
            new PolicyStatement({
                actions: ['lambda:InvokeFunction', 'lambda:InvokeAsync'],
                resources: [minecraftServerFunction.functionArn],
            })
        );

        minecraftServerFunction.addToRolePolicy(
            new PolicyStatement({
                actions: ['ec2:StartInstances', 'ec2:StopInstances'],
                resources: [
                    `arn:aws:ec2:${process.env.CDK_DEFAULT_REGION}:${process.env.CDK_DEFAULT_ACCOUNT}:instance/${process.env.INSTANCE_ID}`,
                ],
            })
        );
    }
}
